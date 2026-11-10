
import api from './api';

export const adminsService = {
  // Listar administradores
  async getAll(params = {}) {
    const response = await api.get('/admins', { params });
    return response.data;
  },

  // Consultar administrador por ID
  async getById(id) {
    const response = await api.get(`/admins/${id}`);
    return response.data;
  },

  // Crear administrador
  async create(adminData) {
    const response = await api.post('/admins', adminData);
    return response.data;
  },

  // Actualizar administrador
  async update(id, adminData) {
    const response = await api.patch(`/admins/${id}`, adminData);
    return response.data;
  },

  // Activar o desactivar administrador
  async toggleStatus(id) {
    const response = await api.patch(`/admins/${id}/status`);
    return response.data;
  },
};
