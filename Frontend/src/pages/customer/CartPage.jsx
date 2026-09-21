import { useNavigate } from 'react-router-dom';

import Container from '../../components/common/Container.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import useCartStore from '../../store/useCartStore.js';
import { ROUTES } from '../../constants/index.js';
import { formatPrice } from '../../utils/index.js';
import { IconArrowRight, IconMinus, IconPlus } from '../../utils/icons.jsx';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, subtotal, deliveryFee, handlingFee, discount, total, updateQuantity, removeItem } =
    useCartStore();

  const freeDeliveryThreshold = 499;
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeDeliveryProgress = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  if (items.length === 0) {
    return (
      <div className="bg-[#f7f9f7] min-h-[75vh] py-12">
        <Container>
          <EmptyState
            preset="cart"
            onAction={() => navigate(ROUTES.PRODUCTS)}
          />
        </Container>
      </div>
    );
  }

  return (
    <section className="py-8 lg:py-12 bg-[#f7f9f7] min-h-[80vh] antialiased">
      <Container>
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 shadow-2xs mb-2">
            <span>🛒 Express Checkout</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Your Shopping Basket
          </h1>
          <p className="mt-1 text-sm text-stone-500 font-medium">
            {items.length} unique item{items.length === 1 ? '' : 's'} ready for delivery in 8-10 minutes
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Items List */}
          <div className="min-w-0 space-y-3.5 lg:col-span-8">
            
            {/* Free Delivery Meter */}
            <div
              className={`p-4 rounded-2xl border transition-all duration-300 ${
                remainingForFreeDelivery === 0
                  ? 'bg-[#054428] text-[#ccff00] border-[#065f46]'
                  : 'bg-white border-stone-200 text-stone-800 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold mb-2">
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
                    remainingForFreeDelivery === 0 ? 'bg-[#ccff00]' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${freeDeliveryProgress}%` }}
                />
              </div>
            </div>

            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 rounded-3xl border border-stone-200/80 bg-white p-4 shadow-xs hover:border-emerald-300 hover:shadow-card transition-all"
              >
                <button
                  type="button"
                  onClick={() =>
                    navigate(ROUTES.PRODUCT.replace(':id', item.slug || item.id))
                  }
                  className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-2xl bg-stone-50 border border-stone-100 p-2 cursor-pointer"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-contain"
                  />
                </button>

                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm sm:text-base font-bold text-stone-900">
                        {item.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-stone-500 font-medium">
                        {item.unit}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-xs font-bold text-stone-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-3 border-t border-stone-100">
                    {/* Stepper with Fresh Mint Theme */}
                    <div className="flex items-center rounded-xl border border-emerald-200 bg-emerald-50/60 p-0.5 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-emerald-800 hover:bg-emerald-100 transition-colors shadow-2xs font-bold text-xs cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <IconMinus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-black text-emerald-950 tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs font-bold text-xs cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <IconPlus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <p className="font-display text-base font-black text-stone-900">
                      {formatPrice((item.sellingPrice || item.price) * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sticky Summary Card */}
          <div className="h-fit min-w-0 rounded-3xl border border-stone-200/80 bg-white p-6 lg:col-span-4 shadow-card sticky top-28">
            <h2 className="font-display text-lg font-black text-stone-900 mb-4">
              Bill Details
            </h2>
            <dl className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between text-stone-600">
                <dt>Items Subtotal</dt>
                <dd className="font-bold text-stone-900">
                  {formatPrice(subtotal)}
                </dd>
              </div>
              <div className="flex justify-between text-stone-600">
                <dt>Delivery Fee</dt>
                <dd className="font-bold">
                  {deliveryFee === 0 ? (
                    <span className="font-black text-emerald-600">FREE</span>
                  ) : (
                    formatPrice(deliveryFee)
                  )}
                </dd>
              </div>
              <div className="flex justify-between text-stone-600">
                <dt>Packaging / Handling Fee</dt>
                <dd className="font-bold text-stone-900">
                  {formatPrice(handlingFee)}
                </dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <dt>Discount</dt>
                  <dd>− {formatPrice(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-stone-200 pt-3 text-base font-bold text-stone-900">
                <dt>Grand Total</dt>
                <dd className="font-display text-[#054428] font-black text-xl">
                  {formatPrice(total)}
                </dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={() => navigate(ROUTES.CHECKOUT)}
              className="w-full mt-6 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm tracking-wide shadow-md shadow-emerald-950/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <IconArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
}
