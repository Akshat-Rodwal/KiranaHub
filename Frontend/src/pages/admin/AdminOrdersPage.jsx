import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminService from '../../services/admin.service.js';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import Modal, { useModal } from '../../components/common/Modal.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { toast } from '../../components/common/Toast.jsx';
import { formatPrice } from '../../utils/index.js';
import {
  IconSearch,
  IconRefresh,
  IconEye,
  IconClock,
  IconPhone,
} from '../../utils/icons.jsx';

const STATUS_BADGES = {
  PENDING: { variant: 'secondary', label: 'Order Received' },
  CONFIRMED: { variant: 'primary', label: 'Confirmed' },
  PREPARING: { variant: 'warning', label: 'Packing Items' },
  OUT_FOR_DELIVERY: { variant: 'warning', label: 'Out for Delivery' },
  DELIVERED: { variant: 'success', label: 'Delivered' },
  CANCELLED: { variant: 'danger', label: 'Cancelled' },
};

const NEXT_STATUS_MAP = {
  PENDING: [
    { value: 'CONFIRMED', label: 'Confirm Order' },
    { value: 'CANCELLED', label: 'Cancel Order' },
  ],
  CONFIRMED: [
    { value: 'PREPARING', label: 'Start Packing' },
    { value: 'CANCELLED', label: 'Cancel Order' },
  ],
  PREPARING: [
    { value: 'OUT_FOR_DELIVERY', label: 'Dispatch Delivery' },
    { value: 'CANCELLED', label: 'Cancel Order' },
  ],
  OUT_FOR_DELIVERY: [
    { value: 'DELIVERED', label: 'Mark Delivered' },
    { value: 'CANCELLED', label: 'Cancel Order' },
  ],
  DELIVERED: [], // Terminal
  CANCELLED: [], // Terminal
};

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const orderDetailModal = useModal('admin-order-detail-modal');

  const {
    data: ordersRes,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['admin-orders', { page, status: selectedStatus, search: searchQuery }],
    queryFn: () =>
      adminService.getAdminOrders({
        page,
        limit: 15,
        status: selectedStatus,
        search: searchQuery,
      }),
    staleTime: 5 * 1000,
    refetchInterval: 10 * 1000,
    refetchOnWindowFocus: true,
  });

  const payload = ordersRes?.data || ordersRes || {};
  const orders = payload.orders || [];
  const pagination = payload.pagination || { page: 1, totalPages: 1, total: orders.length };

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }) => adminService.updateOrderStatus(orderId, status),
    onSuccess: (_data, variables) => {
      toast.success('Order Status Updated', {
        description: `Order successfully updated to ${variables.status}`,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-analytics-overview'] });
      if (selectedOrder && selectedOrder._id === variables.orderId) {
        setSelectedOrder((prev) => ({ ...prev, orderStatus: variables.status }));
      }
    },
    onError: (err) => {
      toast.error('Update Failed', {
        description: err?.message || 'Could not update order status.',
      });
    },
  });

  const handleStatusChange = (orderId, newStatus) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const openDetails = (order) => {
    setSelectedOrder(order);
    orderDetailModal.open(order);
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary" size="sm" className="font-mono uppercase tracking-wider">
              Fulfillment Engine
            </Badge>
            <span className="text-xs text-text-muted">Live Dispatch & Delivery Tracking</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-text-primary">
            Orders Management
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            Process customer orders, update delivery milestones, and track live status.
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
            Refresh Orders
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="rounded-3xl border border-border bg-surface p-4 shadow-xs space-y-3">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 border-b border-border pb-3">
          {[
            { id: 'ALL', label: 'All Orders' },
            { id: 'PENDING', label: 'Pending' },
            { id: 'CONFIRMED', label: 'Confirmed' },
            { id: 'PREPARING', label: 'Packing' },
            { id: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
            { id: 'DELIVERED', label: 'Delivered' },
            { id: 'CANCELLED', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setSelectedStatus(tab.id);
                setPage(1);
              }}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                selectedStatus === tab.id
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-surface-soft text-text-secondary hover:bg-border/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search by Order ID, Receiver Name, Phone, or City..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-2xl border border-border bg-surface-soft pl-10 pr-4 py-2 text-xs sm:text-sm text-text-primary focus:border-brand-500 focus:bg-surface focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
            />
          </div>
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery('')}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-3xl border border-border bg-surface shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="min-h-[30vh] flex items-center justify-center p-12">
            <LoadingSpinner size="lg" message="Loading store orders..." />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="font-display font-bold text-base text-text-primary">
              No orders match this filter
            </h3>
            <p className="text-xs text-text-muted mt-1">
              Try switching the status tab or clearing your search term.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-soft/70 border-b border-border text-text-muted uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-5 py-3">Order ID / Date</th>
                  <th className="px-5 py-3">Customer & Location</th>
                  <th className="px-5 py-3">Items</th>
                  <th className="px-5 py-3">Grand Total</th>
                  <th className="px-5 py-3">Current Status</th>
                  <th className="px-5 py-3">Milestone Action</th>
                  <th className="px-5 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => {
                  const badge = STATUS_BADGES[order.orderStatus] || {
                    variant: 'secondary',
                    label: order.orderStatus,
                  };
                  const nextActions = NEXT_STATUS_MAP[order.orderStatus] || [];
                  const isFinalized = order.orderStatus === 'DELIVERED' || order.orderStatus === 'CANCELLED';

                  return (
                    <tr key={order._id} className="hover:bg-surface-soft/40 transition-colors">
                      {/* ID & Date */}
                      <td className="px-5 py-4">
                        <div className="font-mono font-bold text-text-primary">
                          #{order._id.slice(-8).toUpperCase()}
                        </div>
                        <div className="text-[11px] text-text-muted mt-0.5">
                          {formatDate(order.createdAt)}
                        </div>
                      </td>

                      {/* Customer & Location */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-text-primary">
                          {order.user?.name || order.deliveryAddress?.receiverName || order.shippingAddress?.fullName || 'Guest Customer'}
                        </div>
                        <div className="text-[11px] text-text-muted flex items-center gap-1 mt-0.5">
                          <span>{order.deliveryAddress?.city || order.shippingAddress?.city || 'Local Delivery'}</span>
                          <span>•</span>
                          <span>+91 {order.deliveryAddress?.receiverPhone || order.user?.phone || 'N/A'}</span>
                        </div>
                        {order.user?.email && (
                          <div className="text-[10px] text-text-muted/80 truncate max-w-[180px]">
                            {order.user.email}
                          </div>
                        )}
                      </td>

                      {/* Items */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-text-primary">
                          {order.items?.reduce((sum, it) => sum + it.quantity, 0)} unit(s)
                        </div>
                        <div className="text-[11px] text-text-muted truncate max-w-[140px]">
                          {order.items?.map((i) => i.name).join(', ')}
                        </div>
                      </td>

                      {/* Pricing */}
                      <td className="px-5 py-4">
                        <div className="font-bold font-display text-text-primary text-sm">
                          {formatPrice(order.pricing?.grandTotal || 0)}
                        </div>
                        <div className="text-[10px] uppercase font-semibold text-text-muted mt-0.5">
                          {order.paymentMethod} • {order.paymentStatus}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-5 py-4">
                        <Badge variant={badge.variant} size="xs">
                          {badge.label}
                        </Badge>
                      </td>

                      {/* Status Transition Action */}
                      <td className="px-5 py-4">
                        {isFinalized ? (
                          <span className="text-[11px] font-medium text-text-muted italic">
                            Order finalized
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <select
                              value={order.orderStatus}
                              disabled={updateStatusMutation.isPending}
                              onChange={(e) => handleStatusChange(order._id, e.target.value)}
                              className="rounded-xl border border-border bg-surface px-2.5 py-1 text-xs font-medium text-text-primary focus:border-brand-500 focus:outline-none"
                            >
                              <option value={order.orderStatus} disabled>
                                Next Step...
                              </option>
                              {nextActions.map((act) => (
                                <option key={act.value} value={act.value}>
                                  {act.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </td>

                      {/* View Details CTA */}
                      <td className="px-5 py-4 text-right">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => openDetails(order)}
                          leftIcon={<IconEye className="h-3.5 w-3.5" />}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between text-xs">
            <span className="text-text-muted">
              Showing page {page} of {pagination.totalPages} ({pagination.total} total orders)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="xs"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="xs"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <Modal
        id="admin-order-detail-modal"
        title={selectedOrder ? `Order #${selectedOrder._id.slice(-8).toUpperCase()}` : 'Order Details'}
        description={selectedOrder ? `Placed on ${formatDate(selectedOrder.createdAt)}` : ''}
        size="lg"
        hideFooter
      >
        {selectedOrder && (
          <div className="space-y-6 pt-2">
            {/* Top Status & Payment Bar */}
            <div className="p-4 rounded-2xl bg-surface-soft border border-border flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-text-muted">Status:</span>
                <Badge
                  variant={STATUS_BADGES[selectedOrder.orderStatus]?.variant || 'secondary'}
                  size="sm"
                >
                  {STATUS_BADGES[selectedOrder.orderStatus]?.label || selectedOrder.orderStatus}
                </Badge>
              </div>

              <div className="flex items-center gap-3">
                <div>
                  <span className="text-text-muted">Payment: </span>
                  <span className="font-semibold text-text-primary">{selectedOrder.paymentMethod}</span>
                  <span className="ml-1 uppercase text-[10px] font-bold text-brand-700">
                    ({selectedOrder.paymentStatus})
                  </span>
                </div>
                <div className="flex items-center gap-1 text-text-muted">
                  <IconClock className="h-3.5 w-3.5 text-brand-600" />
                  <span>ETA: {selectedOrder.expectedDeliveryTime || '20-30 mins'}</span>
                </div>
              </div>
            </div>

            {/* Customer & Delivery Details */}
            <div className="p-4 rounded-2xl border border-border bg-surface text-xs space-y-1.5">
              <h4 className="font-bold text-text-primary uppercase tracking-wider text-[11px] mb-2">
                Customer & Delivery Address
              </h4>
              <div className="mb-2.5 pb-2 border-b border-border/60">
                <p className="font-bold text-text-primary text-sm">
                  {selectedOrder.user?.name || selectedOrder.deliveryAddress?.receiverName || 'Guest Customer'}
                </p>
                {selectedOrder.user?.email && (
                  <p className="text-text-muted text-[11px]">Email: {selectedOrder.user.email}</p>
                )}
                {selectedOrder.user?.phone && (
                  <p className="text-text-muted text-[11px]">User Phone: +91 {selectedOrder.user.phone}</p>
                )}
              </div>
              <p className="font-semibold text-text-primary">
                Receiver: {selectedOrder.deliveryAddress?.receiverName || 'Recipient'} ({selectedOrder.deliveryAddress?.type || 'Home'})
              </p>
              <p className="text-text-secondary">{selectedOrder.deliveryAddress?.addressLine1}</p>
              {selectedOrder.deliveryAddress?.addressLine2 && (
                <p className="text-text-secondary">{selectedOrder.deliveryAddress?.addressLine2}</p>
              )}
              {selectedOrder.deliveryAddress?.landmark && (
                <p className="text-text-muted">Landmark: {selectedOrder.deliveryAddress?.landmark}</p>
              )}
              <p className="text-text-secondary">
                {selectedOrder.deliveryAddress?.city}, {selectedOrder.deliveryAddress?.state} -{' '}
                {selectedOrder.deliveryAddress?.pincode}
              </p>
              <p className="text-brand-700 font-semibold pt-1 flex items-center gap-1">
                <IconPhone className="h-3.5 w-3.5" />
                +91 {selectedOrder.deliveryAddress?.receiverPhone || selectedOrder.user?.phone || 'N/A'}
              </p>
            </div>

            {/* Items List */}
            <div>
              <h4 className="font-bold text-text-primary uppercase tracking-wider text-[11px] mb-3">
                Order Items ({selectedOrder.items?.length || 0})
              </h4>
              <div className="divide-y divide-border rounded-2xl border border-border overflow-hidden">
                {(selectedOrder.items || []).map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between gap-3 bg-surface">
                    <div className="flex items-center gap-3 min-w-0">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-10 w-10 rounded-xl object-cover border border-border bg-surface-soft shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-text-primary truncate">{item.name}</p>
                        <p className="text-[11px] text-text-muted">
                          Qty: {item.quantity} {item.unit ? `• ${item.unit}` : ''} @ {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-xs text-text-primary shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bill Details */}
            <div className="p-4 rounded-2xl border border-border bg-surface space-y-2 text-xs">
              <h4 className="font-bold text-text-primary uppercase tracking-wider text-[11px] mb-2">
                Payment Breakdown
              </h4>
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal</span>
                <span>{formatPrice(selectedOrder.pricing?.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Delivery Fee</span>
                <span>
                  {selectedOrder.pricing?.deliveryFee === 0 ? (
                    <span className="text-success-600 font-semibold">FREE</span>
                  ) : (
                    formatPrice(selectedOrder.pricing?.deliveryFee || 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Handling Fee</span>
                <span>{formatPrice(selectedOrder.pricing?.handlingFee || 0)}</span>
              </div>
              {selectedOrder.pricing?.discount > 0 && (
                <div className="flex justify-between text-success-600 font-medium">
                  <span>Discount</span>
                  <span>-{formatPrice(selectedOrder.pricing?.discount)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-border flex justify-between font-bold text-sm text-text-primary">
                <span>Grand Total</span>
                <span className="font-display text-brand-700">
                  {formatPrice(selectedOrder.pricing?.grandTotal || 0)}
                </span>
              </div>
            </div>

            {/* Status Progress Action Footer */}
            {selectedOrder.orderStatus !== 'DELIVERED' && selectedOrder.orderStatus !== 'CANCELLED' && (
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs text-text-muted">Progress Order State:</span>
                <div className="flex items-center gap-2">
                  {(NEXT_STATUS_MAP[selectedOrder.orderStatus] || []).map((act) => (
                    <Button
                      key={act.value}
                      variant={act.value === 'CANCELLED' ? 'danger' : 'primary'}
                      size="sm"
                      isLoading={updateStatusMutation.isPending}
                      onClick={() => handleStatusChange(selectedOrder._id, act.value)}
                    >
                      {act.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
