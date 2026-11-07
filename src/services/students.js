
import api from './api';

export const studentsService = {
  async getAll(params = {}) {
    const response = await api.get('/students', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  async create(studentData) {
    const response = await api.post('/students', studentData);
    return response.data;
  },

  async update(id, studentData) {
    const response = await api.patch(`/students/${id}`, studentData);
    return response.data;
  },

  async toggleStatus(id) {
    const response = await api.patch(`/students/${id}/status`);
    return response.data;
  },
};
