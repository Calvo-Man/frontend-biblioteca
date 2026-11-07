import api from './api';

export const returnsService = {
  async register(loanId, returnData = {}) {
    const response = await api.post(`/returns/${loanId}`, returnData);
    return response.data;
  },
};