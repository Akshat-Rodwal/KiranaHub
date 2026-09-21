import apiClient from './apiClient.js';

export const DEFAULT_STORE_SETTINGS = {
  storeName: 'KiranaHub',
  announcementText: '⚡ Free Express Delivery on orders above ₹499! Express 20-30 min delivery active.',
  isStoreOpen: true,
  promoCode: 'KIRANA50',
  promoBannerText: 'Flat ₹50 OFF on your first grocery order',
  supportPhone: '9876543210',
  deliveryTimeEstimate: '20-30 mins',
};

export const settingsService = {
  /**
   * Fetch public store settings (announcements, store open/closed status, promo codes)
   * Falls back to DEFAULT_STORE_SETTINGS if network error occurs.
   * @returns {Promise<Object>}
   */
  async getPublicSettings() {
    try {
      const response = await apiClient.get('/settings');
      return response.data?.data || response.data || DEFAULT_STORE_SETTINGS;
    } catch {
      return DEFAULT_STORE_SETTINGS;
    }
  },

  /**
   * Update store settings (admin/manager only)
   * @param {Object} payload
   * @returns {Promise<Object>}
   */
  async updateStoreSettings(payload) {
    const response = await apiClient.patch('/admin/settings', payload);
    return response.data?.data || response.data;
  },
};

export default settingsService;
