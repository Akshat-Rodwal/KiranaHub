import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import bannerService from '../../services/banner.service.js';

const DEFAULT_INSTAMART_CARDS = [
  {
    _id: 'instamart-1',
    title: 'Pick Yours Now',
    subtitle: 'Your kinda coffee, your kinda mug',
    ctaText: 'TRY NOW',
    brandTag: 'Powered by NESCAFE',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80',
    bgColor: '#B91C1C',
    textColor: 'light',
    link: '/products?category=tea-coffee-drinks',
  },
  {
    _id: 'instamart-2',
    title: 'Aged to Perfection',
    subtitle: 'Long grain aromatic basmati for royal feasts',
    ctaText: 'SHOP NOW',
    brandTag: 'Powered by DAAWAT',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
    bgColor: '#FDF8EC',
    textColor: 'dark',
    link: '/products?category=atta-rice-dal',
  },
  {
    _id: 'instamart-3',
    title: 'Direct from Mandi',
    subtitle: 'Crisp green veggies & fresh seasonal fruits',
    ctaText: 'EXPLORE',
    brandTag: 'Farm Fresh Guarantee',
    imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80',
    bgColor: '#ECFDF5',
    textColor: 'dark',
    link: '/products?category=fruits-vegetables',
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
  const [imgErrors, setImgErrors] = useState({});

  const { data: banners = [] } = useQuery({
    queryKey: ['banners'],
    queryFn: () => bannerService.getBanners({ active: true }),
    staleTime: 60 * 1000,
  });

  const bannerList = Array.isArray(banners) ? banners : [];
  const dbCards = bannerList.filter(
    (b) => b.bannerType === 'instamart_card' || (!b.bannerType && b.position !== 'top_single')
  );

  const displayCards = dbCards.length >= 3 ? dbCards.slice(0, 3) : DEFAULT_INSTAMART_CARDS;

  const handleImgError = (id) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 my-5 sm:my-7">
      <div className="flex md:grid md:grid-cols-3 gap-4 sm:gap-5 overflow-x-auto md:overflow-visible pb-3 md:pb-0 scrollbar-none snap-x snap-mandatory">
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
              className="rounded-3xl overflow-hidden relative p-5 sm:p-6 h-[190px] sm:h-[205px] flex justify-between items-center shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer border border-black/5"
              style={{ backgroundColor: card.bgColor || '#F8FAFC' }}
            >
              {/* Optional Top Right Brand / Sponsor Badge */}
              {card.brandTag && (
                <div className="absolute top-3.5 right-4 z-10 bg-white/95 backdrop-blur-xs text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-xs border border-slate-100 text-slate-800">
                  {card.brandTag}
                </div>
              )}

              {/* Left Section: Headline, Subtitle & CTA Pill */}
              <div className="flex flex-col justify-between h-full pr-3 max-w-[58%] z-10">
                <div>
                  <h3
                    className={`text-lg sm:text-2xl font-black tracking-tight leading-[1.15] line-clamp-2 ${
                      isLightText ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {card.title}
                  </h3>
                  {card.subtitle && (
                    <p
                      className={`text-[11px] sm:text-xs font-medium mt-1.5 sm:mt-2 line-clamp-2 leading-snug ${
                        isLightText ? 'text-white/80' : 'text-slate-600'
                      }`}
                    >
                      {card.subtitle}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full font-black text-[10px] sm:text-xs uppercase tracking-wider shadow hover:scale-105 transition-all duration-200 ${
                      isLightText
                        ? 'bg-white text-slate-900 hover:bg-stone-100'
                        : 'bg-slate-900 text-white hover:bg-black'
                    }`}
                  >
                    <span>{card.ctaText || 'SHOP NOW'}</span>
                    <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={2.4} />
                  </span>
                </div>
              </div>

              {/* Right Section: Product Hero Package Cutout */}
              <div className="w-28 h-28 sm:w-36 sm:h-36 shrink-0 relative flex items-center justify-center">
                <img
                  src={imageSrc}
                  alt={card.title}
                  className="w-full h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                  onError={() => handleImgError(cardId)}
                  loading="lazy"
                />
              </div>
            </div>
          );

          return (
            <div
              key={cardId}
              className="min-w-[85%] sm:min-w-[340px] md:min-w-0 flex-1 snap-start"
            >
              {isExternal ? (
                <a href={destinationLink} target="_blank" rel="noopener noreferrer" className="block">
                  {cardElement}
                </a>
              ) : (
                <Link to={destinationLink} className="block">
                  {cardElement}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
