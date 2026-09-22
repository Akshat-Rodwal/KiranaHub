import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Zap,
  Tag,
  Gift,
  Copy,
  Check,
  ArrowRight,
} from 'lucide-react';

import Container from '../common/Container.jsx';
import { toast } from '../common/Toast.jsx';
import { ROUTES, API_BASE_URL } from '../../constants/index.js';
import useStoreSettings from '../../hooks/useStoreSettings.js';
import useBanners from '../../hooks/useBanners.js';
import heroGroceriesImg from '../../assets/hero-groceries.png';

// High-resolution Tier-1 CDN fallback banner images
const CDN_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1400&q=80',
];

// Helper to resolve uploaded or absolute banner image URLs cleanly without CORS/broken links
const resolveBannerImageUrl = (url, fallback) => {
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

const FALLBACK_SLIDES = [
  {
    id: 'instant-delivery',
    badge: '⚡ Instant Hyperlocal Delivery',
    badgeIcon: Zap,
    title: 'Groceries delivered in 10 minutes',
    subtitle: 'Fresh vegetables, dairy, farm eggs & daily pantry essentials rushed directly to your doorstep.',
    ctaText: 'Order Now',
    ctaLink: ROUTES.PRODUCTS,
    image: CDN_FALLBACK_IMAGES[0],
  },
  {
    id: 'super-saver',
    badge: '⚡ Super Saver Deals (Up to 40% OFF)',
    badgeIcon: Tag,
    title: 'Up to 40% OFF on Monthly Staples',
    subtitle: 'Unpolished pulses, stone-ground flours, aged basmati rice & cold-pressed oils at everyday wholesale prices.',
    ctaText: 'Shop Deals',
    ctaLink: `${ROUTES.PRODUCTS}?flashDeal=true`,
    image: CDN_FALLBACK_IMAGES[1],
  },
  {
    id: 'welcome-offer',
    badge: '🎁 New Customer Special',
    badgeIcon: Gift,
    title: 'Flat ₹50 OFF on your first purchase',
    subtitle: 'Use coupon code FIRST50 during checkout on orders above ₹299. Rapid 8-10 minute doorstep delivery.',
    ctaText: 'Claim Offer',
    ctaLink: ROUTES.PRODUCTS,
    isCouponSlide: true,
    image: CDN_FALLBACK_IMAGES[2],
  },
];

const DEFAULT_SUB_TILES = [
  {
    id: 'sub-1',
    title: 'Pharmacy at your doorstep!',
    subtitle: 'Cough syrups, pain relief sprays, vitamins & first aid rushed in 10 mins.',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80',
    link: '/products?category=pharma-wellness',
    ctaText: 'Explore',
    bgGradient: 'from-sky-50 to-blue-100',
    borderColor: 'border-sky-200/80',
    badge: '💊 Pharma & Wellness',
    badgeClass: 'bg-sky-100/90 text-sky-800 border-sky-200',
    btnClass: 'bg-sky-600 hover:bg-sky-700 text-white',
  },
  {
    id: 'sub-2',
    title: 'Pet care supplies at your door',
    subtitle: 'Nutritious dog food, cat treats, litter sand & grooming essentials.',
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80',
    link: '/products?category=pet-care',
    ctaText: 'Explore',
    bgGradient: 'from-amber-50 to-orange-100',
    borderColor: 'border-amber-200/80',
    badge: '🐾 Pet Supplies',
    badgeClass: 'bg-amber-100/90 text-amber-800 border-amber-200',
    btnClass: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
  {
    id: 'sub-3',
    title: 'No time for a diaper run?',
    subtitle: 'Ultra-soft diapers, gentle baby wipes, baby lotions & infant nutrition.',
    imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=400&q=80',
    link: '/products?category=baby-care',
    ctaText: 'Explore',
    bgGradient: 'from-pink-50 to-rose-100',
    borderColor: 'border-rose-200/80',
    badge: '👶 Baby Care',
    badgeClass: 'bg-rose-100/90 text-rose-800 border-rose-200',
    btnClass: 'bg-rose-500 hover:bg-rose-600 text-white',
  },
];

export default function Hero() {
  const reduceMotion = useReducedMotion();
  const { data: settings } = useStoreSettings();
  const { data: bannersData } = useBanners();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [copied, setCopied] = useState(false);

  const promoCode = settings?.promoCode || 'FIRST50';

  // Merge dynamic banners from DB with fallbacks
  const carouselSlides = useMemo(() => {
    const rawList =
      bannersData?.hero_carousel ||
      (Array.isArray(bannersData)
        ? bannersData.filter((b) => b.position === 'hero_carousel' && b.isActive !== false)
        : null) ||
      (Array.isArray(bannersData?.items)
        ? bannersData.items.filter((b) => b.position === 'hero_carousel' && b.isActive !== false)
        : null) ||
      (Array.isArray(bannersData?.all)
        ? bannersData.all.filter((b) => b.position === 'hero_carousel' && b.isActive !== false)
        : null);

    if (rawList && rawList.length > 0) {
      return rawList.map((b, index) => ({
        id: b._id || b.id || `carousel-${index}`,
        badge: b.badge || (index === 0 ? '⚡ Instant Hyperlocal Delivery' : '⚡ Featured Deal'),
        badgeIcon: index % 2 === 0 ? Zap : Tag,
        title: b.title,
        subtitle: b.subtitle,
        ctaText: b.ctaText || 'Shop Now',
        ctaLink: b.link || ROUTES.PRODUCTS,
        image: resolveBannerImageUrl(b.imageUrl, CDN_FALLBACK_IMAGES[index % CDN_FALLBACK_IMAGES.length]),
        isCouponSlide:
          b.title?.toLowerCase().includes('coupon') ||
          b.title?.toLowerCase().includes('first50') ||
          b.subtitle?.toLowerCase().includes('first50'),
      }));
    }
    return FALLBACK_SLIDES;
  }, [bannersData]);

  // Sub-hero promotional tiles (3 columns) with light pastel themes & dynamic database sync
  const subHeroTiles = useMemo(() => {
    const b1 =
      bannersData?.sub_banner_1 ||
      (Array.isArray(bannersData?.all) ? bannersData.all.find((b) => b.position === 'sub_banner_1') : null);
    const b2 =
      bannersData?.sub_banner_2 ||
      (Array.isArray(bannersData?.all) ? bannersData.all.find((b) => b.position === 'sub_banner_2') : null);
    const b3 =
      bannersData?.sub_banner_3 ||
      (Array.isArray(bannersData?.all) ? bannersData.all.find((b) => b.position === 'sub_banner_3') : null);

    return [
      b1
        ? {
            id: b1._id || b1.id || 'sub-1',
            title: b1.title,
            subtitle: b1.subtitle,
            imageUrl: resolveBannerImageUrl(b1.imageUrl, DEFAULT_SUB_TILES[0].imageUrl),
            link: b1.link || DEFAULT_SUB_TILES[0].link,
            ctaText: b1.ctaText || 'Explore',
            bgGradient: 'from-sky-50 to-blue-100',
            borderColor: 'border-sky-200/80',
            badge: b1.badge || '💊 Pharma & Wellness',
            badgeClass: 'bg-sky-100/90 text-sky-800 border-sky-200',
            btnClass: 'bg-sky-600 hover:bg-sky-700 text-white',
          }
        : DEFAULT_SUB_TILES[0],
      b2
        ? {
            id: b2._id || b2.id || 'sub-2',
            title: b2.title,
            subtitle: b2.subtitle,
            imageUrl: resolveBannerImageUrl(b2.imageUrl, DEFAULT_SUB_TILES[1].imageUrl),
            link: b2.link || DEFAULT_SUB_TILES[1].link,
            ctaText: b2.ctaText || 'Explore',
            bgGradient: 'from-amber-50 to-orange-100',
            borderColor: 'border-amber-200/80',
            badge: b2.badge || '🐾 Pet Supplies',
            badgeClass: 'bg-amber-100/90 text-amber-800 border-amber-200',
            btnClass: 'bg-amber-600 hover:bg-amber-700 text-white',
          }
        : DEFAULT_SUB_TILES[1],
      b3
        ? {
            id: b3._id || b3.id || 'sub-3',
            title: b3.title,
            subtitle: b3.subtitle,
            imageUrl: resolveBannerImageUrl(b3.imageUrl, DEFAULT_SUB_TILES[2].imageUrl),
            link: b3.link || DEFAULT_SUB_TILES[2].link,
            ctaText: b3.ctaText || 'Explore',
            bgGradient: 'from-pink-50 to-rose-100',
            borderColor: 'border-rose-200/80',
            badge: b3.badge || '👶 Baby Care',
            badgeClass: 'bg-rose-100/90 text-rose-800 border-rose-200',
            btnClass: 'bg-rose-500 hover:bg-rose-600 text-white',
          }
        : DEFAULT_SUB_TILES[2],
    ];
  }, [bannersData]);

  const slideCount = carouselSlides.length;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slideCount) % slideCount);
  }, [slideCount]);

  // Auto-sliding interval (paused on user hover)
  useEffect(() => {
    if (isPaused || slideCount <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 4000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide, slideCount]);

  const handleCopyPromo = (e) => {
    e.preventDefault();
    navigator.clipboard?.writeText(promoCode);
    setCopied(true);
    toast.success(`Coupon code ${promoCode} copied!`, {
      description: 'Apply at checkout for ₹50 instant discount.',
    });
    setTimeout(() => setCopied(false), 2200);
  };

  const activeSlideIndex = currentSlide < slideCount ? currentSlide : 0;
  const slide = carouselSlides[activeSlideIndex] || carouselSlides[0];
  const BadgeIcon = slide.badgeIcon || Zap;

  return (
    <section className="bg-[#f7f9f7] pt-2 pb-2 sm:pt-4 sm:pb-4">
      <Container className="px-3 sm:px-6">
        {/* 1. Full-Bleed Background Image Hero Carousel with Sleek Quick-Commerce Proportions */}
        <div
          className="relative w-full h-[170px] sm:h-[210px] md:h-[240px] rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 bg-slate-900"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="absolute inset-0 w-full h-full flex items-center"
            >
              {/* Full-Bleed Background Image with Resilient Fallback */}
              <img
                src={slide.image}
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-cover object-center -z-10"
                loading="eager"
                onError={(e) => {
                  const fallbackUrl = CDN_FALLBACK_IMAGES[activeSlideIndex % CDN_FALLBACK_IMAGES.length];
                  if (e.currentTarget.src !== fallbackUrl) {
                    e.currentTarget.src = fallbackUrl;
                  }
                }}
              />

              {/* Elegant Transparent Dark-Slate Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-900/30 to-transparent pointer-events-none" />

              {/* Text & CTA Content Layer */}
              <div className="relative z-10 p-3.5 sm:p-6 md:p-8 max-w-xl text-left">
                {slide.badge && (
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600/95 text-white backdrop-blur-md px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-black shadow-xs mb-1 sm:mb-2.5 border border-emerald-400/30">
                    <BadgeIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={2.4} />
                    <span>{slide.badge}</span>
                  </div>
                )}

                <h1 className="font-display text-base sm:text-2xl md:text-3xl font-black tracking-tight leading-[1.15] text-white drop-shadow-md line-clamp-1 sm:line-clamp-2">
                  {slide.title}
                </h1>

                {slide.subtitle && (
                  <p className="mt-1 sm:mt-2 text-[11px] sm:text-xs md:text-sm text-stone-100 font-medium leading-tight sm:leading-snug drop-shadow-sm max-w-lg line-clamp-1 sm:line-clamp-2">
                    {slide.subtitle}
                  </p>
                )}

                {/* Call-to-Action Group */}
                <div className="mt-2.5 sm:mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
                  <Link
                    to={slide.ctaLink}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#0c831f] hover:bg-[#0a6d1a] px-4 py-1.5 sm:px-6 sm:py-2.5 text-xs sm:text-sm font-black text-white shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <span>{slide.ctaText}</span>
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.4} />
                  </Link>

                  {slide.isCouponSlide && (
                    <button
                      type="button"
                      onClick={handleCopyPromo}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-black/45 hover:bg-black/65 px-3 py-1 sm:px-3.5 sm:py-1.5 text-[10px] sm:text-xs font-bold text-white backdrop-blur-md transition-colors cursor-pointer shadow-md"
                      title="Click to copy voucher code"
                    >
                      <span className="text-stone-300">Code:</span>
                      <strong className="font-mono text-emerald-300 tracking-wider font-extrabold">
                        {promoCode}
                      </strong>
                      <span className="flex items-center gap-1 rounded-full bg-white/20 px-1.5 py-0.5 text-[8px] sm:text-[9px] uppercase font-bold tracking-wide">
                        {copied ? (
                          <>
                            <Check className="h-2.5 w-2.5 text-emerald-400" strokeWidth={2.5} />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-2.5 w-2.5 text-stone-200" strokeWidth={2} />
                            <span>Copy</span>
                          </>
                        )}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Left / Right Floating Navigation Arrows */}
          {slideCount > 1 && (
            <>
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Previous Slide"
                className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 items-center justify-center rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer hover:scale-110"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={2.4} />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next Slide"
                className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 items-center justify-center rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer hover:scale-110"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={2.4} />
              </button>

              {/* Bottom Pagination Indicators (Pill Dashes) */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
                {carouselSlides.map((s, index) => {
                  const isActive = index === activeSlideIndex;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setCurrentSlide(index)}
                      aria-label={`Go to slide ${index + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        isActive
                          ? 'w-7 bg-white shadow-md'
                          : 'w-2 bg-white/45 hover:bg-white/70'
                      }`}
                    />
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* 2. Sub-Hero Thematic Light Pastel Gradient Cards (Pharmacy, Pet Care, Baby Care) */}
        <div className="hidden md:grid md:grid-cols-3 gap-4 mt-4">
          {subHeroTiles.map((tile) => (
            <motion.div
              key={tile.id}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${tile.bgGradient} border ${tile.borderColor} p-5 flex items-center justify-between shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-md transition-all`}
            >
              {/* Left Column: Text & CTA */}
              <div className="relative z-10 flex-1 pr-3 flex flex-col justify-between h-full">
                <div>
                  <span className={`inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border mb-2 shadow-2xs ${tile.badgeClass}`}>
                    {tile.badge}
                  </span>
                  <h3 className="font-display text-base font-black tracking-tight text-slate-900 leading-snug line-clamp-1">
                    {tile.title}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium line-clamp-2 mt-1 leading-snug">
                    {tile.subtitle}
                  </p>
                </div>

                <div className="mt-4">
                  <Link
                    to={tile.link}
                    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold shadow-xs transition-all active:scale-95 group-hover:shadow ${tile.btnClass}`}
                  >
                    <span>{tile.ctaText}</span>
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
                  </Link>
                </div>
              </div>

              {/* Right Column: Transparent / Cut-out Asset with Float Hover Animation */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 relative flex items-center justify-center">
                <div className="absolute inset-0 rounded-2xl bg-white/40 backdrop-blur-2xs transform rotate-3 group-hover:rotate-6 transition-transform duration-300" />
                <img
                  src={tile.imageUrl}
                  alt={tile.title}
                  className="relative z-10 w-full h-full object-cover rounded-xl shadow-xs transition-transform duration-300 group-hover:-translate-y-1.5 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
