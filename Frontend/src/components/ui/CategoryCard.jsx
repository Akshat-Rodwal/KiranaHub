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
          className="w-[85%] h-[85%] object-contain drop-shadow-2xs transition-transform duration-300 group-hover:scale-108"
        />
      );
    }

    if (!icon) {
      return (
        <div className="flex items-center justify-center text-emerald-800 transition-transform duration-300 group-hover:scale-110">
          <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={1.75} />
        </div>
      );
    }

    if (isValidElement(icon)) {
      return (
        <div className="flex items-center justify-center text-emerald-800 transition-transform duration-300 group-hover:scale-110">
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
        <div className="flex items-center justify-center text-emerald-800 transition-transform duration-300 group-hover:scale-110">
          <IconComponent className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={1.75} />
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
      <div className="flex items-center justify-center text-emerald-800 transition-transform duration-300 group-hover:scale-110">
        <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={1.75} />
      </div>
    );
  };

  const content = (
    <>
      <div
        className={classNames(
          'relative flex aspect-square w-18 h-18 sm:w-20 sm:h-20 lg:w-22 lg:h-22 items-center justify-center overflow-hidden rounded-2xl border border-stone-200/80 bg-stone-50/90 p-2 transition-all duration-200 ease-out shadow-2xs group-hover:bg-emerald-50/80 group-hover:border-emerald-300 group-hover:shadow-sm'
        )}
      >
        {renderIconContent()}
      </div>

      {showLabel && (
        <div className="mt-1.5 text-center min-w-0 w-full px-0.5">
          <p className="text-[11px] sm:text-xs font-bold font-display text-stone-800 line-clamp-2 leading-tight group-hover:text-emerald-800 transition-colors">
            {name}
          </p>
          {typeof count === 'number' && (
            <span className="hidden sm:inline-block text-[10px] font-semibold text-stone-400 mt-0.5 tabular-nums">
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
      whileHover={{ y: -3, scale: 1.03 }}
      whileTap={{ scale: 0.94 }}
      className={classNames(
        'group flex flex-col items-center justify-start shrink-0 min-w-0 cursor-pointer',
        className
      )}
    >
      {content}
    </Tag>
  );
}
