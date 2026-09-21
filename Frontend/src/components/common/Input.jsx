import { forwardRef, useState, isValidElement, createElement } from 'react';
import { classNames } from '../../utils/index.js';

const renderIcon = (icon) => {
  if (!icon) return null;
  if (isValidElement(icon)) return icon;
  if (
    typeof icon === 'function' ||
    (typeof icon === 'object' && icon !== null && (icon.$$typeof || icon.render))
  ) {
    return createElement(icon, { className: 'w-4 h-4 shrink-0', strokeWidth: 2 });
  }
  return icon;
};

const sizes = {
  sm: 'h-9 px-3 text-sm rounded-lg',
  md: 'h-11 px-4 text-sm rounded-xl',
  lg: 'h-12 px-5 text-base rounded-xl',
};

const variants = {
  default:
    'bg-surface border-border text-text-primary placeholder:text-text-muted hover:border-neutral-400 focus-within:border-brand-500',
  soft:
    'bg-surface-muted border-transparent text-text-primary placeholder:text-text-muted hover:bg-neutral-100 focus-within:bg-surface focus-within:border-brand-500',
};

const Input = forwardRef(
  (
    {
      id,
      label,
      hint,
      error,
      success,
      variant = 'default',
      size = 'md',
      fullWidth = true,
      disabled = false,
      leftIcon,
      rightIcon,
      leftAddon,
      rightAddon,
      className = '',
      wrapperClassName = '',
      type = 'text',
      onRightIconClick,
      ...rest
    },
    ref
  ) => {
    const describedBy =
      (hint && `${id}-hint`) || (error && `${id}-error`) || (success && `${id}-success`) || null;
    const [focused, setFocused] = useState(false);

    return (
      <div className={classNames(fullWidth && 'w-full', wrapperClassName)}>
        {label && (
          <label
            htmlFor={id}
            className="block mb-1.5 text-sm font-semibold font-display text-text-primary"
          >
            {label}
          </label>
        )}
        <div
          className={classNames(
            'group relative flex items-stretch transition-all duration-200 border rounded-xl',
            sizes[size],
            variants[variant],
            error && '!border-danger-400 !shadow-[0_0_0_4px_rgb(239_68_68_/_0.1)]',
            success && !error && '!border-success-400 !shadow-[0_0_0_4px_rgb(34_197_94_/_0.1)]',
            focused && !error && !success && '!shadow-[0_0_0_4px_rgb(16_185_129_/_0.12)]',
            disabled && '!opacity-50 !cursor-not-allowed',
            !fullWidth && 'w-auto inline-flex',
            className
          )}
        >
          {leftAddon && (
            <span className="flex items-center justify-center px-3 -ml-[1px] border-r border-inherit rounded-l-xl bg-surface-muted text-text-secondary text-sm shrink-0">
              {leftAddon}
            </span>
          )}
          {leftIcon && !leftAddon && (
            <span className="flex items-center justify-center pl-3 text-text-muted group-focus-within:text-brand-600 transition-colors shrink-0">
              {renderIcon(leftIcon)}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            type={type}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            onFocus={(e) => {
              setFocused(true);
              rest.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              rest.onBlur?.(e);
            }}
            className="flex-1 bg-transparent min-w-0 px-3 placeholder:text-text-muted outline-none disabled:cursor-not-allowed rounded-xl"
            {...rest}
          />
          {rightIcon && !rightAddon && (
            <button
              type="button"
              onClick={onRightIconClick}
              tabIndex={-1}
              disabled={disabled}
              className="flex items-center justify-center pr-3 text-text-muted group-focus-within:text-brand-600 transition-colors shrink-0 disabled:opacity-50"
            >
              {renderIcon(rightIcon)}
            </button>
          )}
          {rightAddon && (
            <span className="flex items-center justify-center px-3 -mr-[1px] border-l border-inherit rounded-r-xl bg-surface-muted text-text-secondary text-sm shrink-0">
              {rightAddon}
            </span>
          )}
        </div>
        {hint && !error && !success && (
          <p id={`${id}-hint`} className="mt-1.5 text-xs text-text-muted">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-danger-600 flex items-start gap-1">
            <svg className="w-3.5 h-3.5 shrink-0 mt-[1px]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        {success && !error && (
          <p id={`${id}-success`} className="mt-1.5 text-xs font-medium text-success-600 flex items-start gap-1">
            <svg className="w-3.5 h-3.5 shrink-0 mt-[1px]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
