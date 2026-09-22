import apiClient from './apiClient.js';

export const bannerService = {
  /**
   * Fetch active banners for storefront
   * @returns {Promise<Object>}
   */
  async getBanners() {
    const response = await apiClient.get('/banners?active=true');
    return response.data;
  },
};

export default bannerService;
