// src/utils/formatters.js
import { APP_CONFIG, FORMATS } from './constants';

// ==================== FORMATEO DE MONEDA ====================

/**
 * Formatea un número como moneda colombiana
 * @param {number} value - Valor a formatear
 * @param {boolean} showSymbol - Mostrar símbolo de moneda
 * @returns {string} Valor formateado
 */
export const formatCurrency = (value, showSymbol = true) => {
  if (value === null || value === undefined || isNaN(value)) {
    return showSymbol ? '$0' : '0';
  }

  const formatter = new Intl.NumberFormat(APP_CONFIG.locale, {
    ...FORMATS.CURRENCY,
    style: showSymbol ? 'currency' : 'decimal',
  });

  return formatter.format(value);
};

/**
 * Formatea un número como moneda compacta (ej: $1.2M)
 * @param {number} value - Valor a formatear
 * @returns {string} Valor formateado compacto
 */
export const formatCurrencyCompact = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '$0';
  }

  const formatter = new Intl.NumberFormat(APP_CONFIG.locale, {
    style: 'currency',
    currency: APP_CONFIG.currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  });

  return formatter.format(value);
};

/**
 * Parsea un string de moneda a número
 * @param {string} value - Valor a parsear
 * @returns {number} Valor numérico
 */
export const parseCurrency = (value) => {
  if (!value) return 0;
  
  // Eliminar símbolo de moneda, puntos de miles y espacios
  const cleanValue = value
    .replace(/[$.]/g, '')
    .replace(/\s/g, '')
    .replace(',', '.');
  
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
};

// ==================== FORMATEO DE NÚMEROS ====================

/**
 * Formatea un número con separadores de miles
 * @param {number} value - Valor a formatear
 * @param {number} decimals - Cantidad de decimales
 * @returns {string} Número formateado
 */
export const formatNumber = (value, decimals = 0) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  const formatter = new Intl.NumberFormat(APP_CONFIG.locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return formatter.format(value);
};

/**
 * Formatea un número como porcentaje
 * @param {number} value - Valor a formatear (0-1 o 0-100)
 * @param {boolean} isDecimal - Si el valor está en formato decimal (0-1)
 * @returns {string} Porcentaje formateado
 */
export const formatPercentage = (value, isDecimal = true) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }

  const percentValue = isDecimal ? value * 100 : value;
  return `${formatNumber(percentValue, 1)}%`;
};

// ==================== FORMATEO DE FECHAS ====================

/**
 * Formatea una fecha
 * @param {Date|string|number} date - Fecha a formatear
 * @param {string} format - Formato deseado
 * @returns {string} Fecha formateada
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return '';

  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }

  const options = {
    short: { day: '2-digit', month: '2-digit', year: 'numeric' },
    medium: { day: 'numeric', month: 'short', year: 'numeric' },
    long: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
    monthYear: { month: 'long', year: 'numeric' },
    dayMonth: { day: 'numeric', month: 'long' },
  };

  return dateObj.toLocaleDateString(APP_CONFIG.locale, options[format] || options.short);
};

/**
 * Formatea una hora
 * @param {Date|string|number} date - Fecha/hora a formatear
 * @param {boolean} showSeconds - Mostrar segundos
 * @returns {string} Hora formateada
 */
export const formatTime = (date, showSeconds = false) => {
  if (!date) return '';

  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }

  return dateObj.toLocaleTimeString(APP_CONFIG.locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: showSeconds ? '2-digit' : undefined,
  });
};

/**
 * Formatea fecha y hora
 * @param {Date|string|number} date - Fecha a formatear
 * @param {string} dateFormat - Formato de fecha
 * @param {boolean} showSeconds - Mostrar segundos
 * @returns {string} Fecha y hora formateadas
 */
export const formatDateTime = (date, dateFormat = 'short', showSeconds = false) => {
  if (!date) return '';

  return `${formatDate(date, dateFormat)} ${formatTime(date, showSeconds)}`;
};

/**
 * Obtiene tiempo relativo (hace X tiempo)
 * @param {Date|string|number} date - Fecha a comparar
 * @returns {string} Tiempo relativo
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';

  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }

  const now = new Date();
  const diffMs = now - dateObj;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return 'hace un momento';
  } else if (diffMin < 60) {
    return `hace ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`;
  } else if (diffHour < 24) {
    return `hace ${diffHour} ${diffHour === 1 ? 'hora' : 'horas'}`;
  } else if (diffDay < 7) {
    return `hace ${diffDay} ${diffDay === 1 ? 'día' : 'días'}`;
  } else if (diffDay < 30) {
    const weeks = Math.floor(diffDay / 7);
    return `hace ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
  } else if (diffDay < 365) {
    const months = Math.floor(diffDay / 30);
    return `hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
  } else {
    const years = Math.floor(diffDay / 365);
    return `hace ${years} ${years === 1 ? 'año' : 'años'}`;
  }
};

// ==================== FORMATEO DE TEXTO ====================

/**
 * Capitaliza la primera letra de un texto
 * @param {string} text - Texto a capitalizar
 * @returns {string} Texto capitalizado
 */
export const capitalize = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Capitaliza cada palabra en un texto
 * @param {string} text - Texto a capitalizar
 * @returns {string} Texto con cada palabra capitalizada
 */
export const capitalizeWords = (text) => {
  if (!text) return '';
  return text
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
};

/**
 * Trunca un texto a cierta longitud
 * @param {string} text - Texto a truncar
 * @param {number} length - Longitud máxima
 * @param {string} suffix - Sufijo a agregar
 * @returns {string} Texto truncado
 */
export const truncate = (text, length = 50, suffix = '...') => {
  if (!text || text.length <= length) return text;
  return text.substring(0, length - suffix.length) + suffix;
};

/**
 * Formatea un nombre completo
 * @param {string} firstName - Nombre
 * @param {string} lastName - Apellido
 * @returns {string} Nombre formateado
 */
export const formatFullName = (firstName, lastName) => {
  const parts = [];
  if (firstName) parts.push(firstName.trim());
  if (lastName) parts.push(lastName.trim());
  return capitalizeWords(parts.join(' '));
};

// ==================== FORMATEO DE ARCHIVOS ====================

/**
 * Formatea el tamaño de un archivo
 * @param {number} bytes - Tamaño en bytes
 * @returns {string} Tamaño formateado
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Obtiene la extensión de un archivo
 * @param {string} filename - Nombre del archivo
 * @returns {string} Extensión del archivo
 */
export const getFileExtension = (filename) => {
  if (!filename) return '';
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
};

// ==================== FORMATEO PARA FORMULARIOS ====================

/**
 * Formatea un valor para input de moneda
 * @param {string} value - Valor del input
 * @returns {string} Valor formateado
 */
export const formatCurrencyInput = (value) => {
  if (!value) return '';
  
  // Eliminar caracteres no numéricos excepto punto
  const cleanValue = value.replace(/[^\d.]/g, '');
  
  // Asegurar solo un punto decimal
  const parts = cleanValue.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Limitar decimales a 2
  if (parts.length === 2 && parts[1].length > 2) {
    return parts[0] + '.' + parts[1].substring(0, 2);
  }
  
  return cleanValue;
};

/**
 * Formatea un valor para input numérico
 * @param {string} value - Valor del input
 * @param {boolean} allowDecimals - Permitir decimales
 * @returns {string} Valor formateado
 */
export const formatNumberInput = (value, allowDecimals = false) => {
  if (!value) return '';
  
  if (allowDecimals) {
    return value.replace(/[^\d.]/g, '');
  } else {
    return value.replace(/[^\d]/g, '');
  }
};

// ==================== UTILIDADES ====================

/**
 * Pluraliza una palabra según la cantidad
 * @param {number} count - Cantidad
 * @param {string} singular - Forma singular
 * @param {string} plural - Forma plural (opcional)
 * @returns {string} Palabra pluralizada
 */
export const pluralize = (count, singular, plural = null) => {
  if (count === 1) return singular;
  return plural || `${singular}s`;
};

/**
 * Formatea una lista de elementos
 * @param {Array} items - Lista de elementos
 * @param {string} conjunction - Conjunción (y/o)
 * @returns {string} Lista formateada
 */
export const formatList = (items, conjunction = 'y') => {
  if (!items || items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;
  
  const lastItem = items[items.length - 1];
  const otherItems = items.slice(0, -1);
  return `${otherItems.join(', ')} ${conjunction} ${lastItem}`;
};