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
            e.currentTarget.src =
              'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Shopping%20bags/3D/shopping_bags_3d.png';
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
      {/* KiranaHub Ultra-Soft Airy Pastel Circular Container */}
      <div
        className={classNames(
          'w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-gradient-to-b from-white via-[#f8fbf9] to-[#edf6f2]/80 border border-emerald-100/90 p-2.5 sm:p-3 flex items-center justify-center shadow-xs transition-all duration-300 group-hover:scale-105 group-hover:bg-[#f1f8f4] group-hover:border-emerald-300/80 group-hover:shadow-md group-hover:shadow-emerald-950/5'
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
        'group flex flex-col items-center justify-start shrink-0 min-w-0 cursor-pointer select-none',
        className
      )}
    >
      {content}
    </Tag>
  );
}
