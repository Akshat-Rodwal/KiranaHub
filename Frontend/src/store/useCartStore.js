import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const recalculate = (items, coupon = null) => {
  const subtotal = items.reduce(
    (sum, item) => sum + (item.sellingPrice || item.price || 0) * item.quantity,
    0
  );
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  // Dynamic fee calculation: Free delivery above ₹499, else ₹25. Handling fee ₹2.
  const deliveryFee = subtotal >= 499 ? 0 : (subtotal > 0 ? 25 : 0);
  const handlingFee = subtotal > 0 ? 2 : 0;

  let discount = 0;
  if (coupon && subtotal > 0) {
    if (coupon.type === 'percentage') {
      discount = Math.round(subtotal * (coupon.value / 100));
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.value || 0;
    }
  }

  const total = Math.max(0, subtotal + deliveryFee + handlingFee - discount);

  return {
    subtotal,
    totalQuantity,
    deliveryFee,
    shipping: deliveryFee, // Alias for backward compatibility
    handlingFee,
    discount,
    total,
  };
};

const initialState = {
  items: [],
  totalQuantity: 0,
  subtotal: 0,
  deliveryFee: 0,
  shipping: 0,
  handlingFee: 0,
  discount: 0,
  coupon: null,
  total: 0,
  isCartDrawerOpen: false,
};

const useCartStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      openCartDrawer: () => set({ isCartDrawerOpen: true }),
      closeCartDrawer: () => set({ isCartDrawerOpen: false }),
      toggleCartDrawer: () => set((state) => ({ isCartDrawerOpen: !state.isCartDrawerOpen })),

      addItem: (product, quantity = 1) => {
        const items = [...get().items];
        const prodId = product.slug || product.id || product._id;
        const existing = items.find((i) => i.id === prodId || i.slug === product.slug);

        const effectiveSelling = product.sellingPrice ?? product.price ?? 0;
        const effectiveOriginal = product.originalPrice ?? product.mrp ?? effectiveSelling;
        const imgUrl = product.image || (Array.isArray(product.images) ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url) : '');

        const itemData = {
          id: prodId,
          productId: product._id || product.id,
          name: product.name,
          slug: product.slug,
          image: imgUrl,
          price: effectiveSelling,
          sellingPrice: effectiveSelling,
          mrp: effectiveOriginal,
          originalPrice: effectiveOriginal,
          unit: product.unit || '1 pc',
          quantity,
        };

        if (existing) {
          existing.quantity += quantity;
        } else {
          items.push(itemData);
        }

        const calc = recalculate(items, get().coupon);
        set({ items, ...calc });
      },

      removeItem: (productId) => {
        const items = get().items.filter(
          (i) => i.id !== productId && i.slug !== productId && i.productId !== productId
        );
        const calc = recalculate(items, get().coupon);
        set({ items, ...calc });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        const items = get().items.map((i) =>
          i.id === productId || i.slug === productId || i.productId === productId
            ? { ...i, quantity }
            : i
        );
        const calc = recalculate(items, get().coupon);
        set({ items, ...calc });
      },

      applyCoupon: (coupon) => {
        const calc = recalculate(get().items, coupon);
        set({ coupon, ...calc });
      },

      removeCoupon: () => {
        const calc = recalculate(get().items, null);
        set({ coupon: null, ...calc });
      },

      clearCart: () =>
        set({
          ...initialState,
          isCartDrawerOpen: false,
        }),
    }),
    {
      name: 'kirana_cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        coupon: state.coupon,
        subtotal: state.subtotal,
        totalQuantity: state.totalQuantity,
        deliveryFee: state.deliveryFee,
        shipping: state.shipping,
        handlingFee: state.handlingFee,
        discount: state.discount,
        total: state.total,
      }),
    }
  )
);

export default useCartStore;
