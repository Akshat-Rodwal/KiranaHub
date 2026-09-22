import { useQuery } from '@tanstack/react-query';
import bannerService from '../services/banner.service.js';

export const useBanners = (options = {}) =>
  useQuery({
    queryKey: ['banners'],
    queryFn: () => bannerService.getBanners({ active: true }),
    staleTime: 0,
    refetchOnMount: true,
    ...options,
  });

export default useBanners;
