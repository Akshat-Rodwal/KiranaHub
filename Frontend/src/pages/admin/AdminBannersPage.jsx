import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  RefreshCw,
  Eye,
  Check,
  Upload,
  Layers,
  Image as ImageIcon,
  ArrowRight,
  Sparkles,
  Palette,
  X,
  Zap,
} from 'lucide-react';

import adminService from '../../services/admin.service.js';
import productApi from '../../services/product.service.js';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { toast } from '../../components/common/Toast.jsx';
import { API_BASE_URL } from '../../constants/index.js';

const resolveImageUrl = (url, fallback = '') => {
  if (!url) return fallback;
  const trimmed = String(url).trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }
  if (trimmed.startsWith('/uploads')) {
    const rawApi = import.meta.env.VITE_API_BASE_URL || API_BASE_URL || 'https://kiranahub-backend.onrender.com';
    const backendRoot = rawApi.replace(/\/api\/v1\/?$/, '');
    return `${backendRoot}${trimmed}`;
  }
  return trimmed || fallback;
};

const COLOR_PRESETS = [
  { label: 'Nescafe Crimson', value: '#BA1A1A', text: 'light' },
  { label: 'Rice Cream', value: '#FDF8EE', text: 'dark' },
  { label: 'Fresh Mint', value: '#E6F4EA', text: 'dark' },
  { label: 'Soft Sky Blue', value: '#EFF6FF', text: 'dark' },
  { label: 'Warm Butter', value: '#FFFBEB', text: 'dark' },
  { label: 'Soft Lavender', value: '#F5F3FF', text: 'dark' },
  { label: 'Midnight Slate', value: '#0F172A', text: 'light' },
];

const CUTOUT_PRESETS = [
  { label: 'Coffee Cup/Jar', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=500&q=80' },
  { label: 'Rice Bag', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80' },
  { label: 'Fresh Greens', url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=500&q=80' },
  { label: 'Milk & Butter', url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=500&q=80' },
  { label: 'Snacks Bowl', url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=500&q=80' },
  { label: 'First-Aid Kit', url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=500&q=80' },
];

export default function AdminBannersPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('instamart_cards'); // 'top_single' | 'instamart_cards'

  // Fetch all banners
  const {
    data: bannersRes,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: () => adminService.getAdminBanners(),
    staleTime: 0,
    refetchOnMount: true,
  });

  // Fetch live categories
  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories-list'],
    queryFn: async () => {
      const res = await adminService.getCategories();
      return res?.data?.items || res?.data || res?.items || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch live products
  const { data: products = [] } = useQuery({
    queryKey: ['admin-products-list'],
    queryFn: async () => {
      const res = await productApi.getProducts({ limit: 100 });
      return res?.items || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const bannerList = Array.isArray(bannersRes)
    ? bannersRes
    : Array.isArray(bannersRes?.data)
    ? bannersRes.data
    : [];

  // ==========================================
  // TAB 1: TOP HERO BANNER STATE & HANDLERS
  // ==========================================
  const existingTopBanner = bannerList.find(
    (b) => b.bannerType === 'top_single' || b.position === 'top_single'
  );

  const [topBannerData, setTopBannerData] = useState({
    title: 'Groceries delivered in 10 minutes',
    subtitle: 'Fresh vegetables, dairy, farm eggs & daily pantry essentials rushed directly to your doorstep.',
    badge: '⚡ 10-Minute Hyperlocal Delivery',
    ctaText: 'Order Now',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80',
    link: '/products?flashDeal=true',
    targetType: 'custom',
    targetId: '',
    isActive: true,
  });
  const [isUploadingTopImg, setIsUploadingTopImg] = useState(false);
  const topFileInputRef = useRef(null);

  useEffect(() => {
    if (existingTopBanner) {
      setTopBannerData({
        _id: existingTopBanner._id || existingTopBanner.id,
        title: existingTopBanner.title || '',
        subtitle: existingTopBanner.subtitle || '',
        badge: existingTopBanner.badge || '',
        ctaText: existingTopBanner.ctaText ? existingTopBanner.ctaText.replace(/[\s→\-]+$/, '').trim() : 'Order Now',
        imageUrl: existingTopBanner.imageUrl || '',
        link: existingTopBanner.link || '/products',
        targetType: existingTopBanner.targetType || 'custom',
        targetId: existingTopBanner.targetId || '',
        isActive: existingTopBanner.isActive !== false,
      });
    }
  }, [existingTopBanner]);

  const handleTopImgUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingTopImg(true);
      const res = await adminService.uploadImage(file);
      const url = res?.url || res?.data?.url || res?.imageUrl;
      if (url) {
        setTopBannerData((prev) => ({ ...prev, imageUrl: url }));
        toast.success('Hero banner image uploaded!');
      } else {
        toast.error('Upload succeeded but no image URL was returned.');
      }
    } catch (err) {
      toast.error('Failed to upload banner image', { description: err.message });
    } finally {
      setIsUploadingTopImg(false);
    }
  };

  const saveTopBannerMutation = useMutation({
    mutationFn: async (payload) => {
      let resolvedLink = payload.link || '/products';
      if (payload.targetType === 'category' && payload.targetId) {
        resolvedLink = `/products?category=${encodeURIComponent(payload.targetId)}`;
      } else if (payload.targetType === 'product' && payload.targetId) {
        resolvedLink = `/product/${encodeURIComponent(payload.targetId)}`;
      }

      const body = {
        ...payload,
        bannerType: 'top_single',
        position: 'top_single',
        link: resolvedLink,
      };

      if (payload._id) {
        return adminService.updateBanner(payload._id, body);
      }
      return adminService.createBanner(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.success('Top Hero Banner saved successfully!');
    },
    onError: (err) => {
      toast.error('Failed to save Top Hero Banner', { description: err.message });
    },
  });

  // ==========================================
  // TAB 2: INSTAMART CARDS STATE & HANDLERS
  // ==========================================
  const instamartCards = bannerList.filter(
    (b) => b.bannerType === 'instamart_card' || (!b.bannerType && b.position !== 'top_single')
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [bgMode, setBgMode] = useState('color'); // 'color' | 'image'
  const [cardFormData, setCardFormData] = useState({
    title: '',
    subtitle: '',
    ctaText: 'SHOP NOW',
    brandTag: 'Powered by NESCAFE',
    imageUrl: '',
    bgImageUrl: '',
    bgColor: '#BA1A1A',
    textColor: 'light',
    targetType: 'category',
    targetId: '',
    link: '/products',
    order: 1,
    isActive: true,
  });
  const [isUploadingCardImg, setIsUploadingCardImg] = useState(false);
  const [isUploadingBgImg, setIsUploadingBgImg] = useState(false);
  const cardFileInputRef = useRef(null);
  const cardBgFileInputRef = useRef(null);

  const openCreateModal = () => {
    setEditingCardId(null);
    setBgMode('color');
    setCardFormData({
      title: 'Pick Yours Now',
      subtitle: 'Your kinda coffee, your kinda mug',
      ctaText: 'TRY NOW',
      brandTag: 'Powered by NESCAFE',
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=500&q=80',
      bgImageUrl: '',
      bgColor: '#BA1A1A',
      textColor: 'light',
      targetType: 'category',
      targetId: categories[0]?.slug || '',
      link: '/products',
      order: instamartCards.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (card) => {
    setEditingCardId(card._id || card.id);
    setBgMode(card.bgImageUrl ? 'image' : 'color');
    setCardFormData({
      title: card.title || '',
      subtitle: card.subtitle || '',
      ctaText: card.ctaText || 'SHOP NOW',
      brandTag: card.brandTag || '',
      imageUrl: card.imageUrl || '',
      bgImageUrl: card.bgImageUrl || '',
      bgColor: card.bgColor || '#F8FAFC',
      textColor: card.textColor || 'dark',
      targetType: card.targetType || 'category',
      targetId: card.targetId || '',
      link: card.link || '/products',
      order: card.order || 1,
      isActive: card.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const handleCardImgUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingCardImg(true);
      const res = await adminService.uploadImage(file);
      const url = res?.url || res?.data?.url || res?.imageUrl;
      if (url) {
        setCardFormData((prev) => ({ ...prev, imageUrl: url }));
        toast.success('Cutout image uploaded successfully!');
      } else {
        toast.error('Image upload returned no URL.');
      }
    } catch (err) {
      toast.error('Failed to upload image', { description: err.message });
    } finally {
      setIsUploadingCardImg(false);
    }
  };

  const handleBgImgUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingBgImg(true);
      const res = await adminService.uploadImage(file);
      const url = res?.url || res?.data?.url || res?.imageUrl;
      if (url) {
        setCardFormData((prev) => ({ ...prev, bgImageUrl: url }));
        toast.success('Background image uploaded successfully!');
      }
    } catch (err) {
      toast.error('Failed to upload background image', { description: err.message });
    } finally {
      setIsUploadingBgImg(false);
    }
  };

  const saveCardMutation = useMutation({
    mutationFn: async (payload) => {
      let resolvedLink = payload.link || '/products';
      if (payload.targetType === 'category' && payload.targetId) {
        resolvedLink = `/products?category=${encodeURIComponent(payload.targetId)}`;
      } else if (payload.targetType === 'product' && payload.targetId) {
        resolvedLink = `/product/${encodeURIComponent(payload.targetId)}`;
      }

      const body = {
        ...payload,
        bannerType: 'instamart_card',
        link: resolvedLink,
      };

      if (editingCardId) {
        return adminService.updateBanner(editingCardId, body);
      }
      return adminService.createBanner(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      setIsModalOpen(false);
      toast.success(editingCardId ? 'Promo card updated!' : 'Promo card created!');
    },
    onError: (err) => {
      toast.error('Failed to save promo card', { description: err.message });
    },
  });

  const deleteCardMutation = useMutation({
    mutationFn: (id) => adminService.deleteBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.success('Promo card deleted.');
    },
    onError: (err) => {
      toast.error('Failed to delete card', { description: err.message });
    },
  });

  const toggleCardActive = async (card) => {
    const id = card._id || card.id;
    try {
      await adminService.updateBanner(id, { isActive: !card.isActive });
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.success(`Card ${!card.isActive ? 'activated' : 'deactivated'}.`);
    } catch (err) {
      toast.error('Failed to toggle status', { description: err.message });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const hasTopOverlay = Boolean(topBannerData.title || topBannerData.subtitle || topBannerData.badge);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-14">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-black tracking-tight text-slate-900">
              Banners & Instamart Carousel Manager
            </h1>
            <Badge variant="success" size="sm">
              Swiggy Instamart Model
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage the high-impact Top Hero Banner with dynamic text overlay and the multi-slide Instamart Promo Carousel.
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

          {activeTab === 'instamart_cards' && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={openCreateModal}
              className="flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Add Promo Card</span>
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('instamart_cards')}
          className={`flex items-center gap-2 pb-3 px-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'instamart_cards'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Instamart Promo Carousel Cards</span>
          <span className="rounded-full bg-slate-100 text-slate-700 text-xs px-2 py-0.5 font-black">
            {instamartCards.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('top_single')}
          className={`flex items-center gap-2 pb-3 px-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'top_single'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ImageIcon className="h-4 w-4" />
          <span>Top Hero Banner (Single Image + Overlay)</span>
        </button>
      </div>

      {/* ==================================================== */}
      {/* TAB 1: TOP HERO BANNER (SINGLE IMAGE + OVERLAY)      */}
      {/* ==================================================== */}
      {activeTab === 'top_single' && (
        <div className="space-y-6">
          {/* Live Preview Box with Real-Time Overlay Simulation */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Eye className="h-4 w-4 text-emerald-600" />
                <span>Live Hero Banner Preview (Real-Time Text Overlay)</span>
              </div>
              <span className="text-xs text-slate-500 font-medium">Positioned at the very top of storefront</span>
            </div>

            <div className="relative w-full h-[150px] sm:h-[190px] md:h-[230px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm bg-slate-900 border border-slate-200">
              <img
                src={resolveImageUrl(topBannerData.imageUrl)}
                alt={topBannerData.title}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80';
                }}
              />

              {hasTopOverlay ? (
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/50 to-transparent z-10 pointer-events-none" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
              )}

              {hasTopOverlay && (
                <div className="relative z-20 h-full flex flex-col justify-center p-4 sm:p-7 md:p-8 max-w-xl text-left">
                  {topBannerData.badge && (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600/95 text-white backdrop-blur-md px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-black shadow-xs mb-1.5 sm:mb-2 w-fit border border-emerald-400/30">
                      <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current text-amber-300" />
                      <span>{topBannerData.badge}</span>
                    </div>
                  )}

                  {topBannerData.title && (
                    <h2 className="font-display text-base sm:text-2xl md:text-3xl font-black tracking-tight leading-[1.15] text-white drop-shadow-md line-clamp-1 sm:line-clamp-2">
                      {topBannerData.title}
                    </h2>
                  )}

                  {topBannerData.subtitle && (
                    <p className="mt-1 sm:mt-2 text-[11px] sm:text-xs md:text-sm text-stone-100 font-medium leading-tight sm:leading-snug drop-shadow-sm max-w-lg line-clamp-1 sm:line-clamp-2">
                      {topBannerData.subtitle}
                    </p>
                  )}

                  {topBannerData.ctaText && (
                    <div className="mt-2.5 sm:mt-3">
                      <span className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#0c831f] px-4 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-black text-white shadow-md w-fit">
                        <span>{topBannerData.ctaText}</span>
                        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Form Settings */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-5">
            <h2 className="font-display text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Hero Banner & Text Overlay Configuration
            </h2>

            {/* Image URL & Upload */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Background Banner Image URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={topBannerData.imageUrl}
                  onChange={(e) => setTopBannerData({ ...topBannerData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono"
                  required
                />
                <input
                  ref={topFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleTopImgUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => topFileInputRef.current?.click()}
                  isLoading={isUploadingTopImg}
                  className="flex items-center gap-1.5 shrink-0"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload Image</span>
                </Button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Recommended size: 1600x600 px high-res graphic.
              </p>
            </div>

            {/* Overlay Text Inputs */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Optional Overlay Text Elements
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Offer Badge Text
                  </label>
                  <input
                    type="text"
                    value={topBannerData.badge}
                    onChange={(e) => setTopBannerData({ ...topBannerData, badge: e.target.value })}
                    placeholder="e.g. ⚡ 10-Minute Hyperlocal Delivery or Flat ₹50 OFF"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Call-To-Action Button Text
                  </label>
                  <input
                    type="text"
                    value={topBannerData.ctaText}
                    onChange={(e) => setTopBannerData({ ...topBannerData, ctaText: e.target.value })}
                    placeholder="e.g. Order Now or Claim Offer"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Main Headline
                </label>
                <input
                  type="text"
                  value={topBannerData.title}
                  onChange={(e) => setTopBannerData({ ...topBannerData, title: e.target.value })}
                  placeholder="e.g. Groceries delivered in 10 minutes"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={topBannerData.subtitle}
                  onChange={(e) => setTopBannerData({ ...topBannerData, subtitle: e.target.value })}
                  placeholder="e.g. Fresh vegetables, dairy, farm eggs & daily pantry essentials"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Destination Target Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Target Destination Type
                </label>
                <select
                  value={topBannerData.targetType}
                  onChange={(e) => setTopBannerData({ ...topBannerData, targetType: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="custom">Custom URL / Query</option>
                  <option value="category">Specific Category</option>
                  <option value="product">Specific Product</option>
                </select>
              </div>

              {topBannerData.targetType === 'category' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Select Category
                  </label>
                  <select
                    value={topBannerData.targetId}
                    onChange={(e) =>
                      setTopBannerData({
                        ...topBannerData,
                        targetId: e.target.value,
                        link: `/products?category=${e.target.value}`,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">-- Choose a Category --</option>
                    {categories.map((cat) => (
                      <option key={cat._id || cat.slug} value={cat.slug}>
                        {cat.name} ({cat.slug})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {topBannerData.targetType === 'product' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Select Product
                  </label>
                  <select
                    value={topBannerData.targetId}
                    onChange={(e) =>
                      setTopBannerData({
                        ...topBannerData,
                        targetId: e.target.value,
                        link: `/product/${e.target.value}`,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">-- Choose a Product --</option>
                    {products.map((prod) => (
                      <option key={prod._id || prod.id} value={prod._id || prod.id}>
                        {prod.title || prod.name} (₹{prod.price})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {topBannerData.targetType === 'custom' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Custom Destination Link
                  </label>
                  <input
                    type="text"
                    value={topBannerData.link}
                    onChange={(e) => setTopBannerData({ ...topBannerData, link: e.target.value })}
                    placeholder="/products?flashDeal=true"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={topBannerData.isActive}
                  onChange={(e) => setTopBannerData({ ...topBannerData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Banner is Active & Visible</span>
              </label>

              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => saveTopBannerMutation.mutate(topBannerData)}
                isLoading={saveTopBannerMutation.isPending}
                className="flex items-center gap-2 shadow-sm px-6"
              >
                <Save className="h-4 w-4" />
                <span>Save Top Hero Banner</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: INSTAMART PROMO CAROUSEL CARDS                */}
      {/* ==================================================== */}
      {activeTab === 'instamart_cards' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-emerald-900">
                  Interactive Sliding Carousel Active ({instamartCards.length} slides configured)
                </h2>
                <p className="text-[11px] sm:text-xs text-emerald-700">
                  On desktop, 3 cards are displayed simultaneously with smooth slide transition arrows and pagination pill ({`1/${Math.max(1, instamartCards.length - 2)}`}).
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={openCreateModal}
              className="flex items-center gap-1.5 shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Add Card</span>
            </Button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {instamartCards.map((card, index) => {
              const cardId = card._id || card.id;
              const isLightText = card.textColor === 'light';

              return (
                <div
                  key={cardId || index}
                  className="rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  {/* Visual Card Simulation */}
                  <div className="p-5 h-[190px] relative flex flex-col justify-between overflow-hidden rounded-t-3xl bg-slate-900 select-none">
                    {/* Full Background Image */}
                    <img
                      src={resolveImageUrl(card.imageUrl || card.image)}
                      alt={card.title}
                      className="absolute inset-0 w-full h-full object-cover z-0"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent z-10 pointer-events-none" />

                    {card.brandTag && (
                      <div className="absolute top-3 right-3 z-20 bg-white/95 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs text-slate-800 border border-slate-100">
                        {card.brandTag}
                      </div>
                    )}

                    <div className="max-w-[70%] z-20">
                      <h3 className="font-black text-base tracking-tight leading-tight line-clamp-2 text-white drop-shadow-sm">
                        {card.title}
                      </h3>
                      <p className="text-[11px] font-medium mt-1 line-clamp-2 text-slate-200">
                        {card.subtitle}
                      </p>
                    </div>

                    <div className="pt-2 z-20">
                      <span className="inline-block px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white text-slate-900 shadow-sm">
                        {card.ctaText || 'SHOP NOW'}
                      </span>
                    </div>
                  </div>

                  {/* Card Info & Actions Footer */}
                  <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={card.isActive !== false ? 'success' : 'neutral'} size="sm">
                        {card.isActive !== false ? 'Active' : 'Hidden'}
                      </Badge>
                      <span className="text-[11px] font-mono text-slate-500">Order: {card.order || 0}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => toggleCardActive(card)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                        title={card.isActive !== false ? 'Deactivate Card' : 'Activate Card'}
                      >
                        <Check className={`h-4 w-4 ${card.isActive !== false ? 'text-emerald-600' : ''}`} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(card)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                        title="Edit Card"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete promo card "${card.title}"?`)) {
                            deleteCardMutation.mutate(cardId);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                        title="Delete Card"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: ADD / EDIT INSTAMART PROMO CARD               */}
      {/* ==================================================== */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-emerald-600" />
                  <h3 className="font-display text-base font-bold text-slate-900">
                    {editingCardId ? 'Edit Instamart Promo Card' : 'Create Instamart Promo Card'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveCardMutation.mutate(cardFormData);
                }}
                className="p-6 space-y-5 max-h-[80vh] overflow-y-auto"
              >
                {/* Real-Time Live Preview Matching Storefront Instamart Design */}
                <div>
                  <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Real-Time Storefront Preview
                  </span>
                  <div className="rounded-3xl overflow-hidden relative p-6 h-[210px] flex flex-col justify-between shadow-sm border border-black/5 bg-slate-900 select-none transition-all">
                    {/* Full Background Image */}
                    <img
                      src={resolveImageUrl(cardFormData.imageUrl || cardFormData.image)}
                      alt={cardFormData.title}
                      className="absolute inset-0 w-full h-full object-cover z-0"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent z-10 pointer-events-none" />

                    {cardFormData.brandTag && (
                      <div className="absolute top-4 right-4 z-20 bg-white/95 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-xl shadow-xs text-slate-800 border border-slate-100">
                        {cardFormData.brandTag}
                      </div>
                    )}

                    <div className="max-w-[70%] z-20">
                      <h3 className="text-2xl font-black tracking-tight leading-tight line-clamp-2 text-white drop-shadow-sm">
                        {cardFormData.title || 'Headline Here'}
                      </h3>
                      <p className="text-xs font-medium mt-1.5 line-clamp-2 leading-snug text-slate-200">
                        {cardFormData.subtitle || 'Supporting subtitle goes here'}
                      </p>
                    </div>

                    <div className="pt-2 z-20">
                      <span className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full font-black text-xs uppercase tracking-wider shadow bg-white text-slate-900">
                        <span>{cardFormData.ctaText || 'SHOP NOW'}</span>
                        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.4} />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Headline
                    </label>
                    <input
                      type="text"
                      value={cardFormData.title}
                      onChange={(e) => setCardFormData({ ...cardFormData, title: e.target.value })}
                      placeholder="e.g. Pick Yours Now"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Brand / Sponsor Tag
                    </label>
                    <input
                      type="text"
                      value={cardFormData.brandTag}
                      onChange={(e) => setCardFormData({ ...cardFormData, brandTag: e.target.value })}
                      placeholder="e.g. Powered by NESCAFE"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={cardFormData.subtitle}
                      onChange={(e) => setCardFormData({ ...cardFormData, subtitle: e.target.value })}
                      placeholder="e.g. Your kinda coffee, your kinda mug"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      CTA Button Text
                    </label>
                    <input
                      type="text"
                      value={cardFormData.ctaText}
                      onChange={(e) => setCardFormData({ ...cardFormData, ctaText: e.target.value })}
                      placeholder="e.g. TRY NOW or SHOP NOW"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-bold"
                    />
                  </div>
                </div>

                {/* Background Styling: Color Theme vs Full-bleed Image */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Card Background Style
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setBgMode('color')}
                        className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                          bgMode === 'color'
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        Color Theme
                      </button>
                      <button
                        type="button"
                        onClick={() => setBgMode('image')}
                        className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                          bgMode === 'image'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        Full Background Image
                      </button>
                    </div>
                  </div>

                  {bgMode === 'color' ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={cardFormData.bgColor.startsWith('#') ? cardFormData.bgColor : '#BA1A1A'}
                          onChange={(e) => setCardFormData({ ...cardFormData, bgColor: e.target.value, bgImageUrl: '' })}
                          className="h-8 w-10 rounded border border-slate-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={cardFormData.bgColor}
                          onChange={(e) => setCardFormData({ ...cardFormData, bgColor: e.target.value, bgImageUrl: '' })}
                          placeholder="#BA1A1A"
                          className="w-24 rounded-lg border border-slate-300 px-2 py-1 text-xs font-mono text-slate-900"
                        />
                      </div>

                      {/* Presets */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {COLOR_PRESETS.map((preset) => (
                          <button
                            key={preset.value}
                            type="button"
                            onClick={() =>
                              setCardFormData({
                                ...cardFormData,
                                bgColor: preset.value,
                                textColor: preset.text,
                                bgImageUrl: '',
                              })
                            }
                            className="flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-emerald-400 cursor-pointer"
                          >
                            <span
                              className="h-3 w-3 rounded-full border border-black/10"
                              style={{ backgroundColor: preset.value }}
                            />
                            <span>{preset.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={cardFormData.bgImageUrl}
                          onChange={(e) => setCardFormData({ ...cardFormData, bgImageUrl: e.target.value })}
                          placeholder="https://images.unsplash.com/... (Full bleed background)"
                          className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 font-mono"
                        />
                        <input
                          ref={cardBgFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleBgImgUpload}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => cardBgFileInputRef.current?.click()}
                          isLoading={isUploadingBgImg}
                          className="flex items-center gap-1.5 shrink-0"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          <span>Upload Bg</span>
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Text Color Toggle */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                    <span className="text-xs font-bold text-slate-700">Text Contrast:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCardFormData({ ...cardFormData, textColor: 'dark' })}
                        className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                          cardFormData.textColor === 'dark'
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        Dark Text
                      </button>
                      <button
                        type="button"
                        onClick={() => setCardFormData({ ...cardFormData, textColor: 'light' })}
                        className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                          cardFormData.textColor === 'light'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        White Text
                      </button>
                    </div>
                  </div>
                </div>

                {/* Product / Cutout Image Input */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Product Hero Cutout Asset URL
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={cardFormData.imageUrl}
                      onChange={(e) => setCardFormData({ ...cardFormData, imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/... or transparent cutout"
                      className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono"
                      required
                    />
                    <input
                      ref={cardFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCardImgUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => cardFileInputRef.current?.click()}
                      isLoading={isUploadingCardImg}
                      className="flex items-center gap-1.5 shrink-0"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload</span>
                    </Button>
                  </div>

                  {/* Cutout Presets */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 self-center">
                      Cutout Presets:
                    </span>
                    {CUTOUT_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setCardFormData({ ...cardFormData, imageUrl: preset.url })}
                        className="rounded-full border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 px-2.5 py-0.5 text-[11px] font-medium text-slate-700 transition-colors cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Destination Target */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Destination Target
                    </span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="targetType"
                          value="category"
                          checked={cardFormData.targetType === 'category'}
                          onChange={() => setCardFormData({ ...cardFormData, targetType: 'category' })}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>Category</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="targetType"
                          value="product"
                          checked={cardFormData.targetType === 'product'}
                          onChange={() => setCardFormData({ ...cardFormData, targetType: 'product' })}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>Product</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="targetType"
                          value="custom"
                          checked={cardFormData.targetType === 'custom'}
                          onChange={() => setCardFormData({ ...cardFormData, targetType: 'custom' })}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>Custom Link</span>
                      </label>
                    </div>
                  </div>

                  {cardFormData.targetType === 'category' && (
                    <div>
                      <select
                        value={cardFormData.targetId}
                        onChange={(e) =>
                          setCardFormData({
                            ...cardFormData,
                            targetId: e.target.value,
                            link: `/products?category=${e.target.value}`,
                          })
                        }
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="">-- Choose Category --</option>
                        {categories.map((cat) => (
                          <option key={cat._id || cat.slug} value={cat.slug}>
                            {cat.name} ({cat.slug})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {cardFormData.targetType === 'product' && (
                    <div>
                      <select
                        value={cardFormData.targetId}
                        onChange={(e) =>
                          setCardFormData({
                            ...cardFormData,
                            targetId: e.target.value,
                            link: `/product/${e.target.value}`,
                          })
                        }
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="">-- Choose Product --</option>
                        {products.map((prod) => (
                          <option key={prod._id || prod.id} value={prod._id || prod.id}>
                            {prod.title || prod.name} (₹{prod.price})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {cardFormData.targetType === 'custom' && (
                    <div>
                      <input
                        type="text"
                        value={cardFormData.link}
                        onChange={(e) => setCardFormData({ ...cardFormData, link: e.target.value })}
                        placeholder="/products?category=tea-coffee-drinks"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono"
                      />
                    </div>
                  )}
                </div>

                {/* Display Order & Active Toggle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={cardFormData.order}
                      onChange={(e) =>
                        setCardFormData({ ...cardFormData, order: parseInt(e.target.value, 10) || 0 })
                      }
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={cardFormData.isActive}
                        onChange={(e) => setCardFormData({ ...cardFormData, isActive: e.target.checked })}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Card is Active & Visible</span>
                    </label>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={saveCardMutation.isPending}
                    className="flex items-center gap-2 px-6"
                  >
                    <Save className="h-4 w-4" />
                    <span>{editingCardId ? 'Save Changes' : 'Create Card'}</span>
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
