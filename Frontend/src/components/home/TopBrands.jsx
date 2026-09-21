import Container from '../common/Container.jsx';
import { trustedBrands } from '../../data/mock.jsx';

export default function TopBrands() {
  return (
    <section className="py-6 lg:py-8">
      <Container>
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-text-muted">
          Trusted by leading brands
        </p>
        <div className="hide-scrollbar mt-4 flex gap-3 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center sm:overflow-visible">
          {trustedBrands.map((brand) => (
            <span
              key={brand}
              className="flex shrink-0 items-center rounded-full border border-border-light bg-surface px-4 py-2 font-display text-sm font-semibold text-text-secondary shadow-sm"
            >
              {brand}
            </span>
          ))}
        </div>
      </Container>
    </section>
  );
}
