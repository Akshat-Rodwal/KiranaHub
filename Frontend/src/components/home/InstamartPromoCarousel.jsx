import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import bannerService from '../../services/banner.service.js';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';

const DEFAULT_INSTAMART_CARDS = [
  {
    _id: 'instamart-1',
    title: 'Pick Yours Now',
    subtitle: 'Your kinda coffee, your kinda mug',
    ctaText: 'TRY NOW',
    brandTag: 'Powered by NESCAFE',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    link: '/products?category=tea-coffee-drinks',
  },
  {
    _id: 'instamart-2',
    title: 'Aged to Perfection',
    subtitle: 'Long grain aromatic basmati for royal feasts',
    ctaText: 'SHOP NOW',
    brandTag: 'Powered by DAAWAT',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
    link: '/products?category=atta-rice-dal',
  },
  {
    _id: 'instamart-3',
    title: 'Direct from Mandi',
    subtitle: 'Handpicked crisp greens & farm-fresh fruits',
    ctaText: 'EXPLORE',
    brandTag: 'Farm Fresh Guarantee',
    imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80',
    link: '/products?category=fruits-vegetables',
  },
  {
    _id: 'instamart-4',
    title: 'Morning Essentials',
    subtitle: 'Farm milk, country butter, organic eggs & bread',
    ctaText: 'SHOP NOW',
    brandTag: 'Daily Fresh Express',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
    link: '/products?category=dairy-bread-eggs',
  },
  {
    _id: 'instamart-5',
    title: 'Late Night Cravings?',
    subtitle: 'Gourmet chips, roasted nuts, chocolates & cold drinks',
    ctaText: 'ORDER NOW',
    brandTag: 'Party Essentials',
    imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80',
    link: '/products?category=snacks-munchies',
  },
  {
    _id: 'instamart-6',
    title: 'First-Aid & Care',
    subtitle: 'Pain relief, vitamins & health essentials in 10 mins',
    ctaText: 'EXPLORE',
    brandTag: '10-Min Pharmacy',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    link: '/products?category=pharma-wellness',
  },
];

const resolveImageUrl = (url, fallback = FALLBACK_IMG) => {
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
    return `https://kiranahub-backend.onrender.com${trimmed}`;
  }
  return trimmed || fallback;
};

export default function InstamartPromoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const mobileScrollRef = useRef(null);

  const { data: banners = [] } = useQuery({
    queryKey: ['banners'],
    queryFn: () => bannerService.getBanners({ active: true }),
    staleTime: 60 * 1000,
  });

  const bannerList = Array.isArray(banners) ? banners : [];
  const dbCards = bannerList.filter(
    (b) => b.bannerType === 'instamart_card' || (!b.bannerType && b.position !== 'top_single')
  );

  const displayCards = dbCards.length >= 3 ? dbCards : DEFAULT_INSTAMART_CARDS;
  const totalSlides = displayCards.length;

  // Append first 3 items at end so desktop 3-card window never encounters blank space
  const extendedCards =
    totalSlides > 3 ? [...displayCards, ...displayCards.slice(0, 3)] : displayCards;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Continuous auto-sliding transition every 3.5 seconds
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 3500);
    return () => clearInterval(timer);
  }, [isPaused, totalSlides]);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 my-6 sm:my-8">
      <div
        className="relative group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Desktop Sliding Track / Mobile Horizontal Scroll */}
        <div
          ref={mobileScrollRef}
          className="overflow-x-auto md:overflow-hidden snap-x snap-mandatory scrollbar-none pb-2 md:pb-0"
        >
          <div
            className="flex transition-transform duration-700 ease-out md:-mx-2"
            style={{
              transform:
                typeof window !== 'undefined' && window.innerWidth >= 768
                  ? `translateX(-${currentIndex * (100 / 3)}%)`
                  : undefined,
            }}
          >
            {extendedCards.map((card, index) => {
              const cardId = card._id || card.id || `card-${index}`;

              let destinationLink = card.link || '/products';
              if (card.targetType === 'category' && card.targetId) {
                destinationLink = `/products?category=${encodeURIComponent(card.targetId)}`;
              } else if (card.targetType === 'product' && card.targetId) {
                destinationLink = `/product/${encodeURIComponent(card.targetId)}`;
              }

              const isExternal =
                destinationLink.startsWith('http://') || destinationLink.startsWith('https://');

              const cardElement = (
                <div className="relative rounded-3xl overflow-hidden h-[210px] sm:h-[225px] p-6 flex flex-col justify-between shadow-md hover:shadow-lg transition-all duration-300 group cursor-pointer border border-black/5 bg-slate-900 select-none">
                  {/* 1. Background Image (Lowest Layer: z-0) */}
                  <img
                    src={resolveImageUrl(card.imageUrl || card.image || card.bgImageUrl)}
                    alt={card.title}
                    className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = card.fallbackImage || FALLBACK_IMG;
                    }}
                    loading="lazy"
                  />

                  {/* 2. Gradient Readability Overlay (Middle Layer: z-10) */}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent z-10 pointer-events-none" />

                  {/* 3. Top-Right Brand Badge (Top Layer: z-20) */}
                  {card.brandTag && (
                    <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-900 uppercase tracking-wide select-none">
                      {card.brandTag}
                    </div>
                  )}

                  {/* 4. Foreground Content (Top Layer: z-20) */}
                  <div className="relative z-20 flex flex-col justify-between h-full pointer-events-auto">
                    <div className="max-w-[70%]">
                      <h3 className="text-white font-black text-xl sm:text-2xl leading-tight drop-shadow-md line-clamp-2">
                        {card.title}
                      </h3>
                      <p className="text-slate-200 text-xs sm:text-sm font-medium drop-shadow-sm line-clamp-2 mt-2 leading-snug">
                        {card.subtitle}
                      </p>
                    </div>

                    <div>
                      <span className="inline-flex items-center gap-1.5 bg-white text-slate-950 font-black px-5 py-2 rounded-full text-xs uppercase tracking-wider group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-md active:scale-95">
                        <span>{(card.ctaText || 'SHOP NOW').replace(/[\s→\-]+$/, '').trim()}</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
                      </span>
                    </div>
                  </div>
                </div>
              );

              return (
                <div
                  key={`${cardId}-${index}`}
                  className="w-[85vw] sm:w-[360px] md:w-1/3 flex-shrink-0 px-2 snap-start"
                >
                  {isExternal ? (
                    <a
                      href={destinationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block h-full"
                    >
                      {cardElement}
                    </a>
                  ) : (
                    <Link to={destinationLink} className="block h-full">
                      {cardElement}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating Navigation Arrows (Desktop) */}
        {totalSlides > 1 && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous Slide"
              className="hidden md:flex absolute -left-3.5 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-md border border-slate-200 hover:bg-white hover:scale-110 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5 text-slate-700" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next Slide"
              className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-md border border-slate-200 hover:bg-white hover:scale-110 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronRight className="h-5 w-5 text-slate-700" strokeWidth={2.5} />
            </button>
          </>
        )}
      </div>

      {/* Carousel Controls: Sleek Pagination Dots & Slide Counter Pill */}
      {totalSlides > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          {/* Slide counter pill badge: e.g. "1/6" */}
          <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 text-[11px] font-mono font-bold text-slate-700 shadow-2xs">
            <span>{(currentIndex % totalSlides) + 1}</span>
            <span className="text-slate-400">/</span>
            <span>{totalSlides}</span>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSlides }).map((_, dotIndex) => (
              <button
                key={dotIndex}
                type="button"
                onClick={() => setCurrentIndex(dotIndex)}
                aria-label={`Go to slide ${dotIndex + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  dotIndex === currentIndex % totalSlides
                    ? 'w-6 bg-slate-900 shadow-xs'
                    : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
