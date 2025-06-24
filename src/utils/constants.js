// src/utils/constants.js

// ==================== COLORES ====================
export const COLORS = {
  // Colores principales
  primary: '#0379AF',
  primaryDark: '#025a84',
  primaryLight: '#0496d4',
  
  // Colores de fondo
  background: '#F8F8F8',
  backgroundSecondary: '#E8F1F3',
  
  // Colores de texto
  text: '#00151F',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  
  // Colores semánticos
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // Colores neutros
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
};

// ==================== TIPOS DE PAGO ====================
export const PAYMENT_TYPES = {
  CASH: 'cash',
  TRANSFER: 'transfer',
};

export const PAYMENT_TYPE_LABELS = {
  [PAYMENT_TYPES.CASH]: 'Efectivo',
  [PAYMENT_TYPES.TRANSFER]: 'Transferencia',
};

export const PAYMENT_TYPE_ICONS = {
  [PAYMENT_TYPES.CASH]: 'cash-outline',
  [PAYMENT_TYPES.TRANSFER]: 'card-outline',
};

// ==================== ESTADOS DE SINCRONIZACIÓN ====================
export const SYNC_STATUS = {
  SYNCED: 'synced',
  PENDING: 'pending',
  FAILED: 'failed',
};

export const SYNC_STATUS_LABELS = {
  [SYNC_STATUS.SYNCED]: 'Sincronizado',
  [SYNC_STATUS.PENDING]: 'Pendiente',
  [SYNC_STATUS.FAILED]: 'Error',
};

export const SYNC_STATUS_COLORS = {
  [SYNC_STATUS.SYNCED]: COLORS.success,
  [SYNC_STATUS.PENDING]: COLORS.warning,
  [SYNC_STATUS.FAILED]: COLORS.error,
};

// ==================== CONFIGURACIÓN DE LA APP ====================
export const APP_CONFIG = {
  name: 'Control de Ventas',
  version: '1.0.0',
  supportEmail: 'soporte@controlventas.com',
  companyName: 'Control de Ventas S.A.S',
  currency: 'COP',
  locale: 'es-CO',
  timezone: 'America/Bogota',
};

// ==================== LÍMITES Y VALIDACIONES ====================
export const LIMITS = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 128,
  MIN_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 50,
  MAX_PRODUCT_NAME_LENGTH: 100,
  MAX_SALE_VALUE: 999999999,
  MIN_SALE_VALUE: 0,
  MAX_QUANTITY: 9999,
  MIN_QUANTITY: 1,
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_OFFLINE_QUEUE_SIZE: 100,
};

// ==================== MENSAJES DE ERROR ====================
export const ERROR_MESSAGES = {
  GENERIC: 'Ocurrió un error. Por favor intenta nuevamente.',
  NETWORK: 'Error de conexión. Verifica tu internet.',
  INVALID_EMAIL: 'El correo electrónico no es válido.',
  INVALID_PASSWORD: 'La contraseña debe tener al menos 6 caracteres.',
  PASSWORDS_DONT_MATCH: 'Las contraseñas no coinciden.',
  REQUIRED_FIELD: 'Este campo es requerido.',
  INVALID_SALE_VALUE: 'El valor de venta no es válido.',
  INVALID_QUANTITY: 'La cantidad debe ser mayor a 0.',
  IMAGE_TOO_LARGE: 'La imagen es demasiado grande. Máximo 5MB.',
  OFFLINE_QUEUE_FULL: 'La cola offline está llena. Sincroniza antes de continuar.',
};

// ==================== MENSAJES DE ÉXITO ====================
export const SUCCESS_MESSAGES = {
  SALE_ADDED: 'Venta registrada correctamente.',
  SALE_UPDATED: 'Venta actualizada correctamente.',
  SALE_DELETED: 'Venta eliminada correctamente.',
  SYNC_COMPLETED: 'Sincronización completada.',
  PROFILE_UPDATED: 'Perfil actualizado correctamente.',
  PASSWORD_RESET_SENT: 'Se ha enviado un correo para restablecer tu contraseña.',
  CACHE_CLEARED: 'Caché limpiado correctamente.',
};

// ==================== CONFIGURACIÓN DE FORMATOS ====================
export const FORMATS = {
  DATE: 'DD/MM/YYYY',
  TIME: 'HH:mm',
  DATETIME: 'DD/MM/YYYY HH:mm',
  CURRENCY: {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  },
  NUMBER: {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  },
};

// ==================== RUTAS DE ALMACENAMIENTO ====================
export const STORAGE_PATHS = {
  RECEIPTS: 'receipts',
  PROFILE_PHOTOS: 'profile_photos',
  EXPORTS: 'exports',
};

// ==================== CLAVES DE ALMACENAMIENTO LOCAL ====================
export const STORAGE_KEYS = {
  USER_LOGGED_IN: 'userLoggedIn',
  USER_ID: 'userId',
  USER_CACHE: 'user_cache',
  SALES_CACHE: 'sales_cache',
  OFFLINE_QUEUE: 'offline_queue',
  APP_SETTINGS: 'app_settings',
  RECENT_PRODUCTS: 'recent_products',
  LAST_SYNC: 'last_sync',
};

// ==================== CONFIGURACIÓN DE NOTIFICACIONES ====================
export const NOTIFICATION_TYPES = {
  SALE_ADDED: 'sale_added',
  SYNC_COMPLETED: 'sync_completed',
  SYNC_FAILED: 'sync_failed',
  DAILY_SUMMARY: 'daily_summary',
};

// ==================== PERMISOS REQUERIDOS ====================
export const REQUIRED_PERMISSIONS = {
  CAMERA: 'camera',
  MEDIA_LIBRARY: 'mediaLibrary',
  NOTIFICATIONS: 'notifications',
};

// ==================== CONFIGURACIÓN DE DESARROLLO ====================
export const DEV_CONFIG = {
  ENABLE_LOGS: __DEV__,
  MOCK_OFFLINE: false,
  SHOW_SYNC_STATUS: __DEV__,
  FORCE_OFFLINE_MODE: false,
};

// ==================== REGEX PATTERNS ====================
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[0-9]{10}$/,
  NUMBERS_ONLY: /^\d+$/,
  DECIMAL_NUMBERS: /^\d+(\.\d{0,2})?$/,
  ALPHANUMERIC: /^[a-zA-Z0-9\s]+$/,
  NAME: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
};