import api from './api';

export const authService = {
  async loginAdmin(credentials) {
    const response = await api.post('/auth/admin/login', credentials);
    return response.data;
  },

  async loginStudent(credentials) {
    const response = await api.post('/auth/student/login', credentials);
    return response.data;
  },

  async getSession() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};