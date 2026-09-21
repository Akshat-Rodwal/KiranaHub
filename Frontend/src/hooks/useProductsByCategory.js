import { useProducts } from './useProducts.js';

export const useProductsByCategory = (slug, params = {}, options = {}) =>
  useProducts(
    { ...params, category: slug },
    { enabled: Boolean(slug), ...options },
  );

export default useProductsByCategory;
