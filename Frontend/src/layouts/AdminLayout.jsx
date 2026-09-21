import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import useAuthStore from '../store/useAuthStore.js';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import { ROUTES } from '../constants/index.js';
import {
  IconGrid,
  IconShoppingBag,
  IconTag,
  IconCategory,
  IconOffer,
  IconShield,
  IconHome,
  IconMenu,
  IconClose,
  IconLogOut,
} from '../utils/icons.jsx';

const navItems = [
  {
    name: 'Overview',
    path: ROUTES.ADMIN?.ROOT || '/admin',
    exact: true,
    icon: IconGrid,
  },
  {
    name: 'Orders',
    path: ROUTES.ADMIN?.ORDERS || '/admin/orders',
    icon: IconShoppingBag,
  },
  {
    name: 'Products & Stock',
    path: ROUTES.ADMIN?.PRODUCTS || '/admin/products',
    icon: IconTag,
  },
  {
    name: 'Categories',
    path: ROUTES.ADMIN?.CATEGORIES || '/admin/categories',
    icon: IconCategory,
  },
  {
    name: 'Banners & Promos',
    path: '/admin/banners',
    icon: IconOffer,
  },
  {
    name: 'Store Settings',
    path: ROUTES.ADMIN?.SETTINGS || '/admin/settings',
    icon: IconShield,
  },
];

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  const isActiveLink = (item) => {
    if (item.exact) {
      return location.pathname === '/admin' || location.pathname === '/admin/dashboard';
    }
    return location.pathname.startsWith(item.path);
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AD';

  return (
    <div className="min-h-screen bg-[#f8faf8] flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 h-16 border-b border-stone-200/80 bg-white px-4 sm:px-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-xl text-stone-500 hover:bg-stone-100 hover:text-stone-900"
            aria-label="Open Admin Menu"
          >
            <IconMenu className="h-6 w-6" />
          </button>

          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#054428] text-[#ccff00] font-black font-display shadow-xs">
              KH
            </div>
            <div>
              <span className="font-display font-black text-base text-stone-900 tracking-tight">
                Kirana<span className="text-[#054428]">Hub</span>
              </span>
              <span className="ml-2 text-xs font-bold text-emerald-800 hidden sm:inline">
                Admin Console
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Role badge */}
          <Badge variant="discount" size="sm" className="hidden sm:inline-flex uppercase font-mono tracking-wider">
            {user?.role || 'admin'}
          </Badge>

          {/* Return to Storefront */}
          <Button
            as={Link}
            to={ROUTES.HOME}
            variant="outline"
            size="sm"
            leftIcon={<IconHome className="h-4 w-4" />}
            className="border-stone-200 text-stone-700 hover:bg-stone-50"
          >
            <span className="hidden sm:inline">Storefront</span>
          </Button>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
              {initials}
            </div>
            <div className="hidden md:block text-left text-xs leading-tight">
              <p className="font-semibold text-stone-900 truncate max-w-[120px]">{user?.name || 'Manager'}</p>
              <p className="text-stone-500 capitalize">{user?.role || 'Admin'}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-stone-200/80 bg-white shrink-0">
          <div className="p-4 flex-1 space-y-1.5">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-stone-400">
              Store Management
            </div>
            {navItems.map((item) => {
              const active = isActiveLink(item);
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-emerald-50 text-emerald-800 font-bold shadow-xs border-r-2 border-emerald-600'
                      : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? 'text-emerald-700' : 'text-stone-400'}`} />
                  {item.name}
                </NavLink>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-stone-200 space-y-2">
            <div className="rounded-xl bg-emerald-50/70 p-3 text-xs text-stone-600 border border-emerald-100">
              <div className="flex items-center gap-1.5 font-bold text-[#054428] mb-0.5">
                <IconShield className="h-3.5 w-3.5 text-emerald-700" />
                <span>Elevated Access</span>
              </div>
              <p className="text-[11px]">Logged in with administrative and management permissions.</p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <IconLogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs lg:hidden"
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl flex flex-col lg:hidden"
              >
                <div className="h-16 px-4 border-b border-stone-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#054428] text-[#ccff00] font-bold font-display text-sm shadow-xs">
                      KH
                    </div>
                    <span className="font-display font-bold text-sm text-stone-900">Admin Console</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="p-2 rounded-xl text-stone-400 hover:bg-stone-100"
                  >
                    <IconClose className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-4 flex-1 space-y-1.5 overflow-y-auto">
                  <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                    Navigation
                  </div>
                  {navItems.map((item) => {
                    const active = isActiveLink(item);
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.name}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          active
                            ? 'bg-emerald-50 text-emerald-800 font-bold border-r-2 border-emerald-600'
                            : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${active ? 'text-emerald-700' : 'text-stone-400'}`} />
                        {item.name}
                      </NavLink>
                    );
                  })}
                </div>

                <div className="p-4 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <IconLogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto min-w-0 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
