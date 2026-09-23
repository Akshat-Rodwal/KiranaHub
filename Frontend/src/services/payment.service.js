import apiClient from './apiClient.js';

export const createRazorpayOrder = async (orderId) => {
  const response = await apiClient.post('/payments/create-order', { orderId });
  return response.data;
};

export const verifyPayment = async (verificationPayload) => {
  const response = await apiClient.post('/payments/verify', verificationPayload);
  return response.data;
};

export default {
  createRazorpayOrder,
  verifyPayment,
};
