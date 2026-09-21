import { useQuery } from '@tanstack/react-query';
import productApi from '../services/product.service.js';

export const useRelatedProducts = (slug, limit = 8, options = {}) =>
  useQuery({
    queryKey: ['related-products', slug, limit],
    queryFn: () => productApi.getRelatedProducts(slug, limit),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(slug),
    ...options,
  });

export default useRelatedProducts;
