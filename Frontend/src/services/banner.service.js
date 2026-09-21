import apiClient from './apiClient.js';

export const bannerService = {
  /**
   * Fetch active banners for storefront
   * @returns {Promise<Object>}
   */
  async getBanners() {
    const response = await apiClient.get('/banners');
    return response.data;
  },
};

export default bannerService;
