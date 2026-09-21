import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useCartStore from '../../store/useCartStore.js';
import Button from '../common/Button.jsx';
import { ROUTES } from '../../constants/index.js';
import { formatPrice } from '../../utils/index.js';
import {
  IconClose,
  IconShoppingBag,
  IconPlus,
  IconMinus,
  IconArrowRight,
} from '../../utils/icons.jsx';

export default function CartDrawer() {
  const navigate = useNavigate();
  const {
    items,
    subtotal,
    deliveryFee,
    handlingFee,
    discount,
    total,
    isCartDrawerOpen,
    closeCartDrawer,
    updateQuantity,
    removeItem,
  } = useCartStore();

  const freeDeliveryThreshold = 499;
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeDeliveryProgress = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  const handleCheckout = () => {
    closeCartDrawer();
    navigate(ROUTES.CHECKOUT);
  };

  const handleViewCart = () => {
    closeCartDrawer();
    navigate(ROUTES.CART);
  };

  return (
    <AnimatePresence>
      {isCartDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCartDrawer}
            className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
          />

          {/* Slide-over Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-8 sm:pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 240 }}
              className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-stone-200/80 bg-stone-50/90 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#054428] text-[#ccff00] shadow-sm">
                    <IconShoppingBag className="h-5 w-5 drop-shadow-xs" />
                  </div>
                  <div>
                    <h2 className="font-display text-base font-black text-stone-900">
                      My Basket
                    </h2>
                    <p className="text-xs font-semibold text-emerald-800">
                      ⚡ Delivering in 10-15 mins
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeCartDrawer}
                  className="p-2 rounded-2xl text-stone-400 hover:text-stone-900 hover:bg-stone-200/60 transition-colors"
                  aria-label="Close cart drawer"
                >
                  <IconClose className="h-5 w-5" />
                </button>
              </div>

              {/* Blinkit Free Delivery Progress Meter */}
              {items.length > 0 && (
                <div
                  className={`px-4 py-3 border-b transition-all duration-300 ${
                    remainingForFreeDelivery === 0
                      ? 'bg-[#054428] text-[#ccff00] border-[#065f46]'
                      : 'bg-emerald-50/70 border-emerald-100 text-stone-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    {remainingForFreeDelivery === 0 ? (
                      <span className="flex items-center gap-1.5 font-extrabold text-[#ccff00]">
                        <span>🎉</span>
                        <span>Yay! <strong>FREE Delivery Unlocked</strong></span>
                      </span>
                    ) : (
                      <span className="text-stone-700">
                        Add <strong className="text-emerald-700 font-extrabold">{formatPrice(remainingForFreeDelivery)}</strong> more for <strong>FREE delivery</strong>
                      </span>
                    )}
                    <span className={remainingForFreeDelivery === 0 ? 'text-[#ccff00] font-black' : 'text-emerald-700 font-extrabold'}>
                      {freeDeliveryProgress}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-stone-200/80 overflow-hidden shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        remainingForFreeDelivery === 0
                          ? 'bg-[#ccff00]'
                          : 'bg-emerald-600'
                      }`}
                      style={{ width: `${freeDeliveryProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Items List or Empty State */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-700 mb-4 shadow-inner">
                      <IconShoppingBag className="h-8 w-8" />
                    </div>
                    <h3 className="font-display text-lg font-black text-stone-900">
                      Your basket is empty
                    </h3>
                    <p className="mt-1 text-xs text-stone-500 max-w-xs leading-relaxed">
                      Explore fresh farm produce, pure dairy, daily flour and quick snacks to get started.
                    </p>
                    <div className="mt-6">
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => {
                          closeCartDrawer();
                          navigate(ROUTES.PRODUCTS);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                      >
                        Start Shopping
                      </Button>
                    </div>
                  </div>
                ) : (
                  items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex gap-3 p-3 rounded-2xl border border-stone-200/80 bg-white hover:border-emerald-200 hover:shadow-xs transition-all"
                    >
                      <img
                        src={item.image || 'https://placehold.co/100x100?text=Item'}
                        alt={item.name}
                        className="h-16 w-16 shrink-0 rounded-xl object-contain bg-stone-50 p-1 border border-stone-100"
                      />
                      <div className="flex flex-1 flex-col justify-between min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="truncate text-xs font-bold text-stone-900">
                              {item.name}
                            </h4>
                            <p className="text-[11px] font-medium text-stone-500 mt-0.5">
                              {item.unit}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                            title="Remove item"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-100">
                          <span className="font-display text-xs font-black text-stone-900">
                            {formatPrice((item.sellingPrice || item.price) * item.quantity)}
                          </span>

                          {/* Stepper with Fresh Mint Theme */}
                          <div className="flex items-center rounded-xl border border-emerald-200 bg-emerald-50/60 p-0.5 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-emerald-800 hover:bg-emerald-100 transition-colors shadow-2xs font-bold text-xs"
                              aria-label="Decrease quantity"
                            >
                              <IconMinus className="h-3 w-3" />
                            </button>
                            <span className="w-7 text-center text-xs font-black text-emerald-950 tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs font-bold text-xs"
                              aria-label="Increase quantity"
                            >
                              <IconPlus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Bill Details & Footer Actions */}
              {items.length > 0 && (
                <div className="border-t border-stone-200/80 bg-stone-50/90 p-4 sm:p-5 space-y-3 backdrop-blur-sm">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-stone-600">
                      <span>Items Subtotal</span>
                      <span className="font-bold text-stone-900">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Delivery Fee</span>
                      <span className="font-bold text-stone-900">
                        {deliveryFee === 0 ? (
                          <span className="text-emerald-600 font-extrabold">FREE</span>
                        ) : (
                          formatPrice(deliveryFee)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Handling Fee</span>
                      <span className="font-bold text-stone-900">{formatPrice(handlingFee)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>Special Discount</span>
                        <span>− {formatPrice(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-stone-200 text-sm font-bold text-stone-900">
                      <span>Grand Total</span>
                      <span className="font-display text-[#054428] font-black text-base">{formatPrice(total)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCheckout}
                      className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm tracking-wide shadow-lg shadow-emerald-950/20 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <span>Proceed to Pay {formatPrice(total)}</span>
                      <IconArrowRight className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleViewCart}
                      className="text-xs font-bold text-center text-stone-500 hover:text-emerald-700 py-1 transition-colors"
                    >
                      View Full Cart Page
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
