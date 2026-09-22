import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap,
  MapPin,
  Gift,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';

import Container from '../common/Container.jsx';
import { toast } from '../common/Toast.jsx';
import useStoreSettings from '../../hooks/useStoreSettings.js';

const BENTO_VIBES = [
  {
    id: 'dairy-staples',
    icon: '🥛',
    title: 'Morning Staples & Dairy',
    subtitle: 'Fresh milk, bread, farm eggs & daily butter',
    tag: 'Instant Breakfast',
    link: '/products?category=dairy-bread-eggs',
    bgGradient: 'from-amber-50/90 via-emerald-50/60 to-emerald-100/70',
    borderColor: 'border-emerald-200/80',
    hoverBorder: 'hover:border-emerald-400',
    tagBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    arrowColor: 'text-emerald-700 bg-emerald-100/80 group-hover:bg-emerald-600 group-hover:text-white',
  },
  {
    id: 'fresh-produce',
    icon: '🥦',
    title: 'Fresh Farm Produce',
    subtitle: 'Directly sourced vegetables & juicy seasonal fruits',
    tag: 'Direct from Mandi',
    link: '/products?category=fruits-vegetables',
    bgGradient: 'from-emerald-50/90 via-teal-50/60 to-green-100/70',
    borderColor: 'border-green-200/80',
    hoverBorder: 'hover:border-green-400',
    tagBg: 'bg-green-100 text-green-800 border-green-200',
    arrowColor: 'text-green-700 bg-green-100/80 group-hover:bg-green-600 group-hover:text-white',
  },
  {
    id: 'pharma-wellness',
    icon: '💊',
    title: 'Pharma & Urgent Daily',
    subtitle: 'First aid, pain relief, vitamins & wellness',
    tag: 'Express 10 Mins',
    link: '/products?category=pharma-wellness',
    bgGradient: 'from-sky-50/90 via-blue-50/60 to-indigo-100/70',
    borderColor: 'border-sky-200/80',
    hoverBorder: 'hover:border-sky-400',
    tagBg: 'bg-sky-100 text-sky-800 border-sky-200',
    arrowColor: 'text-sky-700 bg-sky-100/80 group-hover:bg-sky-600 group-hover:text-white',
  },
  {
    id: 'snacks-munchies',
    icon: '🍿',
    title: 'Snacks & Munchies',
    subtitle: 'Crispy chips, cold beverages & sweet indulgences',
    tag: 'Craving Essentials',
    link: '/products?category=snacks-munchies',
    bgGradient: 'from-orange-50/90 via-amber-50/60 to-yellow-100/70',
    borderColor: 'border-amber-200/80',
    hoverBorder: 'hover:border-amber-400',
    tagBg: 'bg-amber-100 text-amber-800 border-amber-200',
    arrowColor: 'text-amber-700 bg-amber-100/80 group-hover:bg-amber-600 group-hover:text-white',
  },
];

export default function Hero() {
  const { data: settings } = useStoreSettings();
  const [copied, setCopied] = useState(false);

  const promoCode = settings?.promoCode || 'KIRANA50';
  const promoText = settings?.promoBannerText || 'FLAT ₹50 OFF on ₹299+';
  const deliveryEstimate = settings?.deliveryTimeEstimate || '9 Mins';

  const handleCopyPromo = (e) => {
    e.preventDefault();
    navigator.clipboard?.writeText(promoCode);
    setCopied(true);
    toast.success(`Coupon code ${promoCode} copied!`, {
      description: 'Paste during checkout to claim your instant discount.',
    });
    setTimeout(() => setCopied(false), 2400);
  };

  return (
    <section className="bg-[#f7f9f7] pt-2 pb-3 sm:pt-3 sm:pb-4 border-b border-slate-100/80">
      <Container className="px-3 sm:px-6 space-y-3">
        {/* A. Hyperlocal Delivery & Live Offer Ticker (Glassmorphic Bar) */}
        <div className="relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-md border border-emerald-100/80 p-2.5 sm:p-3.5 shadow-[0_2px_12px_rgba(12,131,31,0.06)]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 sm:gap-3">
            {/* Left: Neon lightning & hyperlocal delivery badge */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-600 text-white px-2.5 py-1 text-xs font-black shadow-xs tracking-tight">
                <Zap className="h-3.5 w-3.5 fill-current animate-pulse text-amber-300" />
                <span>Delivery in {deliveryEstimate}</span>
              </div>
              <div className="hidden sm:inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200/80 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                <MapPin className="h-3 w-3 text-emerald-600" />
                <span>Hyperlocal Express</span>
              </div>
            </div>

            {/* Center: Animated coupon pill with 1-click copy feedback */}
            <div className="flex-1 flex items-center justify-center">
              <button
                type="button"
                onClick={handleCopyPromo}
                className="group relative inline-flex items-center gap-2 rounded-full border border-emerald-300/80 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 px-3.5 py-1.5 text-xs font-bold text-slate-800 shadow-xs hover:shadow-sm hover:border-emerald-400 transition-all cursor-pointer active:scale-98"
                title="Click to copy voucher code"
              >
                <Gift className="h-3.5 w-3.5 text-emerald-600 group-hover:rotate-12 transition-transform" />
                <span className="text-slate-700 text-[11px] sm:text-xs">
                  {promoText} | Use code{' '}
                  <span className="font-mono font-black text-emerald-700 bg-white/90 px-1.5 py-0.5 rounded border border-emerald-200/70 shadow-2xs">
                    {promoCode}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors group-hover:bg-emerald-700">
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-amber-200" strokeWidth={3} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-2.5 w-2.5" strokeWidth={2.2} />
                      <span>Tap to Copy</span>
                    </>
                  )}
                </span>
              </button>
            </div>

            {/* Right: Trust & Freshness Guarantee */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 text-xs font-bold text-emerald-800">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>🌱 100% Quality & Fresh Guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* B. Quick-Access Bento Curated Vibes (4 interactive pastel pills, no heavy images needed) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          {BENTO_VIBES.map((vibe) => (
            <motion.div
              key={vibe.id}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Link
                to={vibe.link}
                className={`group block h-full rounded-2xl bg-gradient-to-br ${vibe.bgGradient} border ${vibe.borderColor} ${vibe.hoverBorder} p-3.5 sm:p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-200`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-2xl sm:text-3xl select-none group-hover:scale-110 transition-transform duration-200">
                    {vibe.icon}
                  </span>
                  <span
                    className={`inline-block text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-2xs ${vibe.tagBg}`}
                  >
                    {vibe.tag}
                  </span>
                </div>

                <div className="mt-2.5">
                  <h3 className="font-display text-xs sm:text-sm font-black text-slate-900 tracking-tight leading-snug line-clamp-1">
                    {vibe.title}
                  </h3>
                  <p className="mt-0.5 text-[10px] sm:text-xs text-slate-600 font-medium leading-tight line-clamp-1">
                    {vibe.subtitle}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-black/5">
                  <span className="text-[10px] sm:text-xs font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">
                    Explore
                  </span>
                  <span
                    className={`inline-flex items-center justify-center w-5 h-5 rounded-full transition-all duration-200 ${vibe.arrowColor}`}
                  >
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
