import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  ShoppingCart,
  MapPin,
  ChevronDown,
  ShieldCheck,
  User,
  Package,
  LogOut,
  X,
  Check,
  Navigation,
  Loader2,
} from 'lucide-react';
import Container from '../common/Container.jsx';
import SearchBar from '../common/SearchBar.jsx';
import { ROUTES } from '../../constants/index.js';
import { classNames, formatPrice } from '../../utils/index.js';
import useCartStore from '../../store/useCartStore.js';
import useAuthStore from '../../store/useAuthStore.js';
import useStoreSettings from '../../hooks/useStoreSettings.js';
import { detectCurrentLocation } from '../../utils/geolocation.js';
import { toast } from '../common/Toast.jsx';

const PRESET_LOCATIONS = [
  { id: 'loc-1', tag: 'Central Hub', address: 'Connaught Place, Barakhamba, New Delhi - 110001', time: '8 mins' },
  { id: 'loc-2', tag: 'South Hub', address: 'Greater Kailash 1, M-Block Market, New Delhi - 110048', time: '10 mins' },
  { id: 'loc-3', tag: 'NCR Hub', address: 'Cyber City, Phase 2, DLF Cyber Hub - 122002', time: '12 mins' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { data: settings } = useStoreSettings();
  const cartCount = useCartStore((s) => s.totalQuantity);
  const cartSubtotal = useCartStore((s) => s.subtotal);
  const openCartDrawer = useCartStore((s) => s.openCartDrawer);
  const { isAuthenticated, user, logout } = useAuthStore();
  const firstName = user?.name ? user.name.split(' ')[0] : null;

  const [selectedLocation, setSelectedLocation] = useState(PRESET_LOCATIONS[0]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleGpsAutoDetect = async () => {
    setIsDetectingLocation(true);
    try {
      const loc = await detectCurrentLocation();
      const detectedItem = {
        id: 'gps-live',
        tag: 'Current Location',
        address: `${loc.addressLine1}, ${loc.city}`,
        time: '10-15 mins',
        coords: loc.coords,
      };
      setSelectedLocation(detectedItem);
      setIsLocationModalOpen(false);
      toast.success('Live Location Detected!', {
        description: `Delivering to ${loc.addressLine1}, ${loc.city}`,
      });
    } catch (err) {
      toast.error('GPS Detection Failed', {
        description: err.message || 'Please enable location access in your browser settings.',
      });
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleSearch = (value) => {
    const query = value?.trim();
    navigate(query ? `${ROUTES.SEARCH}?q=${encodeURIComponent(query)}` : ROUTES.SEARCH);
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/95 border-b border-stone-200/70 shadow-xs transition-all w-full">
      {/* Dynamic Announcement Bar */}
      {settings?.announcementText && (
        <div
          className={`px-4 py-1.5 text-center text-xs font-semibold tracking-wide transition-colors ${
            settings.isStoreOpen !== false
              ? 'bg-[#054428] text-[#ccff00] border-b border-[#065f46]'
              : 'bg-stone-900 text-stone-200'
          }`}
        >
          <Container className="px-3 sm:px-6">
            <div className="flex items-center justify-center gap-2">
              <span className="font-extrabold tracking-wide">⚡ {settings.announcementText}</span>
              {settings.isStoreOpen === false && (
                <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Store Offline • Pre-orders Only
                </span>
              )}
            </div>
          </Container>
        </div>
      )}

      <Container className="px-3 sm:px-6">
        {/* Main Omnibar Row (Exact Blinkit Layout) */}
        <div className="flex h-16 sm:h-20 items-center justify-between gap-2 sm:gap-4 lg:gap-6 w-full">
          
          {/* 1. Brand Logo */}
          <Link to={ROUTES.HOME} className="flex items-center gap-2 shrink-0 group">
            <span className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-[#0c831f] text-[#f8cb46] font-black text-xl shadow-xs transition-transform group-hover:scale-105">
              <ShoppingBag className="h-5 w-5 drop-shadow-xs" strokeWidth={2} />
            </span>
            <div className="leading-none">
              <span className="font-display text-2xl sm:text-[26px] font-black tracking-tighter text-[#0c831f]">
                kirana<span className="text-[#f8cb46]">hub</span>
              </span>
            </div>
          </Link>

          {/* 2. Delivery Location Pill */}
          <div className="relative shrink min-w-0 max-w-[125px] sm:max-w-none">
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2 text-left py-1 px-1.5 sm:py-1.5 sm:px-3 rounded-xl hover:bg-stone-100/80 transition-colors cursor-pointer group border border-transparent hover:border-stone-200 max-w-full"
            >
              <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-emerald-50 text-[#0c831f] shrink-0">
                <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.75} />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <span className="font-display font-black text-[11px] sm:text-sm text-stone-900 leading-tight truncate">
                    Delivery in {selectedLocation.time}
                  </span>
                  <ChevronDown className="h-3 w-3 text-stone-500 group-hover:text-stone-900 transition-transform group-hover:translate-y-0.5 shrink-0" strokeWidth={2} />
                </div>
                <span className="text-[10px] sm:text-[11px] font-medium text-stone-500 max-w-[95px] sm:max-w-[190px] truncate leading-tight mt-0.5">
                  {selectedLocation.address}
                </span>
              </div>
            </button>

            {/* Location Switcher Modal */}
            <AnimatePresence>
              {isLocationModalOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-stone-950/20 backdrop-blur-2xs"
                    onClick={() => setIsLocationModalOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    className="absolute left-0 top-full mt-2 w-80 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xl z-[100]"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                      <div>
                        <h4 className="font-display font-extrabold text-sm text-stone-900">Choose Delivery Location</h4>
                        <p className="text-[11px] text-stone-500">Fastest delivery in your neighbourhood</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsLocationModalOpen(false)}
                        className="rounded-full p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
                      >
                        <X className="h-4 w-4" strokeWidth={2} />
                      </button>
                    </div>

                    <div className="pt-3 pb-2">
                      <button
                        type="button"
                        disabled={isDetectingLocation}
                        onClick={handleGpsAutoDetect}
                        className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-60 mb-2"
                      >
                        {isDetectingLocation ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                            <span>Detecting GPS Location...</span>
                          </>
                        ) : (
                          <>
                            <Navigation className="h-3.5 w-3.5 text-emerald-100" />
                            <span>📍 Use Current Location (GPS Auto-detect)</span>
                          </>
                        )}
                      </button>

                      <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1 px-1">
                        Or select delivery hub
                      </div>
                    </div>

                    <div className="py-1 space-y-1.5 max-h-60 overflow-y-auto">
                      {PRESET_LOCATIONS.map((loc) => {
                        const isSelected = loc.id === selectedLocation.id;
                        return (
                          <button
                            key={loc.id}
                            type="button"
                            onClick={() => {
                              setSelectedLocation(loc);
                              setIsLocationModalOpen(false);
                            }}
                            className={classNames(
                              'w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-start justify-between gap-2 cursor-pointer',
                              isSelected
                                ? 'bg-emerald-50 border border-emerald-300 text-emerald-950 font-semibold'
                                : 'hover:bg-stone-50 text-stone-700'
                            )}
                          >
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-stone-900">{loc.tag}</span>
                                <span className="text-[10px] font-mono font-bold text-[#0c831f] bg-emerald-100/60 px-1.5 py-0.5 rounded">
                                  {loc.time}
                                </span>
                              </div>
                              <p className="text-[11px] text-stone-500 mt-0.5 leading-snug line-clamp-2">
                                {loc.address}
                              </p>
                            </div>
                            {isSelected && (
                              <Check className="h-4 w-4 text-[#0c831f] shrink-0 mt-0.5" strokeWidth={2.5} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* 3. Wide Center Omnisearch Bar */}
          <div className="hidden md:block flex-1 max-w-2xl mx-auto">
            <SearchBar size="md" onSubmit={handleSearch} />
          </div>

          {/* 4. Login, Admin Portal & My Cart Action Area */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Prominent Admin Portal Button when admin/manager logged in */}
            {['admin', 'manager'].includes(user?.role) && (
              <Link
                to="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-black px-3 py-2 text-xs shadow-xs transition-all tracking-tight cursor-pointer hover:shadow-md"
              >
                <ShieldCheck className="h-4 w-4 text-stone-950" strokeWidth={2} />
                <span>Admin Portal</span>
              </Link>
            )}

            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 py-1.5 px-2 sm:px-3 rounded-xl border border-stone-200/80 bg-white hover:bg-stone-50 transition-colors text-xs font-bold text-stone-800 cursor-pointer shadow-2xs"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#0c831f] text-white font-bold text-[10px] uppercase">
                    {firstName?.[0] || 'U'}
                  </span>
                  <span className="hidden sm:inline max-w-[90px] truncate">{firstName}</span>
                  <ChevronDown className="h-3 w-3 text-stone-400" strokeWidth={2} />
                </button>

                <AnimatePresence>
                  {userDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserDropdownOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-stone-200/80 bg-white py-2 shadow-2xl z-[100] text-xs font-semibold text-stone-700 divide-y divide-stone-100"
                      >
                        <div className="px-3.5 py-2">
                          <p className="font-bold text-stone-900">{user?.name}</p>
                          <p className="text-[11px] text-stone-400 truncate">{user?.email}</p>
                        </div>
                        <div className="py-1">
                          {['admin', 'manager'].includes(user?.role) && (
                            <Link
                              to="/admin"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center justify-between px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-950 font-black rounded-lg text-xs transition-colors mx-1 my-0.5"
                            >
                              <span className="flex items-center gap-1.5">
                                <ShieldCheck className="h-4 w-4 text-amber-700" strokeWidth={2} />
                                <span>Admin Portal</span>
                              </span>
                              <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-mono uppercase font-bold">
                                {user.role}
                              </span>
                            </Link>
                          )}
                          <Link
                            to="/account"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3.5 py-2 hover:bg-stone-50 text-stone-800 transition-colors cursor-pointer"
                          >
                            <User className="h-3.5 w-3.5 text-stone-400" strokeWidth={1.75} />
                            <span>My Profile</span>
                          </Link>
                          <Link
                            to="/orders"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3.5 py-2 hover:bg-stone-50 text-stone-800 transition-colors cursor-pointer"
                          >
                            <Package className="h-3.5 w-3.5 text-stone-400" strokeWidth={1.75} />
                            <span>My Orders</span>
                          </Link>
                        </div>
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setUserDropdownOpen(false);
                              logout();
                            }}
                            className="flex items-center gap-2 w-full text-left px-3.5 py-2 hover:bg-red-50 text-red-600 font-bold cursor-pointer"
                          >
                            <LogOut className="h-3.5 w-3.5 text-red-500" strokeWidth={1.75} />
                            <span>Log Out</span>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to={ROUTES.LOGIN}
                className="text-xs sm:text-sm font-bold text-stone-800 hover:text-[#0c831f] transition-colors py-1.5 px-2 cursor-pointer"
              >
                Login
              </Link>
            )}

            {/* Mobile Compact Cart Icon Button (< sm) */}
            <motion.button
              type="button"
              onClick={openCartDrawer}
              whileTap={{ scale: 0.92 }}
              className="relative p-2 rounded-xl bg-stone-100/80 hover:bg-stone-200/80 sm:hidden cursor-pointer transition-colors"
              aria-label="Open Cart"
            >
              <ShoppingCart className="w-5 h-5 text-stone-800" strokeWidth={2} />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0.3, opacity: 0 }}
                    animate={{ scale: [0.3, 1.35, 0.9, 1.1, 1], opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 600, damping: 18 }}
                    className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-black rounded-full h-4 min-w-4 px-1 flex items-center justify-center shadow-xs"
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Desktop / Tablet Signature Blinkit "My Cart" Button (>= sm) */}
            <motion.button
              type="button"
              onClick={openCartDrawer}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.94 }}
              className={classNames(
                'hidden sm:flex items-center gap-2.5 rounded-2xl px-4 py-2.5 text-xs font-extrabold transition-all cursor-pointer shadow-xs',
                cartCount > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25 hover:shadow-lg'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              )}
              aria-label="Open Cart"
            >
              <motion.div
                key={cartCount}
                initial={{ scale: 0.8 }}
                animate={{ scale: [0.8, 1.25, 0.95, 1.05, 1] }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                className="flex items-center gap-2"
              >
                <ShoppingCart className="h-4.5 w-4.5 text-current" strokeWidth={2} />
                <div className="leading-tight text-left">
                  {cartCount > 0 ? (
                    <>
                      <p className="text-[10px] text-emerald-100 uppercase tracking-wider leading-none font-bold">
                        {cartCount} {cartCount === 1 ? 'item' : 'items'}
                      </p>
                      <p className="font-display font-black text-xs text-white leading-none mt-0.5">
                        {formatPrice(cartSubtotal)}
                      </p>
                    </>
                  ) : (
                    <span className="font-bold text-xs text-stone-700">My Cart</span>
                  )}
                </div>
              </motion.div>
            </motion.button>
          </div>
        </div>

        {/* Mobile Search Bar Row (<768px) */}
        <div className="pb-3 md:hidden">
          <SearchBar size="sm" onSubmit={handleSearch} />
        </div>
      </Container>
    </header>
  );
}
