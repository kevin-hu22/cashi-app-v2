/* eslint-disable import/no-unresolved */
// context/AuthContext.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../services/firebase/firebaseConfig';
import firebaseService from '../services/firebase/firebaseService';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Listener de cambios de autenticación
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsAuthenticated(true);
        
        // Guardar estado de sesión
        await AsyncStorage.setItem('userLoggedIn', 'true');
        
        // Inicializar servicios de Firebase
        await firebaseService.initFirebase();
      } else {
        setUser(null);
        setIsAuthenticated(false);
        await AsyncStorage.removeItem('userLoggedIn');
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const result = await firebaseService.login(email, password);
      
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
      }
      
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email, password, displayName) => {
    try {
      setIsLoading(true);
      const result = await firebaseService.signup(email, password, displayName);
      
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
      }
      
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (idToken) => {
    try {
      setIsLoading(true);
      const result = await firebaseService.loginWithGoogle(idToken);
      
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
      }
      
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await firebaseService.logout();
      setUser(null);
      setIsAuthenticated(false);
      
      // Limpiar datos locales
      await firebaseService.clearCache();
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    signup,
    loginWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};