import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import bannerService from '../../services/banner.service.js';

const DEFAULT_INSTAMART_CARDS = [
  {
    _id: 'instamart-1',
    title: 'Pick Yours Now',
    subtitle: 'Your kinda coffee, your kinda mug',
    ctaText: 'TRY NOW',
    brandTag: 'Powered by NESCAFE',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=500&q=80',
    bgColor: '#BA1A1A',
    textColor: 'light',
    link: '/products?category=tea-coffee-drinks',
  },
  {
    _id: 'instamart-2',
    title: 'Aged to Perfection',
    subtitle: 'Long grain aromatic basmati for royal feasts',
    ctaText: 'SHOP NOW',
    brandTag: 'Powered by DAAWAT',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80',
    bgColor: '#FDF8EE',
    textColor: 'dark',
    link: '/products?category=atta-rice-dal',
  },
  {
    _id: 'instamart-3',
    title: 'Direct from Mandi',
    subtitle: 'Handpicked crisp greens & farm-fresh fruits',
    ctaText: 'EXPLORE',
    brandTag: 'Farm Fresh Guarantee',
    imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=500&q=80',
    bgColor: '#E6F4EA',
    textColor: 'dark',
    link: '/products?category=fruits-vegetables',
  },
  {
    _id: 'instamart-4',
    title: 'Morning Essentials',
    subtitle: 'Farm milk, country butter, organic eggs & bread',
    ctaText: 'SHOP NOW',
    brandTag: 'Daily Fresh Express',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=500&q=80',
    bgColor: '#EFF6FF',
    textColor: 'dark',
    link: '/products?category=dairy-bread-eggs',
  },
  {
    _id: 'instamart-5',
    title: 'Late Night Cravings?',
    subtitle: 'Gourmet chips, roasted nuts, chocolates & cold drinks',
    ctaText: 'ORDER NOW',
    brandTag: 'Party Essentials',
    imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=500&q=80',
    bgColor: '#FFFBEB',
    textColor: 'dark',
    link: '/products?category=snacks-munchies',
  },
  {
    _id: 'instamart-6',
    title: 'First-Aid & Care',
    subtitle: 'Pain relief, vitamins & health essentials in 10 mins',
    ctaText: 'EXPLORE',
    brandTag: '10-Min Pharmacy',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=500&q=80',
    bgColor: '#F5F3FF',
    textColor: 'dark',
    link: '/products?category=pharma-wellness',
  },
];

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
    return `https://kiranahub-backend.onrender.com${trimmed}`;
  }
  return trimmed || fallback;
};

export default function InstamartPromoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [imgErrors, setImgErrors] = useState({});
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

  // On desktop, 3 cards are visible at a time. The maximum starting index is totalSlides - 3.
  const maxIndex = Math.max(0, totalSlides - 3);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // Auto-sliding every 4.5 seconds when not paused and slides > 3
  useEffect(() => {
    if (isPaused || maxIndex <= 0) return;
    const interval = setInterval(nextSlide, 4500);
    return () => clearInterval(interval);
  }, [isPaused, maxIndex, nextSlide]);

  const handleImgError = (id) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

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
            className="flex transition-transform duration-500 ease-out md:-mx-2"
            style={{
              // Desktop: translate by (100 / 3)% per index
              transform: typeof window !== 'undefined' && window.innerWidth >= 768
                ? `translateX(-${currentIndex * (100 / 3)}%)`
                : undefined,
            }}
          >
            {displayCards.map((card, index) => {
              const cardId = card._id || card.id || `card-${index}`;
              const isLightText = card.textColor === 'light';

              let destinationLink = card.link || '/products';
              if (card.targetType === 'category' && card.targetId) {
                destinationLink = `/products?category=${encodeURIComponent(card.targetId)}`;
              } else if (card.targetType === 'product' && card.targetId) {
                destinationLink = `/product/${encodeURIComponent(card.targetId)}`;
              }

              const isExternal =
                destinationLink.startsWith('http://') || destinationLink.startsWith('https://');

              const fallbackSrc =
                DEFAULT_INSTAMART_CARDS[index % DEFAULT_INSTAMART_CARDS.length].imageUrl;
              const imageSrc = imgErrors[cardId]
                ? fallbackSrc
                : resolveImageUrl(card.imageUrl, fallbackSrc);

              const cardElement = (
                <div
                  className="relative rounded-3xl overflow-hidden h-[210px] sm:h-[225px] p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer border border-black/5"
                  style={{ backgroundColor: card.bgColor || '#F8FAFC' }}
                >
                  {/* Full-bleed background image if configured */}
                  {card.bgImageUrl && (
                    <>
                      <img
                        src={resolveImageUrl(card.bgImageUrl)}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover -z-20"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent -z-10 pointer-events-none" />
                    </>
                  )}

                  {/* Top-Right Badge: Brand / Sponsor Tag */}
                  {card.brandTag && (
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-xl shadow-xs border border-slate-100 flex flex-col items-center justify-center text-[10px] font-bold text-slate-800 z-10 select-none">
                      <span>{card.brandTag}</span>
                    </div>
                  )}

                  {/* Left Section: Headline, Subtitle & High-Contrast Pill CTA */}
                  <div className="flex flex-col justify-between h-full z-10">
                    <div>
                      <h3
                        className={`text-2xl sm:text-3xl font-black tracking-tight leading-tight max-w-[65%] line-clamp-2 ${
                          isLightText ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {card.title}
                      </h3>
                      {card.subtitle && (
                        <p
                          className={`text-xs sm:text-sm font-medium mt-2 line-clamp-2 max-w-[60%] leading-snug ${
                            isLightText ? 'text-white/85' : 'text-slate-600'
                          }`}
                        >
                          {card.subtitle}
                        </p>
                      )}
                    </div>

                    <div className="pt-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-wider shadow-sm transition-transform hover:scale-105 active:scale-95 ${
                          isLightText
                            ? 'bg-white text-slate-900 hover:bg-stone-100'
                            : 'bg-slate-900 text-white hover:bg-black'
                        }`}
                      >
                        <span>{card.ctaText || 'SHOP NOW'}</span>
                        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.4} />
                      </span>
                    </div>
                  </div>

                  {/* Right Section: Hero Product Cutout Asset Positioned at Right-Center */}
                  <img
                    src={imageSrc}
                    alt={card.title}
                    className="absolute right-4 bottom-2 sm:bottom-3 max-h-[160px] sm:max-h-[175px] w-36 sm:w-44 object-contain drop-shadow-xl hover:scale-105 transition-transform duration-300 pointer-events-none"
                    onError={() => handleImgError(cardId)}
                    loading="lazy"
                  />
                </div>
              );

              return (
                <div
                  key={cardId}
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
        {maxIndex > 0 && (
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
      {maxIndex > 0 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          {/* Slide counter pill badge: e.g. "1/4" */}
          <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 text-[11px] font-mono font-bold text-slate-700 shadow-2xs">
            <span>{currentIndex + 1}</span>
            <span className="text-slate-400">/</span>
            <span>{maxIndex + 1}</span>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: maxIndex + 1 }).map((_, dotIndex) => (
              <button
                key={dotIndex}
                type="button"
                onClick={() => setCurrentIndex(dotIndex)}
                aria-label={`Go to slide ${dotIndex + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  dotIndex === currentIndex
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
