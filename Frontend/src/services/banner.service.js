import apiClient from './apiClient.js';

export const bannerService = {
  /**
   * Fetch active banners for storefront
   * @param {Object} params
   * @returns {Promise<Array>}
   */
  getBanners: async (params = {}) => {
    const res = await apiClient.get('/banners', { params });
    const banners =
      res?.data?.data?.banners ||
      res?.data?.banners ||
      res?.data?.data?.all ||
      res?.data?.data ||
      res?.data ||
      [];
    return Array.isArray(banners) ? banners : [];
  },
};

export default bannerService;
