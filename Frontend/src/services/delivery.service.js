import apiClient from './apiClient.js';

export const getActiveDeliveryOrders = async () => {
  const response = await apiClient.get('/delivery/orders');
  return response.data;
};

export const acceptDeliveryOrder = async (orderId, riderData = {}) => {
  const response = await apiClient.post(`/delivery/accept/${orderId}`, riderData);
  return response.data;
};

export const updateDeliveryStep = async (orderId, status, otp = '') => {
  const response = await apiClient.post(`/delivery/status/${orderId}`, { status, otp });
  return response.data;
};

export const updateDeliveryLocation = async (orderId, coords) => {
  const response = await apiClient.post(`/delivery/location/${orderId}`, { coords });
  return response.data;
};

export default {
  getActiveDeliveryOrders,
  acceptDeliveryOrder,
  updateDeliveryStep,
  updateDeliveryLocation,
};
