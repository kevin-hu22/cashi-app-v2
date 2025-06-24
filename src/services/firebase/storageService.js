/* eslint-disable import/no-unresolved */
// src/services/firebase/storageService.js
import * as ImageManipulator from 'expo-image-manipulator';
import {
    deleteObject,
    getDownloadURL,
    getMetadata,
    listAll,
    ref,
    uploadBytes,
    uploadBytesResumable,
} from 'firebase/storage';
import { storage } from './firebaseConfig';

class StorageService {
  constructor() {
    this.uploadTasks = new Map();
  }

  // ==================== SUBIDA DE ARCHIVOS ====================
  
  // Subir imagen con compresión
  async uploadImage(uri, path, options = {}) {
    try {
      // Opciones por defecto
      const defaultOptions = {
        compress: 0.7,
        maxWidth: 1200,
        maxHeight: 1200,
        format: ImageManipulator.SaveFormat.JPEG,
      };
      
      const finalOptions = { ...defaultOptions, ...options };
      
      // Comprimir imagen si es necesario
      let imageUri = uri;
      if (finalOptions.compress < 1) {
        const compressed = await this.compressImage(uri, finalOptions);
        imageUri = compressed.uri;
      }
      
      // Convertir a blob
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // Crear referencia
      const storageRef = ref(storage, path);
      
      // Subir archivo
      const snapshot = await uploadBytes(storageRef, blob, {
        contentType: 'image/jpeg',
        customMetadata: {
          uploadedAt: new Date().toISOString(),
          compressed: finalOptions.compress < 1 ? 'true' : 'false',
        },
      });
      
      // Obtener URL de descarga
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        success: true,
        url: downloadURL,
        path: snapshot.ref.fullPath,
        size: snapshot.metadata.size,
      };
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Subir imagen con progreso
  async uploadImageWithProgress(uri, path, onProgress, options = {}) {
    try {
      // Comprimir imagen
      const compressed = await this.compressImage(uri, options);
      
      // Convertir a blob
      const response = await fetch(compressed.uri);
      const blob = await response.blob();
      
      // Crear referencia
      const storageRef = ref(storage, path);
      
      // Crear tarea de subida
      const uploadTask = uploadBytesResumable(storageRef, blob, {
        contentType: 'image/jpeg',
      });
      
      // Guardar referencia a la tarea
      const taskId = Date.now().toString();
      this.uploadTasks.set(taskId, uploadTask);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) {
              onProgress(progress, snapshot.state);
            }
          },
          (error) => {
            this.uploadTasks.delete(taskId);
            reject({
              success: false,
              error: error.message,
            });
          },
          async () => {
            this.uploadTasks.delete(taskId);
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              success: true,
              url: downloadURL,
              path: uploadTask.snapshot.ref.fullPath,
              size: uploadTask.snapshot.metadata.size,
              taskId,
            });
          }
        );
      });
    } catch (error) {
      console.error('Error en subida con progreso:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Cancelar subida
  cancelUpload(taskId) {
    const uploadTask = this.uploadTasks.get(taskId);
    if (uploadTask) {
      uploadTask.cancel();
      this.uploadTasks.delete(taskId);
      return true;
    }
    return false;
  }

  // ==================== COMPRESIÓN DE IMÁGENES ====================
  
  // Comprimir imagen
  async compressImage(uri, options = {}) {
    try {
      const defaultOptions = {
        compress: 0.7,
        maxWidth: 1200,
        maxHeight: 1200,
        format: ImageManipulator.SaveFormat.JPEG,
      };
      
      const finalOptions = { ...defaultOptions, ...options };
      
      // Manipular imagen
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: finalOptions.maxWidth } }],
        {
          compress: finalOptions.compress,
          format: finalOptions.format,
        }
      );
      
      return manipResult;
    } catch (error) {
      console.error('Error comprimiendo imagen:', error);
      throw error;
    }
  }

  // ==================== GESTIÓN DE ARCHIVOS ====================
  
  // Eliminar archivo
  async deleteFile(path) {
    try {
      const fileRef = ref(storage, path);
      await deleteObject(fileRef);
      
      return {
        success: true,
        message: 'Archivo eliminado correctamente',
      };
    } catch (error) {
      console.error('Error eliminando archivo:', error);
      
      if (error.code === 'storage/object-not-found') {
        return {
          success: true,
          message: 'El archivo no existe',
        };
      }
      
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Eliminar archivo por URL
  async deleteFileByUrl(url) {
    try {
      // Extraer path de la URL
      const path = this.getPathFromUrl(url);
      if (!path) {
        throw new Error('URL inválida');
      }
      
      return await this.deleteFile(path);
    } catch (error) {
      console.error('Error eliminando archivo por URL:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Obtener metadatos de archivo
  async getFileMetadata(path) {
    try {
      const fileRef = ref(storage, path);
      const metadata = await getMetadata(fileRef);
      
      return {
        success: true,
        metadata: {
          name: metadata.name,
          size: metadata.size,
          contentType: metadata.contentType,
          created: metadata.timeCreated,
          updated: metadata.updated,
          customMetadata: metadata.customMetadata,
        },
      };
    } catch (error) {
      console.error('Error obteniendo metadatos:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ==================== LISTADO DE ARCHIVOS ====================
  
  // Listar archivos en una carpeta
  async listFiles(folderPath) {
    try {
      const folderRef = ref(storage, folderPath);
      const result = await listAll(folderRef);
      
      const files = await Promise.all(
        result.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          const metadata = await getMetadata(itemRef);
          
          return {
            name: itemRef.name,
            path: itemRef.fullPath,
            url,
            size: metadata.size,
            created: metadata.timeCreated,
            contentType: metadata.contentType,
          };
        })
      );
      
      return {
        success: true,
        files,
        folders: result.prefixes.map(prefix => ({
          name: prefix.name,
          path: prefix.fullPath,
        })),
      };
    } catch (error) {
      console.error('Error listando archivos:', error);
      return {
        success: false,
        error: error.message,
        files: [],
        folders: [],
      };
    }
  }

  // ==================== UTILIDADES ====================
  
  // Generar nombre único para archivo
  generateUniqueFileName(originalName) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const extension = originalName.split('.').pop();
    const nameWithoutExt = originalName.split('.').slice(0, -1).join('.');
    
    return `${nameWithoutExt}_${timestamp}_${random}.${extension}`;
  }

  // Obtener path desde URL de Firebase Storage
  getPathFromUrl(url) {
    try {
      const baseUrl = `https://firebasestorage.googleapis.com/v0/b/${storage.app.options.storageBucket}/o/`;
      
      if (!url.startsWith(baseUrl)) {
        return null;
      }
      
      const encodedPath = url.substring(baseUrl.length).split('?')[0];
      return decodeURIComponent(encodedPath);
    } catch (error) {
      console.error('Error extrayendo path de URL:', error);
      return null;
    }
  }

  // Validar tipo de archivo
  isValidImageType(mimeType) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(mimeType);
  }

  // Obtener tamaño de archivo formateado
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default new StorageService();