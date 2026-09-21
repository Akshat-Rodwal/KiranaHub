import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, LayoutGrid, Search, ShoppingCart, User } from 'lucide-react';
import { ROUTES } from '../../constants/index.js';
import useCartStore from '../../store/useCartStore.js';
import { classNames } from '../../utils/index.js';

const items = [
  { label: 'Home', to: ROUTES.HOME, icon: Home, end: true },
  { label: 'Categories', to: ROUTES.CATEGORIES, icon: LayoutGrid, end: true },
  { label: 'Search', to: ROUTES.SEARCH, icon: Search, end: true },
  { label: 'Cart', to: ROUTES.CART, icon: ShoppingCart, end: true, showBadge: true },
  { label: 'Account', to: ROUTES.ACCOUNT, icon: User, end: true },
];

export default function MobileBottomNavigation() {
  const cartCount = useCartStore((s) => s.totalQuantity);

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-stone-200/80 md:hidden shadow-lg safe-area-bottom pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-5 py-2">
        {items.map(({ label, to, icon: Icon, end, showBadge }) => (
          <NavLink
            key={label}
            to={to}
            end={end}
            className={({ isActive }) =>
              classNames(
                'relative flex min-h-[58px] flex-col items-center justify-center gap-1 py-1.5 transition-colors',
                isActive ? 'text-emerald-800 font-extrabold' : 'text-stone-500 hover:text-stone-800'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className="relative">
                  <Icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.4 : 1.9} />
                  {showBadge && cartCount > 0 && (
                    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[9px] font-bold leading-none text-white shadow-xs">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </span>
                <span className="text-[10px] tracking-tight leading-none">{label}</span>
                {isActive && (
                  <motion.span
                    layoutId="bottom-nav-indicator"
                    className="absolute -top-px h-1 w-8 rounded-full bg-emerald-600 shadow-[0_2px_8px_rgba(5,150,105,0.4)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
