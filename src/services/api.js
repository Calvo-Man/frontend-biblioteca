
import axios from 'axios';

// Instancia centralizada de Axios.
const api = axios.create({
  // URL del backend NestJS.
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',

  // Necesario para enviar y recibir cookies HttpOnly.
  withCredentials: true,

  // Tiempo máximo de espera.
  timeout: 15000,

  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Interceptor para centralizar el tratamiento de errores.
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response) {
      // El servidor respondió con un código de error.
      console.error(
        'Error de API:',
        error.response.status,
        error.response.data,
      );
    } else if (error.request) {
      // No hubo respuesta del servidor.
      console.error('No se pudo conectar con el backend.');
    } else {
      console.error('Error al realizar la petición:', error.message);
    }

    return Promise.reject(error);
  },
);

export default api;
