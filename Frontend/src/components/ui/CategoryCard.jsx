import { isValidElement } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { classNames } from '../../utils/index.js';

const MotionLink = motion.create(Link);
const MotionButton = motion.button;

export default function CategoryCard({
  id: _id,
  slug: _slug,
  name,
  icon,
  image,
  count,
  to,
  onClick,
  showLabel = true,
  className = '',
}) {
  const Tag = to ? MotionLink : MotionButton;
  const linkProps = to ? { to } : { type: 'button' };

  const renderIconContent = () => {
    if (image) {
      return (
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="w-[85%] h-[85%] object-contain drop-shadow-2xs transition-transform duration-300 group-hover:scale-110"
        />
      );
    }

    if (!icon) {
      return (
        <div className="flex items-center justify-center text-emerald-700 transition-transform duration-300 group-hover:scale-110">
          <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2} />
        </div>
      );
    }

    if (isValidElement(icon)) {
      return (
        <div className="flex items-center justify-center text-emerald-700 transition-transform duration-300 group-hover:scale-110">
          {icon}
        </div>
      );
    }

    if (
      typeof icon === 'function' ||
      (typeof icon === 'object' && icon !== null && (icon.$$typeof || icon.render))
    ) {
      const IconComponent = icon;
      return (
        <div className="flex items-center justify-center text-emerald-700 transition-transform duration-300 group-hover:scale-110">
          <IconComponent className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2} />
        </div>
      );
    }

    if (typeof icon === 'string') {
      return (
        <span className="text-2xl sm:text-3xl drop-shadow-2xs transition-transform duration-300 group-hover:scale-110">
          {icon}
        </span>
      );
    }

    return (
      <div className="flex items-center justify-center text-emerald-700 transition-transform duration-300 group-hover:scale-110">
        <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2} />
      </div>
    );
  };

  const content = (
    <>
      <div
        className={classNames(
          'relative flex aspect-square w-18 h-18 sm:w-20 sm:h-20 lg:w-22 lg:h-22 items-center justify-center overflow-hidden rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all duration-300 p-2 group-hover:bg-emerald-50/40'
        )}
      >
        {renderIconContent()}
      </div>

      {showLabel && (
        <div className="mt-1.5 text-center min-w-0 w-full px-0.5">
          <p className="text-xs font-semibold text-slate-800 text-center line-clamp-1 group-hover:text-emerald-700 transition-colors">
            {name}
          </p>
          {typeof count === 'number' && (
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
      whileTap={{ scale: 0.95 }}
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
