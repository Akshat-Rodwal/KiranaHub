import { classNames } from '../../utils/index.js';

export default function LoadingSpinner({
  size = 'md',
  variant = 'brand',
  label,
  className = '',
  fullScreen = false,
}) {
  const sizes = {
    xs: 'w-3 h-3 border-2',
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-[3px]',
    lg: 'w-10 h-10 border-4',
    xl: 'w-16 h-16 border-4',
  };

  const variants = {
    brand: 'border-brand-100 border-t-brand-600',
    accent: 'border-accent-100 border-t-accent-500',
    white: 'border-white/30 border-t-white',
    muted: 'border-neutral-200 border-t-neutral-500',
    danger: 'border-danger-100 border-t-danger-500',
  };

  const spinner = (
    <div
      role="status"
      aria-live="polite"
      aria-label={label || 'Loading'}
      className={classNames(
        'inline-flex flex-col items-center gap-2',
        fullScreen && 'min-h-[300px] justify-center w-full',
        className
      )}
    >
      <div
        className={classNames(
          'inline-block rounded-full animate-spin',
          sizes[size],
          variants[variant]
        )}
      />
      {label && (
        <span className="text-sm font-medium text-text-muted font-display">{label}</span>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  );

  if (fullScreen) {
    return <div className="w-full py-16 flex items-center justify-center">{spinner}</div>;
  }

  return spinner;
}
