import apiClient from './apiClient.js';

export const adminService = {
  /**
   * Fetch overview analytics (KPI metrics, sales, order status counts, low stock, payment breakdown)
   * @returns {Promise<Object>}
   */
  async getOverviewAnalytics() {
    const response = await apiClient.get('/admin/analytics/overview');
    return response.data;
  },

  /**
   * Fetch all orders with pagination, status filtering, and search
   * @param {Object} params - { page, limit, status, search }
   * @returns {Promise<Object>}
   */
  async getAdminOrders(params = {}) {
    const response = await apiClient.get('/admin/orders', { params });
    return response.data;
  },

  /**
   * Update order status with state machine transition validation
   * @param {string} orderId
   * @param {string} orderStatus
   * @returns {Promise<Object>}
   */
  async updateOrderStatus(orderId, orderStatus) {
    const response = await apiClient.patch(`/admin/orders/${orderId}/status`, { orderStatus });
    return response.data;
  },

  /**
   * Quick inline product stock updater
   * @param {string} productId
   * @param {number} stock
   * @returns {Promise<Object>}
   */
  async updateProductStock(productId, stock) {
    const response = await apiClient.patch(`/admin/products/${productId}/stock`, { stock });
    return response.data;
  },

  /**
   * Create a new product (admin/manager)
   * @param {Object} payload
   * @returns {Promise<Object>}
   */
  async createProduct(payload) {
    const response = await apiClient.post('/products', payload);
    return response.data;
  },

  /**
   * Update existing product by ID or slug (admin/manager)
   * @param {string} idOrSlug
   * @param {Object} payload
   * @returns {Promise<Object>}
   */
  async updateProduct(idOrSlug, payload) {
    const response = await apiClient.put(`/products/${idOrSlug}`, payload);
    return response.data;
  },

  /**
   * Delete product by ID or slug (admin/manager)
   * @param {string} idOrSlug
   * @returns {Promise<Object>}
   */
  async deleteProduct(idOrSlug) {
    const response = await apiClient.delete(`/products/${idOrSlug}`);
    return response.data;
  },

  /**
   * Fetch all categories
   * @returns {Promise<Object>}
   */
  async getCategories() {
    const response = await apiClient.get('/categories');
    return response.data;
  },

  /**
   * Create category (admin/manager)
   * @param {Object} payload
   * @returns {Promise<Object>}
   */
  async createCategory(payload) {
    const response = await apiClient.post('/categories', payload);
    return response.data;
  },

  /**
   * Fetch all banners for admin management
   * @returns {Promise<Object>}
   */
  async getAdminBanners() {
    const response = await apiClient.get('/admin/banners');
    return response.data;
  },

  /**
   * Create a new banner
   * @param {Object} payload
   * @returns {Promise<Object>}
   */
  async createBanner(payload) {
    const response = await apiClient.post('/admin/banners', payload);
    return response.data;
  },

  /**
   * Update existing banner
   * @param {string} id
   * @param {Object} payload
   * @returns {Promise<Object>}
   */
  async updateBanner(id, payload) {
    const response = await apiClient.put(`/admin/banners/${id}`, payload);
    return response.data;
  },

  /**
   * Delete banner
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async deleteBanner(id) {
    const response = await apiClient.delete(`/admin/banners/${id}`);
    return response.data;
  },

  /**
   * Upload image file for banners or products
   * @param {File} file
   * @returns {Promise<Object>}
   */
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await apiClient.post('/banners/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data || response;
    } catch (err) {
      const fallbackRes = await apiClient.post('/admin/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return fallbackRes.data || fallbackRes;
    }
  },
};

export default adminService;
