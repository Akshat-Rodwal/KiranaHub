import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../../store/useAuthStore.js';
import authService from '../../services/auth.service.js';
import Container from '../../components/common/Container.jsx';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import { ROUTES } from '../../constants/index.js';
import { toast } from '../../components/common/Toast.jsx';
import {
  IconMail,
  IconPhone,
  IconShoppingBag,
  IconHeart,
  IconShield,
  IconLocation,
  IconLogOut,
} from '../../utils/icons.jsx';

const roleColorMap = {
  admin: 'danger',
  manager: 'warning',
  staff: 'accent',
  delivery: 'primary',
  customer: 'secondary',
};

export default function AccountPage() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuthStore();
  const [, setIsRefreshing] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadFreshProfile = async () => {
      try {
        setIsRefreshing(true);
        const res = await authService.getMe();
        const freshUser = res?.user || res?.data?.user || res;
        if (freshUser && isMounted) {
          updateUser(freshUser);
        }
      } catch (err) {
        console.warn('[AccountPage] Could not refresh profile:', err?.message);
      } finally {
        if (isMounted) setIsRefreshing(false);
      }
    };
    loadFreshProfile();
    return () => {
      isMounted = false;
    };
  }, [updateUser]);

  const handleLogout = async () => {
    await logout();
    toast.info('You have been logged out', {
      description: 'See you again soon!',
    });
    navigate(ROUTES.LOGIN);
  };

  const isAdminOrStaff = ['admin', 'manager', 'staff'].includes(user?.role);
  const initials = user?.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  const roleLabel =
    user?.role === 'admin'
      ? 'Admin'
      : user?.role === 'manager'
      ? 'Manager'
      : 'Customer';

  return (
    <div className="py-8 lg:py-12 bg-[#f7f9f7] min-h-[80vh]">
      <Container>
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-4xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6"
          >
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-tr from-emerald-600 via-[#054428] to-stone-900 text-white font-display text-2xl sm:text-3xl font-black shadow-md shadow-emerald-900/20">
                {initials}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-xl sm:text-2xl font-bold text-stone-900">
                    {user?.name || 'Customer'}
                  </h1>
                  <Badge
                    variant={roleColorMap[user?.role] || 'secondary'}
                    size="sm"
                    className="font-bold tracking-wide"
                  >
                    {roleLabel}
                  </Badge>
                </div>
                <p className="text-sm text-stone-500 mt-1 flex items-center gap-1.5">
                  <IconMail className="h-4 w-4 text-stone-400" />
                  <span>{user?.email || 'No email associated'}</span>
                </p>
                <p className="text-sm text-stone-500 mt-0.5 flex items-center gap-1.5">
                  <IconPhone className="h-4 w-4 text-stone-400" />
                  <span>{user?.phone ? `+91 ${user.phone}` : 'Not provided'}</span>
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col gap-2 shrink-0">
              {isAdminOrStaff && (
                <Button
                  as={Link}
                  to={ROUTES.ADMIN?.ROOT || '/admin'}
                  variant="primary"
                  size="sm"
                  leftIcon={<IconShield className="h-4 w-4" />}
                >
                  Admin Console
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                leftIcon={<IconLogOut className="h-4 w-4" />}
              >
                Sign Out
              </Button>
            </div>
          </motion.div>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to={ROUTES.ORDERS}
              className="flex items-center gap-3 p-4 rounded-2xl border border-border-light bg-surface hover:border-brand-300 hover:shadow-sm transition-all"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <IconShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-sm text-text-primary">My Orders</div>
                <div className="text-xs text-text-muted">Track active orders & history</div>
              </div>
            </Link>

            <Link
              to={ROUTES.WISHLIST}
              className="flex items-center gap-3 p-4 rounded-2xl border border-border-light bg-surface hover:border-brand-300 hover:shadow-sm transition-all"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger-50 text-danger-600">
                <IconHeart className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-sm text-text-primary">Saved Items</div>
                <div className="text-xs text-text-muted">Your personal wishlist</div>
              </div>
            </Link>

            <div className="flex items-center gap-3 p-4 rounded-2xl border border-border-light bg-surface">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                <IconShield className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-sm text-text-primary">Account Security</div>
                <div className="text-xs text-success-600 font-medium">Active & Protected</div>
              </div>
            </div>
          </div>

          {/* Addresses Section */}
          <div className="rounded-3xl border border-border-light bg-surface p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <IconLocation className="h-5 w-5 text-brand-600" />
                <h2 className="font-display text-lg font-bold text-text-primary">
                  Delivery Addresses
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  toast.info('Address management coming soon', {
                    description: 'You will be able to manage saved addresses in the checkout release.',
                  })
                }
              >
                + Add Address
              </Button>
            </div>

            {user?.addresses && user.addresses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.addresses.map((addr, idx) => (
                  <div
                    key={addr._id || idx}
                    className="p-4 rounded-2xl border border-border-light bg-surface-soft relative"
                  >
                    {addr.isDefault && (
                      <Badge variant="primary" size="xs" className="mb-2">
                        Default
                      </Badge>
                    )}
                    <div className="font-semibold text-sm text-text-primary">
                      {addr.label || 'Home'}
                    </div>
                    <div className="text-sm text-text-secondary mt-1">
                      {addr.street}
                    </div>
                    <div className="text-xs text-text-muted mt-0.5">
                      {addr.city}, {addr.state} - {addr.pincode}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border-light p-6 text-center">
                <p className="text-sm text-text-muted">
                  No delivery address saved yet. Addresses added during checkout will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
