import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import Container from '../common/Container.jsx';
import { storeInfo } from '../../data/mock.jsx';

const PROMO_PILLARS = [
  {
    id: 'fast-delivery',
    title: 'Rapid 10-Minute Delivery',
    description: 'Chilled cold-chain items, dairy & vegetables delivered to your kitchen in record time.',
    icon: Zap,
    tone: 'bg-emerald-50 text-emerald-700',
  },
  {
    id: 'fresh-quality',
    title: 'Daily Farm-Fresh Guarantee',
    description: 'Handpicked farm produce and authentic staples verified by our dark-store curators.',
    icon: Sparkles,
    tone: 'bg-amber-50 text-amber-700',
  },
  {
    id: 'secure-support',
    title: 'Instant Support & Easy Returns',
    description: 'Unhappy with any item? Request a hassle-free doorstep replacement or instant refund.',
    icon: ShieldCheck,
    tone: 'bg-teal-50 text-teal-700',
  },
];

export default function StoreInfoSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="py-6 lg:py-8 bg-[#f7f9f7]"
    >
      <Container>
        <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
          {/* Store Info Card */}
          <div className="rounded-3xl bg-[#054428] p-6 text-white sm:p-8 lg:col-span-1 shadow-sm">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#ccff00]">
              Indore Hyperlocal Hub
            </span>
            <h2 className="headline mt-2 text-xl text-white sm:text-2xl font-black">
              {storeInfo.name}
            </h2>
            <p className="mt-2 text-sm text-emerald-100 font-medium">{storeInfo.tagline}</p>

            <ul className="mt-6 space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                  <MapPin className="h-4.5 w-4.5" strokeWidth={1.75} />
                </span>
                <span className="leading-relaxed text-stone-200">{storeInfo.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                  <Phone className="h-4.5 w-4.5" strokeWidth={1.75} />
                </span>
                <span className="text-stone-200">{storeInfo.phone}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                  <Clock className="h-4.5 w-4.5" strokeWidth={1.75} />
                </span>
                <ul className="space-y-1">
                  {storeInfo.hours.map((h) => (
                    <li key={h.days} className="leading-relaxed text-stone-200">
                      <span className="font-semibold text-white">{h.days}:</span>{' '}
                      {h.time}
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </div>

          {/* Pillars & Trust Highlights */}
          <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2 lg:gap-5">
            {PROMO_PILLARS.map(({ id, title, description, icon: Icon, tone }) => (
              <div
                key={id}
                className="flex flex-col rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tone}`}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <h3 className="mt-4 font-display text-base font-bold text-stone-900">
                  {title}
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-stone-500">
                  {description}
                </p>
              </div>
            ))}

            <div className="flex flex-col justify-between rounded-3xl border border-emerald-200/80 bg-emerald-50/70 p-6 sm:col-span-3 lg:flex-row lg:items-center lg:gap-6">
              <div>
                <h3 className="font-display text-base font-black text-emerald-950">
                  100% Quality & Freshness Guarantee
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-emerald-800 font-medium">
                  Not completely delighted with any dairy product or fresh vegetable? Get an instant replacement or immediate refund directly to your account.
                </p>
              </div>
              <span className="mt-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xs lg:mt-0">
                <ShieldCheck className="h-6 w-6" strokeWidth={2} />
              </span>
            </div>
          </div>
        </div>
      </Container>
    </motion.section>
  );
}
