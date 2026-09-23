import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';

import Container from '../../components/common/Container.jsx';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import LiveOrderTrackerModal from '../../components/order/LiveOrderTrackerModal.jsx';
import orderService from '../../services/order.service.js';
import { ROUTES } from '../../constants/index.js';
import { formatPrice } from '../../utils/index.js';

export default function OrderSuccessPage() {
  const { orderId } = useParams();
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);

  const { data: orderRes, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderService.getOrderById(orderId),
    enabled: Boolean(orderId),
    staleTime: 60 * 1000,
  });

  const order = orderRes?.data || orderRes;

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" message="Fetching your order details..." />
      </div>
    );
  }

  return (
    <div className="py-10 lg:py-16 min-h-[80vh] bg-surface-soft flex items-center justify-center">
      <Container size="sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="mx-auto max-w-xl text-center"
        >
          {/* Success Checkmark Badge */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 shadow-brand">
            <motion.svg
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 20 }}
              className="h-10 w-10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <polyline points="20 6 9 17 4 12" />
            </motion.svg>
          </div>

          <Badge variant="success" size="md" className="font-bold tracking-wide">
            Order Confirmed
          </Badge>

          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary mt-3">
            Thank you for shopping with KiranaHub!
          </h1>
          <p className="text-sm text-text-muted mt-2 max-w-md mx-auto">
            Your order has been received and our neighborhood Kirana team is already packing your fresh items.
          </p>

          {/* Delivery ETA Card */}
          <div className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-xs text-left">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div>
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Order Number
                </span>
                <p className="font-mono text-sm font-bold text-text-primary mt-0.5">
                  #{orderId?.slice(-8).toUpperCase()}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Status
                </span>
                <div className="mt-0.5">
                  <Badge variant="primary" size="xs">
                    {order?.orderStatus || 'CONFIRMED'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Estimated Time */}
            <div className="flex items-center gap-3.5 my-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-lg shadow-xs">
                ⚡
              </div>
              <div>
                <span className="font-bold text-sm text-slate-900">
                  Estimated Delivery: {order?.expectedDeliveryTime || '10-15 mins'}
                </span>
                <p className="text-xs text-emerald-800 font-medium mt-0.5">
                  Live partner GPS dispatch ready • Follow your bag on the map
                </p>
              </div>
            </div>

            {/* Address & Items Summary */}
            {order?.deliveryAddress && (
              <div className="py-3 border-t border-stone-100 text-xs text-text-secondary">
                <span className="font-semibold text-text-primary block mb-1">
                  Delivering to:
                </span>
                <p>
                  {order.deliveryAddress.receiverName} ({order.deliveryAddress.receiverPhone})
                </p>
                <p className="text-text-muted mt-0.5">
                  {order.deliveryAddress.addressLine1}, {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
                </p>
              </div>
            )}

            {/* Pricing Total */}
            {order?.pricing && (
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-sm">
                <span className="font-bold text-text-primary">Total Paid:</span>
                <span className="font-display font-extrabold text-emerald-700 text-lg">
                  {formatPrice(order.pricing.grandTotal)}
                </span>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => setIsTrackerOpen(true)}
              className="py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm tracking-wide shadow-brand hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🛵 Track Live Delivery</span>
            </button>
            <Button
              as={Link}
              to={ROUTES.ORDERS}
              variant="outline"
              size="lg"
            >
              View All Orders
            </Button>
            <Button
              as={Link}
              to={ROUTES.HOME}
              variant="ghost"
              size="lg"
            >
              Continue Shopping
            </Button>
          </div>
        </motion.div>
      </Container>

      {/* Live Order Tracker Modal with Mapbox */}
      <LiveOrderTrackerModal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        order={order}
      />
    </div>
  );
}
