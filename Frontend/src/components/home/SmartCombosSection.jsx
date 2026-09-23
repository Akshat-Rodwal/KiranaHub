import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Check, ShoppingBag, Sparkles, Layers } from 'lucide-react';
import bundleService from '../../services/bundle.service.js';
import useCartStore from '../../store/useCartStore.js';
import { toast } from '../common/Toast.jsx';
import { formatPrice } from '../../utils/index.js';

export default function SmartCombosSection() {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedBundleId, setAddedBundleId] = useState(null);
  const addItem = useCartStore((state) => state.addItem);
  const openCartDrawer = useCartStore((state) => state.openCartDrawer);

  useEffect(() => {
    let isMounted = true;
    const loadBundles = async () => {
      try {
        const res = await bundleService.getBundles();
        if (isMounted) {
          const list = res?.data?.bundles || res?.bundles || [];
          setBundles(list);
        }
      } catch (err) {
        console.error('Failed to load bundles:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadBundles();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddBundle = (bundle) => {
    if (!bundle?.items || bundle.items.length === 0) return;

    // Add each item in the bundle to cart
    bundle.items.forEach((item) => {
      if (item.product) {
        addItem(item.product, item.quantity || 1);
      }
    });

    setAddedBundleId(bundle._id || bundle.slug);
    toast.success(`Combo Added!`, {
      description: `All items from "${bundle.name}" added with extra savings.`,
    });

    setTimeout(() => {
      setAddedBundleId(null);
    }, 2000);
  };

  if (!loading && bundles.length === 0) {
    return null;
  }

  return (
    <section className="py-10 bg-gradient-to-b from-[#f7f9f7] via-white to-[#f7f9f7] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold shadow-2xs mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>1-Click Smart Bundles</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Curated Combos & Daily Baskets
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Handpicked everyday essentials grouped together with up to 15% extra combo discounts
            </p>
          </div>
        </div>

        {/* Skeleton Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-sm animate-pulse space-y-4"
              >
                <div className="h-44 bg-stone-100 rounded-2xl w-full" />
                <div className="h-5 bg-stone-200 rounded w-3/4" />
                <div className="h-4 bg-stone-100 rounded w-full" />
                <div className="h-10 bg-stone-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          /* Combos Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bundles.map((bundle) => {
              const isAdded = addedBundleId === (bundle._id || bundle.slug);

              return (
                <motion.div
                  key={bundle._id || bundle.slug}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-3xl border border-stone-200/80 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between overflow-hidden group"
                >
                  {/* Top Image Banner */}
                  <div className="relative h-44 sm:h-48 overflow-hidden bg-stone-100">
                    <img
                      src={bundle.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'}
                      alt={bundle.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />

                    {/* Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-600 text-white font-black text-[11px] shadow-md tracking-wider uppercase">
                        {bundle.badge || `⚡ ${bundle.discountPercent}% OFF`}
                      </span>
                    </div>

                    {/* Included Items Counter */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                      <span className="font-bold flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg">
                        <Layers className="w-3.5 h-3.5 text-emerald-400" />
                        {bundle.itemCount || bundle.items?.length || 3} items inside
                      </span>
                      {bundle.savings > 0 && (
                        <span className="font-black text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/30">
                          Save {formatPrice(bundle.savings)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {bundle.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {bundle.description}
                      </p>

                      {/* Items Preview Chips */}
                      <div className="mt-3.5 pt-3 border-t border-stone-100 flex flex-wrap gap-1.5">
                        {(bundle.items || []).slice(0, 4).map((item, idx) => {
                          const prod = item.product || {};
                          return (
                            <span
                              key={prod._id || idx}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-stone-100/80 text-slate-700 text-[11px] font-medium"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span className="truncate max-w-[110px]">{prod.name}</span>
                              {item.quantity > 1 && (
                                <span className="font-bold text-slate-900">×{item.quantity}</span>
                              )}
                            </span>
                          );
                        })}
                        {(bundle.items || []).length > 4 && (
                          <span className="text-[11px] font-bold text-slate-400 self-center">
                            +{(bundle.items.length - 4)} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price & Action Row */}
                    <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-display text-xl font-black text-emerald-700">
                            {formatPrice(bundle.bundlePrice || bundle.regularSubtotal || 0)}
                          </span>
                          {bundle.regularSubtotal > (bundle.bundlePrice || 0) && (
                            <span className="text-xs text-slate-400 line-through font-semibold">
                              {formatPrice(bundle.regularSubtotal)}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium block">
                          Inclusive of all taxes
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddBundle(bundle)}
                        className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer select-none active:scale-95 ${
                          isAdded
                            ? 'bg-emerald-600 text-white shadow-emerald-200'
                            : 'bg-slate-900 hover:bg-emerald-600 text-white'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>Added!</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                            <span>Add Combo</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
