/* eslint-disable import/no-unresolved */
// src/utils/permissions.js
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import { Alert, Linking, Platform } from 'react-native';

// ==================== PERMISOS DE CÁMARA ====================

/**
 * Solicita permisos de cámara
 * @returns {Promise<boolean>} true si se otorgaron los permisos
 */
export const requestCameraPermission = async () => {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status === 'granted') {
      return true;
    }
    
    if (status === 'denied') {
      showPermissionAlert(
        'Permiso de Cámara',
        'Necesitamos acceso a tu cámara para tomar fotos de los recibos.',
        'camera'
      );
    }
    
    return false;
  } catch (error) {
    console.error('Error solicitando permiso de cámara:', error);
    return false;
  }
};

/**
 * Verifica si tiene permisos de cámara
 * @returns {Promise<boolean>} true si tiene permisos
 */
export const hasCameraPermission = async () => {
  try {
    const { status } = await ImagePicker.getCameraPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error verificando permiso de cámara:', error);
    return false;
  }
};

// ==================== PERMISOS DE GALERÍA ====================

/**
 * Solicita permisos de galería
 * @returns {Promise<boolean>} true si se otorgaron los permisos
 */
export const requestMediaLibraryPermission = async () => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status === 'granted') {
      return true;
    }
    
    if (status === 'denied') {
      showPermissionAlert(
        'Permiso de Galería',
        'Necesitamos acceso a tu galería para seleccionar fotos de los recibos.',
        'photos'
      );
    }
    
    return false;
  } catch (error) {
    console.error('Error solicitando permiso de galería:', error);
    return false;
  }
};

/**
 * Verifica si tiene permisos de galería
 * @returns {Promise<boolean>} true si tiene permisos
 */
export const hasMediaLibraryPermission = async () => {
  try {
    const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error verificando permiso de galería:', error);
    return false;
  }
};

// ==================== PERMISOS DE NOTIFICACIONES ====================

/**
 * Solicita permisos de notificaciones
 * @returns {Promise<boolean>} true si se otorgaron los permisos
 */
export const requestNotificationPermission = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus === 'granted') {
      return true;
    }
    
    if (finalStatus === 'denied') {
      showPermissionAlert(
        'Permiso de Notificaciones',
        'Necesitamos permisos de notificación para informarte sobre sincronizaciones y resúmenes diarios.',
        'notifications'
      );
    }
    
    return false;
  } catch (error) {
    console.error('Error solicitando permiso de notificaciones:', error);
    return false;
  }
};

/**
 * Verifica si tiene permisos de notificaciones
 * @returns {Promise<boolean>} true si tiene permisos
 */
export const hasNotificationPermission = async () => {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error verificando permiso de notificaciones:', error);
    return false;
  }
};

// ==================== SOLICITUD MÚLTIPLE DE PERMISOS ====================

/**
 * Solicita todos los permisos necesarios
 * @returns {Promise<object>} Estado de cada permiso
 */
export const requestAllPermissions = async () => {
  const results = {
    camera: false,
    mediaLibrary: false,
    notifications: false,
  };

  // Solicitar permisos en paralelo
  const [camera, mediaLibrary, notifications] = await Promise.all([
    requestCameraPermission(),
    requestMediaLibraryPermission(),
    requestNotificationPermission(),
  ]);

  results.camera = camera;
  results.mediaLibrary = mediaLibrary;
  results.notifications = notifications;

  return results;
};

/**
 * Verifica todos los permisos
 * @returns {Promise<object>} Estado de cada permiso
 */
export const checkAllPermissions = async () => {
  const results = {
    camera: false,
    mediaLibrary: false,
    notifications: false,
  };

  // Verificar permisos en paralelo
  const [camera, mediaLibrary, notifications] = await Promise.all([
    hasCameraPermission(),
    hasMediaLibraryPermission(),
    hasNotificationPermission(),
  ]);

  results.camera = camera;
  results.mediaLibrary = mediaLibrary;
  results.notifications = notifications;

  return results;
};

// ==================== UTILIDADES ====================

/**
 * Muestra alerta de permiso denegado
 * @param {string} title - Título de la alerta
 * @param {string} message - Mensaje de la alerta
 * @param {string} permissionType - Tipo de permiso
 */
const showPermissionAlert = (title, message, permissionType) => {
  Alert.alert(
    title,
    message,
    [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Ir a Configuración',
        onPress: () => openAppSettings(),
      },
    ],
    { cancelable: false }
  );
};

/**
 * Abre la configuración de la app
 */
const openAppSettings = () => {
  if (Platform.OS === 'ios') {
    Linking.openURL('app-settings:');
  } else {
    Linking.openSettings();
  }
};

/**
 * Obtiene el estado de un permiso específico
 * @param {string} permissionType - Tipo de permiso
 * @returns {Promise<string>} Estado del permiso
 */
export const getPermissionStatus = async (permissionType) => {
  try {
    switch (permissionType) {
      case 'camera':
        const cameraStatus = await ImagePicker.getCameraPermissionsAsync();
        return cameraStatus.status;
        
      case 'mediaLibrary':
        const mediaStatus = await ImagePicker.getMediaLibraryPermissionsAsync();
        return mediaStatus.status;
        
      case 'notifications':
        const notifStatus = await Notifications.getPermissionsAsync();
        return notifStatus.status;
        
      default:
        return 'undetermined';
    }
  } catch (error) {
    console.error(`Error obteniendo estado de permiso ${permissionType}:`, error);
    return 'undetermined';
  }
};

/**
 * Verifica si un permiso puede ser solicitado
 * @param {string} permissionType - Tipo de permiso
 * @returns {Promise<boolean>} true si puede ser solicitado
 */
export const canRequestPermission = async (permissionType) => {
  const status = await getPermissionStatus(permissionType);
  return status === 'undetermined';
};

// ==================== CONFIGURACIÓN DE NOTIFICACIONES ====================

/**
 * Configura las notificaciones
 */
export const setupNotifications = async () => {
  // Configurar el comportamiento de las notificaciones
  await Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  // Configurar canal de notificación para Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0379AF',
    });
  }
};

/**
 * Programa una notificación local
 * @param {object} notification - Datos de la notificación
 * @returns {Promise<string>} ID de la notificación
 */
export const scheduleLocalNotification = async (notification) => {
  try {
    const hasPermission = await hasNotificationPermission();
    
    if (!hasPermission) {
      console.log('No hay permisos para notificaciones');
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        sound: true,
      },
      trigger: notification.trigger || null,
    });

    return notificationId;
  } catch (error) {
    console.error('Error programando notificación:', error);
    return null;
  }
};

/**
 * Cancela una notificación programada
 * @param {string} notificationId - ID de la notificación
 */
export const cancelScheduledNotification = async (notificationId) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error cancelando notificación:', error);
  }
};

/**
 * Cancela todas las notificaciones programadas
 */
export const cancelAllScheduledNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error cancelando todas las notificaciones:', error);
  }
};

// ==================== PERMISOS PARA IMÁGENES ====================

/**
 * Solicita permisos para tomar o seleccionar una foto
 * @param {string} source - 'camera' o 'library'
 * @returns {Promise<boolean>} true si se otorgaron los permisos
 */
export const requestImagePermission = async (source) => {
  if (source === 'camera') {
    return await requestCameraPermission();
  } else if (source === 'library') {
    return await requestMediaLibraryPermission();
  }
  return false;
};

/**
 * Verifica y solicita permisos antes de abrir la cámara o galería
 * @param {string} source - 'camera' o 'library'
 * @returns {Promise<boolean>} true si tiene permisos
 */
export const ensureImagePermission = async (source) => {
  let hasPermission = false;
  
  if (source === 'camera') {
    hasPermission = await hasCameraPermission();
    if (!hasPermission) {
      hasPermission = await requestCameraPermission();
    }
  } else if (source === 'library') {
    hasPermission = await hasMediaLibraryPermission();
    if (!hasPermission) {
      hasPermission = await requestMediaLibraryPermission();
    }
  }
  
  return hasPermission;
};