import api from './api';

export const loansService = {
  async getAll(params = {}) {
    const response = await api.get('/loans', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/loans/${id}`);
    return response.data;
  },

  async getByStudent(documentNumber) {
    const response = await api.get(
      `/loans/student/document/${documentNumber}`,
    );
    return response.data;
  },

  async getMyLoans() {
    const response = await api.get('/loans/my-loans');
    return response.data;
  },

  async create(loanData) {
    const response = await api.post('/loans', loanData);
    return response.data;
  },
};