
import api from './api';

export const booksService = {
  // ==========================================
  // ADMINISTRACIÓN
  // ==========================================

  async getAll(params = {}) {
    const response = await api.get('/books', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/books/${id}`);
    return response.data;
  },

  async create(bookData) {
    const response = await api.post('/books', bookData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  async update(id, bookData) {
    const response = await api.patch(`/books/${id}`, bookData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  async toggleStatus(id) {
    const response = await api.patch(`/books/${id}/status`);
    return response.data;
  },

  // ==========================================
  // CATÁLOGO
  // ==========================================

  async getCatalog(params = {}) {
    const response = await api.get('/books/catalog', { params });
    return response.data;
  },

  async getCatalogById(id) {
    const response = await api.get(`/books/catalog/${id}`);
    return response.data;
  },
};
