import React, { isValidElement } from 'react';
import { classNames } from '../../utils/index.js';

const variants = {
  discount: 'bg-[#054428] text-[#ccff00] font-extrabold shadow-xs',
  'discount-soft': 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold',
  new: 'bg-brand-600 text-white font-bold',
  'new-soft': 'bg-brand-50 text-brand-700 border border-brand-200 font-semibold',
  sale: 'bg-amber-400 text-stone-900 font-bold',
  'sale-soft': 'bg-amber-50 text-amber-800 border border-amber-200 font-semibold',
  stock: 'bg-emerald-600 text-white font-bold',
  'stock-soft': 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold',
  info: 'bg-info-600 text-white font-bold',
  'info-soft': 'bg-info-50 text-info-700 border border-info-200 font-semibold',
  neutral: 'bg-stone-100 text-stone-700 border border-stone-200 font-medium',
  combo: 'bg-gradient-to-r from-[#054428] to-emerald-700 text-[#ccff00] font-extrabold',
};

const sizes = {
  xs: 'px-1.5 py-0.5 text-[10px] font-bold rounded',
  sm: 'px-2 py-1 text-xs font-bold rounded-md',
  md: 'px-2.5 py-1 text-xs font-bold rounded-lg',
  lg: 'px-3 py-1.5 text-sm font-bold rounded-lg',
};

export default function Badge({
  variant = 'new',
  size = 'sm',
  pill = false,
  className = '',
  dot,
  icon,
  children,
  ...rest
}) {
  if (!children && !dot && !icon) return null;

  const renderIcon = () => {
    if (!icon) return null;
    if (isValidElement(icon)) return icon;
    if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null && (icon.$$typeof || icon.render))) {
      return React.createElement(icon, { className: 'w-3 h-3', strokeWidth: 2 });
    }
    return icon;
  };

  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1 font-display tracking-tight uppercase leading-none',
        variants[variant],
        sizes[size],
        pill && 'rounded-full',
        className
      )}
      {...rest}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {renderIcon()}
      {children}
    </span>
  );
}
