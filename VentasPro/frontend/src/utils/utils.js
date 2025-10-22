import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatea un número como moneda en dólares
 * @param {number|string} amount - Cantidad a formatear
 * @returns {string} - Cantidad formateada
 */
export const formatCurrency = (amount) => {
  const num = parseFloat(amount) || 0;
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

/**
 * Formatea una fecha en formato legible
 * @param {string|Date} date - Fecha a formatear
 * @param {string} formatStr - Formato deseado (por defecto: 'dd/MM/yyyy')
 * @returns {string} - Fecha formateada
 */
export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: es });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return '';
  }
};

/**
 * Formatea una fecha para uso en inputs de tipo date
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} - Fecha en formato YYYY-MM-DD
 */
export const formatDateForInput = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error formateando fecha para input:', error);
    return '';
  }
};

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD
 * @returns {string} - Fecha actual
 */
export const getCurrentDate = () => {
  return format(new Date(), 'yyyy-MM-dd');
};

/**
 * Formatea un porcentaje
 * @param {number|string} value - Valor a formatear
 * @returns {string} - Porcentaje formateado
 */
export const formatPercentage = (value) => {
  const num = parseFloat(value) || 0;
  return `${num.toFixed(2)}%`;
};

/**
 * Trunca un texto si es muy largo
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} - Texto truncado
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Valida si un email tiene formato correcto
 * @param {string} email - Email a validar
 * @returns {boolean} - true si es válido
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida si un número es positivo
 * @param {number|string} value - Valor a validar
 * @returns {boolean} - true si es positivo
 */
export const isPositiveNumber = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
};

/**
 * Calcula la diferencia en días entre dos fechas
 * @param {string|Date} startDate - Fecha inicial
 * @param {string|Date} endDate - Fecha final
 * @returns {number} - Diferencia en días
 */
export const getDaysDifference = (startDate, endDate) => {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Maneja errores de la API y retorna un mensaje amigable
 * @param {Error} error - Error de axios
 * @returns {string} - Mensaje de error
 */
export const handleAPIError = (error) => {
  if (error.response) {
    // Error de respuesta del servidor
    const { status, data } = error.response;
    
    if (status === 400) {
      return data.message || 'Datos inválidos. Por favor, verifica la información.';
    } else if (status === 404) {
      return 'Recurso no encontrado.';
    } else if (status === 500) {
      return 'Error del servidor. Por favor, intenta más tarde.';
    } else {
      return data.message || 'Ha ocurrido un error. Por favor, intenta nuevamente.';
    }
  } else if (error.request) {
    return 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
  } else {
    return 'Error al procesar la solicitud.';
  }
};

/**
 * Debounce para optimizar búsquedas
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en ms
 * @returns {Function} - Función con debounce
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
