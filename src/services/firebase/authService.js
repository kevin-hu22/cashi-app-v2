// src/services/firebase/authService.js
/* eslint-disable import/no-unresolved */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    EmailAuthProvider,
    deleteUser,
    onAuthStateChanged,
    reauthenticateWithCredential,
    sendEmailVerification,
    sendPasswordResetEmail,
    updateEmail,
    updatePassword,
} from 'firebase/auth';
import { deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.authStateListeners = [];
  }

  // ==================== GESTIÓN DE SESIÓN ====================
  
  // Observador de estado de autenticación
  onAuthStateChange(callback) {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      this.currentUser = user;
      
      if (user) {
        // Guardar estado de sesión
        await AsyncStorage.setItem('userLoggedIn', 'true');
        await AsyncStorage.setItem('userId', user.uid);
        
        // Obtener datos adicionales del usuario
        const userData = await this.getUserData(user.uid);
        callback({ ...user, userData });
      } else {
        await AsyncStorage.multiRemove(['userLoggedIn', 'userId']);
        callback(null);
      }
    });

    this.authStateListeners.push(unsubscribe);
    return unsubscribe;
  }

  // Obtener datos del usuario desde Firestore
  async getUserData(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        return userDoc.data();
      }
      
      return null;
    } catch (error) {
      console.error('Error obteniendo datos del usuario:', error);
      return null;
    }
  }

  // Verificar si el usuario está autenticado
  async isAuthenticated() {
    const userLoggedIn = await AsyncStorage.getItem('userLoggedIn');
    return userLoggedIn === 'true' && auth.currentUser !== null;
  }

  // ==================== GESTIÓN DE CONTRASEÑA ====================
  
  // Enviar email de recuperación de contraseña
  async sendPasswordReset(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { 
        success: true, 
        message: 'Se ha enviado un correo para restablecer tu contraseña' 
      };
    } catch (error) {
      return { 
        success: false, 
        error: this.getErrorMessage(error.code) 
      };
    }
  }

  // Cambiar contraseña
  async changePassword(currentPassword, newPassword) {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error('No hay usuario autenticado');
      }

      // Re-autenticar al usuario
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Actualizar contraseña
      await updatePassword(user, newPassword);
      
      return { 
        success: true, 
        message: 'Contraseña actualizada correctamente' 
      };
    } catch (error) {
      return { 
        success: false, 
        error: this.getErrorMessage(error.code) 
      };
    }
  }

  // ==================== GESTIÓN DE PERFIL ====================
  
  // Actualizar email
  async updateEmail(newEmail, password) {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error('No hay usuario autenticado');
      }

      // Re-autenticar al usuario
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      
      // Actualizar email
      await updateEmail(user, newEmail);
      
      // Actualizar en Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        email: newEmail,
        updatedAt: new Date().toISOString(),
      });
      
      return { 
        success: true, 
        message: 'Email actualizado correctamente' 
      };
    } catch (error) {
      return { 
        success: false, 
        error: this.getErrorMessage(error.code) 
      };
    }
  }

  // Actualizar perfil del usuario
  async updateUserProfile(updates) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No hay usuario autenticado');
      }

      // Actualizar en Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      
      return { 
        success: true, 
        message: 'Perfil actualizado correctamente' 
      };
    } catch (error) {
      return { 
        success: false, 
        error: 'Error actualizando el perfil' 
      };
    }
  }

  // ==================== VERIFICACIÓN DE EMAIL ====================
  
  // Enviar email de verificación
  async sendVerificationEmail() {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No hay usuario autenticado');
      }

      await sendEmailVerification(user);
      
      return { 
        success: true, 
        message: 'Email de verificación enviado' 
      };
    } catch (error) {
      return { 
        success: false, 
        error: this.getErrorMessage(error.code) 
      };
    }
  }

  // Verificar si el email está verificado
  isEmailVerified() {
    return auth.currentUser?.emailVerified || false;
  }

  // ==================== ELIMINACIÓN DE CUENTA ====================
  
  // Eliminar cuenta de usuario
  async deleteAccount(password) {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error('No hay usuario autenticado');
      }

      // Re-autenticar al usuario
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      
      // Eliminar datos de Firestore
      await deleteDoc(doc(db, 'users', user.uid));
      
      // Eliminar usuario de Auth
      await deleteUser(user);
      
      // Limpiar datos locales
      await AsyncStorage.multiRemove(['userLoggedIn', 'userId', 'user_cache', 'sales_cache']);
      
      return { 
        success: true, 
        message: 'Cuenta eliminada correctamente' 
      };
    } catch (error) {
      return { 
        success: false, 
        error: this.getErrorMessage(error.code) 
      };
    }
  }

  // ==================== UTILIDADES ====================
  
  // Obtener el usuario actual
  getCurrentUser() {
    return auth.currentUser;
  }

  // Verificar si es un nuevo usuario
  async isNewUser(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        return true;
      }
      
      const userData = userDoc.data();
      const createdAt = userData.createdAt?.toDate() || new Date();
      const hoursSinceCreation = (new Date() - createdAt) / (1000 * 60 * 60);
      
      return hoursSinceCreation < 24; // Considerar nuevo si tiene menos de 24 horas
    } catch (error) {
      console.error('Error verificando si es nuevo usuario:', error);
      return false;
    }
  }

  // Limpiar listeners
  cleanupListeners() {
    this.authStateListeners.forEach(unsubscribe => unsubscribe());
    this.authStateListeners = [];
  }

  // Mensajes de error personalizados
  getErrorMessage(errorCode) {
    const messages = {
      'auth/invalid-email': 'El correo electrónico no es válido',
      'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
      'auth/user-not-found': 'No existe una cuenta con este correo',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/email-already-in-use': 'Este correo ya está registrado',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/network-request-failed': 'Error de conexión a internet',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
      'auth/requires-recent-login': 'Por seguridad, vuelve a iniciar sesión',
      'auth/credential-already-in-use': 'Esta credencial ya está asociada a otra cuenta',
      'auth/invalid-verification-code': 'Código de verificación inválido',
      'auth/invalid-verification-id': 'ID de verificación inválido',
    };
    
    return messages[errorCode] || 'Ha ocurrido un error. Intenta nuevamente';
  }
}

export default new AuthService();