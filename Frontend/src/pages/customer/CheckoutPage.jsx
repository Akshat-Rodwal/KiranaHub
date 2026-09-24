import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ShieldCheck, Heart, Sparkles, AlertCircle } from 'lucide-react';

import Container from '../../components/common/Container.jsx';
import Input from '../../components/common/Input.jsx';
import { toast } from '../../components/common/Toast.jsx';
import useAuthStore from '../../store/useAuthStore.js';
import useCartStore from '../../store/useCartStore.js';
import orderService from '../../services/order.service.js';
import paymentService from '../../services/payment.service.js';
import cartHoldService from '../../services/cartHold.service.js';
import { ROUTES } from '../../constants/index.js';
import { formatPrice } from '../../utils/index.js';
import {
  IconShield,
  IconArrowRight,
  IconLocation,
} from '../../utils/icons.jsx';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, subtotal, deliveryFee, handlingFee, discount, total, clearCart } = useCartStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 5-Minute Inventory Hold State
  const [cartToken] = useState(() => {
    let t = sessionStorage.getItem('kh_cart_token');
    if (!t) {
      t = 'cart_' + Math.random().toString(36).substring(2, 10);
      sessionStorage.setItem('kh_cart_token', t);
    }
    return t;
  });
  const [reserveSecondsLeft, setReserveSecondsLeft] = useState(300);
  const [isHoldActive, setIsHoldActive] = useState(false);

  // Step 1: Address selection / creation
  const savedAddresses = user?.addresses || [];
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [isCustomAddress, setIsCustomAddress] = useState(savedAddresses.length === 0);

  const [addressForm, setAddressForm] = useState({
    type: 'HOME',
    receiverName: user?.name || '',
    receiverPhone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Step 2: Delivery Slot & Instructions & Tip
  const [deliverySlot, setDeliverySlot] = useState('EXPRESS');
  const [deliveryTip, setDeliveryTip] = useState(20);
  const [selectedInstruction, setSelectedInstruction] = useState('Do not ring bell');
  const [customInstruction, setCustomInstruction] = useState('');

  // Step 3: Payment Method selection
  const [paymentMethod, setPaymentMethod] = useState('COD');

  // Total with Rider Tip
  const finalPayableTotal = Math.max(0, total + (deliveryTip || 0));

  useEffect(() => {
    if (items.length === 0) {
      navigate(ROUTES.CART);
    }
  }, [items.length, navigate]);

  // Inventory Hold effect
  useEffect(() => {
    if (items.length === 0) return;

    let timerInterval = null;
    const holdInventory = async () => {
      try {
        const payload = items.map((i) => ({
          product: i.productId || i.id,
          quantity: i.quantity,
        }));
        await cartHoldService.reserveStock(payload, cartToken);
        setIsHoldActive(true);
        setReserveSecondsLeft(300);

        timerInterval = setInterval(() => {
          setReserveSecondsLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timerInterval);
              toast.warning('Reservation expired', {
                description: 'Stock is now released to other shoppers.',
              });
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } catch (err) {
        console.warn('Stock hold notice:', err?.message);
      }
    };

    holdInventory();

    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [items, cartToken]);

  const formatCountdown = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleAddressChange = (field, value) => {
    setAddressForm((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateAddress = () => {
    if (!isCustomAddress && savedAddresses.length > 0) {
      return true;
    }

    const errs = {};
    if (!addressForm.receiverName.trim()) errs.receiverName = 'Receiver name is required';
    const cleanPhone = addressForm.receiverPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      errs.receiverPhone = 'Valid 10-digit mobile number is required';
    }
    if (!addressForm.addressLine1.trim()) {
      errs.addressLine1 = 'House/Flat/Street is required';
    }
    if (!addressForm.city.trim()) errs.city = 'City is required';
    if (!addressForm.state.trim()) errs.state = 'State is required';
    const cleanPin = addressForm.pincode.replace(/\D/g, '');
    if (!cleanPin || cleanPin.length !== 6) {
      errs.pincode = 'Valid 6-digit pincode is required';
    }

    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (isSubmitting) return; // Prevent rapid double-clicks from firing concurrent create-order requests
    setErrorMessage('');
    if (!validateAddress()) {
      toast.error('Please complete the delivery address');
      return;
    }

    let finalAddress;
    if (!isCustomAddress && savedAddresses.length > 0) {
      const saved = savedAddresses[selectedAddressIndex] || savedAddresses[0];
      finalAddress = {
        type: saved.label || 'HOME',
        receiverName: user?.name || 'Customer',
        receiverPhone: user?.phone || '9876543210',
        addressLine1: saved.street || 'Main Street',
        addressLine2: '',
        landmark: '',
        city: saved.city || 'New Delhi',
        state: saved.state || 'Delhi',
        pincode: saved.pincode || '110001',
      };
    } else {
      finalAddress = {
        type: addressForm.type,
        receiverName: addressForm.receiverName.trim(),
        receiverPhone: addressForm.receiverPhone.replace(/\D/g, ''),
        addressLine1: addressForm.addressLine1.trim(),
        addressLine2: addressForm.addressLine2.trim(),
        landmark: addressForm.landmark.trim(),
        city: addressForm.city.trim(),
        state: addressForm.state.trim(),
        pincode: addressForm.pincode.replace(/\D/g, ''),
      };
    }

    const instructions = customInstruction
      ? `${selectedInstruction} - ${customInstruction}`
      : selectedInstruction;

    const orderPayload = {
      items: items.map((i) => ({
        product: i.productId || i.id,
        quantity: i.quantity,
      })),
      deliveryAddress: finalAddress,
      paymentMethod: paymentMethod === 'COD' ? 'COD' : 'ONLINE',
      deliveryTip: deliveryTip || 0,
      deliveryInstructions: instructions || 'Deliver to doorstep',
      cartToken,
    };

    setIsSubmitting(true);

    try {
      if (paymentMethod === 'COD') {
        const result = await orderService.createOrder(orderPayload);
        const placedOrder = result.data || result;
        const orderId = placedOrder._id || placedOrder.id;

        clearCart();
        toast.success('Order Placed Successfully!', {
          description: `Order #${orderId.slice(-6).toUpperCase()} is being prepared.`,
        });

        navigate(`/order-success/${orderId}`, { replace: true });
      } else {
        // Razorpay Gateway Flow (P1)
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
        }

        // 1. Create order record in backend
        const result = await orderService.createOrder(orderPayload);
        const placedOrder = result.data || result;
        const orderId = placedOrder._id || placedOrder.id;

        // 2. Generate Razorpay checkout order
        const rzpDataRes = await paymentService.createRazorpayOrder(orderId);
        const rzpData = rzpDataRes.data || rzpDataRes;

        // If the order has already been paid for (concurrent request or edge case):
        if (rzpData?.alreadyPaid || rzpDataRes?.alreadyPaid) {
          clearCart();
          toast.success("This order is already paid! Redirecting to tracking...");
          setIsSubmitting(false);
          navigate(`/orders/${orderId}?success=true`, { replace: true });
          return;
        }

        const options = {
          key: rzpData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || '',
          amount: rzpData.amount,
          currency: rzpData.currency || 'INR',
          name: 'KiranaHub Quick-Commerce',
          description: `Instant Groceries • Order #${orderId.slice(-6).toUpperCase()}`,
          order_id: rzpData.razorpayOrderId,
          prefill: {
            name: rzpData.customer?.name || finalAddress.receiverName,
            email: rzpData.customer?.email || user?.email || 'customer@kiranahub.local',
            contact: rzpData.customer?.phone || finalAddress.receiverPhone,
          },
          theme: {
            color: '#10b981', // Emerald green KiranaHub theme
          },
          modal: {
            ondismiss: function () {
              setIsSubmitting(false);
              toast.warning('Payment Pending', {
                description: 'Payment was dismissed. You can complete it in your orders history.',
              });
            },
          },
          handler: async function (response) {
            try {
              toast.info('Verifying secure payment signature...');
              await paymentService.verifyPayment({
                orderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              clearCart();
              toast.success('Payment Verified! Order Confirmed!', {
                description: `Payment ID: ${response.razorpay_payment_id}`,
              });
              navigate(`/order-success/${orderId}`, { replace: true });
            } catch (vErr) {
              const msg = vErr?.message || 'Payment verification failed.';
              toast.error('Payment Error', { description: msg });
              navigate(`/order-success/${orderId}`, { replace: true });
            } finally {
              setIsSubmitting(false);
            }
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          setIsSubmitting(false);
          toast.error('Payment Failed', {
            description: resp?.error?.description || 'Transaction could not be completed.',
          });
        });
        rzp.open();
      }
    } catch (err) {
      const isAlreadyPaid =
        err?.response?.data?.alreadyPaid ||
        err?.data?.alreadyPaid ||
        err?.alreadyPaid ||
        (typeof err?.message === 'string' && err.message.toLowerCase().includes('already been paid'));

      if (isAlreadyPaid) {
        clearCart();
        toast.success("This order is already paid! Redirecting to tracking...");
        const targetId =
          err?.response?.data?.orderId ||
          err?.data?.orderId ||
          err?.orderId ||
          '';
        setIsSubmitting(false);
        navigate(targetId ? `/orders/${targetId}?success=true` : `/orders?success=true`, { replace: true });
        return;
      }

      const msg = err?.message || err?.error || 'Failed to place order. Please try again.';
      setErrorMessage(msg);
      toast.error('Order Failed', { description: msg });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-8 lg:py-12 min-h-[85vh] bg-surface-soft text-text-primary antialiased">
      <Container>
        {/* Header & 5-Min Inventory Hold Banner */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200/80 shadow-2xs mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>⚡ 10-Minute Express Checkout</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Review & Complete Order
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Verified local Kirana inventory • Free delivery on orders above ₹499
            </p>
          </div>

          {/* 5-Min Reservation Countdown Chip */}
          {isHoldActive && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border shadow-xs ${
                reserveSecondsLeft < 60
                  ? 'bg-rose-50 border-rose-300 text-rose-800 animate-pulse'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-900'
              }`}
            >
              <Clock className={`w-4 h-4 ${reserveSecondsLeft < 60 ? 'text-rose-600' : 'text-emerald-600'}`} />
              <div>
                <span className="text-xs font-bold block">Reserved For You</span>
                <span className="font-mono text-sm font-black">
                  Expires in {formatCountdown(reserveSecondsLeft)}
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900 text-sm font-semibold flex items-center gap-3 shadow-xs"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </motion.div>
        )}

        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Main 2 columns: 3-Step Accordion System */}
          <div className="space-y-6 lg:col-span-7 xl:col-span-8">
            
            {/* STEP 1: Delivery Address Accordion */}
            <div className="rounded-4xl border border-stone-200/70 bg-white p-6 sm:p-7 shadow-xs">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-600 text-white font-bold text-sm shadow-brand">
                    1
                  </div>
                  <div>
                    <h2 className="font-display text-base sm:text-lg font-black text-slate-900">
                      Delivery Address
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">Where should we deliver your groceries?</p>
                  </div>
                </div>
                {savedAddresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsCustomAddress(!isCustomAddress)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/80 transition-colors"
                  >
                    {isCustomAddress ? 'Use Saved Address' : '+ New Address'}
                  </button>
                )}
              </div>

              {/* Saved Address Selection */}
              {!isCustomAddress && savedAddresses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {savedAddresses.map((addr, idx) => {
                    const isSelected = selectedAddressIndex === idx;
                    return (
                      <div
                        key={addr._id || idx}
                        onClick={() => setSelectedAddressIndex(idx)}
                        className={`p-4 rounded-3xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/40 shadow-xs ring-2 ring-emerald-100'
                            : 'border-stone-200/80 bg-white hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            <IconLocation className="h-3.5 w-3.5 text-emerald-600" />
                            {addr.label || 'Home'}
                          </span>
                          {isSelected && (
                            <span className="h-4 w-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-2">
                          {addr.street}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1 font-medium">
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Address Form */
                <div className="space-y-4 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      id="receiverName"
                      label="Receiver Name"
                      placeholder="e.g. Rahul Sharma"
                      value={addressForm.receiverName}
                      onChange={(e) => handleAddressChange('receiverName', e.target.value)}
                      error={validationErrors.receiverName}
                    />
                    <Input
                      id="receiverPhone"
                      label="10-digit Mobile Number"
                      type="tel"
                      placeholder="9876543210"
                      value={addressForm.receiverPhone}
                      onChange={(e) => handleAddressChange('receiverPhone', e.target.value)}
                      error={validationErrors.receiverPhone}
                    />
                  </div>

                  <Input
                    id="addressLine1"
                    label="Flat / House No. / Building / Street"
                    placeholder="House 42, 2nd Floor, Green Park"
                    value={addressForm.addressLine1}
                    onChange={(e) => handleAddressChange('addressLine1', e.target.value)}
                    error={validationErrors.addressLine1}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      id="city"
                      label="City"
                      value={addressForm.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      error={validationErrors.city}
                    />
                    <Input
                      id="state"
                      label="State"
                      value={addressForm.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      error={validationErrors.state}
                    />
                    <Input
                      id="pincode"
                      label="Pincode"
                      placeholder="110001"
                      value={addressForm.pincode}
                      onChange={(e) => handleAddressChange('pincode', e.target.value)}
                      error={validationErrors.pincode}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* STEP 2: Delivery Speed, Instructions & Partner Tip */}
            <div className="rounded-4xl border border-stone-200/70 bg-white p-6 sm:p-7 shadow-xs">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-600 text-white font-bold text-sm shadow-brand">
                  2
                </div>
                <div>
                  <h2 className="font-display text-base sm:text-lg font-black text-slate-900">
                    Delivery Speed & Partner Preferences
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">Quick delivery options and doorstep instructions</p>
                </div>
              </div>

              {/* Delivery Slots */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
                <div
                  onClick={() => setDeliverySlot('EXPRESS')}
                  className={`flex items-start justify-between p-4 rounded-3xl border-2 cursor-pointer transition-all ${
                    deliverySlot === 'EXPRESS'
                      ? 'border-emerald-600 bg-emerald-50/40 shadow-xs ring-2 ring-emerald-100'
                      : 'border-stone-200/80 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white font-bold shadow-xs">
                      ⚡
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          Express Delivery
                        </span>
                        <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 uppercase">
                          10-15 Mins
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium mt-1">
                        Dispatched from closest Kirana dark hub
                      </p>
                    </div>
                  </div>
                  <span className="font-black text-sm text-emerald-700">
                    {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                  </span>
                </div>

                <div
                  onClick={() => setDeliverySlot('SCHEDULED')}
                  className={`flex items-start justify-between p-4 rounded-3xl border-2 cursor-pointer transition-all ${
                    deliverySlot === 'SCHEDULED'
                      ? 'border-emerald-600 bg-emerald-50/40 shadow-xs ring-2 ring-emerald-100'
                      : 'border-stone-200/80 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white font-bold shadow-xs">
                      🌙
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          Evening Slot
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium mt-1">
                        Today, <strong>6:00 PM – 8:00 PM</strong>
                      </p>
                    </div>
                  </div>
                  <span className="font-black text-sm text-slate-700">
                    {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                  </span>
                </div>
              </div>

              {/* Delivery Instructions */}
              <div className="pt-4 border-t border-stone-100">
                <label className="text-xs font-bold text-slate-800 block mb-2">
                  Delivery Partner Instructions
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {[
                    'Do not ring bell',
                    'Leave at the door',
                    'Call before arriving',
                    'Beware of pet 🐶',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setSelectedInstruction(preset)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedInstruction === preset
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Optional: Landmark, wing, or gate instructions..."
                  value={customInstruction}
                  onChange={(e) => setCustomInstruction(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-500 bg-stone-50/50"
                />
              </div>

              {/* Delivery Partner Tip (Instamart style) */}
              <div className="mt-5 pt-4 border-t border-stone-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                    <span className="text-xs font-bold text-slate-900">
                      Tip your Delivery Partner
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">100% goes to rider</span>
                </div>
                <div className="flex items-center gap-2">
                  {[0, 20, 30, 50].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDeliveryTip(amt)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        deliveryTip === amt
                          ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-200'
                          : 'bg-stone-100 text-slate-700 hover:bg-stone-200'
                      }`}
                    >
                      {amt === 0 ? 'No Tip' : `₹${amt}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* STEP 3: Payment Method Accordion */}
            <div className="rounded-4xl border border-stone-200/70 bg-white p-6 sm:p-7 shadow-xs">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-600 text-white font-bold text-sm shadow-brand">
                  3
                </div>
                <div>
                  <h2 className="font-display text-base sm:text-lg font-black text-slate-900">
                    Select Payment Method
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">Verified Razorpay Gateway & Cash on Delivery</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: 'UPI',
                    icon: '📱',
                    title: 'UPI Instant Payment (Razorpay)',
                    desc: 'Google Pay, PhonePe, Paytm, or any UPI ID / QR',
                    badge: 'Fast & Secure',
                    badgeVariant: 'success',
                  },
                  {
                    id: 'CARD',
                    icon: '💳',
                    title: 'Credit / Debit Card (Razorpay)',
                    desc: 'Visa, MasterCard, RuPay & Corporate Cards',
                    badge: '256-bit SSL',
                    badgeVariant: 'success',
                  },
                  {
                    id: 'COD',
                    icon: '💵',
                    title: 'Cash / Pay on Delivery (COD)',
                    desc: 'Pay cash or scan QR with delivery partner',
                    badge: 'Doorstep Pay',
                    badgeVariant: 'primary',
                  },
                ].map((method) => {
                  const isSelected = paymentMethod === method.id;
                  return (
                    <label
                      key={method.id}
                      className={`flex items-center justify-between p-4 rounded-3xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/40 shadow-xs ring-2 ring-emerald-100'
                          : 'border-stone-200/80 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={isSelected}
                          onChange={() => setPaymentMethod(method.id)}
                          className="h-4.5 w-4.5 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-2xl">{method.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">
                              {method.title}
                            </span>
                            {method.badge && (
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                                method.badgeVariant === 'success'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-stone-200 text-slate-800'
                              }`}>
                                {method.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">{method.desc}</p>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary & Place Order */}
          <div className="space-y-6 lg:col-span-5 xl:col-span-4">
            <div className="rounded-4xl border border-stone-200/70 bg-white p-6 shadow-card sticky top-24">
              <h2 className="font-display text-lg font-black text-slate-900 mb-4">
                Basket Summary
              </h2>

              {/* Items List Preview */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1 pb-3 border-b border-stone-100">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-black text-emerald-700">{item.quantity}×</span>
                      <span className="truncate font-bold text-slate-800">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">
                      {formatPrice((item.sellingPrice || item.price) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bill Details */}
              <dl className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 font-medium">
                  <dt>Items Subtotal</dt>
                  <dd className="font-bold text-slate-900">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between text-slate-600 font-medium">
                  <dt>Delivery Fee</dt>
                  <dd className="font-bold">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-600 font-black">FREE</span>
                    ) : (
                      formatPrice(deliveryFee)
                    )}
                  </dd>
                </div>
                <div className="flex justify-between text-slate-600 font-medium">
                  <dt>Handling Fee</dt>
                  <dd className="font-bold text-slate-900">{formatPrice(handlingFee)}</dd>
                </div>
                {deliveryTip > 0 && (
                  <div className="flex justify-between text-slate-600 font-medium">
                    <dt className="flex items-center gap-1">
                      <span>Delivery Partner Tip</span>
                      <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                    </dt>
                    <dd className="font-bold text-emerald-700">{formatPrice(deliveryTip)}</dd>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <dt>Special Discount</dt>
                    <dd>− {formatPrice(discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-stone-200 text-base font-bold text-slate-900">
                  <dt>Grand Total</dt>
                  <dd className="font-display text-emerald-700 font-black text-xl">
                    {formatPrice(finalPayableTotal)}
                  </dd>
                </div>
              </dl>

              {/* Place Order CTA */}
              <div className="mt-6">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handlePlaceOrder}
                  className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm tracking-wide shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Processing Payment...</span>
                  ) : (
                    <>
                      <span>
                        {paymentMethod === 'COD' ? 'Place Order' : 'Pay Now'} • {formatPrice(finalPayableTotal)}
                      </span>
                      <IconArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="mt-4 text-center">
                <p className="text-[11px] font-semibold text-slate-400 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  Razorpay 256-bit Encrypted Payments
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
