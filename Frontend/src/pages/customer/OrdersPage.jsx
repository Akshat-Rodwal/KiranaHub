import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import Container from '../../components/common/Container.jsx';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import { toast } from '../../components/common/Toast.jsx';
import apiClient from '../../services/apiClient.js';
import orderService from '../../services/order.service.js';
import LiveOrderTrackerModal from '../../components/order/LiveOrderTrackerModal.jsx';
import { ROUTES } from '../../constants/index.js';
import { formatPrice } from '../../utils/index.js';
import {
  IconShoppingBag,
  IconLocation,
  IconClock,
  IconChevronDown,
  IconRefresh,
  IconArrowRight,
} from '../../utils/icons.jsx';

const DEFAULT_IMAGE_FALLBACK =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80';

const STATUS_BADGES = {
  PENDING: { variant: 'neutral', label: 'Order Received' },
  CONFIRMED: { variant: 'info', label: 'Confirmed' },
  PREPARING: { variant: 'sale', label: 'Packing Items' },
  OUT_FOR_DELIVERY: { variant: 'sale', label: 'Out for Delivery' },
  DELIVERED: { variant: 'discount', label: 'Delivered' },
  CANCELLED: { variant: 'neutral', label: 'Cancelled' },
};

const MILESTONES = [
  { key: 'PENDING', label: 'Placed' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'PREPARING', label: 'Packing' },
  { key: 'OUT_FOR_DELIVERY', label: 'On the Way' },
  { key: 'DELIVERED', label: 'Delivered' },
];

function OrdersSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div className="h-4 w-36 bg-stone-200 rounded" />
            <div className="h-6 w-24 bg-stone-200 rounded-full" />
          </div>
          <div className="h-16 bg-stone-100 rounded-2xl" />
          <div className="flex items-center justify-between pt-2">
            <div className="space-y-2">
              <div className="h-4 w-48 bg-stone-200 rounded" />
              <div className="h-3 w-32 bg-stone-200 rounded" />
            </div>
            <div className="h-8 w-24 bg-stone-200 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

function OrderTrackingStepper({ currentStatus }) {
  const safeStatus = (currentStatus || 'PENDING').toUpperCase();

  if (safeStatus === 'CANCELLED') {
    return (
      <div className="my-3 py-3 px-4 rounded-2xl bg-stone-100 border border-stone-200 text-stone-700 text-xs font-bold flex items-center justify-between shadow-2xs">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          <span>Order Cancelled</span>
        </span>
        <span className="text-[11px] font-semibold text-stone-500">Reserved items returned to inventory</span>
      </div>
    );
  }

  const statusOrder = ['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  const rawIndex = statusOrder.indexOf(safeStatus);
  const currentIndex = rawIndex >= 0 ? rawIndex : 0;

  return (
    <div className="my-5 py-3 px-2 sm:px-4 rounded-2xl bg-stone-50 border border-stone-200/80">
      <div className="relative flex items-center justify-between">
        {/* Background Connecting Line */}
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-stone-200" />
        {/* Active Progress Glowing Line */}
        <div
          className="absolute left-4 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-emerald-600 shadow-sm transition-all duration-700"
          style={{
            width: `${Math.max(
              0,
              Math.min(100, (currentIndex / (statusOrder.length - 1)) * 100),
            )}%`,
          }}
        />

        {MILESTONES.map((step, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center">
              <div
                className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl text-[11px] sm:text-xs font-black transition-all ${
                  isCurrent
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-200 shadow-md shadow-emerald-600/30 animate-pulse'
                    : isDone
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-white border-2 border-stone-300 text-stone-400'
                }`}
              >
                {isDone ? '✓' : idx + 1}
              </div>
              <span
                className={`mt-1.5 text-[10px] sm:text-[11px] font-bold tracking-tight text-center whitespace-nowrap ${
                  isCurrent
                    ? 'font-black text-[#054428]'
                    : isDone
                    ? 'text-stone-800'
                    : 'text-stone-400 hidden sm:block'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [expandedOrders, setExpandedOrders] = useState({});
  const [cancellingId, setCancellingId] = useState(null);
  const [trackingOrder, setTrackingOrder] = useState(null);

  const fetchOrders = useCallback(async (targetPage = 1) => {
    try {
      setIsRefreshing(true);
      const response = await apiClient.get('/orders/my-orders', {
        params: { page: targetPage, limit: 10 },
      });

      const data = response?.data || response;
      const orderList = Array.isArray(data)
        ? data
        : Array.isArray(data?.orders)
        ? data.orders
        : Array.isArray(response?.orders)
        ? response.orders
        : [];

      setOrders(Array.isArray(orderList) ? orderList : []);

      if (data?.pagination) {
        setPagination(data.pagination);
      } else {
        setPagination({ page: targetPage, totalPages: 1, total: orderList.length });
      }
    } catch (err) {
      console.error('Failed to load customer orders:', err);
      setError(err?.message || 'Unable to load orders at this moment.');
      setOrders([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isSubscribed = true;

    const loadInitialOrders = async () => {
      try {
        const response = await apiClient.get('/orders/my-orders', {
          params: { page, limit: 10 },
        });
        if (!isSubscribed) return;
        const data = response?.data || response;
        const orderList = Array.isArray(data)
          ? data
          : Array.isArray(data?.orders)
          ? data.orders
          : Array.isArray(response?.orders)
          ? response.orders
          : [];

        setOrders(Array.isArray(orderList) ? orderList : []);

        if (data?.pagination) {
          setPagination(data.pagination);
        } else {
          setPagination({ page, totalPages: 1, total: orderList.length });
        }
      } catch (err) {
        if (!isSubscribed) return;
        console.error('Failed to load customer orders:', err);
        setError(err?.message || 'Unable to load orders at this moment.');
        setOrders([]);
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    };

    loadInitialOrders();

    // Auto-polling interval every 10 seconds for real-time status updates
    const interval = setInterval(() => {
      apiClient
        .get('/orders/my-orders', { params: { page, limit: 10 } })
        .then((res) => {
          if (!isSubscribed) return;
          const d = res?.data || res;
          const list = Array.isArray(d)
            ? d
            : Array.isArray(d?.orders)
            ? d.orders
            : Array.isArray(res?.orders)
            ? res.orders
            : [];
          setOrders(Array.isArray(list) ? list : []);
          if (d?.pagination) setPagination(d.pagination);
        })
        .catch(() => {});
    }, 10000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [page]);

  const handleCancelOrder = async (orderId) => {
    if (
      window.confirm(
        'Are you sure you want to cancel this order? Reserved items will be automatically restocked into store inventory.',
      )
    ) {
      try {
        setCancellingId(orderId);
        await orderService.cancelCustomerOrder(orderId);
        toast.success('Order Cancelled', {
          description: 'Your order was cancelled and items have been returned to store inventory.',
        });
        await fetchOrders(page, false);
      } catch (err) {
        toast.error('Cancellation Failed', {
          description: err?.message || 'Could not cancel order.',
        });
      } finally {
        setCancellingId(null);
      }
    }
  };

  const toggleExpand = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const filteredOrders = (Array.isArray(orders) ? orders : []).filter((order) => {
    if (!order) return false;
    const status = (order.orderStatus || 'PENDING').toUpperCase();
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'ACTIVE') {
      return ['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY'].includes(status);
    }
    if (selectedFilter === 'DELIVERED') {
      return status === 'DELIVERED';
    }
    if (selectedFilter === 'CANCELLED') {
      return status === 'CANCELLED';
    }
    return true;
  });

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  // 1. Loading Skeleton Guard (Returns early to prevent undefined access crashes)
  if (isLoading) {
    return (
      <div className="py-8 lg:py-12 min-h-[75vh] bg-[#f7f9f7]">
        <Container>
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-black text-stone-900">
                  My Orders
                </h1>
                <p className="text-sm text-stone-500 mt-1">
                  View your order history, track live deliveries, and download receipts
                </p>
              </div>
            </div>
            <OrdersSkeleton />
          </div>
        </Container>
      </div>
    );
  }

  // 2. Error View Guard
  if (error) {
    return (
      <div className="py-8 lg:py-12 min-h-[75vh] bg-[#f7f9f7]">
        <Container>
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
              <p className="font-semibold text-red-800">Unable to load orders</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchOrders(page, true)}
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-8 lg:py-12 min-h-[75vh] bg-[#f7f9f7]">
      <Container>
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-black text-stone-900">
                My Orders
              </h1>
              <p className="text-sm text-stone-500 mt-1">
                View your order history, track live deliveries, and download receipts
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchOrders(page, false)}
                isLoading={isRefreshing}
                leftIcon={<IconRefresh className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
              >
                Refresh
              </Button>
              <Button
                as={Link}
                to={ROUTES.PRODUCTS}
                variant="primary"
                size="sm"
                leftIcon={<IconShoppingBag className="h-4 w-4" />}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Shop More
              </Button>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-stone-200/80 pb-4">
            {[
              { id: 'ALL', label: 'All Orders' },
              { id: 'ACTIVE', label: 'Active / In-transit' },
              { id: 'DELIVERED', label: 'Delivered' },
              { id: 'CANCELLED', label: 'Cancelled' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedFilter(tab.id)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  selectedFilter === tab.id
                    ? 'bg-[#054428] text-[#ccff00] shadow-sm font-extrabold'
                    : 'bg-white text-stone-600 border border-stone-200/80 hover:bg-stone-50 hover:text-stone-900 shadow-2xs'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Defensive Orders List Render */}
          {Array.isArray(filteredOrders) && filteredOrders.length === 0 ? (
            <div className="rounded-3xl border border-stone-200 bg-white p-12 text-center shadow-xs">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <IconShoppingBag className="h-8 w-8" />
              </div>
              <h3 className="font-display text-lg font-bold text-stone-900">
                {selectedFilter === 'ALL'
                  ? 'No orders placed yet'
                  : `No ${selectedFilter.toLowerCase()} orders`}
              </h3>
              <p className="mx-auto mt-1 max-w-sm text-sm text-stone-500">
                {selectedFilter === 'ALL'
                  ? 'Stock up on fresh fruits, dairy, snacks, and daily groceries delivered to your door in 8-10 minutes.'
                  : 'You have no orders under this status filter.'}
              </p>
              <Button
                as={Link}
                to={ROUTES.PRODUCTS}
                variant="primary"
                size="md"
                className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                rightIcon={<IconArrowRight className="h-4 w-4" />}
              >
                Start Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const orderId = order?._id || order?.id || 'N/A';
                const isExpanded = Boolean(expandedOrders[orderId]);
                const badgeInfo = STATUS_BADGES[order?.orderStatus] || {
                  variant: 'neutral',
                  label: order?.orderStatus || 'Pending',
                };
                const totalItemQty = Array.isArray(order?.items)
                  ? order.items.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0)
                  : 0;
                const isPending = order?.orderStatus === 'PENDING';

                return (
                  <motion.div
                    key={orderId}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-xs transition-all hover:border-emerald-300 hover:shadow-card"
                  >
                    {/* Order Top Bar */}
                    <div className="border-b border-stone-200/60 bg-stone-50/60 px-5 py-3.5 sm:px-6 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <div>
                          <span className="text-stone-400 font-medium">Order ID: </span>
                          <span className="font-mono font-black text-stone-900">
                            #{String(orderId).slice(-8).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-stone-300 hidden sm:inline">•</span>
                        <div>
                          <span className="text-stone-400 font-medium">Placed: </span>
                          <span className="font-bold text-stone-800">
                            {formatDate(order?.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant={badgeInfo.variant} size="sm">
                          {badgeInfo.label}
                        </Badge>
                      </div>
                    </div>

                    {/* Order Body Summary */}
                    <div className="p-5 sm:p-6">
                      {/* Visual Order Tracking Stepper */}
                      <OrderTrackingStepper currentStatus={order?.orderStatus} />

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 pt-3 border-t border-stone-100">
                        {/* Quick preview of items */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900 text-sm">
                              {totalItemQty} {totalItemQty === 1 ? 'item' : 'items'}
                            </span>
                            <span className="text-stone-300 text-xs">•</span>
                            <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-100">
                              <IconClock className="h-3 w-3 text-emerald-600" />
                              {order?.orderStatus === 'DELIVERED'
                                ? 'Delivered'
                                : `ETA: ${order?.expectedDeliveryTime || '8-10 mins'}`}
                            </span>
                          </div>

                          <p className="mt-1 text-xs text-stone-600 truncate font-medium">
                            {(order?.items || [])
                              .map(
                                (it) =>
                                  `${it?.name || it?.product?.name || 'Item'} (${it?.quantity || 1})`,
                              )
                              .join(', ')}
                          </p>

                          <div className="mt-2 flex items-center gap-1.5 text-xs text-stone-400">
                            <IconLocation className="h-3.5 w-3.5 shrink-0 text-stone-400" />
                            <span className="truncate">
                              {order?.deliveryAddress?.addressLine1 ||
                                order?.shippingAddress?.addressLine1 ||
                                ''}
                              {order?.deliveryAddress?.city
                                ? `, ${order.deliveryAddress.city}`
                                : order?.shippingAddress?.city
                                ? `, ${order.shippingAddress.city}`
                                : ''}
                              {order?.deliveryAddress?.pincode
                                ? ` - ${order.deliveryAddress.pincode}`
                                : order?.shippingAddress?.pincode
                                ? ` - ${order.shippingAddress.pincode}`
                                : ''}
                            </span>
                          </div>
                        </div>

                        {/* Price & Action */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100">
                          <div className="sm:text-right">
                            <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                              Total
                            </div>
                            <div className="text-lg font-black font-display text-stone-950">
                              {formatPrice(order?.pricing?.grandTotal || 0)}
                            </div>
                            <span className="text-[10px] uppercase tracking-wider font-bold text-stone-500">
                              {order?.paymentMethod || 'COD'} • {order?.paymentStatus || 'PENDING'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Track Live Option for active orders */}
                            {['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY'].includes((order?.orderStatus || '').toUpperCase()) && (
                              <button
                                type="button"
                                onClick={() => setTrackingOrder(order)}
                                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
                              >
                                <span>🛵 Track Live</span>
                              </button>
                            )}

                            {/* Cancellation option strictly for PENDING orders */}
                            {isPending && (
                              <button
                                type="button"
                                disabled={cancellingId === orderId}
                                onClick={() => handleCancelOrder(orderId)}
                                className="px-3.5 py-1.5 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 font-bold text-xs transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                              >
                                {cancellingId === orderId ? 'Cancelling...' : 'Cancel Order'}
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => toggleExpand(orderId)}
                              className="px-3.5 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-700 hover:border-stone-300 font-bold text-xs transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>{isExpanded ? 'Hide' : 'Details'}</span>
                              <IconChevronDown
                                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                                  isExpanded ? 'rotate-180' : ''
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expandable Order Details Drawer */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="mt-6 border-t border-stone-100 pt-6 overflow-hidden"
                          >
                            {/* Items List */}
                            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
                              Ordered Items
                            </h4>
                            <div className="divide-y divide-stone-100 rounded-2xl border border-stone-200 bg-stone-50/50 p-3 sm:p-4">
                              {(order?.items || []).map((item, idx) => {
                                const thumb =
                                  item?.image ||
                                  item?.product?.images?.[0]?.url ||
                                  item?.product?.imageUrl ||
                                  DEFAULT_IMAGE_FALLBACK;

                                return (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 gap-3"
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <img
                                        src={thumb}
                                        alt={item?.name || item?.product?.name || 'Item'}
                                        className="h-11 w-11 rounded-xl object-contain bg-white border border-stone-200/80 p-0.5 shrink-0"
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src = DEFAULT_IMAGE_FALLBACK;
                                        }}
                                      />
                                      <div className="min-w-0">
                                        <p className="font-semibold text-xs sm:text-sm text-stone-900 truncate">
                                          {item?.name || item?.product?.name || 'Product'}
                                        </p>
                                        <p className="text-[11px] text-stone-500">
                                          Qty: {item?.quantity || 1}{' '}
                                          {item?.unit ? `• ${item.unit}` : ''} @{' '}
                                          {formatPrice(item?.price || item?.product?.price || 0)} each
                                        </p>
                                      </div>
                                    </div>

                                    <div className="text-right shrink-0">
                                      <span className="font-bold text-xs sm:text-sm text-stone-900">
                                        {formatPrice(
                                          (item?.price || item?.product?.price || 0) *
                                            (item?.quantity || 1),
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Summary & Address Grid */}
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Delivery Details */}
                              <div className="rounded-2xl border border-stone-200 p-4 bg-white">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                                  Delivery Address
                                </h4>
                                <div className="text-xs space-y-1 text-stone-600">
                                  <p className="font-bold text-stone-900">
                                    {order?.deliveryAddress?.receiverName ||
                                      order?.shippingAddress?.fullName ||
                                      'Customer'}{' '}
                                    (
                                    {order?.deliveryAddress?.type ||
                                      order?.shippingAddress?.type ||
                                      'Home'}
                                    )
                                  </p>
                                  <p>
                                    {order?.deliveryAddress?.addressLine1 ||
                                      order?.shippingAddress?.addressLine1}
                                  </p>
                                  {(order?.deliveryAddress?.addressLine2 ||
                                    order?.shippingAddress?.addressLine2) && (
                                    <p>
                                      {order?.deliveryAddress?.addressLine2 ||
                                        order?.shippingAddress?.addressLine2}
                                    </p>
                                  )}
                                  {order?.deliveryAddress?.landmark && (
                                    <p>Landmark: {order.deliveryAddress.landmark}</p>
                                  )}
                                  <p>
                                    {order?.deliveryAddress?.city ||
                                      order?.shippingAddress?.city}
                                    ,{' '}
                                    {order?.deliveryAddress?.state ||
                                      order?.shippingAddress?.state}{' '}
                                    -{' '}
                                    {order?.deliveryAddress?.pincode ||
                                      order?.shippingAddress?.pincode}
                                  </p>
                                  <p className="text-stone-400 pt-1">
                                    Phone: +91{' '}
                                    {order?.deliveryAddress?.receiverPhone ||
                                      order?.shippingAddress?.phone ||
                                      'N/A'}
                                  </p>
                                </div>
                              </div>

                              {/* Bill Breakdown */}
                              <div className="rounded-2xl border border-stone-200 p-4 bg-white space-y-2 text-xs">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                                  Payment & Bill Breakdown
                                </h4>
                                <div className="flex justify-between text-stone-600">
                                  <span>Subtotal</span>
                                  <span>{formatPrice(order?.pricing?.subtotal || 0)}</span>
                                </div>
                                <div className="flex justify-between text-stone-600">
                                  <span>Delivery Fee</span>
                                  <span>
                                    {order?.pricing?.deliveryFee === 0 ? (
                                      <span className="font-bold text-emerald-600">FREE</span>
                                    ) : (
                                      formatPrice(order?.pricing?.deliveryFee || 0)
                                    )}
                                  </span>
                                </div>
                                <div className="flex justify-between text-stone-600">
                                  <span>Packaging / Handling Fee</span>
                                  <span>
                                    {formatPrice(
                                      order?.pricing?.handlingFee || order?.pricing?.tax || 2,
                                    )}
                                  </span>
                                </div>
                                {order?.pricing?.discount > 0 && (
                                  <div className="flex justify-between text-emerald-600 font-bold">
                                    <span>Discount Applied</span>
                                    <span>− {formatPrice(order.pricing.discount)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between pt-2 border-t border-stone-100 font-black text-sm text-stone-900">
                                  <span>Grand Total</span>
                                  <span className="font-display text-[#054428]">
                                    {formatPrice(order?.pricing?.grandTotal || 0)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold text-stone-700 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs font-semibold text-stone-500">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold text-stone-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </Container>

      {/* Live Order Tracker Modal */}
      <LiveOrderTrackerModal
        isOpen={Boolean(trackingOrder)}
        onClose={() => setTrackingOrder(null)}
        order={trackingOrder}
      />
    </div>
  );
}
