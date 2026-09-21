import Button from './Button.jsx';
import { classNames } from '../../utils/index.js';

const presets = {
  cart: {
    title: 'Your cart is empty',
    description: 'Looks like you haven’t added anything yet. Explore our store and start adding your favorites!',
    action: 'Start Shopping',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    tone: 'brand',
  },
  wishlist: {
    title: 'Wishlist is empty',
    description: 'Save products you love here. Tap the heart icon on any product to add it.',
    action: 'Browse Products',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
    tone: 'danger',
  },
  orders: {
    title: 'No orders yet',
    description: 'Your order history will appear here once you place your first order.',
    action: 'Shop Now',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    tone: 'info',
  },
  search: {
    title: 'No results found',
    description: 'Try a different keyword, or explore our popular categories instead.',
    action: 'Clear Search',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
      </svg>
    ),
    tone: 'neutral',
  },
  generic: {
    title: 'Nothing here yet',
    description: 'We couldn’t find anything to show right now.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    ),
    tone: 'neutral',
  },
};

const toneBg = {
  brand: 'bg-brand-50 text-brand-500',
  accent: 'bg-accent-50 text-accent-600',
  info: 'bg-info-50 text-info-500',
  success: 'bg-success-50 text-success-500',
  danger: 'bg-danger-50 text-danger-500',
  neutral: 'bg-neutral-100 text-neutral-500',
};

export default function EmptyState({
  preset = 'generic',
  title,
  description,
  icon,
  action,
  secondaryAction,
  onAction,
  onSecondaryAction,
  tone,
  className = '',
  illustration,
  hideIcon = false,
  size = 'md',
}) {
  const cfg = presets[preset] || presets.generic;
  const t = tone || cfg.tone || 'neutral';
  const iconSize = { sm: 'w-12 h-12', md: 'w-20 h-20', lg: 'w-28 h-28' }[size];
  const padding = { sm: 'py-8', md: 'py-12 lg:py-16', lg: 'py-16 lg:py-24' }[size];

  return (
    <div
      role="status"
      aria-live="polite"
      className={classNames(
        'flex flex-col items-center justify-center text-center',
        padding,
        className
      )}
    >
      {illustration ? (
        <div className={classNames(iconSize, 'mb-5')}>{illustration}</div>
      ) : !hideIcon ? (
        <div
          className={classNames(
            'flex items-center justify-center rounded-3xl mb-6',
            iconSize,
            toneBg[t]
          )}
        >
          <div className={classNames(size === 'lg' ? 'w-16 h-16' : 'w-10 h-10')}>
            {icon || cfg.icon}
          </div>
        </div>
      ) : null}
      <h3 className="font-display font-extrabold text-text-primary text-xl sm:text-2xl tracking-tight text-balance max-w-md">
        {title || cfg.title}
      </h3>
      {description !== null && (description || cfg.description) && (
        <p className="mt-2.5 max-w-md text-text-secondary text-sm sm:text-base leading-relaxed">
          {description || cfg.description}
        </p>
      )}
      {(action || cfg.action || onAction) && (
        <div className="mt-7 flex flex-col sm:flex-row items-center gap-3">
          {secondaryAction && (
            <Button
              variant="outline"
              size="md"
              onClick={onSecondaryAction}
            >
              {secondaryAction}
            </Button>
          )}
          <Button variant="primary" size="md" motion onClick={onAction}>
            {action || cfg.action}
          </Button>
        </div>
      )}
    </div>
  );
}
