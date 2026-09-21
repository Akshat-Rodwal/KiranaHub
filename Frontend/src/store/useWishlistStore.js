import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      add: (product) => {
        const id = product.id || product._id || product.slug;
        if (get().items.some((i) => (i.id || i._id || i.slug) === id)) return;
        set((state) => ({ items: [product, ...state.items] }));
      },

      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => (i.id || i._id || i.slug) !== productId),
        })),

      toggle: (product) => {
        const id = product.id || product._id || product.slug;
        const has = get().items.some((i) => (i.id || i._id || i.slug) === id);
        if (has) get().remove(id);
        else get().add(product);
      },

      isInWishlist: (productId) =>
        get().items.some((i) => (i.id || i._id || i.slug) === productId),

      clear: () => set({ items: [] }),
    }),
    {
      name: 'kirana_wishlist',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useWishlistStore;
