import { isValidElement } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { classNames } from '../../utils/index.js';

const MotionLink = motion.create(Link);
const MotionButton = motion.button;

/**
 * Built-in dictionary of clean transparent 3D quick-commerce icons
 */
export const CATEGORY_3D_ICONS = {
  // Fruits & Vegetables
  'fruits-vegetables': 'https://cdn-icons-png.flaticon.com/512/1625/1625048.png',
  fruits: 'https://cdn-icons-png.flaticon.com/512/1625/1625048.png',
  vegetables: 'https://cdn-icons-png.flaticon.com/512/1625/1625048.png',

  // Dairy, Bread & Eggs
  'dairy-eggs-bread': 'https://cdn-icons-png.flaticon.com/512/3050/3050158.png',
  'dairy-bread-eggs': 'https://cdn-icons-png.flaticon.com/512/3050/3050158.png',
  dairy: 'https://cdn-icons-png.flaticon.com/512/3050/3050158.png',

  // Atta, Rice & Dal / Staples
  staples: 'https://cdn-icons-png.flaticon.com/512/2821/2821805.png',
  'atta-rice-dal': 'https://cdn-icons-png.flaticon.com/512/2821/2821805.png',
  atta: 'https://cdn-icons-png.flaticon.com/512/2821/2821805.png',

  // Spices & Masala
  'spices-masala': 'https://cdn-icons-png.flaticon.com/512/2771/2771401.png',
  'masala-oil': 'https://cdn-icons-png.flaticon.com/512/2771/2771401.png',
  spices: 'https://cdn-icons-png.flaticon.com/512/2771/2771401.png',

  // Snacks & Munchies
  snacks: 'https://cdn-icons-png.flaticon.com/512/2553/2553691.png',
  'snacks-munchies': 'https://cdn-icons-png.flaticon.com/512/2553/2553691.png',

  // Beverages & Cold Drinks
  beverages: 'https://cdn-icons-png.flaticon.com/512/2405/2405479.png',
  'cold-drinks-juices': 'https://cdn-icons-png.flaticon.com/512/2405/2405479.png',
  'tea-coffee-drinks': 'https://cdn-icons-png.flaticon.com/512/2405/2405479.png',

  // Breakfast & Instant Food
  'breakfast-instant': 'https://cdn-icons-png.flaticon.com/512/3480/3480823.png',
  'instant-food': 'https://cdn-icons-png.flaticon.com/512/3480/3480823.png',

  // Personal Care
  'personal-care': 'https://cdn-icons-png.flaticon.com/512/2965/2965300.png',
  'beauty-grooming': 'https://cdn-icons-png.flaticon.com/512/2965/2965300.png',

  // Home Care & Cleaning
  'home-care': 'https://cdn-icons-png.flaticon.com/512/995/995053.png',
  'cleaning-essentials': 'https://cdn-icons-png.flaticon.com/512/995/995053.png',
  'home-office': 'https://cdn-icons-png.flaticon.com/512/995/995053.png',

  // Baby Care
  'baby-care': 'https://cdn-icons-png.flaticon.com/512/2829/2829824.png',

  // Pet Care
  'pet-care': 'https://cdn-icons-png.flaticon.com/512/616/616408.png',

  // Pharma & Wellness
  'pharma-wellness': 'https://cdn-icons-png.flaticon.com/512/883/883407.png',

  // Sweet Tooth / Bakery
  'sweet-tooth': 'https://cdn-icons-png.flaticon.com/512/992/992747.png',
  'bakery-biscuits': 'https://cdn-icons-png.flaticon.com/512/992/992747.png',

  // Meat & Fish
  'chicken-meat-fish': 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png',

  // Paan Corner
  'paan-corner': 'https://cdn-icons-png.flaticon.com/512/2909/2909894.png',
};

export const getCategoryIconUrl = (slug, name, rawImage) => {
  // 1. If explicit valid web image (http/https and not data:image/svg) is provided
  if (rawImage && typeof rawImage === 'string' && rawImage.startsWith('http')) {
    return rawImage;
  }

  // 2. Lookup dictionary by slug
  const normalizedSlug = (slug || '').toLowerCase().trim();
  if (normalizedSlug && CATEGORY_3D_ICONS[normalizedSlug]) {
    return CATEGORY_3D_ICONS[normalizedSlug];
  }

  // 3. Lookup dictionary by name fuzzy match
  const normalizedName = (name || '').toLowerCase().trim();
  for (const [key, url] of Object.entries(CATEGORY_3D_ICONS)) {
    if (
      normalizedSlug.includes(key) ||
      key.includes(normalizedSlug) ||
      normalizedName.includes(key.replace(/-/g, ' '))
    ) {
      return url;
    }
  }

  // 4. Default fallback icon
  return 'https://cdn-icons-png.flaticon.com/512/3050/3050158.png';
};

export default function CategoryCard({
  id: _id,
  slug,
  name,
  icon,
  image,
  count,
  showCount = false,
  to,
  onClick,
  showLabel = true,
  className = '',
}) {
  const Tag = to ? MotionLink : MotionButton;
  const linkProps = to ? { to } : { type: 'button' };

  const iconSrc = getCategoryIconUrl(slug, name, image);

  const renderIconContent = () => {
    if (iconSrc) {
      return (
        <img
          src={iconSrc}
          alt={name}
          loading="lazy"
          className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/3050/3050158.png';
          }}
        />
      );
    }

    if (isValidElement(icon)) {
      return (
        <div className="flex items-center justify-center text-emerald-700 transition-transform duration-300 group-hover:scale-110">
          {icon}
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center text-emerald-700 transition-transform duration-300 group-hover:scale-110">
        <ShoppingBag className="w-8 h-8" strokeWidth={2} />
      </div>
    );
  };

  const content = (
    <>
      <div
        className={classNames(
          'w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-3xl sm:rounded-full bg-gradient-to-b from-slate-50 to-slate-100/90 border border-slate-200/60 p-3.5 flex items-center justify-center shadow-xs hover:shadow-md transition-all duration-300 group-hover:scale-105 group-hover:bg-emerald-50/50 group-hover:border-emerald-200'
        )}
      >
        {renderIconContent()}
      </div>

      {showLabel && (
        <div className="mt-1 text-center min-w-0 w-full px-0.5">
          <p className="text-xs sm:text-[13px] font-bold text-slate-800 text-center mt-2 group-hover:text-emerald-700 transition-colors line-clamp-1">
            {name}
          </p>
          {showCount && typeof count === 'number' && (
            <span className="hidden sm:inline-block text-[10px] font-semibold text-slate-400 mt-0.5 tabular-nums">
              {count} items
            </span>
          )}
        </div>
      )}
    </>
  );

  return (
    <Tag
      {...linkProps}
      onClick={onClick}
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={classNames(
        'group flex flex-col items-center justify-start shrink-0 min-w-0 cursor-pointer',
        className
      )}
    >
      {content}
    </Tag>
  );
}
