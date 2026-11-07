import api from './api';

export const reportsService = {
  async getSummary() {
    const response = await api.get('/reports/summary');
    return response.data;
  },

  async getOverdueLoans() {
    const response = await api.get('/reports/overdue-loans');
    return response.data;
  },

  async getMostBorrowedBooks() {
    const response = await api.get('/reports/most-borrowed-books');
    return response.data;
  },

  async getLoanHistory() {
    const response = await api.get('/reports/loan-history');
    return response.data;
  },
};