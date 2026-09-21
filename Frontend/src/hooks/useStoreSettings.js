import { useQuery } from '@tanstack/react-query';
import settingsService, { DEFAULT_STORE_SETTINGS } from '../services/settings.service.js';

export const useStoreSettings = () => {
  return useQuery({
    queryKey: ['store-settings-public'],
    queryFn: () => settingsService.getPublicSettings(),
    staleTime: 60 * 1000,
    initialData: DEFAULT_STORE_SETTINGS,
  });
};

export default useStoreSettings;
