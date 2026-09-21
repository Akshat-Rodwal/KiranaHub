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
    badge: '10-Minute Hyperlocal Delivery',
    badgeIcon: Zap,
    title: 'Groceries delivered in 10 minutes',
    subtitle: 'Fresh vegetables, dairy, farm eggs & daily pantry essentials rushed directly to your doorstep.',
    ctaText: 'Order Now',
    ctaLink: ROUTES.PRODUCTS,
    secondaryText: 'Explore Aisles',
    secondaryLink: ROUTES.CATEGORIES,
    gradient: 'from-emerald-950 via-[#054428] to-[#042f1a]',
    accentColor: 'text-emerald-300',
    image: heroGroceriesImg,
  },
  {
    id: 'super-saver',
    badge: 'Up to 40% OFF Deals',
    badgeIcon: Tag,
    title: 'Up to 40% OFF on Monthly Staples',
    subtitle: 'Unpolished pulses, stone-ground flours, aged basmati rice & cold-pressed oils at everyday wholesale prices.',
    ctaText: 'Shop Deals',
    ctaLink: `${ROUTES.PRODUCTS}?flashDeal=true`,
    secondaryText: 'View Bestsellers',
    secondaryLink: `${ROUTES.PRODUCTS}?sort=popular`,
    gradient: 'from-stone-950 via-[#064e3b] to-emerald-950',
    accentColor: 'text-amber-300',
    image: heroGroceriesImg,
  },
  {
    id: 'welcome-offer',
    badge: 'New Customer Special',
    badgeIcon: Gift,
    title: 'Flat ₹50 OFF on your first purchase',
    subtitle: 'Use coupon code FIRST50 during checkout on orders above ₹299. Rapid 8-10 minute doorstep delivery.',
    ctaText: 'Claim Offer',
    ctaLink: ROUTES.PRODUCTS,
    isCouponSlide: true,
    gradient: 'from-teal-950 via-[#043d2c] to-stone-900',
    accentColor: 'text-emerald-200',
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
    ctaText: 'Order Now →',
    bgGradient: 'from-[#0f766e] to-[#115e59]',
    badge: 'Pharma & Wellness',
  },
  {
    id: 'sub-2',
    title: 'Pet care supplies at your door',
    subtitle: 'Nutritious dog food, cat treats, litter sand & grooming essentials.',
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80',
    link: '/products?category=pet-care',
    ctaText: 'Shop Pet Care →',
    bgGradient: 'from-[#d97706] to-[#b45309]',
    badge: 'Pet Supplies',
  },
  {
    id: 'sub-3',
    title: 'No time for a diaper run?',
    subtitle: 'Ultra-soft diapers, gentle baby wipes, baby lotions & infant nutrition.',
    imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=400&q=80',
    link: '/products?category=baby-care',
    ctaText: 'Explore Baby Care →',
    bgGradient: 'from-[#4338ca] to-[#3730a3]',
    badge: 'Baby Care',
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
        badge: b.badge || 'Featured Deal',
        badgeIcon: index % 2 === 0 ? Zap : Tag,
        title: b.title,
        subtitle: b.subtitle,
        ctaText: b.ctaText || 'Shop Now',
        ctaLink: b.link || ROUTES.PRODUCTS,
        secondaryText: 'Explore',
        secondaryLink: ROUTES.CATEGORIES,
        gradient: b.bgGradient || (index % 2 === 0 ? 'from-emerald-950 via-[#054428] to-[#042f1a]' : 'from-stone-950 via-[#064e3b] to-emerald-950'),
        accentColor: 'text-emerald-300',
        image: b.imageUrl || heroGroceriesImg,
        isCouponSlide: b.title?.toLowerCase().includes('coupon') || b.title?.toLowerCase().includes('first50'),
      }));
    }
    return FALLBACK_SLIDES;
  }, [bannersData]);

  // Sub-hero promotional tiles (3 columns)
  const subHeroTiles = useMemo(() => {
    return [
      bannersData?.sub_banner_1
        ? {
            id: bannersData.sub_banner_1._id || 'sub-1',
            title: bannersData.sub_banner_1.title,
            subtitle: bannersData.sub_banner_1.subtitle,
            imageUrl: bannersData.sub_banner_1.imageUrl,
            link: bannersData.sub_banner_1.link,
            ctaText: bannersData.sub_banner_1.ctaText || 'Order Now →',
            bgGradient: bannersData.sub_banner_1.bgGradient || 'from-[#0f766e] to-[#115e59]',
            badge: bannersData.sub_banner_1.badge || 'Pharma & Wellness',
          }
        : DEFAULT_SUB_TILES[0],
      bannersData?.sub_banner_2
        ? {
            id: bannersData.sub_banner_2._id || 'sub-2',
            title: bannersData.sub_banner_2.title,
            subtitle: bannersData.sub_banner_2.subtitle,
            imageUrl: bannersData.sub_banner_2.imageUrl,
            link: bannersData.sub_banner_2.link,
            ctaText: bannersData.sub_banner_2.ctaText || 'Shop Pet Care →',
            bgGradient: bannersData.sub_banner_2.bgGradient || 'from-[#d97706] to-[#b45309]',
            badge: bannersData.sub_banner_2.badge || 'Pet Supplies',
          }
        : DEFAULT_SUB_TILES[1],
      bannersData?.sub_banner_3
        ? {
            id: bannersData.sub_banner_3._id || 'sub-3',
            title: bannersData.sub_banner_3.title,
            subtitle: bannersData.sub_banner_3.subtitle,
            imageUrl: bannersData.sub_banner_3.imageUrl,
            link: bannersData.sub_banner_3.link,
            ctaText: bannersData.sub_banner_3.ctaText || 'Explore Baby Care →',
            bgGradient: bannersData.sub_banner_3.bgGradient || 'from-[#4338ca] to-[#3730a3]',
            badge: bannersData.sub_banner_3.badge || 'Baby Care',
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
    }, 3000);
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
        {/* 1. Primary Compact Carousel Banner (~16:5 Blinkit Proportion) */}
        <div
          className="relative overflow-hidden rounded-2xl md:rounded-3xl shadow-xs border border-stone-200/70 w-full"
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
              className="relative overflow-hidden text-white h-44 sm:h-56 md:h-64 lg:h-72 w-full rounded-2xl overflow-hidden flex items-center bg-stone-900"
            >
              {/* Full Background Image Layer */}
              <img
                src={slide.image}
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-cover object-center"
                loading="eager"
              />

              {/* Dark Gradient Overlay for Guaranteed Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/25" />
              <div className="absolute inset-0 bg-black/15" />

              {/* Left Content Column (relative z-10) */}
              <div className="relative z-10 p-4 sm:p-7 md:p-10 max-w-xl text-left">
                {slide.badge && (
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur-md px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold text-white border border-white/20 mb-1.5 sm:mb-3 shadow-xs">
                    <BadgeIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-400" strokeWidth={2.2} />
                    <span>{slide.badge}</span>
                  </div>
                )}

                <h1 className="font-display text-base sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tight leading-[1.15] text-white drop-shadow-sm line-clamp-2">
                  {slide.title}
                </h1>

                {slide.subtitle && (
                  <p className="mt-1 sm:mt-2 text-[11px] sm:text-xs md:text-sm lg:text-base text-stone-200 font-medium leading-snug sm:leading-relaxed max-w-lg line-clamp-1 sm:line-clamp-2 drop-shadow-xs">
                    {slide.subtitle}
                  </p>
                )}

                {/* Call-to-Action Group */}
                <div className="mt-2.5 sm:mt-4 md:mt-5 flex flex-wrap items-center gap-2 sm:gap-3">
                  <Link
                    to={slide.ctaLink}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg sm:rounded-xl bg-white px-3.5 py-1.5 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-black text-stone-950 shadow-md hover:bg-stone-100 transition-all active:scale-95 cursor-pointer"
                  >
                    <span>{slide.ctaText}</span>
                    <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.2} />
                  </Link>

                  {slide.isCouponSlide && (
                    <button
                      type="button"
                      onClick={handleCopyPromo}
                      className="inline-flex items-center gap-1.5 rounded-lg sm:rounded-xl border border-white/30 bg-black/40 hover:bg-black/60 px-2.5 py-1.5 sm:px-4 sm:py-2.5 text-[11px] sm:text-xs font-bold text-white backdrop-blur-sm transition-colors cursor-pointer"
                      title="Click to copy voucher code"
                    >
                      <span className="text-stone-300">Code:</span>
                      <strong className="font-mono text-emerald-300 tracking-wider font-bold">
                        {promoCode}
                      </strong>
                      <span className="flex items-center gap-1 rounded bg-black/40 px-1 py-0.5 text-[9px] uppercase font-bold tracking-wide">
                        {copied ? (
                          <>
                            <Check className="h-2.5 w-2.5 text-emerald-400" strokeWidth={2.5} />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-2.5 w-2.5" strokeWidth={2} />
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
                className="hidden sm:flex absolute left-2.5 top-1/2 -translate-y-1/2 z-20 h-8 w-8 items-center justify-center rounded-full bg-black/45 hover:bg-black/75 text-white backdrop-blur-md transition-all cursor-pointer opacity-80 hover:opacity-100 hover:scale-105"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2.4} />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next Slide"
                className="hidden sm:flex absolute right-2.5 top-1/2 -translate-y-1/2 z-20 h-8 w-8 items-center justify-center rounded-full bg-black/45 hover:bg-black/75 text-white backdrop-blur-md transition-all cursor-pointer opacity-80 hover:opacity-100 hover:scale-105"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={2.4} />
              </button>

              {/* Bottom Pagination Indicators (Pill Dashes) */}
              <div className="absolute bottom-2 sm:bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
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
                          ? 'w-5 sm:w-6 bg-white shadow-xs'
                          : 'w-1.5 sm:w-2 bg-white/40 hover:bg-white/70'
                      }`}
                    />
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* 2. Sub-Hero Tiles: 3-Column Promotional Banner Row (Desktop / Tablet only) */}
        <div className="hidden md:grid md:grid-cols-3 gap-4 mt-4">
          {subHeroTiles.map((tile) => (
            <motion.div
              key={tile.id}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              className="group relative overflow-hidden rounded-2xl text-white min-h-[180px] md:min-h-[200px] h-48 md:h-52 shadow-xs border border-stone-200/60 bg-stone-900"
            >
              {/* Full Background Image Layer with Smooth Hover Zoom */}
              <img
                src={tile.imageUrl}
                alt={tile.title}
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />

              {/* Dark Readability Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Content Container (relative z-10 on left) */}
              <div className="relative z-10 h-full p-5 sm:p-6 flex flex-col justify-between">
                <div>
                  {tile.badge && (
                    <span className="inline-block text-[10px] uppercase font-black tracking-wider bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-md border border-white/15 mb-2 shadow-xs">
                      {tile.badge}
                    </span>
                  )}
                  <h3 className="font-display text-base sm:text-lg font-black tracking-tight leading-snug line-clamp-1 drop-shadow-sm text-white">
                    {tile.title}
                  </h3>
                  <p className="text-xs text-stone-200 font-medium line-clamp-2 mt-1 leading-snug drop-shadow-xs max-w-xs">
                    {tile.subtitle}
                  </p>
                </div>

                <div>
                  <Link
                    to={tile.link}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/95 hover:bg-white text-stone-950 px-3.5 py-1.5 text-xs font-black shadow-xs hover:shadow transition-all active:scale-95 group-hover:bg-[#ccff00] group-hover:text-stone-950"
                  >
                    <span>{tile.ctaText}</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
