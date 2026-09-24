import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronRight, Navigation, Sparkles } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore.js';
import orderService from '../../services/order.service.js';
import { getSocket } from '../../services/socket.js';
import LiveOrderTrackerModal from './LiveOrderTrackerModal.jsx';

export default function ActiveOrderBottomBar() {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);

  // Fetch recent customer orders to find any in-flight order
  const {
    data: ordersRes,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ['my-active-orders', user?._id || user?.id],
    queryFn: () => orderService.getMyOrders({ page: 1, limit: 5 }),
    enabled: !!isAuthenticated,
    staleTime: 5 * 1000,
    refetchInterval: 10 * 1000,
  });

  const ordersPayload = ordersRes?.data || ordersRes || {};
  const ordersList = ordersPayload.orders || (Array.isArray(ordersPayload) ? ordersPayload : []);

  // Find active order (not DELIVERED and not CANCELLED)
  const activeOrder = ordersList.find(
    (o) => o.orderStatus && !['DELIVERED', 'CANCELLED'].includes(o.orderStatus)
  );

  // Real-time socket listener for status transitions
  useEffect(() => {
    if (!isAuthenticated || !activeOrder) return;

    const socket = getSocket();
    const orderId = activeOrder._id || activeOrder.id;
    socket.emit('join_order', orderId);

    const handleUpdate = () => {
      refetchOrders();
    };

    socket.on('order_status_updated', handleUpdate);

    return () => {
      socket.off('order_status_updated', handleUpdate);
    };
  }, [isAuthenticated, activeOrder, refetchOrders]);

  if (!isAuthenticated || !activeOrder || location.pathname === '/checkout') {
    return null;
  }

  const status = activeOrder.orderStatus;
  const orderNumber = (activeOrder._id || activeOrder.id || '').slice(-6).toUpperCase();

  // Dynamic Instamart status text & ETA
  let statusText = 'Partner is on the way';
  let etaText = 'Arriving in 10-15 mins';

  if (status === 'PENDING') {
    statusText = 'Order placed • Store confirmation pending';
    etaText = 'Arriving in 15 mins';
  } else if (status === 'CONFIRMED') {
    statusText = 'Order confirmed • Hub packing items';
    etaText = 'Arriving in 12 mins';
  } else if (status === 'PREPARING') {
    statusText = 'Partner heading to dark store';
    etaText = 'Arriving in 10 mins';
  } else if (status === 'PICKED_UP') {
    statusText = 'Order picked up • Vikram is on the way';
    etaText = 'Arriving in 8 mins';
  } else if (status === 'OUT_FOR_DELIVERY') {
    statusText = 'Live GPS active • Partner on the way';
    etaText = 'Arriving in 5 mins';
  }

  return (
    <>
      <AnimatePresence>
        <motion.aside
          initial={{ y: 80, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-lg w-[calc(100%-2rem)]"
          aria-label="Active order status bar"
        >
          <div
            onClick={() => setIsTrackerOpen(true)}
            className="group w-full rounded-full bg-slate-900/95 backdrop-blur-xl border border-emerald-500/40 p-2 sm:px-4 sm:py-2.5 shadow-2xl shadow-emerald-950/40 hover:border-emerald-400 flex items-center justify-between gap-3 transition-all active:scale-[0.98] cursor-pointer"
          >
            {/* Left: Animated Scooter & Real-Time Status */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-emerald-600 text-white shrink-0 shadow-brand">
                <span className="text-xl animate-bounce">🛵</span>
                <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-black text-xs sm:text-sm text-white truncate">
                    {etaText}
                  </span>
                  <span className="hidden sm:inline-block text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-500/30">
                    #{orderNumber}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-300 font-medium truncate mt-0.5">
                  {statusText}
                </p>
              </div>
            </div>

            {/* Right: Track CTA */}
            <div className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3.5 py-1.5 sm:py-2 rounded-full font-black text-xs shrink-0 shadow-brand transition-colors">
              <span>Track Order</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </motion.aside>
      </AnimatePresence>

      {/* Live Tracking Modal triggered without leaving page */}
      {isTrackerOpen && (
        <LiveOrderTrackerModal
          order={activeOrder}
          isOpen={isTrackerOpen}
          onClose={() => setIsTrackerOpen(false)}
        />
      )}
    </>
  );
}
