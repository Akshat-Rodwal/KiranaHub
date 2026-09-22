import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Upload,
  RefreshCw,
  ExternalLink,
  Save,
  Check,
} from 'lucide-react';

import adminService from '../../services/admin.service.js';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import Modal, { useModal } from '../../components/common/Modal.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { toast } from '../../components/common/Toast.jsx';
import { API_BASE_URL } from '../../constants/index.js';

// Resolve relative or remote banner image URLs cleanly with backend origin fallback
const resolveBannerImageUrl = (url, fallback = '') => {
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
  return trimmed;
};

const GRADIENT_PRESETS = [
  { label: 'Deep Forest', value: 'from-emerald-950 via-[#054428] to-[#042f1a]' },
  { label: 'Dark Stone & Jade', value: 'from-stone-950 via-[#064e3b] to-emerald-950' },
  { label: 'Teal & Pine', value: 'from-teal-950 via-[#043d2c] to-stone-900' },
  { label: 'Amber & Bronze', value: 'from-[#d97706] to-[#b45309]' },
  { label: 'Indigo & Violet', value: 'from-[#4338ca] to-[#3730a3]' },
  { label: 'Emerald Mint', value: 'from-[#0f766e] to-[#115e59]' },
];

const SUB_BANNER_SLOTS = [
  {
    slotKey: 'sub_banner_1',
    slotTitle: 'Sub-Hero Slot 1: Pharmacy & Wellness',
    defaultBadge: 'Pharma & Wellness',
    defaultGradient: 'from-[#0f766e] to-[#115e59]',
    defaultLink: '/products?category=pharma-wellness',
    defaultTitle: 'Pharmacy at your doorstep!',
    defaultSubtitle: 'Cough syrups, pain relief sprays, vitamins & first aid rushed in 10 mins.',
    defaultImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=500&q=80',
  },
  {
    slotKey: 'sub_banner_2',
    slotTitle: 'Sub-Hero Slot 2: Pet Care Supplies',
    defaultBadge: 'Pet Supplies',
    defaultGradient: 'from-[#d97706] to-[#b45309]',
    defaultLink: '/products?category=pet-care',
    defaultTitle: 'Pet care supplies at your door',
    defaultSubtitle: 'Nutritious dog food, cat treats, litter sand & grooming essentials.',
    defaultImage: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=500&q=80',
  },
  {
    slotKey: 'sub_banner_3',
    slotTitle: 'Sub-Hero Slot 3: Baby Care Essentials',
    defaultBadge: 'Baby Care',
    defaultGradient: 'from-[#4338ca] to-[#3730a3]',
    defaultLink: '/products?category=baby-care',
    defaultTitle: 'No time for a diaper run?',
    defaultSubtitle: 'Ultra-soft diapers, gentle baby wipes, baby lotions & infant nutrition.',
    defaultImage: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=500&q=80',
  },
];

export default function AdminBannersPage() {
  const queryClient = useQueryClient();
  const carouselModal = useModal('admin-carousel-modal');

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

  // Safely extract banners array regardless of response unwrap format
  const rawBanners = Array.isArray(bannersRes)
    ? bannersRes
    : Array.isArray(bannersRes?.data)
    ? bannersRes.data
    : [];

  const heroCarouselSlides = rawBanners
    .filter((b) => b.position === 'hero_carousel')
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // State for sub-hero cards direct editing
  const [subBannerEdits, setSubBannerEdits] = useState({});
  const [subBannerFiles, setSubBannerFiles] = useState({});
  const [subBannerSaving, setSubBannerSaving] = useState({});

  // State for Carousel Add/Edit Modal
  const [isEditingSlide, setIsEditingSlide] = useState(false);
  const [editingSlideId, setEditingSlideId] = useState(null);
  const [slideFormData, setSlideFormData] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    link: '/products',
    badge: '⚡ 10-Min Delivery',
    ctaText: 'Order Now',
    bgGradient: GRADIENT_PRESETS[0].value,
    order: 1,
    isActive: true,
  });
  const [slideFile, setSlideFile] = useState(null);
  const [slideFilePreview, setSlideFilePreview] = useState(null);
  const [isUploadingSlide, setIsUploadingSlide] = useState(false);

  // Hidden file inputs for direct carousel slide image replace
  const slideReplaceInputRefs = useRef({});

  // Mutations
  const saveBannerMutation = useMutation({
    mutationFn: (payload) => {
      if (payload._id || payload.id) {
        const id = payload._id || payload.id;
        return adminService.updateBanner(id, payload);
      }
      return adminService.createBanner(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
    onError: (err) => {
      toast.error('Save Failed', {
        description: err?.response?.data?.message || err?.message || 'Could not save banner.',
      });
    },
  });

  const deleteBannerMutation = useMutation({
    mutationFn: (id) => adminService.deleteBanner(id),
    onSuccess: () => {
      toast.success('Slide Removed', { description: 'Carousel slide deleted successfully.' });
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
    onError: (err) => {
      toast.error('Delete Failed', {
        description: err?.response?.data?.message || err?.message || 'Could not delete banner.',
      });
    },
  });

  // Open modal to add new slide
  const openAddSlideModal = () => {
    setIsEditingSlide(false);
    setEditingSlideId(null);
    setSlideFormData({
      title: '',
      subtitle: '',
      imageUrl: '',
      link: '/products',
      badge: '⚡ 10-Minute Hyperlocal Delivery',
      ctaText: 'Order Now',
      bgGradient: GRADIENT_PRESETS[0].value,
      order: heroCarouselSlides.length + 1,
      isActive: true,
    });
    setSlideFile(null);
    setSlideFilePreview(null);
    carouselModal.open();
  };

  // Open modal to edit existing slide
  const openEditSlideModal = (slide) => {
    setIsEditingSlide(true);
    setEditingSlideId(slide._id || slide.id);
    setSlideFormData({
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      imageUrl: slide.imageUrl || '',
      link: slide.link || '/products',
      badge: slide.badge || '',
      ctaText: slide.ctaText || 'Shop Now',
      bgGradient: slide.bgGradient || GRADIENT_PRESETS[0].value,
      order: slide.order || 1,
      isActive: slide.isActive !== false,
    });
    setSlideFile(null);
    setSlideFilePreview(null);
    carouselModal.open();
  };

  // Handle slide modal file selection
  const handleSlideFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSlideFile(file);
    const objectUrl = URL.createObjectURL(file);
    setSlideFilePreview(objectUrl);
  };

  // Submit carousel slide modal (with upload if file picked)
  const handleSaveSlide = async (e) => {
    e.preventDefault();
    if (!slideFormData.title.trim()) {
      toast.error('Headline Required', { description: 'Please enter a slide headline.' });
      return;
    }
    if (!slideFormData.imageUrl.trim() && !slideFile) {
      toast.error('Image Required', { description: 'Please choose an image file or enter an image URL.' });
      return;
    }

    setIsUploadingSlide(true);
    try {
      let finalImageUrl = slideFormData.imageUrl.trim();

      // If local file chosen, upload via Multer first
      if (slideFile) {
        const uploadRes = await adminService.uploadImage(slideFile);
        finalImageUrl = uploadRes.data?.url || uploadRes.url || finalImageUrl;
      }

      const payload = {
        ...slideFormData,
        imageUrl: finalImageUrl,
        position: 'hero_carousel',
        order: Number(slideFormData.order) || 1,
        ...(isEditingSlide && editingSlideId ? { _id: editingSlideId } : {}),
      };

      await saveBannerMutation.mutateAsync(payload);
      toast.success(isEditingSlide ? 'Carousel Slide Updated' : 'Carousel Slide Created', {
        description: 'Storefront carousel refreshed instantly.',
      });
      carouselModal.close();
    } catch (err) {
      toast.error('Upload Error', {
        description: err?.response?.data?.message || err?.message || 'Could not upload slide image.',
      });
    } finally {
      setIsUploadingSlide(false);
    }
  };

  // Direct 1-click replace image on an existing carousel slide card
  const handleDirectSlideImageReplace = async (slide, file) => {
    if (!file) return;
    try {
      toast.loading('Uploading slide image...', { id: 'slide-replace' });
      const uploadRes = await adminService.uploadImage(file);
      const newImageUrl = uploadRes.data?.url || uploadRes.url || uploadRes.data?.relativePath;

      await saveBannerMutation.mutateAsync({
        _id: slide._id || slide.id,
        imageUrl: newImageUrl,
      });

      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });

      toast.success('Slide Image Updated!', {
        id: 'slide-replace',
        description: 'New image is now live on the storefront.',
      });
    } catch (err) {
      toast.error('Image Replace Failed', {
        id: 'slide-replace',
        description: err?.message || 'Could not replace image.',
      });
    }
  };

  // Sub-Banner File Selection
  const handleSubBannerFileChange = (slotKey, file) => {
    if (!file) return;
    setSubBannerFiles((prev) => ({
      ...prev,
      [slotKey]: {
        file,
        previewUrl: URL.createObjectURL(file),
      },
    }));
  };

  // Save / Update Sub-Banner Slot
  const handleSaveSubBanner = async (slotConfig) => {
    const { slotKey } = slotConfig;
    const existingDoc = rawBanners.find((b) => b.position === slotKey);
    const formValues = subBannerEdits[slotKey] || {};
    const pickedFile = subBannerFiles[slotKey]?.file;

    setSubBannerSaving((prev) => ({ ...prev, [slotKey]: true }));
    try {
      let finalImageUrl = formValues.imageUrl || existingDoc?.imageUrl || slotConfig.defaultImage;

      if (pickedFile) {
        const uploadRes = await adminService.uploadImage(pickedFile);
        finalImageUrl = uploadRes.data?.url || uploadRes.url || finalImageUrl;
      }

      const payload = {
        title: formValues.title !== undefined ? formValues.title : existingDoc?.title || slotConfig.defaultTitle,
        subtitle: formValues.subtitle !== undefined ? formValues.subtitle : existingDoc?.subtitle || slotConfig.defaultSubtitle,
        link: formValues.link !== undefined ? formValues.link : existingDoc?.link || slotConfig.defaultLink,
        imageUrl: finalImageUrl,
        position: slotKey,
        badge: existingDoc?.badge || slotConfig.defaultBadge,
        ctaText: existingDoc?.ctaText || 'Order Now →',
        bgGradient: existingDoc?.bgGradient || slotConfig.defaultGradient,
        isActive: true,
        order: 1,
        ...(existingDoc?._id ? { _id: existingDoc._id } : {}),
      };

      await saveBannerMutation.mutateAsync(payload);

      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });

      // Clear pending file
      setSubBannerFiles((prev) => {
        const copy = { ...prev };
        delete copy[slotKey];
        return copy;
      });

      toast.success(`${slotConfig.slotTitle} Updated!`, {
        description: 'Storefront promotional tile refreshed with live media.',
      });
    } catch (err) {
      toast.error('Slot Update Failed', {
        description: err?.message || 'Could not save sub-banner changes.',
      });
    } finally {
      setSubBannerSaving((prev) => ({ ...prev, [slotKey]: false }));
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary" size="sm" className="font-mono uppercase tracking-wider">
              Blinkit Architecture Media Manager
            </Badge>
            <span className="text-xs text-text-muted">Dedicated Slot-Based Uploader</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
            Banner & Promotional Media
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            Directly upload and manage the 3-second compact Hero Carousel and the 3 Sub-Hero promotional tiles.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            leftIcon={<RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />}
          >
            Refresh Data
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={openAddSlideModal}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add Carousel Slide
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-xs font-medium text-text-muted">Connecting to MongoDB & loading banners...</p>
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* SECTION A: HERO CAROUSEL MANAGER */}
          {/* ========================================================================= */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h2 className="font-display text-lg font-black text-stone-900 tracking-tight flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#054428] text-[#ccff00] text-xs font-black">
                    A
                  </span>
                  Hero Carousel Slides ({heroCarouselSlides.length} Live)
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Compact ~16:5 ratio main banner auto-rotating every 3 seconds on the storefront.
                </p>
              </div>

              <Button
                variant="outline"
                size="xs"
                onClick={openAddSlideModal}
                leftIcon={<Upload className="h-3.5 w-3.5" />}
              >
                Upload New Slide
              </Button>
            </div>

            {heroCarouselSlides.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-stone-300 bg-white p-8 text-center">
                <Upload className="h-8 w-8 text-stone-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-stone-700">No carousel slides in database</p>
                <Button variant="primary" size="sm" className="mt-3" onClick={openAddSlideModal}>
                  Upload First Carousel Slide
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {heroCarouselSlides.map((slide, index) => {
                  const slideId = slide._id || slide.id;
                  return (
                    <motion.div
                      key={slideId}
                      layout
                      className="rounded-2xl bg-white border border-stone-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col"
                    >
                      {/* Live Visual Card (Full Background Image) */}
                      <div className="relative p-4 text-white overflow-hidden bg-slate-900 min-h-[140px] flex items-center">
                        {/* Background Image with Fallback */}
                        <img
                          src={resolveBannerImageUrl(slide.imageUrl, 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80')}
                          alt={slide.title}
                          className="absolute inset-0 w-full h-full object-cover object-center"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                        {/* Dark Gradient Overlay for Readability */}
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/40 to-transparent pointer-events-none" />

                        <div className="relative z-10 min-w-0">
                          <span className="inline-block text-[9px] uppercase font-bold tracking-wider bg-black/40 backdrop-blur-md px-2 py-0.5 rounded mb-1 border border-white/20">
                            Slide #{index + 1} • {slide.badge || 'Featured'}
                          </span>
                          <h4 className="font-display text-sm font-black tracking-tight line-clamp-1 text-white drop-shadow-sm">
                            {slide.title}
                          </h4>
                          <p className="text-[11px] text-stone-200 line-clamp-2 mt-0.5 leading-snug drop-shadow-xs">
                            {slide.subtitle}
                          </p>
                          <span className="inline-block mt-2 text-[10px] font-bold bg-white text-stone-950 px-2.5 py-0.5 rounded shadow-xs">
                            {slide.ctaText || 'Order Now'}
                          </span>
                        </div>
                      </div>

                      {/* Controls Footer */}
                      <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-xs text-stone-500">
                          <span>Link: <strong className="text-stone-700 font-mono text-[11px]">{slide.link}</strong></span>
                          <button
                            type="button"
                            onClick={() =>
                              saveBannerMutation.mutate({
                                _id: slideId,
                                isActive: !slide.isActive,
                              })
                            }
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                              slide.isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-stone-100 text-stone-500 border border-stone-200'
                            }`}
                          >
                            {slide.isActive ? (
                              <>
                                <CheckCircle className="h-3 w-3 text-emerald-600" />
                                <span>Active</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 text-stone-400" />
                                <span>Paused</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Direct File Replace & Action Buttons */}
                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              ref={(el) => (slideReplaceInputRefs.current[slideId] = el)}
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleDirectSlideImageReplace(slide, file);
                              }}
                            />
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => slideReplaceInputRefs.current[slideId]?.click()}
                              leftIcon={<Upload className="h-3 w-3" />}
                            >
                              Replace Image
                            </Button>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => openEditSlideModal(slide)}
                              leftIcon={<Edit2 className="h-3 w-3" />}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="xs"
                              onClick={() => {
                                if (confirm(`Delete slide "${slide.title}"?`)) {
                                  deleteBannerMutation.mutate(slideId);
                                }
                              }}
                              leftIcon={<Trash2 className="h-3 w-3" />}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* SECTION B: 3-COLUMN SUB-PROMOTIONAL TILES (DIRECT 1-CLICK REPLACE) */}
          {/* ========================================================================= */}
          <div className="space-y-4 pt-4 border-t border-stone-200">
            <div>
              <h2 className="font-display text-lg font-black text-stone-900 tracking-tight flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#054428] text-[#ccff00] text-xs font-black">
                  B
                </span>
                3-Column Sub-Promotional Tiles (Direct 1-Click Replace)
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                The 3 feature cards positioned directly under the main carousel. Select an image file and save to update instantly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {SUB_BANNER_SLOTS.map((slotConfig) => {
                const { slotKey } = slotConfig;
                const existingDoc = rawBanners.find((b) => b.position === slotKey);
                const edited = subBannerEdits[slotKey] || {};
                const pickedFile = subBannerFiles[slotKey];
                const isSaving = subBannerSaving[slotKey] || false;

                const currentTitle = edited.title !== undefined ? edited.title : existingDoc?.title || slotConfig.defaultTitle;
                const currentSubtitle = edited.subtitle !== undefined ? edited.subtitle : existingDoc?.subtitle || slotConfig.defaultSubtitle;
                const currentLink = edited.link !== undefined ? edited.link : existingDoc?.link || slotConfig.defaultLink;
                const displayImage = resolveBannerImageUrl(
                  pickedFile?.previewUrl || edited.imageUrl || existingDoc?.imageUrl,
                  slotConfig.defaultImage
                );

                return (
                  <div
                    key={slotKey}
                    className="rounded-2xl bg-white border border-stone-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col"
                  >
                    {/* Top Preview Tile (Full Background Image) */}
                    <div className="relative p-4 text-white overflow-hidden bg-slate-900 min-h-[135px] flex items-center">
                      {/* Background Image */}
                      <img
                        src={displayImage}
                        alt={currentTitle}
                        className="absolute inset-0 w-full h-full object-cover object-center"
                        onError={(e) => {
                          e.currentTarget.src = slotConfig.defaultImage;
                        }}
                      />
                      {/* Dark Gradient Overlay for Readability */}
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/40 to-transparent pointer-events-none" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent pointer-events-none" />

                      <div className="relative z-10 min-w-0">
                        <span className="inline-block text-[9px] uppercase font-black tracking-wider bg-black/40 backdrop-blur-md px-2 py-0.5 rounded mb-1 border border-white/20">
                          {existingDoc?.badge || slotConfig.defaultBadge}
                        </span>
                        <h4 className="font-display text-sm font-black tracking-tight line-clamp-1 text-white drop-shadow-sm">
                          {currentTitle}
                        </h4>
                        <p className="text-[11px] text-stone-200 line-clamp-2 mt-0.5 leading-snug drop-shadow-xs">
                          {currentSubtitle}
                        </p>
                        <span className="inline-block mt-2 text-[10px] font-bold bg-white/95 text-stone-950 px-2.5 py-0.5 rounded shadow-xs">
                          {existingDoc?.ctaText || 'Order Now →'}
                        </span>
                      </div>
                    </div>

                    {/* Edit Form Body */}
                    <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        {/* Direct Image URL Input (Recommended) */}
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-2.5 space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="block text-[11px] font-bold text-emerald-950">
                              Image URL (Cloudinary / Unsplash / CDN):
                            </label>
                            <span className="text-[9px] font-extrabold uppercase bg-emerald-600 text-white px-1.5 py-0.2 rounded-full">
                              Permanent
                            </span>
                          </div>
                          <input
                            type="text"
                            value={edited.imageUrl !== undefined ? edited.imageUrl : existingDoc?.imageUrl || ''}
                            onChange={(e) =>
                              setSubBannerEdits((prev) => ({
                                ...prev,
                                [slotKey]: { ...(prev[slotKey] || {}), imageUrl: e.target.value },
                              }))
                            }
                            placeholder="https://images.unsplash.com/photo-..."
                            className="w-full rounded-lg border border-emerald-300 bg-white px-2.5 py-1.5 text-xs text-stone-900 focus:border-brand-500 focus:outline-none"
                          />
                        </div>

                        {/* Local File Upload Input */}
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                            Or Upload Local Image File:
                          </label>
                          <div className="flex items-center gap-2">
                            <label className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-stone-300 hover:border-emerald-500 rounded-xl py-2 px-3 bg-stone-50 hover:bg-emerald-50 text-stone-700 text-xs font-bold cursor-pointer transition-all">
                              <Upload className="h-3.5 w-3.5 text-emerald-600" />
                              <span>{pickedFile ? 'Change Selected File' : 'Pick Image File...'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleSubBannerFileChange(slotKey, e.target.files?.[0])}
                              />
                            </label>

                            {pickedFile && (
                              <div className="w-9 h-9 shrink-0 rounded-lg border border-emerald-300 overflow-hidden shadow-2xs">
                                <img
                                  src={pickedFile.previewUrl}
                                  alt="Pending Upload"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          </div>
                          {pickedFile && (
                            <p className="text-[10px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                              <Check className="h-3 w-3" /> Ready to upload: {pickedFile.file.name}
                            </p>
                          )}
                        </div>

                        {/* Title Input */}
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Headline:
                          </label>
                          <input
                            type="text"
                            value={currentTitle}
                            onChange={(e) =>
                              setSubBannerEdits((prev) => ({
                                ...prev,
                                [slotKey]: { ...(prev[slotKey] || {}), title: e.target.value },
                              }))
                            }
                            className="w-full rounded-xl border border-stone-200 px-3 py-1.5 text-xs text-stone-900 focus:border-brand-500 focus:outline-none"
                          />
                        </div>

                        {/* Subtitle Input */}
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Subtitle Copy:
                          </label>
                          <textarea
                            rows="2"
                            value={currentSubtitle}
                            onChange={(e) =>
                              setSubBannerEdits((prev) => ({
                                ...prev,
                                [slotKey]: { ...(prev[slotKey] || {}), subtitle: e.target.value },
                              }))
                            }
                            className="w-full rounded-xl border border-stone-200 px-3 py-1.5 text-xs text-stone-900 focus:border-brand-500 focus:outline-none"
                          />
                        </div>

                        {/* Link Input */}
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Redirect Target Link:
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={currentLink}
                              onChange={(e) =>
                                setSubBannerEdits((prev) => ({
                                  ...prev,
                                  [slotKey]: { ...(prev[slotKey] || {}), link: e.target.value },
                                }))
                              }
                              className="flex-1 rounded-xl border border-stone-200 px-3 py-1.5 text-xs text-stone-900 font-mono focus:border-brand-500 focus:outline-none"
                            />
                            <a
                              href={currentLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-stone-400 hover:text-stone-700"
                              title="Test link"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Save Slot Button */}
                      <div className="pt-3 border-t border-stone-100">
                        <Button
                          variant="primary"
                          size="sm"
                          fullWidth
                          loading={isSaving}
                          onClick={() => handleSaveSubBanner(slotConfig)}
                          leftIcon={<Save className="h-4 w-4" />}
                        >
                          {isSaving ? 'Uploading & Updating...' : 'Save & Update Slot'}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT CAROUSEL SLIDE */}
      {/* ========================================================================= */}
      <Modal
        id="admin-carousel-modal"
        title={isEditingSlide ? 'Edit Hero Carousel Slide' : 'Upload New Hero Carousel Slide'}
        size="md"
      >
        <form onSubmit={handleSaveSlide} className="space-y-4">
          {/* Direct Image URL (Prominent & Recommended for Render persistence) */}
          <div className="rounded-xl border border-emerald-300/80 bg-emerald-50/70 p-3.5 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-emerald-950">
                Direct Image URL (Recommended: Cloudinary / Unsplash / Permanent HTTPS) *
              </label>
              <span className="text-[10px] font-extrabold uppercase tracking-wide bg-emerald-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
                Permanent
              </span>
            </div>
            <input
              type="url"
              value={slideFormData.imageUrl}
              onChange={(e) => setSlideFormData({ ...slideFormData, imageUrl: e.target.value })}
              placeholder="https://images.unsplash.com/... or https://res.cloudinary.com/..."
              className="w-full rounded-lg border border-emerald-300 bg-white px-3 py-2 text-xs text-text-primary focus:border-emerald-600 focus:outline-none"
            />
            <p className="text-[11px] text-emerald-800 font-medium">
              💡 Direct HTTPS URLs (e.g. Unsplash, Cloudinary, Imgur) remain 100% permanent across Render cold restarts and deployments.
            </p>
          </div>

          {/* Or Local File Upload */}
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Or Upload Local File from Device (Temporary Disk):
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-stone-300 hover:border-emerald-500 rounded-xl py-2.5 px-3 bg-stone-50 hover:bg-emerald-50/50 text-stone-700 text-xs font-bold cursor-pointer transition-all">
                <Upload className="h-4 w-4 text-emerald-600" />
                <span>{slideFile ? `Selected: ${slideFile.name}` : 'Choose File from Computer...'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleSlideFileChange}
                />
              </label>

              {(slideFilePreview || slideFormData.imageUrl) && (
                <div className="w-12 h-12 shrink-0 rounded-xl border border-stone-300 overflow-hidden shadow-2xs">
                  <img
                    src={slideFilePreview || slideFormData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Headline */}
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Slide Headline *
            </label>
            <input
              type="text"
              value={slideFormData.title}
              onChange={(e) => setSlideFormData({ ...slideFormData, title: e.target.value })}
              placeholder="e.g. Groceries delivered in 10 minutes"
              className="w-full rounded-xl border border-border px-3 py-2 text-xs text-text-primary focus:border-brand-500 focus:outline-none"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Subtitle Copy
            </label>
            <textarea
              rows="2"
              value={slideFormData.subtitle}
              onChange={(e) => setSlideFormData({ ...slideFormData, subtitle: e.target.value })}
              placeholder="e.g. Fresh farm vegetables, dairy & pantry essentials rushed to your doorstep."
              className="w-full rounded-xl border border-border px-3 py-2 text-xs text-text-primary focus:border-brand-500 focus:outline-none"
            />
          </div>

          {/* Target Link & CTA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Target Link
              </label>
              <input
                type="text"
                value={slideFormData.link}
                onChange={(e) => setSlideFormData({ ...slideFormData, link: e.target.value })}
                placeholder="/products or /products?category=..."
                className="w-full rounded-xl border border-border px-3 py-2 text-xs text-text-primary focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Button Text
              </label>
              <input
                type="text"
                value={slideFormData.ctaText}
                onChange={(e) => setSlideFormData({ ...slideFormData, ctaText: e.target.value })}
                placeholder="Order Now"
                className="w-full rounded-xl border border-border px-3 py-2 text-xs text-text-primary focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Badge & Order */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Pill Badge
              </label>
              <input
                type="text"
                value={slideFormData.badge}
                onChange={(e) => setSlideFormData({ ...slideFormData, badge: e.target.value })}
                placeholder="⚡ 10-Minute Hyperlocal Delivery"
                className="w-full rounded-xl border border-border px-3 py-2 text-xs text-text-primary focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Display Order
              </label>
              <input
                type="number"
                min="1"
                value={slideFormData.order}
                onChange={(e) => setSlideFormData({ ...slideFormData, order: e.target.value })}
                className="w-full rounded-xl border border-border px-3 py-2 text-xs text-text-primary focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Background Gradient */}
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1.5">
              Card Background Theme
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {GRADIENT_PRESETS.map((p) => {
                const isSelected = slideFormData.bgGradient === p.value;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setSlideFormData({ ...slideFormData, bgGradient: p.value })}
                    className={`h-8 rounded-lg bg-gradient-to-r ${p.value} border-2 transition-all cursor-pointer ${
                      isSelected ? 'border-brand-500 scale-105 shadow-sm' : 'border-transparent opacity-85 hover:opacity-100'
                    }`}
                    title={p.label}
                  />
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-border flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => carouselModal.close()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isUploadingSlide}
            >
              {isUploadingSlide ? 'Uploading Image...' : isEditingSlide ? 'Save Slide' : 'Publish Slide'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
