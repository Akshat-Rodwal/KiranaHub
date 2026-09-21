import { useEffect, useRef, createElement, isValidElement } from 'react';
import { create } from 'zustand';
import { AnimatePresence, motion } from 'framer-motion';
import Button from './Button.jsx';
import { classNames } from '../../utils/index.js';

const useModalStore = create((set, get) => ({
  stacks: {},

  open: (id, payload) => {
    set((state) => ({
      stacks: {
        ...state.stacks,
        [id]: { open: true, payload: payload || null },
      },
    }));
  },

  close: (id) => {
    const cb = get().stacks[id]?.onClose;
    set((state) => {
      const copy = { ...state.stacks };
      if (copy[id]) copy[id] = { ...copy[id], open: false };
      return { stacks: copy };
    });
    setTimeout(() => cb?.(), 250);
  },

  toggle: (id) => {
    const open = get().stacks[id]?.open;
    if (open) get().close(id);
    else get().open(id);
  },

  set: (id, patch) =>
    set((state) => ({
      stacks: {
        ...state.stacks,
        [id]: { ...(state.stacks[id] || {}), ...patch },
      },
    })),

  isOpen: (id) => !!get().stacks[id]?.open,
}));

export const useModal = (id) => {
  const store = useModalStore();
  return {
    isOpen: !!store.stacks[id]?.open,
    payload: store.stacks[id]?.payload,
    open: (payload) => store.open(id, payload),
    close: () => store.close(id),
    toggle: () => store.toggle(id),
    set: (patch) => store.set(id, patch),
  };
};

export const modal = {
  open: (id, payload) => useModalStore.getState().open(id, payload),
  close: (id) => useModalStore.getState().close(id),
  toggle: (id) => useModalStore.getState().toggle(id),
};

const variants = {
  center: 'items-center justify-center p-4 sm:p-6',
  bottom: 'items-end justify-center sm:items-center sm:justify-center',
  right: 'items-stretch justify-end sm:items-center sm:justify-center',
};

export default function Modal({
  id,
  title,
  description,
  icon,
  children,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'primary',
  cancelVariant = 'ghost',
  size = 'md',
  position = 'center',
  hideClose = false,
  hideFooter = false,
  footer,
  header,
  className = '',
  paperClassName = '',
  preventClose = false,
}) {
  const store = useModalStore();
  const data = store.stacks[id];
  const isOpen = !!data?.open;
  const payload = data?.payload;
  const close = () => !preventClose && store.close(id);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setTimeout(() => dialogRef.current?.focus(), 30);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  const sizes = {
    xs: 'sm:max-w-sm',
    sm: 'sm:max-w-md',
    md: 'sm:max-w-lg',
    lg: 'sm:max-w-2xl',
    xl: 'sm:max-w-3xl',
    '2xl': 'sm:max-w-5xl',
    full: 'sm:max-w-[96vw]',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={classNames(
            'fixed inset-0 z-[90] flex',
            variants[position] || variants.center,
            className
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={close}
            className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
            aria-hidden="true"
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? `modal-title-${id}` : undefined}
            tabIndex={-1}
            initial={
              position === 'bottom'
                ? { y: '100%' }
                : position === 'right'
                ? { x: '100%' }
                : { opacity: 0, scale: 0.95, y: 12 }
            }
            animate={
              position === 'bottom'
                ? { y: 0 }
                : position === 'right'
                ? { x: 0 }
                : { opacity: 1, scale: 1, y: 0 }
            }
            exit={
              position === 'bottom'
                ? { y: '100%' }
                : position === 'right'
                ? { x: '100%' }
                : { opacity: 0, scale: 0.95, y: 8 }
            }
            transition={{ type: 'spring', stiffness: 350, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className={classNames(
              'relative w-full flex flex-col bg-surface overflow-hidden focus:outline-none',
              position === 'center'
                ? 'rounded-t-3xl sm:rounded-3xl max-h-[92vh] shadow-2xl'
                : position === 'bottom'
                ? 'sm:rounded-3xl rounded-t-3xl max-h-[88vh] shadow-2xl'
                : position === 'right'
                ? 'h-full sm:h-auto sm:rounded-3xl sm:max-h-[90vh] shadow-2xl'
                : '',
              sizes[size] || sizes.md,
              paperClassName
            )}
          >
            {header || (
              <div className="flex items-start gap-4 px-5 sm:px-6 pt-5 sm:pt-6">
                {icon && (
                  <div className="w-11 h-11 shrink-0 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
                    <span className="w-5 h-5 flex items-center justify-center">
                      {isValidElement(icon)
                        ? icon
                        : (typeof icon === 'function' || (typeof icon === 'object' && icon !== null && (icon.$$typeof || icon.render)))
                          ? createElement(icon, { className: 'w-5 h-5', strokeWidth: 1.75 })
                          : icon}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  {title && (
                    <h2
                      id={`modal-title-${id}`}
                      className="font-display font-extrabold text-text-primary text-xl leading-tight tracking-tight"
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="mt-1 text-sm text-text-secondary leading-relaxed">
                      {description}
                    </p>
                  )}
                </div>
                {!hideClose && (
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Close modal"
                    disabled={preventClose}
                    className="shrink-0 -mt-1 -mr-2 w-10 h-10 rounded-2xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-neutral-100 transition-colors disabled:opacity-40"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 sm:px-6 py-5 sm:py-6">
              {typeof children === 'function' ? children({ payload, close }) : children}
            </div>
            {!hideFooter && (footer || (onConfirm || onCancel) && (
              <div className="flex flex-col-reverse sm:flex-row gap-3 px-5 sm:px-6 py-4 border-t border-border-light bg-surface-soft/60 backdrop-blur">
                {onCancel && (
                  <Button
                    variant={cancelVariant}
                    size="md"
                    fullWidth
                    motion
                    onClick={() => {
                      const res = onCancel?.(payload);
                      if (res !== false) close();
                    }}
                  >
                    {cancelLabel}
                  </Button>
                )}
                {onConfirm && (
                  <Button
                    variant={confirmVariant}
                    size="md"
                    fullWidth
                    motion
                    onClick={() => {
                      const res = onConfirm?.(payload);
                      if (res !== false) close();
                    }}
                  >
                    {confirmLabel}
                  </Button>
                )}
              </div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ModalProvider({ children }) {
  return <>{children}</>;
}
