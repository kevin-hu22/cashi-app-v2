// src/utils/validators.js
import { ERROR_MESSAGES, LIMITS, REGEX } from './constants';

// ==================== VALIDACIONES DE AUTENTICACIÓN ====================

/**
 * Valida un email
 * @param {string} email - Email a validar
 * @returns {object} { isValid: boolean, error?: string }
 */
export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, error: ERROR_MESSAGES.REQUIRED_FIELD };
  }

  if (!REGEX.EMAIL.test(email.trim())) {
    return { isValid: false, error: ERROR_MESSAGES.INVALID_EMAIL };
  }

  return { isValid: true };
};

/**
 * Valida una contraseña
 * @param {string} password - Contraseña a validar
 * @returns {object} { isValid: boolean, error?: string }
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, error: ERROR_MESSAGES.REQUIRED_FIELD };
  }

  if (password.length < LIMITS.MIN_PASSWORD_LENGTH) {
    return { 
      isValid: false, 
      error: `La contraseña debe tener al menos ${LIMITS.MIN_PASSWORD_LENGTH} caracteres` 
    };
  }

  if (password.length > LIMITS.MAX_PASSWORD_LENGTH) {
    return { 
      isValid: false, 
      error: `La contraseña no puede tener más de ${LIMITS.MAX_PASSWORD_LENGTH} caracteres` 
    };
  }

  return { isValid: true };
};

/**
 * Valida la confirmación de contraseña
 * @param {string} password - Contraseña
 * @param {string} confirmPassword - Confirmación de contraseña
 * @returns {object} { isValid: boolean, error?: string }
 */
export const validatePasswordConfirmation = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { isValid: false, error: ERROR_MESSAGES.REQUIRED_FIELD };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: ERROR_MESSAGES.PASSWORDS_DONT_MATCH };
  }

  return { isValid: true };
};

/**
 * Valida un nombre
 * @param {string} name - Nombre a validar
 * @returns {object} { isValid: boolean, error?: string }
 */
export const validateName = (name) => {
  if (!name) {
    return { isValid: false, error: ERROR_MESSAGES.REQUIRED_FIELD };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < LIMITS.MIN_NAME_LENGTH) {
    return { 
      isValid: false, 
      error: `El nombre debe tener al menos ${LIMITS.MIN_NAME_LENGTH} caracteres` 
    };
  }

  if (trimmedName.length > LIMITS.MAX_NAME_LENGTH) {
    return { 
      isValid: false, 
      error: `El nombre no puede tener más de ${LIMITS.MAX_NAME_LENGTH} caracteres` 
    };
  }

  if (!REGEX.NAME.test(trimmedName)) {
    return { 
      isValid: false, 
      error: 'El nombre solo puede contener letras y espacios' 
    };
  }

  return { isValid: true };
};

// ==================== VALIDACIONES DE VENTAS ====================

/**
 * Valida el valor de una venta
 * @param {number|string} value - Valor a validar
 * @returns {object} { isValid: boolean, error?: string }
 */
export const validateSaleValue = (value) => {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, error: ERROR_MESSAGES.REQUIRED_FIELD };
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return { isValid: false, error: ERROR_MESSAGES.INVALID_SALE_VALUE };
  }

  if (numValue < LIMITS.MIN_SALE_VALUE) {
    return { 
      isValid: false, 
      error: 'El valor debe ser mayor a 0' 
    };
  }

  if (numValue > LIMITS.MAX_SALE_VALUE) {
    return { 
      isValid: false, 
      error: `El valor no puede ser mayor a ${LIMITS.MAX_SALE_VALUE}` 
    };
  }

  return { isValid: true };
};

/**
 * Valida la cantidad de una venta
 * @param {number|string} quantity - Cantidad a validar
 * @returns {object} { isValid: boolean, error?: string }
 */
export const validateQuantity = (quantity) => {
  if (quantity === null || quantity === undefined || quantity === '') {
    return { isValid: false, error: ERROR_MESSAGES.REQUIRED_FIELD };
  }

  const numQuantity = typeof quantity === 'string' ? parseInt(quantity) : quantity;

  if (isNaN(numQuantity) || !Number.isInteger(numQuantity)) {
    return { isValid: false, error: 'La cantidad debe ser un número entero' };
  }

  if (numQuantity < LIMITS.MIN_QUANTITY) {
    return { isValid: false, error: ERROR_MESSAGES.INVALID_QUANTITY };
  }

  if (numQuantity > LIMITS.MAX_QUANTITY) {
    return { 
      isValid: false, 
      error: `La cantidad no puede ser mayor a ${LIMITS.MAX_QUANTITY}` 
    };
  }

  return { isValid: true };
};

/**
 * Valida el nombre de un producto
 * @param {string} productName - Nombre del producto
 * @returns {object} { isValid: boolean, error?: string }
 */
export const validateProductName = (productName) => {
  if (!productName) {
    return { isValid: false, error: ERROR_MESSAGES.REQUIRED_FIELD };
  }

  const trimmedName = productName.trim();

  if (trimmedName.length === 0) {
    return { isValid: false, error: ERROR_MESSAGES.REQUIRED_FIELD };
  }

  if (trimmedName.length > LIMITS.MAX_PRODUCT_NAME_LENGTH) {
    return { 
      isValid: false, 
      error: `El nombre del producto no puede tener más de ${LIMITS.MAX_PRODUCT_NAME_LENGTH} caracteres` 
    };
  }

  return { isValid: true };
};

/**
 * Valida un formulario de venta completo
 * @param {object} saleData - Datos de la venta
 * @returns {object} { isValid: boolean, errors: object }
 */
export const validateSaleForm = (saleData) => {
  const errors = {};

  // Validar cantidad
  const quantityValidation = validateQuantity(saleData.quantity);
  if (!quantityValidation.isValid) {
    errors.quantity = quantityValidation.error;
  }

  // Validar nombre del producto
  const productNameValidation = validateProductName(saleData.productName);
  if (!productNameValidation.isValid) {
    errors.productName = productNameValidation.error;
  }

  // Validar valor
  const valueValidation = validateSaleValue(saleData.saleValue);
  if (!valueValidation.isValid) {
    errors.saleValue = valueValidation.error;
  }

  // Validar tipo de pago
  if (!saleData.paymentType) {
    errors.paymentType = ERROR_MESSAGES.REQUIRED_FIELD;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ==================== VALIDACIONES DE ARCHIVOS ====================

/**
 * Valida el tamaño de un archivo
 * @param {number} size - Tamaño en bytes
 * @param {number} maxSize - Tamaño máximo permitido
 * @returns {object} { isValid: boolean, error?: string }
 */
export const validateFileSize = (size, maxSize = LIMITS.MAX_IMAGE_SIZE) => {
  if (size > maxSize) {
    return { 
      isValid: false, 
      error: ERROR_MESSAGES.IMAGE_TOO_LARGE 
    };
  }

  return { isValid: true };
};

/**
 * Valida el tipo de archivo
 * @param {string} mimeType - Tipo MIME del archivo
 * @param {Array} allowedTypes - Tipos permitidos
 * @returns {object} { isValid: boolean, error?: string }
 */
export const validateFileType = (mimeType, allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']) => {
  if (!allowedTypes.includes(mimeType)) {
    return { 
      isValid: false, 
      error: 'Tipo de archivo no permitido' 
    };
  }

  return { isValid: true };
};

/**
 * Valida una imagen
 * @param {object} image - Objeto de imagen con size y mimeType
 * @returns {object} { isValid: boolean, error?: string }
 */
export const validateImage = (image) => {
  if (!image) {
    return { isValid: true }; // La imagen es opcional
  }

  // Validar tamaño
  const sizeValidation = validateFileSize(image.size);
  if (!sizeValidation.isValid) {
    return sizeValidation;
  }

  // Validar tipo
  const typeValidation = validateFileType(image.mimeType);
  if (!typeValidation.isValid) {
    return typeValidation;
  }

  return { isValid: true };
};

// ==================== VALIDACIONES DE FORMULARIOS ====================

/**
 * Valida un formulario de registro
 * @param {object} formData - Datos del formulario
 * @returns {object} { isValid: boolean, errors: object }
 */
export const validateSignupForm = (formData) => {
  const errors = {};

  // Validar nombre
  const nameValidation = validateName(formData.displayName);
  if (!nameValidation.isValid) {
    errors.displayName = nameValidation.error;
  }

  // Validar email
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
  }

  // Validar contraseña
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error;
  }

  // Validar confirmación de contraseña
  const confirmValidation = validatePasswordConfirmation(
    formData.password,
    formData.confirmPassword
  );
  if (!confirmValidation.isValid) {
    errors.confirmPassword = confirmValidation.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Valida un formulario de login
 * @param {object} formData - Datos del formulario
 * @returns {object} { isValid: boolean, errors: object }
 */
export const validateLoginForm = (formData) => {
  const errors = {};

  // Validar email
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
  }

  // Validar contraseña (solo requerida, no longitud)
  if (!formData.password) {
    errors.password = ERROR_MESSAGES.REQUIRED_FIELD;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ==================== VALIDACIONES DE DATOS ====================

/**
 * Valida un número de teléfono
 * @param {string} phone - Teléfono a validar
 * @returns {object} { isValid: boolean, error?: string }
 */
export const validatePhone = (phone) => {
  if (!phone) {
    return { isValid: false, error: ERROR_MESSAGES.REQUIRED_FIELD };
  }

  const cleanPhone = phone.replace(/\D/g, '');

  if (!REGEX.PHONE.test(cleanPhone)) {
    return { 
      isValid: false, 
      error: 'El teléfono debe tener 10 dígitos' 
    };
  }

  return { isValid: true };
};

/**
 * Valida una fecha
 * @param {Date|string} date - Fecha a validar
 * @param {object} options - Opciones de validación
 * @returns {object} { isValid: boolean, error?: string }
 */
export const validateDate = (date, options = {}) => {
  if (!date) {
    return { isValid: false, error: ERROR_MESSAGES.REQUIRED_FIELD };
  }

  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: 'Fecha inválida' };
  }

  // Validar fecha mínima
  if (options.minDate) {
    const minDateObj = options.minDate instanceof Date ? options.minDate : new Date(options.minDate);
    if (dateObj < minDateObj) {
      return { 
        isValid: false, 
        error: 'La fecha no puede ser anterior a ' + minDateObj.toLocaleDateString() 
      };
    }
  }

  // Validar fecha máxima
  if (options.maxDate) {
    const maxDateObj = options.maxDate instanceof Date ? options.maxDate : new Date(options.maxDate);
    if (dateObj > maxDateObj) {
      return { 
        isValid: false, 
        error: 'La fecha no puede ser posterior a ' + maxDateObj.toLocaleDateString() 
      };
    }
  }

  return { isValid: true };
};

// ==================== VALIDACIONES DE NEGOCIO ====================

/**
 * Valida si se puede agregar una venta offline
 * @param {number} queueSize - Tamaño actual de la cola
 * @returns {object} { isValid: boolean, error?: string }
 */
export const validateOfflineQueueSpace = (queueSize) => {
  if (queueSize >= LIMITS.MAX_OFFLINE_QUEUE_SIZE) {
    return { 
      isValid: false, 
      error: ERROR_MESSAGES.OFFLINE_QUEUE_FULL 
    };
  }

  return { isValid: true };
};

/**
 * Valida si un valor está dentro de un rango
 * @param {number} value - Valor a validar
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {object} { isValid: boolean, error?: string }
 */
export const validateRange = (value, min, max) => {
  if (value < min || value > max) {
    return { 
      isValid: false, 
      error: `El valor debe estar entre ${min} y ${max}` 
    };
  }

  return { isValid: true };
};

// ==================== UTILIDADES DE VALIDACIÓN ====================

/**
 * Valida múltiples campos
 * @param {object} validations - Objeto con validaciones { campo: resultado }
 * @returns {object} { isValid: boolean, errors: object }
 */
export const validateMultiple = (validations) => {
  const errors = {};

  Object.entries(validations).forEach(([field, validation]) => {
    if (!validation.isValid) {
      errors[field] = validation.error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Sanitiza un input eliminando caracteres peligrosos
 * @param {string} input - Input a sanitizar
 * @returns {string} Input sanitizado
 */
export const sanitizeInput = (input) => {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Eliminar tags HTML básicos
    .replace(/javascript:/gi, '') // Eliminar javascript:
    .substring(0, 1000); // Limitar longitud
};

/**
 * Valida si un string está vacío
 * @param {string} value - Valor a validar
 * @returns {boolean} true si está vacío
 */
export const isEmpty = (value) => {
  return !value || value.trim().length === 0;
};

/**
 * Valida si un objeto está vacío
 * @param {object} obj - Objeto a validar
 * @returns {boolean} true si está vacío
 */
export const isEmptyObject = (obj) => {
  return !obj || Object.keys(obj).length === 0;
};