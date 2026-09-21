import { useQuery } from '@tanstack/react-query';
import categoryApi from '../services/category.service.js';

export const useCategory = (slug, options = {}) =>
  useQuery({
    queryKey: ['category', slug],
    queryFn: async () => {
      const body = await categoryApi.getCategoryBySlug(slug);
      return body.data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(slug),
    retry: false,
    ...options,
  });

export default useCategory;
