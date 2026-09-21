import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';

import Container from '../common/Container.jsx';
import ConnectedProductCard from './ConnectedProductCard.jsx';
import EmptyState from '../common/EmptyState.jsx';
import Skeleton from '../common/Skeleton.jsx';

export default function ProductSection({
  title,
  subtitle,
  badge,
  countdown,
  products = [],
  to,
  viewAllLabel = 'See All →',
  dense = false,
  isLoading = false,
  isError = false,
  onRetry,
}) {
  return (
    <section className={dense ? 'py-5 lg:py-7' : 'section'}>
      <Container>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4 sm:mb-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              {badge && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-xs font-extrabold border border-emerald-200/60 shadow-2xs">
                  {badge}
                </span>
              )}
              {countdown && (
                <span className="inline-flex items-center gap-1 rounded-full bg-stone-900 text-amber-400 px-2.5 py-0.5 text-[11px] font-mono font-bold">
                  <Clock className="h-3 w-3" strokeWidth={2} />
                  <span>{countdown}</span>
                </span>
              )}
            </div>
            <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-black text-stone-900 tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1 text-xs sm:text-sm text-stone-500">{subtitle}</p>
            )}
          </div>

          {to && (
            <Link
              to={to}
              className="group flex shrink-0 items-center gap-1.5 rounded-full border border-stone-200/90 bg-white px-3.5 py-1.5 text-xs font-extrabold text-emerald-800 shadow-2xs transition-all hover:border-emerald-600 hover:text-emerald-700 hover:shadow-xs"
            >
              <span>{viewAllLabel}</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
            </Link>
          )}
        </div>

        {isLoading ? (
          <Skeleton variant="product" count={6} />
        ) : isError && products.length === 0 ? (
          <EmptyState
            preset="generic"
            title="Something went wrong"
            description="We couldn't load these products. Please try again."
            action="Retry"
            onAction={onRetry}
          />
        ) : products.length === 0 ? (
          <EmptyState
            preset="empty"
            title="Nothing here yet"
            description="Products for this aisle are arriving shortly."
            hideIcon={false}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6">
            {products.map((product) => (
              <ConnectedProductCard key={product.id || product._id} product={product} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
