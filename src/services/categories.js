
import api from './api';

export const categoriesService = {
  async getAll(params = {}) {
    const response = await api.get('/categories', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  async create(categoryData) {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  async update(id, categoryData) {
    const response = await api.patch(`/categories/${id}`, categoryData);
    return response.data;
  },

  async toggleStatus(id) {
    const response = await api.patch(`/categories/${id}/status`);
    return response.data;
  },
};
