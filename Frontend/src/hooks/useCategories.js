import { useQuery } from '@tanstack/react-query';
import categoryApi from '../services/category.service.js';

export const useCategories = (options = {}) =>
  useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const body = await categoryApi.getCategories();
      return body.data.items;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });

export default useCategories;
