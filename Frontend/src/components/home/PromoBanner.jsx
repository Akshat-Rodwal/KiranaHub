import { Link } from 'react-router';
import { motion } from 'framer-motion';

import Container from '../common/Container.jsx';
import { ROUTES } from '../../constants/index.js';
import { promoCards } from '../../data/mock.jsx';
import { IconArrowRight } from '../../utils/icons.jsx';

export default function PromoBanner() {
  return (
    <section className="py-6 lg:py-8">
      <Container>
        <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
          {promoCards.map((promo, index) => (
            <motion.div
              key={promo.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
              className={`card-hover relative overflow-hidden rounded-2xl border border-border-light bg-gradient-to-br p-5 sm:p-6 ${promo.background}`}
            >
              <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/50" />
              <div className="absolute -bottom-8 right-10 h-16 w-16 rounded-full bg-white/40" />
              <div className="relative">
                <h3 className="headline text-base text-text-primary sm:text-lg">
                  {promo.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                  {promo.description}
                </p>
                <Link
                  to={ROUTES.PRODUCTS}
                  className="mt-3.5 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800"
                >
                  {promo.cta}
                  <IconArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
