// src/services/firebase/firebaseService.js
/* eslint-disable import/no-unresolved */
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage';
import { auth, db, storage } from './firebaseConfig';

// Constantes
const OFFLINE_QUEUE_KEY = 'offline_queue';
const SALES_CACHE_KEY = 'sales_cache';
const USER_CACHE_KEY = 'user_cache';

class FirebaseService {
  constructor() {
    this.offlineQueue = [];
    this.isOnline = true;
    this.syncInProgress = false;
    this.initNetworkListener();
  }

  // ==================== INICIALIZACIÓN ====================
  async initFirebase() {
    try {
      // Cargar cola offline
      await this.loadOfflineQueue();
      
      // Verificar estado de conexión
      const netInfo = await NetInfo.fetch();
      this.isOnline = netInfo.isConnected;
      
      // Sincronizar si está online
      if (this.isOnline) {
        await this.syncOffline();
      }
      
      console.log('Firebase inicializado correctamente');
      return { success: true };
    } catch (error) {
      console.error('Error iniciando Firebase:', error);
      return { success: false, error };
    }
  }

  // Listener de conectividad
  initNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected;
      
      if (wasOffline && this.isOnline) {
        console.log('Conexión restaurada, sincronizando...');
        this.syncOffline();
      }
    });
  }

  // ==================== AUTENTICACIÓN ====================
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await this.cacheUserData(userCredential.user);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  async signup(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Actualizar perfil con nombre
      await updateProfile(userCredential.user, { displayName });
      
      // Crear documento de usuario en Firestore
      await this.createUserDocument(userCredential.user);
      
      // Cachear datos del usuario
      await this.cacheUserData(userCredential.user);
      
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  async loginWithGoogle(idToken) {
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      
      // Crear documento de usuario si es primera vez
      await this.createUserDocument(userCredential.user);
      
      // Cachear datos del usuario
      await this.cacheUserData(userCredential.user);
      
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  async logout() {
    try {
      await signOut(auth);
      // Limpiar caché de usuario pero mantener ventas offline
      await AsyncStorage.removeItem(USER_CACHE_KEY);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createUserDocument(user) {
    const userRef = doc(db, 'users', user.uid);
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      settings: {
        notifications: true,
        autoSync: true,
      }
    };
    
    try {
      await setDoc(userRef, userData, { merge: true });
    } catch (error) {
      console.error('Error creando documento de usuario:', error);
    }
  }

  async cacheUserData(user) {
    try {
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      };
      await AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Error cacheando datos de usuario:', error);
    }
  }

  // ==================== GESTIÓN DE VENTAS ====================
  async addSale(saleData) {
    const sale = {
      ...saleData,
      userId: auth.currentUser?.uid,
      createdAt: new Date().toISOString(),
      syncStatus: 'pending',
      id: this.generateTempId(),
    };

    if (this.isOnline) {
      try {
        // Si hay foto, subirla primero
        if (sale.receiptPhoto) {
          const photoUrl = await this.uploadReceiptPhoto(sale.receiptPhoto);
          sale.receiptPhotoUrl = photoUrl;
          delete sale.receiptPhoto;
        }

        // Agregar a Firestore
        const docRef = await addDoc(collection(db, 'sales'), {
          ...sale,
          createdAt: serverTimestamp(),
          syncStatus: 'synced',
        });
        
        // Actualizar caché local
        await this.updateLocalCache('add', { ...sale, id: docRef.id, syncStatus: 'synced' });
        
        return { success: true, id: docRef.id };
      } catch (error) {
        console.error('Error agregando venta online:', error);
        // Si falla, agregar a cola offline
        return await this.addToOfflineQueue('add', sale);
      }
    } else {
      // Si está offline, agregar a cola
      return await this.addToOfflineQueue('add', sale);
    }
  }

  async updateSale(saleId, updates) {
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (this.isOnline) {
      try {
        // Si hay nueva foto, subirla
        if (updateData.receiptPhoto) {
          const photoUrl = await this.uploadReceiptPhoto(updateData.receiptPhoto);
          updateData.receiptPhotoUrl = photoUrl;
          delete updateData.receiptPhoto;
        }

        await updateDoc(doc(db, 'sales', saleId), {
          ...updateData,
          updatedAt: serverTimestamp(),
        });
        
        await this.updateLocalCache('update', { id: saleId, ...updateData });
        return { success: true };
      } catch (error) {
        console.error('Error actualizando venta:', error);
        return await this.addToOfflineQueue('update', { id: saleId, ...updateData });
      }
    } else {
      return await this.addToOfflineQueue('update', { id: saleId, ...updateData });
    }
  }

  async deleteSale(saleId) {
    if (this.isOnline) {
      try {
        // Obtener la venta para eliminar la foto si existe
        const saleData = await this.getSaleFromCache(saleId);
        if (saleData?.receiptPhotoUrl) {
          await this.deleteReceiptPhoto(saleData.receiptPhotoUrl);
        }

        await deleteDoc(doc(db, 'sales', saleId));
        await this.updateLocalCache('delete', { id: saleId });
        return { success: true };
      } catch (error) {
        console.error('Error eliminando venta:', error);
        return await this.addToOfflineQueue('delete', { id: saleId });
      }
    } else {
      return await this.addToOfflineQueue('delete', { id: saleId });
    }
  }

  async getTodaySales() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    try {
      if (this.isOnline) {
        const q = query(
          collection(db, 'sales'),
          where('userId', '==', auth.currentUser?.uid),
          where('createdAt', '>=', today),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const sales = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        // Actualizar caché
        await AsyncStorage.setItem(SALES_CACHE_KEY, JSON.stringify(sales));
        return sales;
      } else {
        // Retornar desde caché si está offline
        return await this.getFromCache();
      }
    } catch (error) {
      console.error('Error obteniendo ventas:', error);
      return await this.getFromCache();
    }
  }

  // Obtener ventas con paginación
  async getSalesPaginated(pageSize = 20, lastDoc = null) {
    try {
      let q = query(
        collection(db, 'sales'),
        where('userId', '==', auth.currentUser?.uid),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      const sales = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      
      return { sales, lastDoc: lastVisible };
    } catch (error) {
      console.error('Error obteniendo ventas paginadas:', error);
      return { sales: [], lastDoc: null };
    }
  }

  // Listener en tiempo real para ventas del día
  subscribeTodaySales(callback) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const q = query(
      collection(db, 'sales'),
      where('userId', '==', auth.currentUser?.uid),
      where('createdAt', '>=', today),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, 
      (querySnapshot) => {
        const sales = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(sales);
        // Actualizar caché con datos en tiempo real
        AsyncStorage.setItem(SALES_CACHE_KEY, JSON.stringify(sales));
      },
      (error) => {
        console.error('Error en listener:', error);
        // Si hay error, usar caché
        this.getFromCache().then(callback);
      }
    );
  }

  // ==================== MANEJO DE FOTOS ====================
  async uploadReceiptPhoto(photoUri) {
    try {
      const response = await fetch(photoUri);
      const blob = await response.blob();
      
      const fileName = `receipts/${auth.currentUser.uid}/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      const storageRef = ref(storage, fileName);
      
      const snapshot = await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      
      return downloadUrl;
    } catch (error) {
      console.error('Error subiendo foto:', error);
      throw error;
    }
  }

  async deleteReceiptPhoto(photoUrl) {
    try {
      const storageRef = ref(storage, photoUrl);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error eliminando foto:', error);
      // No lanzar error si falla la eliminación
    }
  }

  // ==================== SINCRONIZACIÓN OFFLINE ====================
  async addToOfflineQueue(action, data) {
    const queueItem = {
      id: this.generateTempId(),
      action,
      data,
      timestamp: new Date().toISOString(),
      userId: auth.currentUser?.uid,
      retryCount: 0,
    };
    
    this.offlineQueue.push(queueItem);
    await this.saveOfflineQueue();
    
    // Actualizar caché local inmediatamente
    if (action === 'add') {
      await this.updateLocalCache('add', { ...data, syncStatus: 'pending' });
    } else if (action === 'update') {
      await this.updateLocalCache('update', { ...data, syncStatus: 'pending' });
    } else if (action === 'delete') {
      await this.updateLocalCache('delete', data);
    }
    
    return { success: true, offline: true, tempId: queueItem.id };
  }

  async loadOfflineQueue() {
    try {
      const queueData = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      this.offlineQueue = queueData ? JSON.parse(queueData) : [];
    } catch (error) {
      console.error('Error cargando cola offline:', error);
      this.offlineQueue = [];
    }
  }

  async saveOfflineQueue() {
    try {
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.error('Error guardando cola offline:', error);
    }
  }

  async syncOffline() {
    if (!this.isOnline || this.offlineQueue.length === 0 || this.syncInProgress) return;
    
    this.syncInProgress = true;
    console.log(`Sincronizando ${this.offlineQueue.length} elementos...`);
    
    const batch = writeBatch(db);
    const processedItems = [];
    const failedItems = [];
    
    for (const item of this.offlineQueue) {
      try {
        switch (item.action) {
          case 'add':
            // Subir foto si existe
            if (item.data.receiptPhoto) {
              try {
                item.data.receiptPhotoUrl = await this.uploadReceiptPhoto(item.data.receiptPhoto);
                delete item.data.receiptPhoto;
              } catch (photoError) {
                console.error('Error subiendo foto en sincronización:', photoError);
                // Continuar sin foto
              }
            }
            
            const docRef = doc(collection(db, 'sales'));
            batch.set(docRef, {
              ...item.data,
              createdAt: serverTimestamp(),
              syncStatus: 'synced',
              syncedAt: serverTimestamp(),
            });
            processedItems.push(item.id);
            break;
            
          case 'update':
            if (item.data.receiptPhoto) {
              try {
                item.data.receiptPhotoUrl = await this.uploadReceiptPhoto(item.data.receiptPhoto);
                delete item.data.receiptPhoto;
              } catch (photoError) {
                console.error('Error subiendo foto en sincronización:', photoError);
              }
            }
            
            batch.update(doc(db, 'sales', item.data.id), {
              ...item.data,
              syncStatus: 'synced',
              syncedAt: serverTimestamp(),
            });
            processedItems.push(item.id);
            break;
            
          case 'delete':
            batch.delete(doc(db, 'sales', item.data.id));
            processedItems.push(item.id);
            break;
        }
      } catch (error) {
        console.error(`Error procesando item ${item.id}:`, error);
        item.retryCount++;
        if (item.retryCount < 3) {
          failedItems.push(item);
        }
      }
    }
    
    // Ejecutar batch
    if (processedItems.length > 0) {
      try {
        await batch.commit();
        console.log(`Sincronización completada: ${processedItems.length} elementos`);
      } catch (error) {
        console.error('Error en batch commit:', error);
        // Volver a agregar items a la cola
        failedItems.push(...this.offlineQueue.filter(item => 
          processedItems.includes(item.id)
        ));
      }
    }
    
    // Actualizar cola con elementos fallidos
    this.offlineQueue = failedItems;
    await this.saveOfflineQueue();
    
    this.syncInProgress = false;
  }

  // ==================== CACHÉ LOCAL ====================
  async updateLocalCache(action, data) {
    try {
      let cache = await this.getFromCache();
      
      switch (action) {
        case 'add':
          // Agregar al inicio para mostrar las más recientes primero
          cache.unshift(data);
          break;
          
        case 'update':
          const updateIndex = cache.findIndex(item => item.id === data.id);
          if (updateIndex !== -1) {
            cache[updateIndex] = { ...cache[updateIndex], ...data };
          }
          break;
          
        case 'delete':
          cache = cache.filter(item => item.id !== data.id);
          break;
      }
      
      await AsyncStorage.setItem(SALES_CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Error actualizando caché:', error);
    }
  }

  async getFromCache() {
    try {
      const cacheData = await AsyncStorage.getItem(SALES_CACHE_KEY);
      return cacheData ? JSON.parse(cacheData) : [];
    } catch (error) {
      console.error('Error leyendo caché:', error);
      return [];
    }
  }

  async getSaleFromCache(saleId) {
    const cache = await this.getFromCache();
    return cache.find(sale => sale.id === saleId);
  }

  async clearCache() {
    try {
      await AsyncStorage.multiRemove([OFFLINE_QUEUE_KEY, SALES_CACHE_KEY]);
      this.offlineQueue = [];
      console.log('Caché limpiado correctamente');
    } catch (error) {
      console.error('Error limpiando caché:', error);
      throw error;
    }
  }

  // ==================== UTILIDADES ====================
  generateTempId() {
    return `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  getErrorMessage(errorCode) {
    const messages = {
      'auth/email-already-in-use': 'Este correo ya está registrado',
      'auth/invalid-email': 'Correo electrónico inválido',
      'auth/operation-not-allowed': 'Operación no permitida',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/user-disabled': 'Usuario deshabilitado',
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/network-request-failed': 'Error de conexión',
      'auth/too-many-requests': 'Demasiados intentos, intenta más tarde',
      'auth/popup-closed-by-user': 'Ventana cerrada por el usuario',
      'auth/cancelled-popup-request': 'Solicitud cancelada',
    };
    
    return messages[errorCode] || 'Error desconocido';
  }

  // ==================== ESTADÍSTICAS ====================
  async getMonthlyStats() {
    try {
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);

      const q = query(
        collection(db, 'sales'),
        where('userId', '==', auth.currentUser?.uid),
        where('createdAt', '>=', firstDayOfMonth),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const sales = querySnapshot.docs.map(doc => doc.data());

      const stats = {
        totalSales: sales.length,
        totalAmount: sales.reduce((sum, sale) => sum + sale.saleValue, 0),
        cashTotal: sales.filter(s => s.paymentType === 'cash')
          .reduce((sum, sale) => sum + sale.saleValue, 0),
        transferTotal: sales.filter(s => s.paymentType === 'transfer')
          .reduce((sum, sale) => sum + sale.saleValue, 0),
      };

      return stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas mensuales:', error);
      return null;
    }
  }
}

// Exportar instancia única
export default new FirebaseService();