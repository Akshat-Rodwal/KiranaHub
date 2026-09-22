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
import { ROUTES } from '../../constants/index.js';
import useStoreSettings from '../../hooks/useStoreSettings.js';
import useBanners from '../../hooks/useBanners.js';
import heroGroceriesImg from '../../assets/hero-groceries.png';

const FALLBACK_SLIDES = [
  {
    id: 'instant-delivery',
    badge: '⚡ Instant Hyperlocal Delivery',
    badgeIcon: Zap,
    title: 'Groceries delivered in 10 minutes',
    subtitle: 'Fresh vegetables, dairy, farm eggs & daily pantry essentials rushed directly to your doorstep.',
    ctaText: 'Order Now',
    ctaLink: ROUTES.PRODUCTS,
    secondaryText: 'Explore Aisles',
    secondaryLink: ROUTES.CATEGORIES,
    gradient: 'from-emerald-500/10 via-emerald-100/30 to-teal-50',
    borderColor: 'border-emerald-200/70',
    badgeBg: 'bg-emerald-600 text-white',
    image: heroGroceriesImg,
  },
  {
    id: 'super-saver',
    badge: '⚡ Super Saver Deals (Up to 40% OFF)',
    badgeIcon: Tag,
    title: 'Up to 40% OFF on Monthly Staples',
    subtitle: 'Unpolished pulses, stone-ground flours, aged basmati rice & cold-pressed oils at everyday wholesale prices.',
    ctaText: 'Shop Deals',
    ctaLink: `${ROUTES.PRODUCTS}?flashDeal=true`,
    secondaryText: 'View Bestsellers',
    secondaryLink: `${ROUTES.PRODUCTS}?sort=popular`,
    gradient: 'from-amber-500/10 via-orange-100/30 to-amber-50',
    borderColor: 'border-amber-200/70',
    badgeBg: 'bg-amber-600 text-white',
    image: heroGroceriesImg,
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
    gradient: 'from-teal-500/10 via-emerald-100/30 to-cyan-50',
    borderColor: 'border-teal-200/70',
    badgeBg: 'bg-teal-600 text-white',
    image: heroGroceriesImg,
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
    if (bannersData?.hero_carousel && bannersData.hero_carousel.length > 0) {
      return bannersData.hero_carousel.map((b, index) => ({
        id: b._id || `carousel-${index}`,
        badge: b.badge || (index === 0 ? '⚡ Instant Hyperlocal Delivery' : '⚡ Featured Deal'),
        badgeIcon: index % 2 === 0 ? Zap : Tag,
        title: b.title,
        subtitle: b.subtitle,
        ctaText: b.ctaText || 'Order Now',
        ctaLink: b.link || ROUTES.PRODUCTS,
        secondaryText: 'Explore',
        secondaryLink: ROUTES.CATEGORIES,
        gradient: b.bgGradient || 'from-emerald-500/10 via-emerald-100/30 to-teal-50',
        borderColor: 'border-emerald-200/70',
        badgeBg: 'bg-emerald-600 text-white',
        image: b.imageUrl || heroGroceriesImg,
        isCouponSlide: b.title?.toLowerCase().includes('coupon') || b.title?.toLowerCase().includes('first50'),
      }));
    }
    return FALLBACK_SLIDES;
  }, [bannersData]);

  // Sub-hero promotional tiles (3 columns) with light pastel themes
  const subHeroTiles = useMemo(() => {
    return [
      bannersData?.sub_banner_1
        ? {
            id: bannersData.sub_banner_1._id || 'sub-1',
            title: bannersData.sub_banner_1.title,
            subtitle: bannersData.sub_banner_1.subtitle,
            imageUrl: bannersData.sub_banner_1.imageUrl,
            link: bannersData.sub_banner_1.link,
            ctaText: 'Explore',
            bgGradient: 'from-sky-50 to-blue-100',
            borderColor: 'border-sky-200/80',
            badge: bannersData.sub_banner_1.badge || '💊 Pharma & Wellness',
            badgeClass: 'bg-sky-100/90 text-sky-800 border-sky-200',
            btnClass: 'bg-sky-600 hover:bg-sky-700 text-white',
          }
        : DEFAULT_SUB_TILES[0],
      bannersData?.sub_banner_2
        ? {
            id: bannersData.sub_banner_2._id || 'sub-2',
            title: bannersData.sub_banner_2.title,
            subtitle: bannersData.sub_banner_2.subtitle,
            imageUrl: bannersData.sub_banner_2.imageUrl,
            link: bannersData.sub_banner_2.link,
            ctaText: 'Explore',
            bgGradient: 'from-amber-50 to-orange-100',
            borderColor: 'border-amber-200/80',
            badge: bannersData.sub_banner_2.badge || '🐾 Pet Supplies',
            badgeClass: 'bg-amber-100/90 text-amber-800 border-amber-200',
            btnClass: 'bg-amber-600 hover:bg-amber-700 text-white',
          }
        : DEFAULT_SUB_TILES[1],
      bannersData?.sub_banner_3
        ? {
            id: bannersData.sub_banner_3._id || 'sub-3',
            title: bannersData.sub_banner_3.title,
            subtitle: bannersData.sub_banner_3.subtitle,
            imageUrl: bannersData.sub_banner_3.imageUrl,
            link: bannersData.sub_banner_3.link,
            ctaText: 'Explore',
            bgGradient: 'from-pink-50 to-rose-100',
            borderColor: 'border-rose-200/80',
            badge: bannersData.sub_banner_3.badge || '👶 Baby Care',
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

  // 3-Second Auto-Sliding Interval (Paused on user hover)
  useEffect(() => {
    if (isPaused || slideCount <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 3500);
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
        {/* 1. Main Hero: Soft Fresh Gradient Quick-Commerce Banner */}
        <div
          className={`relative overflow-hidden rounded-2xl md:rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border ${slide.borderColor || 'border-emerald-200/70'} w-full bg-gradient-to-r ${slide.gradient} transition-colors duration-500`}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="relative overflow-hidden h-48 sm:h-60 md:h-72 lg:h-80 w-full flex items-center px-4 sm:px-8 md:px-12"
            >
              {/* Subtle background decorative shapes */}
              <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-emerald-200/20 blur-3xl pointer-events-none" />
              <div className="absolute right-1/3 -bottom-10 w-48 h-48 rounded-full bg-teal-200/30 blur-2xl pointer-events-none" />

              {/* Left Content Column (relative z-10) */}
              <div className="relative z-10 py-4 sm:py-6 max-w-lg md:max-w-xl text-left">
                {slide.badge && (
                  <div className={`inline-flex items-center gap-1.5 rounded-full ${slide.badgeBg || 'bg-emerald-600 text-white'} px-3 py-1 text-[11px] sm:text-xs font-black shadow-xs mb-2 sm:mb-3`}>
                    <BadgeIcon className="h-3.5 w-3.5" strokeWidth={2.2} />
                    <span>{slide.badge}</span>
                  </div>
                )}

                <h1 className="font-display text-xl sm:text-3xl md:text-4xl lg:text-[42px] font-black tracking-tight leading-[1.12] text-slate-900 drop-shadow-2xs line-clamp-2">
                  {slide.title}
                </h1>

                {slide.subtitle && (
                  <p className="mt-1.5 sm:mt-2.5 text-xs sm:text-sm md:text-base text-slate-600 font-medium leading-relaxed max-w-md line-clamp-2">
                    {slide.subtitle}
                  </p>
                )}

                {/* Call-to-Action Group */}
                <div className="mt-3.5 sm:mt-5 flex flex-wrap items-center gap-2.5 sm:gap-3.5">
                  <Link
                    to={slide.ctaLink}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 px-5 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm font-black text-white shadow-md shadow-emerald-600/25 transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                  >
                    <span>{slide.ctaText}</span>
                    <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.4} />
                  </Link>

                  {slide.isCouponSlide && (
                    <button
                      type="button"
                      onClick={handleCopyPromo}
                      className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/80 bg-white/90 hover:bg-white px-3.5 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-bold text-slate-800 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                      title="Click to copy voucher code"
                    >
                      <span className="text-slate-500">Code:</span>
                      <strong className="font-mono text-emerald-700 tracking-wider font-extrabold">
                        {promoCode}
                      </strong>
                      <span className="flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 text-[9px] uppercase font-bold tracking-wide">
                        {copied ? (
                          <>
                            <Check className="h-2.5 w-2.5 text-emerald-600" strokeWidth={2.5} />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-2.5 w-2.5 text-slate-500" strokeWidth={2} />
                            <span>Copy</span>
                          </>
                        )}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Right Cut-out 3D Illustration / Fresh Produce Layer with float effect */}
              <div className="hidden sm:flex absolute right-4 md:right-8 lg:right-12 top-1/2 -translate-y-1/2 h-[85%] max-h-64 md:max-h-72 items-center justify-center pointer-events-none">
                <motion.img
                  animate={reduceMotion ? {} : { y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  src={slide.image}
                  alt={slide.title}
                  className="h-full w-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.12)]"
                  loading="eager"
                />
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
                className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 h-8 w-8 items-center justify-center rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-slate-950 shadow-md border border-slate-100 transition-all cursor-pointer hover:scale-105"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next Slide"
                className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 h-8 w-8 items-center justify-center rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-slate-950 shadow-md border border-slate-100 transition-all cursor-pointer hover:scale-105"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
              </button>

              {/* Bottom Pagination Indicators (Pill Dashes) */}
              <div className="absolute bottom-2.5 sm:bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
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
                          ? 'w-6 bg-emerald-600 shadow-xs'
                          : 'w-2 bg-slate-300/80 hover:bg-slate-400'
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
