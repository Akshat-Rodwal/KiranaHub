import { motion } from 'framer-motion';
import { classNames } from '../../utils/index.js';

export default function Skeleton({
  variant = 'rect',
  width,
  height,
  rounded = 'md',
  className = '',
  count = 1,
  gap = 'gap-3',
  container: Container = 'div',
  containerClassName = '',
}) {
  const roundedClass = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
    full: 'rounded-full',
    pill: 'rounded-full',
    circle: 'rounded-full',
  }[rounded] || 'rounded-md';

  const buildStyles = () => {
    const base = {};
    if (width) base.width = typeof width === 'number' ? `${width}px` : width;
    if (height) base.height = typeof height === 'number' ? `${height}px` : height;
    return base;
  };

  if (variant === 'text') {
    const widths = ['w-full', 'w-11/12', 'w-10/12', 'w-8/12', 'w-7/12', 'w-9/12', 'w-11/12'];
    return (
      <Container className={classNames('flex flex-col', gap, containerClassName)}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            style={buildStyles()}
            className={classNames(
              'h-4 rounded-lg bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-100 animate-pulse',
              !height && widths[i % widths.length],
              className
            )}
          />
        ))}
      </Container>
    );
  }

  if (variant === 'circle') {
    return (
      <Container className={classNames('flex flex-wrap', gap, containerClassName)}>
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              width: typeof width === 'number' ? `${width}px` : width || '48px',
              height: typeof height === 'number' ? `${height}px` : height || width || '48px',
            }}
            className={classNames(
              'rounded-full bg-gradient-to-br from-neutral-100 via-neutral-200 to-neutral-100 animate-pulse shrink-0',
              className
            )}
          />
        ))}
      </Container>
    );
  }

  if (variant === 'product') {
    return (
      <Container className={classNames('grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6', containerClassName)}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={classNames(
              'w-full rounded-3xl bg-surface border border-stone-200/60 shadow-xs overflow-hidden p-3 flex flex-col justify-between',
              className
            )}
          >
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-stone-100 via-stone-50 to-stone-100 animate-pulse" />
            <div className="mt-3 space-y-2">
              <div className="h-3 w-1/3 rounded-full bg-stone-200/70 animate-pulse" />
              <div className="h-4 w-4/5 rounded-lg bg-stone-200/70 animate-pulse" />
              <div className="h-3 w-1/2 rounded-full bg-stone-200/70 animate-pulse" />
              <div className="flex items-center justify-between pt-2">
                <div className="h-5 w-14 rounded-lg bg-stone-200/70 animate-pulse" />
                <div className="h-8 w-20 rounded-full bg-stone-200/70 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </Container>
    );
  }

  if (variant === 'category') {
    return (
      <Container className={classNames('flex gap-5 overflow-x-auto hide-scrollbar py-1 sm:grid sm:grid-cols-4 sm:gap-6 lg:grid-cols-8', containerClassName)}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 shrink-0">
            <div
              style={{
                width: width || '80px',
                height: height || width || '80px',
              }}
              className={classNames(
                'rounded-3xl border border-stone-200/60 bg-gradient-to-br from-stone-100 via-stone-50 to-stone-100 animate-pulse shadow-xs',
                className
              )}
            />
            <div className="h-3 w-14 rounded-full bg-stone-200/70 animate-pulse" />
          </div>
        ))}
      </Container>
    );
  }

  return (
    <Container className={classNames('flex flex-wrap', gap, containerClassName)}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={buildStyles()}
          className={classNames(
            'bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-100 animate-pulse',
            roundedClass,
            !width && !height && 'w-full h-10',
            className
          )}
        />
      ))}
    </Container>
  );
}
