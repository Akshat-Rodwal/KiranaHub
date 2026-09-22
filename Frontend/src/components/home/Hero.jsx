import { useState } from 'react';
import {
  Zap,
  MapPin,
  Gift,
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-react';

import Container from '../common/Container.jsx';
import { toast } from '../common/Toast.jsx';
import useStoreSettings from '../../hooks/useStoreSettings.js';

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
    <section className="bg-[#f7f9f7] pt-2 pb-1 sm:pt-3 sm:pb-2">
      <Container className="px-4 sm:px-6">
        {/* Compact Hyperlocal Delivery & Live Offer Ticker (Glassmorphic Bar) */}
        <div className="relative overflow-hidden rounded-2xl bg-white/95 backdrop-blur-md border border-emerald-100/90 p-2 sm:p-2.5 shadow-[0_2px_12px_rgba(12,131,31,0.05)]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 sm:gap-3">
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
                className="group relative inline-flex items-center gap-2 rounded-full border border-emerald-300/80 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 px-3.5 py-1 text-xs font-bold text-slate-800 shadow-xs hover:shadow-sm hover:border-emerald-400 transition-all cursor-pointer active:scale-98"
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
      </Container>
    </section>
  );
}
