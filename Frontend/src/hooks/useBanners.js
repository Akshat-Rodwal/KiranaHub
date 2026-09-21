import { useQuery } from '@tanstack/react-query';
import bannerService from '../services/banner.service.js';

export const useBanners = (options = {}) =>
  useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      const res = await bannerService.getBanners();
      return res?.data || null;
    },
    staleTime: 60 * 1000,
    ...options,
  });

export default useBanners;
