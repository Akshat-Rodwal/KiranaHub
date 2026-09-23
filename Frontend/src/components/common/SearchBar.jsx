import { forwardRef, useState, useEffect, useRef, useImperativeHandle } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight } from 'lucide-react';
import { classNames, formatPrice } from '../../utils/index.js';
import productApi from '../../services/product.service.js';
import { ROUTES } from '../../constants/index.js';
import Badge from './Badge.jsx';
import useCartStore from '../../store/useCartStore.js';

const sizes = {
  sm: 'h-10 text-xs',
  md: 'h-12 text-sm',
  lg: 'h-14 text-base',
};

const TICKER_ITEMS = [
  "Search 'milk, bread, curd, butter'...",
  "Search 'fresh farm vegetables'...",
  "Search 'atta, rice & dal'...",
  "Search 'cold drinks & snacks'...",
  "Search 'dry fruits & chocolates'...",
  "Search 'fortune sunflower oil'...",
];

const SearchBar = forwardRef(
  (
    {
      value = '',
      defaultValue,
      onChange,
      onSubmit,
      onClear,
      size = 'md',
      placeholder,
      category,
      categories,
      onCategoryChange,
      fullWidth = true,
      className = '',
      autoFocus = false,
      enableLivePreview = true,
    },
    ref
  ) => {
    const navigate = useNavigate();
    const inputRef = useRef(null);
    useImperativeHandle(ref, () => inputRef.current);

    const [internal, setInternal] = useState(defaultValue ?? '');
    const [focused, setFocused] = useState(false);
    const [tickerIndex, setTickerIndex] = useState(0);

    const [previewResults, setPreviewResults] = useState([]);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const addItem = useCartStore((s) => s.addItem);
    const cartItems = useCartStore((s) => s.items);

    const finalValue = onChange ? value : internal;

    // Animated Ticker Interval
    useEffect(() => {
      if (placeholder) return;
      const interval = setInterval(() => {
        setTickerIndex((prev) => (prev + 1) % TICKER_ITEMS.length);
      }, 3000);
      return () => clearInterval(interval);
    }, [placeholder]);

    // Keyboard Shortcuts: Ctrl+K or / to focus search
    useEffect(() => {
      const handleKeyDown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          inputRef.current?.focus();
        } else if (
          e.key === '/' &&
          document.activeElement?.tagName !== 'INPUT' &&
          document.activeElement?.tagName !== 'TEXTAREA'
        ) {
          e.preventDefault();
          inputRef.current?.focus();
        } else if (e.key === 'Escape') {
          setFocused(false);
          setShowPreview(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Live debounced search preview
    useEffect(() => {
      if (!enableLivePreview) return;
      const q = finalValue.trim();
      if (q.length < 2) return;

      const timer = setTimeout(async () => {
        setIsLoadingPreview(true);
        try {
          const res = await productApi.getProducts({ search: q, limit: 5 });
          setPreviewResults(res.items || []);
          setShowPreview(true);
        } catch {
          setPreviewResults([]);
        } finally {
          setIsLoadingPreview(false);
        }
      }, 250);

      return () => clearTimeout(timer);
    }, [finalValue, enableLivePreview]);

    const handleChange = (e) => {
      const v = e.target.value;
      if (v.trim().length < 2) {
        setPreviewResults([]);
        setShowPreview(false);
      }
      if (onChange) onChange(v);
      else setInternal(v);
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      setShowPreview(false);
      setFocused(false);
      inputRef.current?.blur();
      onSubmit?.(finalValue, category);
    };

    const clear = () => {
      if (onChange) onChange('');
      else setInternal('');
      setPreviewResults([]);
      setShowPreview(false);
      onClear?.();
      inputRef.current?.focus();
    };

    const handleSelectProduct = (product) => {
      setShowPreview(false);
      setFocused(false);
      navigate(ROUTES.PRODUCT.replace(':id', product.slug || product.id || product._id));
    };

    const handleAddToCart = (e, product) => {
      e.preventDefault();
      e.stopPropagation();
      addItem(product, 1);
    };

    const currentTicker = placeholder || TICKER_ITEMS[tickerIndex];

    return (
      <div className={classNames('relative', fullWidth && 'w-full', className)}>
        <form
          onSubmit={handleSubmit}
          className={classNames(
            'group relative flex items-center rounded-2xl bg-stone-100/90 border transition-all duration-200 shadow-2xs focus-within:bg-white',
            focused
              ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
              : 'border-stone-200/80 hover:border-stone-300',
            sizes[size],
            fullWidth && 'w-full'
          )}
        >
          {/* Optional Category Filter Dropdown */}
          {categories && (
            <div className="flex items-center pl-4 pr-3 gap-1.5 border-r border-stone-200 shrink-0">
              <select
                value={category || ''}
                onChange={(e) => onCategoryChange?.(e.target.value)}
                className="bg-transparent text-xs font-semibold text-stone-700 outline-none cursor-pointer pr-1"
              >
                <option value="">All</option>
                {categories.map((c) => (
                  <option key={c.value || c} value={c.value || c}>
                    {c.label || c}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Search Icon */}
          <span className="flex items-center pl-4 text-stone-400 group-focus-within:text-emerald-700 transition-colors shrink-0">
            <Search className="w-4.5 h-4.5" strokeWidth={1.75} />
          </span>

          {/* Search Input & Placeholder Container */}
          <div className="relative flex-1 min-w-0 h-full flex items-center px-3">
            {/* Animated Ticker Placeholder */}
            {!finalValue && (
              <div className="absolute inset-y-0 left-3 right-3 flex items-center pointer-events-none overflow-hidden text-stone-400 select-none">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentTicker}
                    initial={{ opacity: 0, y: 7 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -7 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                    className="truncate text-xs sm:text-sm font-normal"
                  >
                    {currentTicker}
                  </motion.span>
                </AnimatePresence>
              </div>
            )}

            <input
              ref={inputRef}
              type="search"
              value={finalValue}
              onChange={handleChange}
              onFocus={() => {
                setFocused(true);
                if (finalValue.trim().length >= 2 && previewResults.length > 0) {
                  setShowPreview(true);
                }
              }}
              onBlur={() => {
                setTimeout(() => setFocused(false), 220);
              }}
              autoFocus={autoFocus}
              className="w-full bg-transparent text-sm text-stone-900 outline-none z-10"
              aria-label="Search groceries"
            />
          </div>

          {/* Keyboard shortcut hint */}
          {!finalValue && !focused && (
            <span className="hidden sm:flex items-center gap-1 mr-2 px-2 py-0.5 rounded-md border border-stone-200 bg-stone-50 text-[10px] font-mono font-medium text-stone-400 select-none shrink-0">
              <kbd>Ctrl</kbd>+<kbd>K</kbd>
            </span>
          )}

          {/* Clear button */}
          {finalValue && (
            <motion.button
              type="button"
              onClick={clear}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center w-7 h-7 mr-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors shrink-0 z-10 cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" strokeWidth={2} />
            </motion.button>
          )}

          {/* Submit Search Button */}
          <button
            type="submit"
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 mr-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white transition-all shadow-xs shrink-0 z-10 cursor-pointer"
            aria-label="Submit search"
          >
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </form>

        {/* Floating Quick-Results Dropdown Preview */}
        <AnimatePresence>
          {focused && showPreview && (previewResults.length > 0 || isLoadingPreview) && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-stone-200 shadow-2xl z-50 overflow-hidden divide-y divide-stone-100"
            >
              <div className="px-4 py-2.5 bg-stone-50/90 flex items-center justify-between text-xs font-semibold text-stone-500 uppercase tracking-wider">
                <span>Matching Products</span>
                {isLoadingPreview && (
                  <span className="text-emerald-700 text-[11px] font-normal normal-case animate-pulse">
                    Searching...
                  </span>
                )}
              </div>

              <div className="max-h-[340px] overflow-y-auto divide-y divide-stone-100">
                {previewResults.map((product) => {
                  const effectivePrice = product.sellingPrice ?? product.price ?? 0;
                  const effectiveMrp = product.originalPrice ?? product.mrp ?? effectivePrice;
                  const discount = effectiveMrp > effectivePrice ? Math.round(((effectiveMrp - effectivePrice) / effectiveMrp) * 100) : 0;
                  const imageSrc = product.image || product.images?.[0]?.url || product.images?.[0];
                  const inCart = cartItems.find((i) => i.id === (product.id || product._id));

                  return (
                    <div
                      key={product.id || product._id}
                      onClick={() => handleSelectProduct(product)}
                      className="w-full px-4 py-2.5 flex items-center gap-3.5 hover:bg-emerald-50/60 transition-colors text-left group cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-xl bg-stone-50 border border-stone-200/60 flex items-center justify-center p-1 overflow-hidden shrink-0">
                        {imageSrc ? (
                          <img
                            src={imageSrc}
                            alt={product.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <span className="text-stone-400 text-xs">🛒</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs sm:text-sm font-semibold text-stone-900 truncate group-hover:text-emerald-800 transition-colors">
                            {product.name}
                          </p>
                          {discount > 0 && (
                            <Badge variant="discount" size="xs">
                              {discount}% OFF
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5 truncate">
                          {product.unit || '1 pc'} {product.brand && `• ${product.brand}`}
                        </p>
                      </div>

                      <div className="text-right shrink-0 flex items-center gap-3">
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-stone-900 font-display">
                            {formatPrice(effectivePrice)}
                          </p>
                          {effectiveMrp > effectivePrice && (
                            <p className="text-[10px] text-stone-400 line-through">
                              {formatPrice(effectiveMrp)}
                            </p>
                          )}
                        </div>

                        {/* Instant Add to Cart Button */}
                        <button
                          type="button"
                          onMouseDown={(e) => handleAddToCart(e, product)}
                          className={classNames(
                            'px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer shadow-2xs',
                            inCart
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white text-emerald-700 border-emerald-600 hover:bg-emerald-600 hover:text-white'
                          )}
                        >
                          {inCart ? `${inCart.quantity} in cart` : '+ ADD'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-2.5 bg-stone-50/80 text-center">
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSubmit(e);
                  }}
                  className="w-full py-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer group"
                >
                  <span>See all results for &ldquo;{finalValue}&rdquo;</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';

export default SearchBar;
