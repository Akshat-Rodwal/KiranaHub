import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import settingsService from '../../services/settings.service.js';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { toast } from '../../components/common/Toast.jsx';
import { IconRefresh } from '../../utils/icons.jsx';

function SettingsForm({ initialSettings, onSave, isPending }) {
  const [formData, setFormData] = useState({
    storeName: initialSettings.storeName || 'KiranaHub',
    announcementText: initialSettings.announcementText || '',
    isStoreOpen: initialSettings.isStoreOpen !== false,
    promoCode: initialSettings.promoCode || 'KIRANA50',
    promoBannerText: initialSettings.promoBannerText || '',
    supportPhone: initialSettings.supportPhone || '9876543210',
    deliveryTimeEstimate: initialSettings.deliveryTimeEstimate || '20-30 mins',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Operating Status Card */}
      <div className="p-6 rounded-3xl border border-border bg-surface shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-text-primary">
              Store Operating Status
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Temporarily pause incoming instant orders during holidays or inventory restocks.
            </p>
          </div>
          <Badge variant={formData.isStoreOpen ? 'success' : 'danger'} size="sm">
            {formData.isStoreOpen ? 'Open for Orders' : 'Store Closed'}
          </Badge>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-text-primary">
            <input
              type="checkbox"
              checked={formData.isStoreOpen}
              onChange={(e) => setFormData({ ...formData, isStoreOpen: e.target.checked })}
              className="h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-500"
            />
            Store is Open & Accepting Orders
          </label>
        </div>
      </div>

      {/* Announcement Bar Settings */}
      <div className="p-6 rounded-3xl border border-border bg-surface shadow-xs space-y-4">
        <div>
          <h3 className="font-display font-bold text-base text-text-primary">
            Navbar Announcement Bar
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Displays a prominent banner across the very top of the customer storefront.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-primary mb-1">
            Announcement Text
          </label>
          <input
            type="text"
            value={formData.announcementText}
            onChange={(e) => setFormData({ ...formData, announcementText: e.target.value })}
            placeholder="⚡ Free Express Delivery on orders above ₹499! Groceries delivered in 20-30 mins."
            className="w-full rounded-xl border border-border px-3.5 py-2.5 text-xs text-text-primary focus:border-brand-500 focus:outline-none"
          />
          <p className="text-[11px] text-text-muted mt-1">
            Leave empty to hide the announcement bar completely.
          </p>
        </div>
      </div>

      {/* Promotions & Details */}
      <div className="p-6 rounded-3xl border border-border bg-surface shadow-xs space-y-4">
        <div>
          <h3 className="font-display font-bold text-base text-text-primary">
            Hero Section Promotions & Contact
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Dynamic promotion code badge displayed on the homepage hero banner.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Featured Promo Code
            </label>
            <input
              type="text"
              value={formData.promoCode}
              onChange={(e) => setFormData({ ...formData, promoCode: e.target.value })}
              placeholder="KIRANA50"
              className="w-full rounded-xl border border-border px-3.5 py-2.5 text-xs text-text-primary font-mono focus:border-brand-500 focus:outline-none uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Promo Offer Tagline
            </label>
            <input
              type="text"
              value={formData.promoBannerText}
              onChange={(e) => setFormData({ ...formData, promoBannerText: e.target.value })}
              placeholder="Flat ₹50 OFF on your first grocery order"
              className="w-full rounded-xl border border-border px-3.5 py-2.5 text-xs text-text-primary focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Estimated Delivery ETA
            </label>
            <input
              type="text"
              value={formData.deliveryTimeEstimate}
              onChange={(e) => setFormData({ ...formData, deliveryTimeEstimate: e.target.value })}
              placeholder="20-30 mins"
              className="w-full rounded-xl border border-border px-3.5 py-2.5 text-xs text-text-primary focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Store Support Phone
            </label>
            <input
              type="text"
              value={formData.supportPhone}
              onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
              placeholder="9876543210"
              className="w-full rounded-xl border border-border px-3.5 py-2.5 text-xs text-text-primary focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isPending}
        >
          Save Storefront Settings
        </Button>
      </div>
    </form>
  );
}

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();

  const {
    data: settings,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['admin-store-settings'],
    queryFn: () => settingsService.getPublicSettings(),
    staleTime: 30 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => settingsService.updateStoreSettings(payload),
    onSuccess: () => {
      toast.success('Store Settings Saved', {
        description: 'Customer announcement bar and storefront banners updated live.',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-store-settings'] });
      queryClient.invalidateQueries({ queryKey: ['store-settings-public'] });
    },
    onError: (err) => {
      toast.error('Save Failed', {
        description: err?.message || 'Could not update store settings.',
      });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary" size="sm" className="font-mono uppercase tracking-wider">
              Storefront Customization
            </Badge>
            <span className="text-xs text-text-muted">Dynamic Announcements & Operating Hours</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-text-primary">
            Store Settings
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            Configure announcement bar alerts, store open/closed status, and promotional banners.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          isLoading={isFetching}
          leftIcon={<IconRefresh className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />}
        >
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="min-h-[30vh] flex items-center justify-center p-12 bg-surface rounded-3xl border border-border">
          <LoadingSpinner size="lg" message="Loading store settings..." />
        </div>
      ) : (
        <SettingsForm
          key={settings?.updatedAt || 'settings-loaded'}
          initialSettings={settings || {}}
          onSave={(payload) => updateMutation.mutate(payload)}
          isPending={updateMutation.isPending}
        />
      )}
    </div>
  );
}
