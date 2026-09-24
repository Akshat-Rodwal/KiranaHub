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
  CheckSquare,
  Square,
  AlertCircle,
  Store,
  Compass,
} from 'lucide-react';
import deliveryService from '../../services/delivery.service.js';
import { getSocket } from '../../services/socket.js';
import { toast } from '../../components/common/Toast.jsx';
import { formatPrice } from '../../utils/index.js';

// Default Dark Store Coordinates (Connaught Hub, New Delhi)
const DARK_STORE_COORDS = { lat: 28.6328, lng: 77.2167 };
const DARK_STORE_ADDRESS = 'KiranaHub Central Dark Hub #12, Inner Circle, New Delhi';

export default function DeliveryPartnerPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('available'); // 'available' | 'active'
  const [isGpsStreaming, setIsGpsStreaming] = useState(false);
  const [isSimulatingGps, setIsSimulatingGps] = useState(false);
  const [currentCoords, setCurrentCoords] = useState(DARK_STORE_COORDS);
  const [otpInput, setOtpInput] = useState('');
  const [isSubmittingStep, setIsSubmittingStep] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [pickedItems, setPickedItems] = useState({});

  const watchIdRef = useRef(null);
  const simulationIntervalRef = useRef(null);
  const socketRef = useRef(null);

  // Initialize Socket connection
  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;
    socket.emit('join_admin');

    const handleNewOrder = () => {
      fetchOrders(false);
    };

    socket.on('new_order', handleNewOrder);
    socket.on('new_order_alert', handleNewOrder);
    socket.on('order_status_updated', () => {
      fetchOrders(false);
    });

    return () => {
      socket.off('new_order', handleNewOrder);
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

      // Keep active order reference in sync with backend state
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

    // Socket real-time broadcast to customer & admin rooms
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
            toast.warning('GPS hardware unavailable on this device. Switching to simulated route telemetry.');
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

  // Simulated GPS Telemetry (moves rider progressively along route towards customer destination)
  useEffect(() => {
    if (isSimulatingGps && selectedOrder) {
      let progress = 0;
      const targetCoords = selectedOrder.deliveryAddress?.coords || { lat: 28.648, lng: 77.231 };

      simulationIntervalRef.current = setInterval(() => {
        progress += 0.05;
        if (progress > 1) progress = 0;

        const nextLat = DARK_STORE_COORDS.lat + (targetCoords.lat - DARK_STORE_COORDS.lat) * progress;
        const nextLng = DARK_STORE_COORDS.lng + (targetCoords.lng - DARK_STORE_COORDS.lng) * progress;

        broadcastLocation({ lat: nextLat, lng: nextLng });
      }, 2500);
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

      toast.success('Order Claimed! 🛵', {
        description: `Order #${orderId.slice(-6).toUpperCase()} assigned. Head to dark store for item packing.`,
      });

      const orderData = updated.data || updated;
      setSelectedOrder(orderData);
      setActiveTab('active');
      fetchOrders(false);
    } catch (err) {
      toast.error('Failed to accept order', { description: err?.message });
    } finally {
      setIsSubmittingStep(false);
    }
  };

  // Toggle item in picking checklist
  const toggleItemCheck = (idx) => {
    setPickedItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  // Advance Order Step
  const handleStepChange = async (targetStatus) => {
    if (!selectedOrder) return;
    const orderId = selectedOrder._id || selectedOrder.id;

    try {
      setIsSubmittingStep(true);

      // If completing delivery with OTP
      if (targetStatus === 'DELIVERED') {
        if (!otpInput || otpInput.trim().length !== 4) {
          toast.error('Please enter the 4-digit Delivery OTP provided by the customer.');
          return;
        }

        const res = await deliveryService.updateDeliveryStep(orderId, 'DELIVERED', otpInput);
        toast.success('Order Delivered Successfully! 🎉', {
          description: 'Payment verified and payout added to your rider wallet.',
        });
        setSelectedOrder(res.data || res);
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
          description: 'Live GPS location is now streaming to the customer map.',
        });
      } else if (targetStatus === 'PICKED_UP') {
        toast.success('Items Picked Up! 🛍️', {
          description: 'Order bagged. Proceeding to doorstep transit.',
        });
      }

      fetchOrders(false);
    } catch (err) {
      toast.error('Step update failed', { description: err?.message });
    } finally {
      setIsSubmittingStep(false);
    }
  };

  // Google Maps Navigation Link
  const getGoogleMapsNavUrl = (order) => {
    if (!order?.deliveryAddress) return 'https://maps.google.com';
    const coords = order.deliveryAddress.coords;
    if (coords && coords.lat && coords.lng) {
      return `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`;
    }
    const addr = `${order.deliveryAddress.addressLine1}, ${order.deliveryAddress.city || 'New Delhi'}, ${order.deliveryAddress.pincode || ''}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}`;
  };

  // Filter available orders (CONFIRMED status waiting for rider)
  const availableOrders = orders.filter((o) => o.orderStatus === 'CONFIRMED');

  // Determine current active stage (1 to 4)
  const getActiveStageNumber = () => {
    if (!selectedOrder) return 1;
    const st = selectedOrder.orderStatus;
    if (st === 'CONFIRMED') return 1;
    if (st === 'PREPARING') return 2;
    if (st === 'PICKED_UP') return 3;
    if (st === 'OUT_FOR_DELIVERY') return 4;
    if (st === 'DELIVERED') return 5;
    return 1;
  };

  const activeStage = getActiveStageNumber();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased pb-24">
      {/* Light Professional Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 sm:px-6 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-brand">
              🛵
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-black text-base sm:text-lg text-slate-900">
                  KiranaHub Fleet
                </h1>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                  Rider App
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold">Vikram Singh • Fleet #402 • 4.9★</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsOnline(!isOnline)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                  : 'bg-rose-50 text-rose-800 border-rose-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </button>

            <button
              type="button"
              onClick={() => fetchOrders(true)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              title="Refresh Orders"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-5 space-y-5">
        {/* Navigation Tabs (Available vs Active Task) */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('available')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'available'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>Available Dispatches</span>
            <span
              className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                activeTab === 'available' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {availableOrders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'active'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>Active Order Task</span>
            {selectedOrder && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>
        </div>

        {/* TAB 1: Available Orders Tab */}
        {activeTab === 'available' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-black text-lg text-slate-900">
                  Confirmed Orders Ready for Pickup
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Dark store dispatches awaiting partner acceptance
                </p>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {availableOrders.length} available
              </span>
            </div>

            {availableOrders.length === 0 ? (
              <div className="rounded-3xl bg-white border border-slate-200/90 p-8 text-center shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
                  ⚡
                </div>
                <h3 className="font-display font-black text-base text-slate-800">
                  No Dispatches Currently Waiting
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                  As soon as customers place orders and the store manager clicks &quot;Accept &amp; Send to Store&quot;, orders will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {availableOrders.map((order) => {
                  const orderId = (order._id || order.id || '').slice(-6).toUpperCase();
                  const customerName = order.deliveryAddress?.receiverName || order.user?.name || 'Customer';
                  const baseEarning = 45;
                  const tip = order.deliveryTip || 0;
                  const totalPayout = baseEarning + tip;
                  const itemCount = order.items?.length || 0;

                  return (
                    <motion.div
                      key={order._id || order.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-3xl bg-white border border-slate-200 p-5 shadow-xs hover:shadow-card transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-black text-sm text-slate-900">
                            Order #{orderId}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                            Confirmed
                          </span>
                          {tip > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                              <Heart className="w-2.5 h-2.5 fill-rose-500" />
                              +₹{tip} Customer Tip
                            </span>
                          )}
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Estimated Payout
                          </span>
                          <span className="font-display font-black text-lg text-emerald-700">
                            ₹{totalPayout}
                          </span>
                        </div>
                      </div>

                      {/* Dark Store Pickup & Delivery Route Preview */}
                      <div className="py-3.5 space-y-2.5 text-xs">
                        <div className="flex items-start gap-2.5">
                          <Store className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-800">Pickup: </span>
                            <span className="text-slate-600">{DARK_STORE_ADDRESS}</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-800">Deliver To: </span>
                            <span className="text-slate-600">
                              {customerName} • {order.deliveryAddress?.addressLine1}, {order.deliveryAddress?.city}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1 font-semibold">
                          <span>📦 {itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                          <span>⚡ Est. Distance: ~1.8 km</span>
                          <span>💵 {order.paymentMethod || 'ONLINE'}</span>
                        </div>
                      </div>

                      {/* Accept Delivery CTA */}
                      <div className="pt-2">
                        <button
                          type="button"
                          disabled={isSubmittingStep}
                          onClick={() => handleAcceptOrder(order)}
                          className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-brand hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <Bike className="w-4 h-4" />
                          <span>Accept Delivery Task • ₹{totalPayout}</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Active Order Execution Screen (4-Stage State Machine) */}
        {activeTab === 'active' && (
          <div className="space-y-4">
            {!selectedOrder ? (
              <div className="rounded-3xl bg-white border border-slate-200 p-8 text-center shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2 text-xl font-bold">
                  🛵
                </div>
                <h3 className="font-display font-black text-base text-slate-800">
                  No Active Task Selected
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Go to &quot;Available Dispatches&quot; and accept an order to begin execution.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('available')}
                  className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs"
                >
                  View Available Orders
                </button>
              </div>
            ) : (
              <div className="rounded-3xl bg-white border-2 border-emerald-500/60 p-5 sm:p-6 shadow-sm space-y-6">
                {/* Active Task Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white uppercase tracking-wider">
                        Active Fulfillment
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-500">
                        #{selectedOrder._id?.slice(-8).toUpperCase()}
                      </span>
                    </div>
                    <h2 className="font-display font-black text-lg text-slate-900">
                      Deliver to {selectedOrder.deliveryAddress?.receiverName || 'Customer'}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Status:</span>
                    <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 uppercase">
                      {selectedOrder.orderStatus}
                    </span>
                  </div>
                </div>

                {/* 4-Stage Stepper Bar */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  {[
                    { num: 1, label: 'Navigate Store' },
                    { num: 2, label: 'Pick Items' },
                    { num: 3, label: 'Stream GPS' },
                    { num: 4, label: 'Doorstep OTP' },
                  ].map((st) => {
                    const isDone = activeStage > st.num;
                    const isCurrent = activeStage === st.num;
                    return (
                      <div key={st.num} className="flex flex-col items-center">
                        <div
                          className={`w-full h-1.5 rounded-full mb-1.5 transition-all ${
                            isDone
                              ? 'bg-emerald-600'
                              : isCurrent
                              ? 'bg-amber-400 ring-2 ring-amber-200'
                              : 'bg-slate-200'
                          }`}
                        />
                        <span
                          className={`text-[11px] font-black ${
                            isCurrent
                              ? 'text-emerald-700'
                              : isDone
                              ? 'text-slate-800'
                              : 'text-slate-400'
                          }`}
                        >
                          Step {st.num}: {st.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* STAGE 1: Navigate to Dark Store */}
                {activeStage === 1 && (
                  <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-4">
                    <div className="flex items-center gap-2.5">
                      <Store className="w-5 h-5 text-emerald-700" />
                      <div>
                        <h3 className="font-display font-black text-sm text-slate-900">
                          Stage 1: Navigate to Dark Store
                        </h3>
                        <p className="text-xs text-slate-600">
                          Drive to the hub to collect the bagged items.
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs space-y-1">
                      <span className="font-bold text-slate-700 block">Hub Address:</span>
                      <p className="text-slate-600">{DARK_STORE_ADDRESS}</p>
                    </div>

                    <button
                      type="button"
                      disabled={isSubmittingStep}
                      onClick={() => handleStepChange('PREPARING')}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-brand flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Reached Store • Start Item Picking</span>
                    </button>
                  </div>
                )}

                {/* STAGE 2: Pick Items Checklist */}
                {activeStage === 2 && (
                  <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200 space-y-4">
                    <div className="flex items-center gap-2.5">
                      <Package className="w-5 h-5 text-amber-700" />
                      <div>
                        <h3 className="font-display font-black text-sm text-slate-900">
                          Stage 2: Check &amp; Collect Order Items
                        </h3>
                        <p className="text-xs text-slate-600">
                          Verify every customer item is placed in your dispatch bag.
                        </p>
                      </div>
                    </div>

                    {/* Checklist of Items */}
                    <div className="divide-y divide-slate-100 bg-white rounded-xl border border-amber-200 p-2 text-xs">
                      {(selectedOrder.items || []).map((item, idx) => {
                        const isChecked = !!pickedItems[idx];
                        return (
                          <div
                            key={idx}
                            onClick={() => toggleItemCheck(idx)}
                            className="py-2.5 px-3 flex items-center justify-between cursor-pointer hover:bg-amber-50/50 rounded-lg transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              {isChecked ? (
                                <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-300 shrink-0" />
                              )}
                              <span className={`font-bold ${isChecked ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                {item.name}
                              </span>
                            </div>
                            <span className="font-mono font-black text-xs text-emerald-700 shrink-0">
                              Qty: {item.quantity}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      disabled={isSubmittingStep}
                      onClick={() => handleStepChange('PICKED_UP')}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-brand flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>All Items Collected &amp; Bagged ➔ Proceed</span>
                    </button>
                  </div>
                )}

                {/* STAGE 3: Start Delivery & Stream Live GPS */}
                {activeStage === 3 && (
                  <div className="p-5 rounded-2xl bg-teal-50/40 border border-teal-200 space-y-4">
                    <div className="flex items-center gap-2.5">
                      <Radio className="w-5 h-5 text-teal-700 animate-pulse" />
                      <div>
                        <h3 className="font-display font-black text-sm text-slate-900">
                          Stage 3: Start Delivery &amp; Stream Live GPS
                        </h3>
                        <p className="text-xs text-slate-600">
                          Engage transit mode to begin broadcasting rider coordinates to the customer map.
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-teal-200 text-xs flex items-center justify-between">
                      <span className="font-semibold text-slate-700">Live GPS Status:</span>
                      <span className="font-bold text-teal-700 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                        Ready to Stream
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={isSubmittingStep}
                      onClick={() => handleStepChange('OUT_FOR_DELIVERY')}
                      className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-brand flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Bike className="w-4 h-4" />
                      <span>Start Delivery &amp; Stream Live GPS 🛵</span>
                    </button>
                  </div>
                )}

                {/* STAGE 4: Deliver to Doorstep & OTP Verification */}
                {activeStage >= 4 && selectedOrder.orderStatus !== 'DELIVERED' && (
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-rose-600" />
                        <div>
                          <h3 className="font-display font-black text-sm text-slate-900">
                            Stage 4: Doorstep Handover
                          </h3>
                          <p className="text-xs text-slate-500">
                            Navigate to customer, follow preferences, and verify OTP.
                          </p>
                        </div>
                      </div>

                      {/* GPS Live Telemetry Beacon */}
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        GPS Streaming
                      </span>
                    </div>

                    {/* Customer Info & Action Buttons */}
                    <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs space-y-3">
                      <div>
                        <span className="font-bold text-slate-800 block text-sm">
                          {selectedOrder.deliveryAddress?.receiverName || 'Customer'}
                        </span>
                        <p className="text-slate-600 mt-0.5">
                          {selectedOrder.deliveryAddress?.addressLine1}, {selectedOrder.deliveryAddress?.city}
                        </p>
                      </div>

                      {/* Delivery Instructions */}
                      {selectedOrder.deliveryInstructions?.length > 0 && (
                        <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-[11px] font-semibold text-amber-900 flex items-center gap-1.5">
                          <span>📝 Note:</span>
                          <span>
                            {Array.isArray(selectedOrder.deliveryInstructions)
                              ? selectedOrder.deliveryInstructions.join(' • ')
                              : selectedOrder.deliveryInstructions}
                          </span>
                        </div>
                      )}

                      {/* 1-Tap Google Maps & Call Customer */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <a
                          href={getGoogleMapsNavUrl(selectedOrder)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2.5 px-3 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-800 transition-colors shadow-xs"
                        >
                          <Compass className="w-3.5 h-3.5" />
                          <span>Google Maps</span>
                        </a>

                        <a
                          href={`tel:${selectedOrder.deliveryAddress?.receiverPhone || '9876543210'}`}
                          className="py-2.5 px-3 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-700 transition-colors shadow-xs"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call Customer</span>
                        </a>
                      </div>
                    </div>

                    {/* Delivery OTP Input */}
                    <div className="p-4 bg-white rounded-xl border-2 border-emerald-300 space-y-3">
                      <div className="flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-emerald-600" />
                        <span className="font-display font-black text-xs uppercase tracking-wider text-slate-800">
                          Verify Customer Delivery OTP
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Ask the customer for the 4-digit code displayed on their live tracking screen.
                      </p>

                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          maxLength={4}
                          placeholder="4-digit OTP"
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                          className="flex-1 font-mono font-black text-lg tracking-widest text-center py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 bg-slate-50"
                        />

                        <button
                          type="button"
                          disabled={isSubmittingStep || otpInput.length !== 4}
                          onClick={() => handleStepChange('DELIVERED')}
                          className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-brand transition-all cursor-pointer disabled:opacity-50"
                        >
                          {isSubmittingStep ? 'Verifying...' : 'Mark Delivered'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Delivered Screen */}
                {selectedOrder.orderStatus === 'DELIVERED' && (
                  <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto text-xl font-bold shadow-brand">
                      ✓
                    </div>
                    <h3 className="font-display font-black text-lg text-emerald-900">
                      Delivery Completed! 🎉
                    </h3>
                    <p className="text-xs text-emerald-700">
                      Great job, Vikram! Order #{selectedOrder._id?.slice(-6).toUpperCase()} has been delivered and settled.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOrder(null);
                        setActiveTab('available');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs hover:bg-emerald-700 cursor-pointer"
                    >
                      Back to Available Orders
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
