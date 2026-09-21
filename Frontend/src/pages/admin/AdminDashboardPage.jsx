import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';

import useAuthStore from '../../store/useAuthStore.js';
import adminService from '../../services/admin.service.js';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { ROUTES } from '../../constants/index.js';
import { formatPrice } from '../../utils/index.js';
import {
  IconGrid,
  IconShoppingBag,
  IconTag,
  IconClock,
  IconRefresh,
  IconArrowRight,
  IconRupee,
} from '../../utils/icons.jsx';

const STATUS_BADGES = {
  PENDING: { variant: 'secondary', label: 'Pending' },
  CONFIRMED: { variant: 'primary', label: 'Confirmed' },
  PREPARING: { variant: 'warning', label: 'Preparing' },
  OUT_FOR_DELIVERY: { variant: 'warning', label: 'Out for Delivery' },
  DELIVERED: { variant: 'success', label: 'Delivered' },
  CANCELLED: { variant: 'danger', label: 'Cancelled' },
};

export default function AdminDashboardPage() {
  const { user } = useAuthStore();

  const {
    data: analyticsRes,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['admin-analytics-overview'],
    queryFn: () => adminService.getOverviewAnalytics(),
    staleTime: 5 * 1000,
    refetchInterval: 10 * 1000,
    refetchOnWindowFocus: true,
  });

  const analytics = analyticsRes?.data || analyticsRes || {};

  const stats = [
    {
      label: 'Total Revenue',
      value: formatPrice(analytics.totalRevenue || 0),
      subtitle: `Today: ${formatPrice(analytics.todaySales || 0)}`,
      icon: IconRupee,
      color: 'bg-emerald-50 text-emerald-700',
      border: 'border-emerald-100',
    },
    {
      label: 'Total Orders',
      value: analytics.totalOrders ?? 0,
      subtitle: `${analytics.todayOrders || 0} placed today`,
      icon: IconShoppingBag,
      color: 'bg-indigo-50 text-indigo-700',
      border: 'border-indigo-100',
    },
    {
      label: 'Pending Orders',
      value: analytics.pendingOrders ?? 0,
      subtitle: 'Needs action & confirmation',
      icon: IconClock,
      color: 'bg-amber-50 text-amber-700',
      border: 'border-amber-100',
    },
    {
      label: 'Active Fulfillment',
      value: analytics.activeOrders ?? 0,
      subtitle: 'In-transit or packing',
      icon: IconClock,
      color: 'bg-blue-50 text-blue-700',
      border: 'border-blue-100',
    },
    {
      label: 'Low Stock Alert',
      value: analytics.lowStockCount ?? 0,
      subtitle: `${analytics.outOfStockCount || 0} out of stock`,
      icon: IconTag,
      color: 'bg-rose-50 text-rose-700',
      border: 'border-rose-100',
    },
  ];

  const recentOrders = analytics.recentOrders || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary" size="sm" className="font-mono uppercase tracking-wider">
              Live Operations
            </Badge>
            <span className="text-xs text-text-muted">KiranaHub Store Control</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-text-primary">
            Store Dashboard
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            Real-time sales, order fulfillment, and inventory monitoring for {user?.name || 'Store Manager'}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            isLoading={isFetching}
            leftIcon={<IconRefresh className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
          <Button
            as={Link}
            to={ROUTES.ADMIN?.ORDERS || '/admin/orders'}
            variant="primary"
            size="sm"
            leftIcon={<IconShoppingBag className="h-4 w-4" />}
          >
            Manage Orders
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="min-h-[40vh] flex items-center justify-center bg-surface rounded-3xl border border-border p-12">
          <LoadingSpinner size="lg" message="Loading store analytics..." />
        </div>
      ) : (
        <>
          {/* Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-xs hover:shadow-card transition-all"
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {stat.label}
                    </span>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${stat.color} shadow-2xs`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="font-display text-2xl lg:text-3xl font-black text-slate-900">
                    {stat.value}
                  </div>
                  <div className="text-xs font-medium text-slate-500 mt-1">{stat.subtitle}</div>
                </motion.div>
              );
            })}
          </div>

          {/* Revenue Breakdown & Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Payment Methods */}
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-xs">
              <h3 className="font-display text-base font-bold text-text-primary mb-4">
                Revenue by Payment Method
              </h3>
              <div className="space-y-3">
                {Object.entries(analytics.paymentBreakdown || {}).map(([method, data]) => (
                  <div
                    key={method}
                    className="flex items-center justify-between p-3 rounded-xl bg-surface-soft border border-border/60"
                  >
                    <div>
                      <span className="font-semibold text-xs text-text-primary">{method}</span>
                      <p className="text-[11px] text-text-muted">{data.count} order(s)</p>
                    </div>
                    <span className="font-bold text-sm text-text-primary">
                      {formatPrice(data.revenue)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-border flex justify-between items-center text-xs">
                <span className="text-text-muted">Total Lifetime Sales</span>
                <span className="font-bold text-brand-700 text-sm">
                  {formatPrice(analytics.totalRevenue || 0)}
                </span>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="lg:col-span-2 rounded-3xl border border-border bg-surface p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-text-primary mb-2">
                  Operational Shortcuts
                </h3>
                <p className="text-xs text-text-muted mb-4">
                  Quickly navigate to frequent operations or update inventory levels.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Link
                    to={ROUTES.ADMIN?.ORDERS || '/admin/orders'}
                    className="p-4 rounded-2xl border border-border bg-surface-soft hover:border-brand-300 hover:shadow-xs transition-all group"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 mb-2 group-hover:scale-105 transition-transform">
                      <IconShoppingBag className="h-5 w-5" />
                    </div>
                    <h4 className="font-semibold text-sm text-text-primary">Live Orders</h4>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      Fulfill, pack, and dispatch
                    </p>
                  </Link>

                  <Link
                    to={ROUTES.ADMIN?.PRODUCTS || '/admin/products'}
                    className="p-4 rounded-2xl border border-border bg-surface-soft hover:border-brand-300 hover:shadow-xs transition-all group"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 mb-2 group-hover:scale-105 transition-transform">
                      <IconTag className="h-5 w-5" />
                    </div>
                    <h4 className="font-semibold text-sm text-text-primary">Stock Updater</h4>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      Inline inventory editing
                    </p>
                  </Link>

                  <Link
                    to={ROUTES.ADMIN?.CATEGORIES || '/admin/categories'}
                    className="p-4 rounded-2xl border border-border bg-surface-soft hover:border-brand-300 hover:shadow-xs transition-all group"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700 mb-2 group-hover:scale-105 transition-transform">
                      <IconGrid className="h-5 w-5" />
                    </div>
                    <h4 className="font-semibold text-sm text-text-primary">Categories</h4>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      Manage department taxonomy
                    </p>
                  </Link>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-text-muted">
                <span>Total Orders Placed: <strong>{analytics.totalOrders || 0}</strong></span>
                <span>Low Stock Threshold: <strong>&lt; 10 units</strong></span>
              </div>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="rounded-3xl border border-border bg-surface shadow-xs overflow-hidden">
            <div className="p-5 sm:px-6 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-text-primary">
                  Recent Orders
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Latest customer orders waiting for dispatch or delivery
                </p>
              </div>

              <Button
                as={Link}
                to={ROUTES.ADMIN?.ORDERS || '/admin/orders'}
                variant="outline"
                size="sm"
                rightIcon={<IconArrowRight className="h-4 w-4" />}
              >
                View All Orders
              </Button>
            </div>

            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-text-muted text-sm">
                No orders placed in the store yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-soft/60 border-b border-border text-text-muted uppercase font-bold tracking-wider">
                    <tr>
                      <th className="px-5 py-3">Order ID</th>
                      <th className="px-5 py-3">Customer</th>
                      <th className="px-5 py-3">Items</th>
                      <th className="px-5 py-3">Grand Total</th>
                      <th className="px-5 py-3">Payment</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentOrders.map((order) => {
                      const badge = STATUS_BADGES[order.orderStatus] || {
                        variant: 'secondary',
                        label: order.orderStatus,
                      };
                      return (
                        <tr key={order._id} className="hover:bg-surface-soft/40 transition-colors">
                          <td className="px-5 py-3.5 font-mono font-bold text-text-primary">
                            #{order._id.slice(-8).toUpperCase()}
                          </td>
                          <td className="px-5 py-3.5">
                            <p className="font-semibold text-text-primary">
                              {order.user?.name || order.deliveryAddress?.receiverName || order.shippingAddress?.fullName || 'Guest Customer'}
                            </p>
                            <p className="text-[11px] text-text-muted">
                              {order.deliveryAddress?.city || order.shippingAddress?.city || 'Local Delivery'}
                              {order.deliveryAddress?.receiverPhone || order.user?.phone ? ` • +91 ${order.deliveryAddress?.receiverPhone || order.user?.phone}` : ''}
                            </p>
                          </td>
                          <td className="px-5 py-3.5 text-text-secondary">
                            {order.items?.length || 0} item(s)
                          </td>
                          <td className="px-5 py-3.5 font-bold font-display text-text-primary">
                            {formatPrice(order.pricing?.grandTotal || 0)}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="font-medium text-[11px] text-text-secondary">
                              {order.paymentMethod}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <Badge variant={badge.variant} size="xs">
                              {badge.label}
                            </Badge>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <Button
                              as={Link}
                              to={ROUTES.ADMIN?.ORDERS || '/admin/orders'}
                              variant="ghost"
                              size="xs"
                            >
                              Manage
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
