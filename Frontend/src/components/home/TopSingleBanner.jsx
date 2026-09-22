import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import bannerService from '../../services/banner.service.js';

const DEFAULT_TOP_BANNER = {
  imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80',
  title: 'Mega Grocery Deals & Discounts',
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

  const cardContent = (
    <div className="relative w-full h-[140px] sm:h-[180px] md:h-[220px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer bg-slate-100">
      <img
        src={resolvedImage}
        alt={topBanner.title || 'Special Promotion Banner'}
        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-[1.02]"
        onError={() => setImgError(true)}
        loading="lazy"
      />
      {/* Subtle overlay for contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
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
