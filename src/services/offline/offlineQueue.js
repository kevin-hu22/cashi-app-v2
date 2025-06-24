/* eslint-disable import/no-unresolved */
// src/services/offline/offlineQueue.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { EventEmitter } from 'events';

class OfflineQueue extends EventEmitter {
  constructor() {
    super();
    this.queue = [];
    this.isOnline = true;
    this.isProcessing = false;
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 segundo inicial
    this.storageKey = 'offline_queue_v2';
    this.init();
  }

  // ==================== INICIALIZACIÓN ====================
  
  async init() {
    // Cargar cola desde almacenamiento
    await this.loadQueue();
    
    // Configurar listener de conectividad
    this.setupNetworkListener();
    
    // Verificar estado inicial
    const netInfo = await NetInfo.fetch();
    this.isOnline = netInfo.isConnected;
    
    // Procesar cola si hay conexión
    if (this.isOnline && this.queue.length > 0) {
      this.processQueue();
    }
  }

  setupNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected;
      
      this.emit('connectionChange', { isOnline: this.isOnline });
      
      if (wasOffline && this.isOnline) {
        console.log('Conexión restaurada, procesando cola offline...');
        this.processQueue();
      }
    });
  }

  // ==================== GESTIÓN DE COLA ====================
  
  async add(item) {
    const queueItem = {
      id: this.generateId(),
      ...item,
      timestamp: new Date().toISOString(),
      retries: 0,
      status: 'pending',
      lastError: null,
    };
    
    this.queue.push(queueItem);
    await this.saveQueue();
    
    this.emit('itemAdded', queueItem);
    
    // Intentar procesar inmediatamente si hay conexión
    if (this.isOnline && !this.isProcessing) {
      this.processQueue();
    }
    
    return queueItem;
  }

  async remove(itemId) {
    const index = this.queue.findIndex(item => item.id === itemId);
    
    if (index !== -1) {
      const removed = this.queue.splice(index, 1)[0];
      await this.saveQueue();
      this.emit('itemRemoved', removed);
      return true;
    }
    
    return false;
  }

  async update(itemId, updates) {
    const index = this.queue.findIndex(item => item.id === itemId);
    
    if (index !== -1) {
      this.queue[index] = { ...this.queue[index], ...updates };
      await this.saveQueue();
      this.emit('itemUpdated', this.queue[index]);
      return true;
    }
    
    return false;
  }

  getAll() {
    return [...this.queue];
  }

  getById(itemId) {
    return this.queue.find(item => item.id === itemId);
  }

  getPending() {
    return this.queue.filter(item => item.status === 'pending');
  }

  getFailed() {
    return this.queue.filter(item => item.status === 'failed');
  }

  // ==================== PROCESAMIENTO ====================
  
  async processQueue() {
    if (!this.isOnline || this.isProcessing || this.queue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    this.emit('processingStarted');
    
    const pendingItems = this.getPending();
    console.log(`Procesando ${pendingItems.length} elementos de la cola...`);
    
    for (const item of pendingItems) {
      await this.processItem(item);
    }
    
    this.isProcessing = false;
    this.emit('processingCompleted', {
      processed: pendingItems.length,
      remaining: this.getPending().length,
    });
    
    // Si quedan elementos pendientes, programar otro intento
    if (this.getPending().length > 0) {
      setTimeout(() => this.processQueue(), this.retryDelay * 5);
    }
  }

  async processItem(item) {
    try {
      this.emit('itemProcessing', item);
      
      // Ejecutar el procesador del item
      if (!item.processor) {
        throw new Error('No se definió un procesador para este item');
      }
      
      const result = await this.executeProcessor(item);
      
      // Marcar como completado y eliminar de la cola
      await this.remove(item.id);
      
      this.emit('itemProcessed', { item, result });
      
      return result;
    } catch (error) {
      console.error(`Error procesando item ${item.id}:`, error);
      
      // Incrementar contador de reintentos
      item.retries++;
      item.lastError = error.message;
      item.lastRetry = new Date().toISOString();
      
      if (item.retries >= this.maxRetries) {
        item.status = 'failed';
        this.emit('itemFailed', { item, error });
      } else {
        // Programar reintento con backoff exponencial
        const delay = this.retryDelay * Math.pow(2, item.retries);
        setTimeout(() => {
          if (this.isOnline) {
            this.processItem(item);
          }
        }, delay);
      }
      
      await this.update(item.id, item);
    }
  }

  async executeProcessor(item) {
    // El procesador debe ser una función que retorne una promesa
    if (typeof item.processor === 'function') {
      return await item.processor(item.data);
    }
    
    // Si es un string, buscar en el registro de procesadores
    const processor = this.processors[item.processor];
    if (processor) {
      return await processor(item.data);
    }
    
    throw new Error(`Procesador no encontrado: ${item.processor}`);
  }

  // ==================== PROCESADORES REGISTRADOS ====================
  
  processors = {
    // Procesador para ventas
    addSale: async (data) => {
      const firebaseService = require('../firebase/firebaseService').default;
      return await firebaseService.addSale(data);
    },
    
    updateSale: async (data) => {
      const firebaseService = require('../firebase/firebaseService').default;
      return await firebaseService.updateSale(data.id, data.updates);
    },
    
    deleteSale: async (data) => {
      const firebaseService = require('../firebase/firebaseService').default;
      return await firebaseService.deleteSale(data.id);
    },
  };

  registerProcessor(name, processor) {
    this.processors[name] = processor;
  }

  // ==================== PERSISTENCIA ====================
  
  async loadQueue() {
    try {
      const data = await AsyncStorage.getItem(this.storageKey);
      if (data) {
        this.queue = JSON.parse(data);
        console.log(`Cola offline cargada: ${this.queue.length} elementos`);
      }
    } catch (error) {
      console.error('Error cargando cola offline:', error);
      this.queue = [];
    }
  }

  async saveQueue() {
    try {
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Error guardando cola offline:', error);
    }
  }

  async clearQueue() {
    this.queue = [];
    await AsyncStorage.removeItem(this.storageKey);
    this.emit('queueCleared');
  }

  async clearFailed() {
    this.queue = this.queue.filter(item => item.status !== 'failed');
    await this.saveQueue();
    this.emit('failedCleared');
  }

  // ==================== UTILIDADES ====================
  
  generateId() {
    return `queue_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  getQueueSize() {
    return this.queue.length;
  }

  getQueueStats() {
    return {
      total: this.queue.length,
      pending: this.getPending().length,
      failed: this.getFailed().length,
      isOnline: this.isOnline,
      isProcessing: this.isProcessing,
    };
  }

  // Método para debugging
  printQueue() {
    console.log('=== Cola Offline ===');
    console.log(`Total: ${this.queue.length}`);
    console.log(`Pendientes: ${this.getPending().length}`);
    console.log(`Fallidos: ${this.getFailed().length}`);
    console.log('Elementos:');
    this.queue.forEach(item => {
      console.log(`- ${item.id}: ${item.status} (reintentos: ${item.retries})`);
    });
  }
}

// Exportar instancia única
export default new OfflineQueue();