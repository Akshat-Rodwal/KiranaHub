import { useQuery } from '@tanstack/react-query';
import categoryApi from '../services/category.service.js';

export const useCategories = (options = {}) =>
  useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await categoryApi.getCategories();
      const items =
        res?.data?.data?.categories ||
        res?.data?.data?.items ||
        res?.data?.categories ||
        res?.data?.items ||
        res?.data?.data ||
        res?.data ||
        [];
      return Array.isArray(items) ? items : [];
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });

export default useCategories;
