import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Zap } from 'lucide-react';
import bannerService from '../../services/banner.service.js';

const DEFAULT_TOP_BANNER = {
  imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80',
  title: 'Groceries delivered in 10 minutes',
  subtitle: 'Fresh vegetables, dairy, farm eggs & daily pantry essentials rushed directly to your doorstep.',
  badge: '⚡ 10-Minute Hyperlocal Delivery',
  ctaText: 'Order Now',
  link: '/products?flashDeal=true',
};

const resolveImageUrl = (url, fallback = DEFAULT_TOP_BANNER.imageUrl) => {
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

export default function TopSingleBanner() {
  const [imgError, setImgError] = useState(false);

  const { data: banners = [] } = useQuery({
    queryKey: ['banners', 'top_single'],
    queryFn: () => bannerService.getBanners({ active: true }),
    staleTime: 60 * 1000,
  });

  const bannerList = Array.isArray(banners) ? banners : [];
  const topBanner =
    bannerList.find((b) => b.bannerType === 'top_single' || b.position === 'top_single') ||
    bannerList[0] ||
    DEFAULT_TOP_BANNER;

  const resolvedImage = imgError
    ? DEFAULT_TOP_BANNER.imageUrl
    : resolveImageUrl(topBanner.imageUrl, DEFAULT_TOP_BANNER.imageUrl);

  const destinationLink = topBanner.link || '/products';
  const isExternal = destinationLink.startsWith('http://') || destinationLink.startsWith('https://');

  const hasOverlayText = Boolean(topBanner.title || topBanner.subtitle || topBanner.badge);

  const cardContent = (
    <div className="relative w-full h-[150px] sm:h-[190px] md:h-[230px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer bg-slate-900">
      {/* High-res Full-Bleed Background Image */}
      <img
        src={resolvedImage}
        alt={topBanner.title || 'Special Promotion Banner'}
        className="absolute inset-0 object-cover w-full h-full transition-transform duration-500 group-hover:scale-[1.02]"
        onError={() => setImgError(true)}
        loading="lazy"
      />

      {/* Gradient Overlay for 100% Readability */}
      {hasOverlayText ? (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/50 to-transparent z-10 pointer-events-none" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}

      {/* Editable Dynamic Overlay Text & CTA Button */}
      {hasOverlayText && (
        <div className="relative z-20 h-full flex flex-col justify-center p-4 sm:p-7 md:p-9 max-w-xl text-left">
          {topBanner.badge && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600/95 text-white backdrop-blur-md px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-black shadow-xs mb-1.5 sm:mb-2 w-fit border border-emerald-400/30">
              <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current text-amber-300 animate-pulse" />
              <span>{topBanner.badge}</span>
            </div>
          )}

          {topBanner.title && (
            <h2 className="font-display text-base sm:text-2xl md:text-3xl font-black tracking-tight leading-[1.15] text-white drop-shadow-md line-clamp-1 sm:line-clamp-2">
              {topBanner.title}
            </h2>
          )}

          {topBanner.subtitle && (
            <p className="mt-1 sm:mt-2 text-[11px] sm:text-xs md:text-sm text-stone-100 font-medium leading-tight sm:leading-snug drop-shadow-sm max-w-lg line-clamp-1 sm:line-clamp-2">
              {topBanner.subtitle}
            </p>
          )}

          {topBanner.ctaText && (
            <div className="mt-2.5 sm:mt-4">
              <span className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#0c831f] hover:bg-[#0a6d1a] px-4 py-1.5 sm:px-6 sm:py-2 text-xs sm:text-sm font-black text-white shadow-md transition-all group-hover:scale-105 active:scale-95 cursor-pointer w-fit">
                <span>{topBanner.ctaText.replace(/[\s→\-]+$/, '').trim()}</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 my-3">
      {isExternal ? (
        <a href={destinationLink} target="_blank" rel="noopener noreferrer" className="block">
          {cardContent}
        </a>
      ) : (
        <Link to={destinationLink} className="block">
          {cardContent}
        </Link>
      )}
    </section>
  );
}
