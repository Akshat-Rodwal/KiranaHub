import apiClient from './apiClient.js';

export const bannerService = {
  /**
   * Fetch active banners for storefront (returns array)
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

  /**
   * Fetch grouped banners data ({ banners, top_single, instamart_cards })
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  getBannersData: async (params = {}) => {
    const res = await apiClient.get('/banners', { params });
    const rawData = res?.data?.data || res?.data || {};
    const banners = Array.isArray(rawData.banners)
      ? rawData.banners
      : Array.isArray(res?.data)
      ? res.data
      : [];

    return {
      banners,
      top_single: rawData.top_single || banners.find((b) => b.bannerType === 'top_single') || null,
      instamart_cards:
        rawData.instamart_cards ||
        banners.filter((b) => b.bannerType === 'instamart_card' || !b.bannerType),
    };
  },
};

export default bannerService;
