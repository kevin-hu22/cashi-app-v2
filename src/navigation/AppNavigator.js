/* eslint-disable import/no-unresolved */
// src/navigation/AppNavigator.js
import NetInfo from '@react-native-community/netinfo';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import SplashScreen from '../screens/SplashScreen';
import firebaseService from '../services/firebase/firebaseService';
import { setupNotifications } from '../utils/permissions';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    // Ocultar splash después de 2 segundos mínimo
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const initializeApp = async () => {
    try {
      // Configurar notificaciones
      await setupNotifications();

      // Inicializar Firebase
      await firebaseService.initFirebase();

      // Verificar conexión
      const netInfo = await NetInfo.fetch();
      console.log('Estado de conexión:', netInfo.isConnected ? 'Online' : 'Offline');

      setIsInitializing(false);
    } catch (error) {
      console.error('Error inicializando app:', error);
      setIsInitializing(false);
    }
  };

  // Mostrar splash screen mientras carga
  if (showSplash || isInitializing || authLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen 
            name="Main" 
            component={MainNavigator}
            options={{
              animation: 'fade',
            }}
          />
        ) : (
          <Stack.Screen 
            name="Auth" 
            component={AuthNavigator}
            options={{
              animation: 'fade',
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;