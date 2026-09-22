import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Tag,
  Zap,
  Gift,
  Clock,
  Sparkles,
  Save,
  RefreshCw,
  Eye,
  CheckCircle,
  Copy,
  Check,
  ShieldCheck,
  MapPin,
  Megaphone,
  Store,
} from 'lucide-react';

import settingsService, { DEFAULT_STORE_SETTINGS } from '../../services/settings.service.js';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { toast } from '../../components/common/Toast.jsx';

const PRESET_OFFERS = [
  { code: 'KIRANA50', text: 'FLAT ₹50 OFF on ₹299+' },
  { code: 'FIRSTORDER', text: 'Flat ₹100 OFF on your first grocery basket' },
  { code: 'FREEDEL', text: 'Free Instant Express Delivery on all orders' },
  { code: 'SUPERSTAPLE', text: 'Up to 40% OFF on Monthly Staples' },
];

const PRESET_DELIVERY_TIMES = [
  '8-10 mins',
  '9 Mins',
  '10-15 mins',
  '15-20 mins',
  '20-30 mins',
];

export default function AdminBannersPage() {
  const queryClient = useQueryClient();

  // Fetch current store settings
  const {
    data: settings,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['store-settings-admin'],
    queryFn: () => settingsService.getPublicSettings(),
    staleTime: 0,
    refetchOnMount: true,
  });

  const [formData, setFormData] = useState({
    promoCode: 'KIRANA50',
    promoBannerText: 'FLAT ₹50 OFF on ₹299+',
    deliveryTimeEstimate: '9 Mins',
    announcementText: '⚡ Free Express Delivery on orders above ₹499! Express delivery active.',
    isStoreOpen: true,
    supportPhone: '9876543210',
  });

  const [previewCopied, setPreviewCopied] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        promoCode: settings.promoCode || 'KIRANA50',
        promoBannerText: settings.promoBannerText || 'FLAT ₹50 OFF on ₹299+',
        deliveryTimeEstimate: settings.deliveryTimeEstimate || '9 Mins',
        announcementText: settings.announcementText || '',
        isStoreOpen: settings.isStoreOpen !== false,
        supportPhone: settings.supportPhone || '9876543210',
      });
    }
  }, [settings]);

  // Mutation to update store settings
  const updateSettingsMutation = useMutation({
    mutationFn: (payload) => settingsService.updateStoreSettings(payload),
    onSuccess: (updatedData) => {
      queryClient.setQueryData(['store-settings-admin'], updatedData);
      queryClient.invalidateQueries({ queryKey: ['store-settings-public'] });
      queryClient.invalidateQueries({ queryKey: ['store-settings-admin'] });
      toast.success('Store promos & announcement ticker updated successfully!');
    },
    onError: (err) => {
      toast.error('Failed to update store settings', {
        description: err?.response?.data?.message || err.message,
      });
    },
  });

  const handleSave = (e) => {
    e.preventDefault();
    updateSettingsMutation.mutate({
      ...formData,
      promoCode: formData.promoCode.trim().toUpperCase(),
    });
  };

  const handleApplyPreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      promoCode: preset.code,
      promoBannerText: preset.text,
    }));
    toast.success(`Preset applied: ${preset.code}`);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-black tracking-tight text-slate-900">
              Promos & Announcements Manager
            </h1>
            <Badge variant="success" size="sm">
              Live Quick-Commerce
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Update storefront coupon codes, instant delivery estimates, and announcement tickers without brittle image uploads.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSave}
            isLoading={updateSettingsMutation.isPending}
            className="flex items-center gap-1.5 shadow-sm"
          >
            <Save className="h-4 w-4" />
            <span>Save Changes</span>
          </Button>
        </div>
      </div>

      {/* 1. Real-Time Storefront Header Preview Card */}
      <div className="rounded-2xl border border-emerald-200/80 bg-white p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Eye className="h-4 w-4 text-emerald-600" />
            <span>Live Storefront Header Strip Preview</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Updates in real-time</span>
        </div>

        {/* Mock Glassmorphic Bar as rendered on Customer Storefront */}
        <div className="rounded-xl border border-emerald-100 bg-[#f7f9f7] p-3 sm:p-4">
          <div className="relative overflow-hidden rounded-xl bg-white/95 border border-emerald-100/90 p-2.5 sm:p-3 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
              {/* Left Badge */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-600 text-white px-2.5 py-1 text-xs font-black shadow-xs tracking-tight">
                  <Zap className="h-3.5 w-3.5 fill-current animate-pulse text-amber-300" />
                  <span>Delivery in {formData.deliveryTimeEstimate || '9 Mins'}</span>
                </div>
                <div className="hidden sm:inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200/80 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                  <MapPin className="h-3 w-3 text-emerald-600" />
                  <span>Hyperlocal Express</span>
                </div>
              </div>

              {/* Center Coupon */}
              <div className="flex-1 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewCopied(true);
                    setTimeout(() => setPreviewCopied(false), 2000);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-300/80 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 px-3 py-1 text-xs font-bold text-slate-800 shadow-2xs hover:shadow-xs cursor-pointer"
                >
                  <Gift className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-[11px] sm:text-xs">
                    {formData.promoBannerText || 'FLAT ₹50 OFF on ₹299+'} | Use code{' '}
                    <span className="font-mono font-black text-emerald-700 bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                      {formData.promoCode || 'KIRANA50'}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    {previewCopied ? (
                      <>
                        <Check className="h-2.5 w-2.5 text-amber-200" strokeWidth={3} />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-2.5 w-2.5" strokeWidth={2.2} />
                        <span>Copy</span>
                      </>
                    )}
                  </span>
                </button>
              </div>

              {/* Right Trust Badge */}
              <div className="hidden lg:flex items-center gap-2 shrink-0">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 text-xs font-bold text-emerald-800">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>🌱 100% Quality & Fresh Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Form Settings */}
      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card A: Promo Voucher & Discounts */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Gift className="h-5 w-5 text-emerald-600" />
            <div>
              <h2 className="font-display text-sm font-bold text-slate-900">
                Store Promo Code & Discount Pill
              </h2>
              <p className="text-xs text-slate-500">
                Configure the primary voucher code shown in the customer top header ticker.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Coupon Voucher Code
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.promoCode}
                onChange={(e) =>
                  setFormData({ ...formData, promoCode: e.target.value.toUpperCase() })
                }
                placeholder="e.g. KIRANA50"
                className="w-full font-mono font-bold tracking-wider rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 uppercase"
                required
              />
              <Tag className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Customers can 1-click copy this code and apply it during checkout.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Promo Offer Headline / Banner Text
            </label>
            <input
              type="text"
              value={formData.promoBannerText}
              onChange={(e) => setFormData({ ...formData, promoBannerText: e.target.value })}
              placeholder="e.g. FLAT ₹50 OFF on ₹299+"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Quick Presets */}
          <div>
            <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Quick Preset Offers
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_OFFERS.map((preset) => (
                <button
                  key={preset.code}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
                >
                  <span className="font-mono font-bold">{preset.code}</span> ({preset.text.split(' ')[0]})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Card B: Delivery Speed & Store Status */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Clock className="h-5 w-5 text-emerald-600" />
            <div>
              <h2 className="font-display text-sm font-bold text-slate-900">
                Delivery Estimate & Store Controls
              </h2>
              <p className="text-xs text-slate-500">
                Set active delivery speed promises and emergency store operation toggles.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Delivery Time Promise
            </label>
            <input
              type="text"
              value={formData.deliveryTimeEstimate}
              onChange={(e) => setFormData({ ...formData, deliveryTimeEstimate: e.target.value })}
              placeholder="e.g. 9 Mins or 10-15 mins"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {PRESET_DELIVERY_TIMES.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setFormData({ ...formData, deliveryTimeEstimate: time })}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium border transition-colors cursor-pointer ${
                    formData.deliveryTimeEstimate === time
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  ⚡ {time}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Store Operational Status
            </label>
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-slate-600" />
                <span className="text-xs font-bold text-slate-800">
                  {formData.isStoreOpen ? 'Accepting Instant Orders' : 'Store Temporarily Closed'}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isStoreOpen}
                  onChange={(e) => setFormData({ ...formData, isStoreOpen: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Customer Support Helpline
            </label>
            <input
              type="text"
              value={formData.supportPhone}
              onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
              placeholder="e.g. 9876543210"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Card C: Navbar Top Announcement Ticker (Full Width) */}
        <div className="md:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Megaphone className="h-5 w-5 text-emerald-600" />
            <div>
              <h2 className="font-display text-sm font-bold text-slate-900">
                Top Announcement Bar
              </h2>
              <p className="text-xs text-slate-500">
                Text ticker displayed across the very top bar of the customer storefront.
              </p>
            </div>
          </div>

          <div>
            <textarea
              rows={2}
              value={formData.announcementText}
              onChange={(e) => setFormData({ ...formData, announcementText: e.target.value })}
              placeholder="e.g. ⚡ Free Express Delivery on orders above ₹499! Express 9-minute delivery active."
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={updateSettingsMutation.isPending}
              className="flex items-center gap-2 shadow-sm font-bold px-6"
            >
              <Save className="h-4 w-4" />
              <span>Save Promos & Settings</span>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
