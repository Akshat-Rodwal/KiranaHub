import apiClient from './apiClient.js';

export const getBundles = async () => {
  const response = await apiClient.get('/bundles');
  return response.data?.bundles || response.data || [];
};

export default {
  getBundles,
};
