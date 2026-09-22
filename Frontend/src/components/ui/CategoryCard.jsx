import { isValidElement } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { classNames } from '../../utils/index.js';
import { resolveCategory3DIcon } from '../../utils/categoryIcons.js';

const MotionLink = motion.create(Link);
const MotionButton = motion.button;

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

  // Resolve best 3D icon using smart keyword detection or custom uploaded image
  const customWebImage =
    image && typeof image === 'string' && image.startsWith('http') && !image.startsWith('data:image/svg')
      ? image
      : null;

  const iconSrc = customWebImage || resolveCategory3DIcon(name, slug, icon);

  const renderIconContent = () => {
    if (iconSrc) {
      return (
        <img
          src={iconSrc}
          alt={name}
          loading="lazy"
          className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-300 pointer-events-none select-none"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://img.icons8.com/plasticine/200/shopping-basket-2.png';
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
      {/* KiranaHub Signature Soft Mint / Emerald Circular Container */}
      <div
        className={classNames(
          'w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-gradient-to-b from-[#ebfaf2] to-[#dcf6e7] border border-[#bbf0d2] p-3 sm:p-3.5 flex items-center justify-center shadow-xs transition-all duration-300 group-hover:scale-105 group-hover:bg-[#d0f3df] group-hover:border-[#8be2b0] group-hover:shadow-md group-hover:shadow-emerald-900/10'
        )}
      >
        {renderIconContent()}
      </div>

      {showLabel && (
        <div className="mt-1 text-center min-w-0 w-full px-0.5">
          <p className="text-xs sm:text-[13px] font-bold text-slate-800 text-center mt-2 group-hover:text-[#0c831f] transition-colors line-clamp-1">
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
        'group flex flex-col items-center justify-start shrink-0 min-w-0 cursor-pointer select-none',
        className
      )}
    >
      {content}
    </Tag>
  );
}
