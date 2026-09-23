import apiClient from './apiClient.js';

export const reserveStock = async (items, cartToken) => {
  const response = await apiClient.post('/cart/reserve-stock', { items, cartToken });
  return response.data;
};

export const releaseStock = async (cartToken) => {
  const response = await apiClient.post('/cart/release-stock', { cartToken });
  return response.data;
};

export default {
  reserveStock,
  releaseStock,
};
