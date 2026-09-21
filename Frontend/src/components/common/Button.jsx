import { forwardRef, isValidElement, createElement } from 'react';
import { motion } from 'framer-motion';
import { classNames } from '../../utils/index.js';

const sizes = {
  xs: 'h-8 px-3 text-xs font-semibold gap-1.5 rounded-md',
  sm: 'h-9 px-4 text-sm font-semibold gap-2 rounded-lg',
  md: 'h-11 px-5 text-sm font-semibold gap-2 rounded-xl',
  lg: 'h-12 px-6 text-base font-semibold gap-2.5 rounded-xl',
  xl: 'h-14 px-7 text-base font-bold gap-3 rounded-2xl',
};

const variants = {
  primary:
    'bg-brand-600 text-white shadow-[0_10px_25px_-10px_rgb(225_29_72_/_0.5)] hover:bg-brand-700 active:bg-brand-800 border border-brand-600',
  secondary:
    'bg-brand-50 text-brand-700 hover:bg-brand-100 active:bg-brand-200 border border-brand-200',
  accent:
    'bg-accent-500 text-white shadow-[0_10px_25px_-10px_rgb(245_158_11_/_0.5)] hover:bg-accent-600 active:bg-accent-700 border border-accent-500',
  outline:
    'bg-surface text-text-primary border border-border hover:border-brand-500 hover:text-brand-700 active:bg-brand-50',
  ghost:
    'bg-transparent text-text-secondary hover:bg-neutral-100 hover:text-text-primary border border-transparent',
  danger:
    'bg-danger-500 text-white hover:bg-danger-600 active:bg-danger-700 border border-danger-500',
  'primary-soft':
    'bg-white text-brand-700 hover:bg-brand-50 active:bg-brand-100 border border-brand-200',
};

const iconSizes = {
  xs: 'w-3.5 h-3.5',
  sm: 'w-4 h-4',
  md: 'w-[18px] h-[18px]',
  lg: 'w-5 h-5',
  xl: 'w-5 h-5',
};

const renderIcon = (icon) => {
  if (!icon) return null;
  if (isValidElement(icon)) return icon;
  if (
    typeof icon === 'function' ||
    (typeof icon === 'object' && icon !== null && (icon.$$typeof || icon.render))
  ) {
    return createElement(icon, { className: 'w-full h-full shrink-0', strokeWidth: 2 });
  }
  return icon;
};

const Button = forwardRef(
  (
    {
      as,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      disabled = false,
      loading = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      className = '',
      children,
      type = 'button',
      motion: animated = false,
      ...rest
    },
    ref
  ) => {
    const Comp = as;
    const isBusy = loading || isLoading;
    const disabledState = disabled || isBusy;

    const content = (
      <>
        {isBusy && (
          <svg
            className={classNames(iconSizes[size], 'animate-spin shrink-0')}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {!isBusy && leftIcon && (
          <span className={classNames(iconSizes[size], 'shrink-0 inline-flex items-center justify-center')}>
            {renderIcon(leftIcon)}
          </span>
        )}
        {children && <span className="leading-none">{children}</span>}
        {rightIcon && (
          <span className={classNames(iconSizes[size], 'shrink-0 inline-flex items-center justify-center')}>
            {renderIcon(rightIcon)}
          </span>
        )}
      </>
    );

    const classList = classNames(
      'inline-flex items-center justify-center font-display tracking-tight transition-all duration-200 ease-out',
      'whitespace-nowrap select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
      sizes[size],
      variants[variant],
      fullWidth && 'w-full',
      className
    );

    if (Comp) {
      const Element = Comp;
      if (animated) {
        return (
          <motion.span
            whileHover={disabledState ? undefined : { y: -1 }}
            whileTap={disabledState ? undefined : { scale: 0.97 }}
            className="inline-flex"
          >
            <Element ref={ref} className={classList} {...rest}>
              {content}
            </Element>
          </motion.span>
        );
      }
      return (
        <Element ref={ref} className={classList} {...rest}>
          {content}
        </Element>
      );
    }

    const Btn = animated ? motion.button : 'button';
    const motionProps = animated && !disabledState ? { whileHover: { y: -1 }, whileTap: { scale: 0.97 } } : {};

    return (
      <Btn
        ref={ref}
        type={type}
        disabled={disabledState}
        className={classList}
        {...motionProps}
        {...rest}
      >
        {content}
      </Btn>
    );
  }
);

Button.displayName = 'Button';

export default Button;
