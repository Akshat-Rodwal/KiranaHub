import { motion, AnimatePresence } from 'framer-motion';
import useCartStore from '../../store/useCartStore.js';
import { formatPrice } from '../../utils/index.js';
import { IconArrowRight, IconCart } from '../../utils/icons.jsx';

export default function MobileFloatingCartPill() {
  const { items, total, totalQuantity, openCartDrawer } = useCartStore();

  const count = totalQuantity || items.reduce((acc, item) => acc + item.quantity, 0);

  if (items.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 50, opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        className="fixed bottom-[72px] inset-x-0 z-40 md:hidden pointer-events-auto px-4"
      >
        <button
          type="button"
          onClick={openCartDrawer}
          className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl p-3.5 shadow-2xl shadow-emerald-950/30 border border-emerald-500/40 flex items-center justify-between transition-transform active:scale-[0.98] cursor-pointer"
          aria-label="View Cart"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 text-[#ccff00] text-sm">
              <IconCart className="h-4.5 w-4.5" />
            </span>
            <div className="text-left leading-tight">
              <p className="text-xs font-black text-white flex items-center gap-1.5">
                <span>{count} {count === 1 ? 'item' : 'items'}</span>
                <span>•</span>
                <span className="text-[#ccff00] font-display">{formatPrice(total)}</span>
              </p>
              <p className="text-[10px] text-emerald-200 font-semibold mt-0.5">
                Extra discount applied at checkout
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-[#ccff00] text-[#054428] px-3.5 py-1.5 rounded-xl text-xs font-black shadow-md">
            <span>View Cart</span>
            <IconArrowRight className="h-3.5 w-3.5" />
          </div>
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
