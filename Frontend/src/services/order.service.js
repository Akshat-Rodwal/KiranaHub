import apiClient from './apiClient.js';

export const orderService = {
  /**
   * Create a new order (validates stock, charges server pricing, creates order)
   * @param {Object} payload - { items, deliveryAddress, paymentMethod }
   * @returns {Promise<Object>}
   */
  async createOrder(payload) {
    const response = await apiClient.post('/orders', payload);
    return response.data;
  },

  /**
   * Fetch current authenticated user's order history
   * @param {Object} params - { page, limit }
   * @returns {Promise<Object>}
   */
  async getMyOrders(params = {}) {
    const response = await apiClient.get('/orders/my-orders', { params });
    return response.data;
  },

  /**
   * Fetch single order details by ID
   * @param {string} orderId
   * @returns {Promise<Object>}
   */
  async getOrderById(orderId) {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data;
  },

  /**
   * Cancel order while in PENDING status (customer self-cancellation)
   * @param {string} orderId
   * @returns {Promise<Object>}
   */
  async cancelCustomerOrder(orderId) {
    const response = await apiClient.patch(`/orders/${orderId}/cancel`);
    return response.data;
  },
};

export default orderService;
