import { useEffect } from 'react';
import { create } from 'zustand';
import { AnimatePresence, motion } from 'framer-motion';
import { classNames } from '../../utils/index.js';

const toastIcon = {
  success: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  loading: (
    <svg className="animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  ),
};

const toneStyles = {
  success: {
    bg: 'bg-white border-success-200',
    ring: 'shadow-[0_10px_40px_-12px_rgb(34_197_94_/_0.3)]',
    icon: 'bg-success-50 text-success-600',
    progress: 'bg-success-500',
  },
  error: {
    bg: 'bg-white border-danger-200',
    ring: 'shadow-[0_10px_40px_-12px_rgb(239_68_68_/_0.3)]',
    icon: 'bg-danger-50 text-danger-600',
    progress: 'bg-danger-500',
  },
  warning: {
    bg: 'bg-white border-warning-200',
    ring: 'shadow-[0_10px_40px_-12px_rgb(245_158_11_/_0.3)]',
    icon: 'bg-warning-50 text-warning-600',
    progress: 'bg-warning-500',
  },
  info: {
    bg: 'bg-white border-info-200',
    ring: 'shadow-[0_10px_40px_-12px_rgb(59_130_246_/_0.25)]',
    icon: 'bg-info-50 text-info-600',
    progress: 'bg-info-500',
  },
  loading: {
    bg: 'bg-white border-brand-200',
    ring: 'shadow-[0_10px_40px_-12px_rgb(16_185_129_/_0.3)]',
    icon: 'bg-brand-50 text-brand-600',
    progress: 'bg-brand-500',
  },
};

let _id = 0;

export const useToastStore = create((set, get) => ({
  toasts: [],

  show: ({ title, description, type = 'info', duration = 4000, icon, action, onClose }) => {
    const id = ++_id;
    const toast = { id, title, description, type, duration, icon, action, onClose };
    set((state) => ({ toasts: [toast, ...state.toasts].slice(0, 5) }));
    if (duration > 0 && type !== 'loading') {
      setTimeout(() => get().dismiss(id), duration);
    }
    return id;
  },

  update: (id, patch) =>
    set((state) => ({
      toasts: state.toasts.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })),

  dismiss: (id) => {
    const toast = get().toasts.find((t) => t.id === id);
    toast?.onClose?.();
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  clear: () => set({ toasts: [] }),
}));

export const toast = {
  success: (title, opts) => useToastStore.getState().show({ title, type: 'success', ...opts }),
  error: (title, opts) => useToastStore.getState().show({ title, type: 'error', ...opts }),
  warning: (title, opts) => useToastStore.getState().show({ title, type: 'warning', ...opts }),
  info: (title, opts) => useToastStore.getState().show({ title, type: 'info', ...opts }),
  loading: (title, opts) => useToastStore.getState().show({ title, type: 'loading', duration: 0, ...opts }),
  dismiss: (id) => useToastStore.getState().dismiss(id),
  update: (id, patch) => useToastStore.getState().update(id, patch),
  clear: () => useToastStore.getState().clear(),
};

export default function ToastContainer({ position = 'top-right' }) {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  useEffect(() => {
    const clearShortcut = (e) => {
      if (e.key === 'Escape') useToastStore.getState().clear();
    };
    window.addEventListener('keydown', clearShortcut);
    return () => window.removeEventListener('keydown', clearShortcut);
  }, []);

  const positions = {
    'top-left': 'top-4 left-4 sm:top-6 sm:left-6 items-start',
    'top-right': 'top-4 right-4 sm:top-6 sm:right-6 items-end',
    'bottom-left': 'bottom-4 left-4 sm:bottom-6 sm:left-6 items-start',
    'bottom-right': 'bottom-4 right-4 sm:bottom-6 sm:right-6 items-end',
    'top-center': 'top-4 left-1/2 -translate-x-1/2 sm:top-6 items-center',
  };

  return (
    <div
      className={classNames(
        'fixed z-[100] flex flex-col gap-3 w-[min(calc(100vw-2rem),400px)] pointer-events-none',
        positions[position] || positions['top-right']
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const tone = toneStyles[t.type] || toneStyles.info;
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: position.includes('right') ? 60 : position.includes('left') ? -60 : 0, y: position.includes('top') ? -40 : position.includes('bottom') ? 40 : 0 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: position.includes('right') ? 60 : position.includes('left') ? -60 : 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className={classNames(
                'pointer-events-auto relative overflow-hidden rounded-2xl border w-full',
                tone.bg,
                tone.ring
              )}
              role={t.type === 'error' ? 'alert' : 'status'}
            >
              <div className="flex gap-3.5 p-4">
                <div className={classNames('w-10 h-10 shrink-0 rounded-xl flex items-center justify-center', tone.icon)}>
                  <span className="w-5 h-5 block">
                    {t.icon || toastIcon[t.type] || toastIcon.info}
                  </span>
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  {t.title && (
                    <p className="font-display font-bold text-text-primary text-sm leading-snug">{t.title}</p>
                  )}
                  {t.description && (
                    <p className="mt-0.5 text-sm text-text-secondary leading-relaxed">{t.description}</p>
                  )}
                  {t.action && (
                    <button
                      type="button"
                      onClick={() => {
                        t.action.onClick?.();
                        dismiss(t.id);
                      }}
                      className="mt-2 text-sm font-semibold text-brand-700 hover:text-brand-800"
                    >
                      {t.action.label}
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  className="shrink-0 -mr-1 -mt-1 w-8 h-8 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-neutral-100 transition-colors"
                  aria-label="Dismiss notification"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {t.duration > 0 && (
                <motion.div
                  className={classNames('absolute bottom-0 left-0 h-0.5', tone.progress)}
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: t.duration / 1000, ease: 'linear' }}
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
