import apiClient from './apiClient.js';

export const healthApi = {
  checkHealth: () => apiClient.get('/health'),
};

export default healthApi;
