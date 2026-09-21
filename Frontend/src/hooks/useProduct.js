import { useQuery } from '@tanstack/react-query';
import productApi from '../services/product.service.js';

export const useProduct = (slug, options = {}) =>
  useQuery({
    queryKey: ['product', slug],
    queryFn: () => productApi.getProductBySlug(slug),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(slug),
    retry: false,
    ...options,
  });

export default useProduct;
