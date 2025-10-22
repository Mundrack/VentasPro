import axios from 'axios';

// Configurar la URL base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

// Crear instancia de axios con configuración por defecto
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      console.error('Error de respuesta:', error.response.data);
      console.error('Estado:', error.response.status);
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      console.error('Error de petición:', error.request);
    } else {
      // Algo sucedió al configurar la petición
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// ========== VENDEDORES ==========
export const vendedoresAPI = {
  // Obtener todos los vendedores
  getAll: () => api.get('/vendedores/'),
  
  // Obtener vendedores activos
  getActivos: () => api.get('/vendedores/activos/'),
  
  // Obtener un vendedor por ID
  getById: (id) => api.get(`/vendedores/${id}/`),
  
  // Crear un nuevo vendedor
  create: (data) => api.post('/vendedores/', data),
  
  // Actualizar un vendedor
  update: (id, data) => api.put(`/vendedores/${id}/`, data),
  
  // Eliminar un vendedor
  delete: (id) => api.delete(`/vendedores/${id}/`),
  
  // Obtener ventas de un vendedor
  getVentas: (id, params = {}) => api.get(`/vendedores/${id}/ventas/`, { params }),
  
  // Obtener comisiones de un vendedor
  getComisiones: (id) => api.get(`/vendedores/${id}/comisiones/`),
};

// ========== REGLAS DE COMISIÓN ==========
export const reglasAPI = {
  // Obtener todas las reglas
  getAll: (params = {}) => api.get('/reglas/', { params }),
  
  // Obtener reglas activas
  getActivas: () => api.get('/reglas/', { params: { activas: 'true' } }),
  
  // Obtener una regla por ID
  getById: (id) => api.get(`/reglas/${id}/`),
  
  // Crear una nueva regla
  create: (data) => api.post('/reglas/', data),
  
  // Actualizar una regla
  update: (id, data) => api.put(`/reglas/${id}/`, data),
  
  // Eliminar una regla
  delete: (id) => api.delete(`/reglas/${id}/`),
  
  // Activar una regla
  activar: (id) => api.post(`/reglas/${id}/activar/`),
  
  // Desactivar una regla
  desactivar: (id) => api.post(`/reglas/${id}/desactivar/`),
};

// ========== VENTAS ==========
export const ventasAPI = {
  // Obtener todas las ventas
  getAll: (params = {}) => api.get('/ventas/', { params }),
  
  // Obtener una venta por ID
  getById: (id) => api.get(`/ventas/${id}/`),
  
  // Crear una nueva venta
  create: (data) => api.post('/ventas/', data),
  
  // Actualizar una venta
  update: (id, data) => api.put(`/ventas/${id}/`, data),
  
  // Eliminar una venta
  delete: (id) => api.delete(`/ventas/${id}/`),
  
  // Obtener estadísticas de ventas
  getEstadisticas: (params = {}) => api.get('/ventas/estadisticas/', { params }),
};

// ========== COMISIONES ==========
export const comisionesAPI = {
  // Calcular comisiones para un período
  calcular: (data) => api.post('/comisiones/calcular/', data),
  
  // Obtener resumen de comisiones
  getResumen: (params = {}) => api.get('/comisiones/resumen/', { params }),
};

// Exportar la instancia de axios configurada
export default api;
