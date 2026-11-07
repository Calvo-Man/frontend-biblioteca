
import api from './api';

export const copiesService = {
  async getAll(params = {}) {
    const response = await api.get('/copies', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/copies/${id}`);
    return response.data;
  },

  async getByBook(bookId) {
    const response = await api.get(`/copies/book/${bookId}`);
    return response.data;
  },

  async create(copyData) {
    const response = await api.post('/copies', copyData);
    return response.data;
  },

  async update(id, copyData) {
    const response = await api.patch(`/copies/${id}`, copyData);
    return response.data;
  },

  async updateStatus(id, statusData) {
    const response = await api.patch(`/copies/${id}/status`, statusData);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/copies/${id}`);
    return response.data;
  },
};
