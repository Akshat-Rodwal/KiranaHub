import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Navigation,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  Package,
  Bike,
  Sparkles,
  ExternalLink,
  Shield,
  KeyRound,
  Radio,
  ChevronRight,
  RefreshCw,
  Heart,
} from 'lucide-react';
import deliveryService from '../../services/delivery.service.js';
import { getSocket } from '../../services/socket.js';
import { toast } from '../../components/common/Toast.jsx';
import { formatPrice } from '../../utils/index.js';

// Default Dark Store Coordinates (Connaught Hub, New Delhi)
const DARK_STORE_COORDS = { lat: 28.6328, lng: 77.2167 };

export default function DeliveryPartnerPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isGpsStreaming, setIsGpsStreaming] = useState(false);
  const [isSimulatingGps, setIsSimulatingGps] = useState(false);
  const [currentCoords, setCurrentCoords] = useState(DARK_STORE_COORDS);
  const [otpInput, setOtpInput] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isSubmittingStep, setIsSubmittingStep] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const watchIdRef = useRef(null);
  const simulationIntervalRef = useRef(null);
  const socketRef = useRef(null);

  // Initialize Socket
  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;
    socket.emit('join_admin');

    const handleNewOrder = () => {
      fetchOrders(false);
    };

    socket.on('new_order_alert', handleNewOrder);
    socket.on('order_status_updated', () => {
      fetchOrders(false);
    });

    return () => {
      socket.off('new_order_alert', handleNewOrder);
    };
  }, []);

  // Fetch Active Orders Feed
  const fetchOrders = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const res = await deliveryService.getActiveDeliveryOrders();
      const list = res?.data?.orders || res?.orders || [];
      setOrders(list);

      // Keep selected order updated
      if (selectedOrder) {
        const updated = list.find((o) => (o._id || o.id) === (selectedOrder._id || selectedOrder.id));
        if (updated) setSelectedOrder(updated);
      }
    } catch (err) {
      console.error('Failed to fetch delivery orders:', err);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(true);
    const interval = setInterval(() => fetchOrders(false), 8000);
    return () => clearInterval(interval);
  }, []);

  // Broadcast Location to Socket & Backend
  const broadcastLocation = (coords) => {
    if (!selectedOrder) return;
    const orderId = selectedOrder._id || selectedOrder.id;

    setCurrentCoords(coords);

    // Socket real-time broadcast
    if (socketRef.current) {
      socketRef.current.emit('delivery_partner_location', {
        orderId,
        coords,
      });
    }

    // Backend persistence
    deliveryService.updateDeliveryLocation(orderId, coords).catch(() => {});
  };

  // Real GPS Device Watcher
  useEffect(() => {
    if (isGpsStreaming && selectedOrder) {
      if ('geolocation' in navigator) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            const coords = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            };
            broadcastLocation(coords);
          },
          (err) => {
            console.warn('Geolocation error:', err.message);
            toast.warning('GPS unavailable on this device. Switching to simulated telemetry.');
            setIsGpsStreaming(false);
            setIsSimulatingGps(true);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 3000,
          },
        );
      } else {
        toast.warning('Geolocation not supported. Using simulation mode.');
        setIsGpsStreaming(false);
        setIsSimulatingGps(true);
      }
    } else if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isGpsStreaming, selectedOrder]);

  // Simulated GPS Telemetry (steps along path towards customer destination)
  useEffect(() => {
    if (isSimulatingGps && selectedOrder) {
      let progress = 0;
      const targetCoords = { lat: 28.648, lng: 77.231 }; // Customer Connaught Hub

      simulationIntervalRef.current = setInterval(() => {
        progress += 0.04;
        if (progress > 1) progress = 0;

        const nextLat = DARK_STORE_COORDS.lat + (targetCoords.lat - DARK_STORE_COORDS.lat) * progress;
        const nextLng = DARK_STORE_COORDS.lng + (targetCoords.lng - DARK_STORE_COORDS.lng) * progress;

        broadcastLocation({ lat: nextLat, lng: nextLng });
      }, 3000);
    } else if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }

    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, [isSimulatingGps, selectedOrder]);

  // Accept Order
  const handleAcceptOrder = async (order) => {
    try {
      setIsSubmittingStep(true);
      const orderId = order._id || order.id;
      const updated = await deliveryService.acceptDeliveryOrder(orderId, {
        riderName: 'Vikram Singh',
        riderPhone: '+91 98765 43210',
        coords: currentCoords,
      });

      toast.success('Order Accepted!', {
        description: `Order #${orderId.slice(-6).toUpperCase()} assigned to you. Head to dark store!`,
      });

      setSelectedOrder(updated.data || updated);
      fetchOrders(false);
    } catch (err) {
      toast.error('Failed to accept order', { description: err?.message });
    } finally {
      setIsSubmittingStep(false);
    }
  };

  // Advance Order Step
  const handleStepChange = async (targetStatus) => {
    if (!selectedOrder) return;
    const orderId = selectedOrder._id || selectedOrder.id;

    try {
      setIsSubmittingStep(true);

      // If completing delivery with OTP
      if (targetStatus === 'DELIVERED') {
        const res = await deliveryService.updateDeliveryStep(orderId, 'DELIVERED', otpInput);
        toast.success('Order Delivered! Great job! 🎉', {
          description: 'Payment settled and items handed over.',
        });
        setSelectedOrder(res.data || res);
        setShowOtpModal(false);
        setIsGpsStreaming(false);
        setIsSimulatingGps(false);
        fetchOrders(false);
        return;
      }

      const res = await deliveryService.updateDeliveryStep(orderId, targetStatus);
      const updated = res.data || res;
      setSelectedOrder(updated);

      if (targetStatus === 'OUT_FOR_DELIVERY') {
        setIsSimulatingGps(true); // Automatically engage live GPS broadcast
        toast.success('Dispatched for Delivery! 🛵', {
          description: 'Live GPS location is now broadcasting to customer map.',
        });
      } else if (targetStatus === 'PICKED_UP') {
        toast.success('Items Picked Up! 🛍️', {
          description: 'Order bagged and ready for transit.',
        });
      }

      fetchOrders(false);
    } catch (err) {
      toast.error('Step update failed', { description: err?.message });
    } finally {
      setIsSubmittingStep(false);
    }
  };

  // Google Maps Navigation URL
  const getGoogleMapsNavUrl = (order) => {
    if (!order?.deliveryAddress) return 'https://maps.google.com';
    const addr = `${order.deliveryAddress.addressLine1}, ${order.deliveryAddress.city || 'New Delhi'}, ${order.deliveryAddress.pincode || ''}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased pb-20">
      {/* Top App Header */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-brand">
              🛵
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-black text-base sm:text-lg text-white">
                  KiranaHub Fleet
                </h1>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                  Rider Portal
                </span>
              </div>
              <p className="text-xs text-slate-400">Vikram Singh • Fleet #402</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsOnline(!isOnline)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isOnline
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </button>

            <button
              type="button"
              onClick={() => fetchOrders(true)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh Orders"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* GPS Live Telemetry Status Banner */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${isGpsStreaming || isSimulatingGps ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
              <Radio className={`w-5 h-5 ${isGpsStreaming || isSimulatingGps ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-200 block">
                {isGpsStreaming
                  ? '🟢 Live Device GPS Streaming'
                  : isSimulatingGps
                  ? '⚡ Active Route Telemetry Simulation'
                  : '⚪ GPS Idle'}
              </span>
              <span className="text-[11px] text-slate-400">
                Coords: {currentCoords.lat.toFixed(4)}, {currentCoords.lng.toFixed(4)} • Syncing every 3s
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsSimulatingGps(!isSimulatingGps);
                setIsGpsStreaming(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isSimulatingGps
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {isSimulatingGps ? 'Stop Telemetry' : 'Simulate Ride 🛵'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsGpsStreaming(!isGpsStreaming);
                setIsSimulatingGps(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isGpsStreaming
                  ? 'bg-emerald-600 text-white shadow-brand'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {isGpsStreaming ? 'Streaming GPS' : 'Use Device GPS'}
            </button>
          </div>
        </div>

        {/* Selected Order Fulfillment Card */}
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-4xl bg-slate-900 border-2 border-emerald-500/50 p-6 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-xs font-bold text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800/80"
              >
                Close Task ✕
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500 text-slate-950">
                Active Delivery Task
              </span>
              <span className="text-xs font-mono text-slate-400">
                #{selectedOrder._id?.slice(-8).toUpperCase()}
              </span>
              {selectedOrder.deliveryTip > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  <Heart className="w-3 h-3 fill-rose-400" />
                  +₹{selectedOrder.deliveryTip} Tip
                </span>
              )}
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-5 border-b border-slate-800">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Customer
                </span>
                <p className="font-display font-bold text-lg text-white">
                  {selectedOrder.deliveryAddress?.receiverName || 'Valued Customer'}
                </p>
                <a
                  href={`tel:${selectedOrder.deliveryAddress?.receiverPhone || '9876543210'}`}
                  className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call {selectedOrder.deliveryAddress?.receiverPhone || '9876543210'}</span>
                </a>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Drop Location
                </span>
                <p className="text-sm font-semibold text-slate-200">
                  {selectedOrder.deliveryAddress?.addressLine1}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedOrder.deliveryAddress?.city} - {selectedOrder.deliveryAddress?.pincode}
                </p>
                <a
                  href={getGoogleMapsNavUrl(selectedOrder)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-2 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-brand"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Google Maps Navigation</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Delivery Instructions */}
            {selectedOrder.deliveryInstructions && (
              <div className="py-3 border-b border-slate-800 flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-bold">Preferences:</span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                  {Array.isArray(selectedOrder.deliveryInstructions)
                    ? selectedOrder.deliveryInstructions.join(' • ')
                    : selectedOrder.deliveryInstructions}
                </span>
              </div>
            )}

            {/* Order Items Preview */}
            <div className="py-3 border-b border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Order Items ({selectedOrder.items?.length || 0})
              </span>
              <div className="flex flex-wrap gap-2">
                {(selectedOrder.items || []).map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-xs font-medium text-slate-300"
                  >
                    <span className="font-bold text-emerald-400">{item.quantity}×</span>
                    <span>{item.name || item.product?.name}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Multi-Step Fulfillment Stepper */}
            <div className="mt-6 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Fulfillment Workflow Stepper
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Step 1: Pick Up Items */}
                <button
                  type="button"
                  disabled={isSubmittingStep || selectedOrder.orderStatus === 'DELIVERED'}
                  onClick={() => handleStepChange('PICKED_UP')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    ['PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(selectedOrder.orderStatus)
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 hover:border-emerald-500/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-black uppercase">Step 1</span>
                    {['PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(selectedOrder.orderStatus) && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <p className="font-bold text-sm text-white">Pick Up from Store</p>
                  <p className="text-[11px] text-slate-400 mt-1">Pack items & confirm readiness</p>
                </button>

                {/* Step 2: Start Delivery & Share Location */}
                <button
                  type="button"
                  disabled={isSubmittingStep || selectedOrder.orderStatus === 'DELIVERED'}
                  onClick={() => handleStepChange('OUT_FOR_DELIVERY')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(selectedOrder.orderStatus)
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 hover:border-emerald-500/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-black uppercase">Step 2</span>
                    {['OUT_FOR_DELIVERY', 'DELIVERED'].includes(selectedOrder.orderStatus) && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <p className="font-bold text-sm text-white">Start Transit (Out)</p>
                  <p className="text-[11px] text-slate-400 mt-1">Broadcasts live GPS to customer</p>
                </button>

                {/* Step 3: Mark as Delivered */}
                <button
                  type="button"
                  disabled={isSubmittingStep || selectedOrder.orderStatus === 'DELIVERED'}
                  onClick={() => setShowOtpModal(true)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedOrder.orderStatus === 'DELIVERED'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-brand'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-black uppercase">Step 3</span>
                    {selectedOrder.orderStatus === 'DELIVERED' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <p className="font-bold text-sm text-white">
                    {selectedOrder.orderStatus === 'DELIVERED' ? 'Order Delivered' : 'Complete Delivery'}
                  </p>
                  <p className="text-[11px] text-emerald-100 mt-1">Verify OTP & hand over</p>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Active Orders Feed Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-black text-lg text-white">
                Assigned Delivery Feed
              </h2>
              <p className="text-xs text-slate-400">
                Orders requiring doorstep pickup & instant transit
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-bold text-xs">
              {orders.length} orders
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-32 bg-slate-900 rounded-3xl animate-pulse border border-slate-800" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 bg-slate-900 rounded-4xl border border-slate-800 p-8">
              <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="font-bold text-slate-200">No Orders in Queue</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                New customer orders placed on KiranaHub will immediately appear here via Socket.io pulse.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {orders.map((order) => {
                const orderId = order._id || order.id;
                const isSelected = selectedOrder && (selectedOrder._id || selectedOrder.id) === orderId;

                return (
                  <div
                    key={orderId}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-5 rounded-3xl border transition-all cursor-pointer bg-slate-900 hover:border-emerald-500/60 ${
                      isSelected
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xl'
                        : 'border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="h-9 w-9 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/30">
                          📦
                        </span>
                        <div>
                          <span className="font-mono font-bold text-sm text-white">
                            #{orderId.slice(-8).toUpperCase()}
                          </span>
                          <span className="text-xs text-slate-400 block">
                            {order.deliveryAddress?.receiverName || 'Customer'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          order.orderStatus === 'DELIVERED'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {order.orderStatus}
                        </span>

                        <span className="font-display font-black text-sm text-white">
                          {formatPrice(order.pricing?.grandTotal || 0)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">
                          {order.deliveryAddress?.addressLine1}, {order.deliveryAddress?.city}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {order.deliveryTip > 0 && (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <Heart className="w-3 h-3 fill-emerald-400" />
                            ₹{order.deliveryTip} Tip
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcceptOrder(order);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-1"
                        >
                          <span>Accept & Fulfill</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Delivery OTP Verification Modal */}
      <AnimatePresence>
        {showOtpModal && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-6 h-6 text-emerald-400" />
                <h3 className="font-display font-black text-lg text-white">
                  Verify Delivery OTP
                </h3>
              </div>

              <p className="text-xs text-slate-400">
                Ask the customer for their 4-digit KiranaHub delivery confirmation code.
              </p>

              {/* Debug Helper Display */}
              <div className="p-3 rounded-xl bg-slate-800 text-[11px] text-slate-300 border border-slate-700">
                <span>Customer Order OTP: </span>
                <span className="font-mono font-bold text-emerald-400">
                  {selectedOrder.deliveryOtp || '9842'}
                </span>
              </div>

              <input
                type="text"
                maxLength={6}
                placeholder="Enter 4-digit OTP"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                className="w-full text-center font-mono text-xl tracking-widest px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              />

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmittingStep}
                  onClick={() => handleStepChange('DELIVERED')}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-brand"
                >
                  Confirm Delivery
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
