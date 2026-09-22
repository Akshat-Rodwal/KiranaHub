import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Plus, Minus, Star } from 'lucide-react';
import {
  classNames,
  formatPrice,
  calculateDiscount,
} from '../../utils/index.js';

export default function ProductCard({
  id: _idProp,
  _id,
  slug: _slug,
  name,
  image,
  images,
  category,
  brand: _brand,
  originalPrice,
  sellingPrice,
  price,
  mrp,
  unit = '1 pc',
  rating = 0,
  reviewCount: _reviewCount = 0,
  stock = 10,
  badges: _badges = [],
  isNew: _isNew = false,
  isInWishlist = false,
  quantityInCart = 0,
  onClick,
  onAddToCart,
  onToggleWishlist,
  variant = 'default',
  className = '',
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const effectiveSellingPrice = sellingPrice ?? price ?? 0;
  const effectiveOriginalPrice = originalPrice ?? mrp ?? effectiveSellingPrice;
  const discount = calculateDiscount(effectiveOriginalPrice, effectiveSellingPrice);
  const outOfStock = stock <= 0;
  const lowStock = stock > 0 && stock <= 5;
  const categoryName = typeof category === 'object' ? category?.name : category;

  const DEFAULT_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=80';
  
  const rawImage = image || images?.[0]?.url || images?.[0] || '';
  const isSvgDataUri = typeof rawImage === 'string' && rawImage.startsWith('data:image/svg');
  const initialSrc = !rawImage || isSvgDataUri ? DEFAULT_PRODUCT_IMAGE : rawImage;

  const [currentSrc, setCurrentSrc] = useState(initialSrc);

  const renderQuantity = () => {
    if (!onAddToCart || outOfStock) return null;

    if (quantityInCart === 0) {
      return (
        <motion.button
          type="button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart?.(1);
          }}
          className="w-full h-8 rounded-full bg-white border-2 border-emerald-600 text-emerald-700 font-bold hover:bg-emerald-600 hover:text-white px-3 py-1 text-xs transition-all shadow-2xs flex items-center justify-between cursor-pointer"
        >
          <span className="font-extrabold tracking-wide">ADD</span>
          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
        </motion.button>
      );
    }

    return (
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        className="flex items-center justify-between w-full h-8 px-1.5 rounded-full bg-emerald-600 text-white shadow-sm"
      >
        <motion.button
          type="button"
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.8 }}
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart?.(-1);
          }}
          className="flex h-6 w-6 items-center justify-center rounded-full text-white hover:bg-emerald-700 transition-colors cursor-pointer"
          aria-label="Decrease quantity"
        >
          <Minus className="h-3 w-3" strokeWidth={2.5} />
        </motion.button>

        <span className="font-mono text-xs font-black tabular-nums">
          {quantityInCart}
        </span>

        <motion.button
          type="button"
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.8 }}
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart?.(1);
          }}
          className="flex h-6 w-6 items-center justify-center rounded-full text-white hover:bg-emerald-700 transition-colors cursor-pointer"
          aria-label="Increase quantity"
        >
          <Plus className="h-3 w-3" strokeWidth={2.5} />
        </motion.button>
      </motion.div>
    );
  };

  return (
    <motion.article
      whileHover={variant === 'compact' ? {} : { y: -4 }}
      whileTap={onClick ? { scale: 0.985 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={classNames(
        'group relative flex flex-col rounded-2xl bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-all duration-300 p-3',
        outOfStock ? 'opacity-60' : '',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {/* 1. Crisp Centered Image Container with Aspect-Square Padding */}
      <div className="relative w-full aspect-square bg-slate-50/60 rounded-xl p-2 flex items-center justify-center overflow-hidden">
        {!imgLoaded && (
          <div className="absolute inset-0 bg-slate-100 animate-pulse" />
        )}
        <img
          src={currentSrc}
          alt={name}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={() => {
            if (currentSrc !== DEFAULT_PRODUCT_IMAGE) {
              setCurrentSrc(DEFAULT_PRODUCT_IMAGE);
            }
          }}
          className={classNames(
            'w-full h-full object-contain transition-transform duration-300',
            !outOfStock && 'group-hover:scale-105',
            imgLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />

        {/* Vibrant Pill Badge at Top-Left */}
        {discount > 0 && (
          <div className="absolute top-2 left-2 z-10">
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              {discount}% OFF
            </span>
          </div>
        )}

        {/* Minimalist Wishlist Button with Lucide Heart */}
        {onToggleWishlist && (
          <motion.button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist();
            }}
            whileTap={{ scale: 0.75 }}
            className={classNames(
              'absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm border transition-all duration-200 shadow-2xs cursor-pointer',
              isInWishlist
                ? 'bg-rose-50 text-rose-600 border-rose-200'
                : 'bg-white/90 text-slate-400 hover:text-slate-700 border-slate-200/80 hover:bg-white'
            )}
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              className={classNames(
                'w-3.5 h-3.5',
                isInWishlist ? 'fill-rose-600 text-rose-600' : 'text-slate-500'
              )}
              strokeWidth={2}
            />
          </motion.button>
        )}

        {/* Out of Stock Overlay */}
        {outOfStock && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="px-2.5 py-1 rounded-full bg-slate-900/90 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* 2. Product Metadata */}
      <div className="flex flex-col flex-1 pt-2.5 text-left justify-between">
        <div>
          {/* Pack Size / Weight in muted gray */}
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-xs text-slate-500 font-medium">
              {unit}
            </span>
            {categoryName && (
              <span className="text-[10px] font-medium text-slate-400 truncate max-w-[100px]">
                {categoryName}
              </span>
            )}
          </div>

          {/* Product Name in Crisp Dark Slate */}
          <h3
            className={classNames(
              'text-slate-900 font-semibold text-sm line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors',
              variant === 'compact' ? 'text-xs' : 'text-sm'
            )}
            title={name}
          >
            {name}
          </h3>

          {/* Clean Rating Snippet */}
          <div className="flex items-center gap-1 mt-1">
            <div className="flex items-center text-amber-500">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" strokeWidth={2} />
            </div>
            <span className="text-[10px] font-bold text-slate-500 tabular-nums">
              {rating > 0 ? rating.toFixed(1) : '4.8'}
            </span>
          </div>
        </div>

        {/* 3. Pricing + Tier-1 Quick-Commerce ADD Button */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="leading-tight">
            <p className="text-sm sm:text-base font-bold text-slate-900 tabular-nums">
              {formatPrice(effectiveSellingPrice)}
            </p>
            {effectiveOriginalPrice > effectiveSellingPrice && (
              <p className="text-[10px] text-slate-400 line-through tabular-nums">
                {formatPrice(effectiveOriginalPrice)}
              </p>
            )}
          </div>

          <div className="w-[84px] sm:w-[92px] shrink-0">
            {renderQuantity()}
          </div>
        </div>

        {/* Low Stock Indicator */}
        {lowStock && (
          <p className="text-[10px] font-semibold text-amber-600 flex items-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Only {stock} left
          </p>
        )}
      </div>
    </motion.article>
  );
}
