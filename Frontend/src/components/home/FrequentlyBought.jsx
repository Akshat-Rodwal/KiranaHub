import { Link } from 'react-router';

import Container from '../common/Container.jsx';
import ConnectedProductCard from '../product/ConnectedProductCard.jsx';
import { ROUTES } from '../../constants/index.js';
import { frequentlyBought, products } from '../../data/mock.jsx';
import { IconArrowRight } from '../../utils/icons.jsx';

export default function FrequentlyBought() {
  const items = frequentlyBought.productIds
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean);

  if (items.length === 0) return null;

  return (
    <section className="py-6 lg:py-8">
      <Container>
        <div className="rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-50/80 via-surface-soft to-accent-50/60 p-4 sm:p-6 lg:p-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="headline text-lg text-text-primary sm:text-xl">
                {frequentlyBought.title}
              </h2>
              {frequentlyBought.description && (
                <p className="mt-1 text-sm text-text-muted">
                  {frequentlyBought.description}
                </p>
              )}
            </div>
            <Link
              to={ROUTES.PRODUCTS}
              className="flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700"
            >
              View All
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {items.map((product) => (
              <ConnectedProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
