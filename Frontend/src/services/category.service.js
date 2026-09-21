import apiClient from './apiClient.js';

export const categoryApi = {
  getCategories: () => apiClient.get('/categories'),
  getCategoryBySlug: (slug) => apiClient.get(`/categories/${slug}`),
};

export default categoryApi;
