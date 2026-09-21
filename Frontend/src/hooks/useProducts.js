import { useQuery } from '@tanstack/react-query';
import productApi from '../services/product.service.js';

export const useProducts = (params = {}, options = {}) =>
  useQuery({
    queryKey: ['products', params],
    queryFn: () => productApi.getProducts(params),
    staleTime: 60 * 1000,
    ...options,
  });

export default useProducts;
