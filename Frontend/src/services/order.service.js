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

  /**
   * Submit return request for an order
   * @param {string} orderId
   * @param {Object} payload - { reason, comments, items }
   * @returns {Promise<Object>}
   */
  async requestReturn(orderId, payload) {
    const response = await apiClient.post(`/orders/${orderId}/return-request`, payload);
    return response.data;
  },

  /**
   * Download corporate PDF tax invoice
   * @param {string} orderId
   */
  async downloadInvoice(orderId) {
    const response = await apiClient.get(`/orders/${orderId}/invoice`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `KiranaHub-Invoice-${orderId.slice(-6).toUpperCase()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Cross-reference live product stock and price before checkout
   * @param {Array} items
   * @returns {Promise<Object>}
   */
  async validateCart(items) {
    const response = await apiClient.post('/cart/validate', { items });
    return response.data;
  },

  /**
   * Generate shipping label (Admin / Operations)
   * @param {string} orderId
   */
  async generateShippingLabel(orderId) {
    const response = await apiClient.post(`/orders/${orderId}/generate-shipping-label`);
    return response.data;
  },

  /**
   * Get shipping label (Admin / Operations)
   * @param {string} orderId
   */
  async getShippingLabel(orderId) {
    const response = await apiClient.get(`/orders/${orderId}/shipping-label`);
    return response.data;
  },

  /**
   * Process refund & inventory restoration (Admin)
   * @param {string} orderId
   * @param {Object} payload
   */
  async processRefund(orderId, payload = {}) {
    const response = await apiClient.post(`/orders/${orderId}/process-refund`, payload);
    return response.data;
  },

  /**
   * Export user personal data & order history (GDPR / CCPA)
   */
  async exportUserData() {
    const response = await apiClient.get('/users/me/export-data', {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'kiranahub-my-data.json');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Delete account and anonymize PII (GDPR Right to be Forgotten)
   */
  async deleteAccount() {
    const response = await apiClient.delete('/users/me/delete-account');
    return response.data;
  },
};

export default orderService;
