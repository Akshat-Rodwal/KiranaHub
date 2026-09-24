import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, ShieldCheck, Check, Clock, Navigation, MapPin, KeyRound, Radio } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import useOrderSocket from '../../hooks/useOrderSocket.js';
import { toast } from '../common/Toast.jsx';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';

// Default Dark Store Hub & Customer Coordinates (New Delhi Connaught Hub)
const STORE_COORDS = [77.2167, 28.6328];
const DESTINATION_COORDS = [77.2310, 28.6480];

const STAGES = [
  { key: 'CONFIRMED', label: 'Order Confirmed & Sent to Store', shortLabel: 'Confirmed', icon: '⚡' },
  { key: 'ASSIGNED', label: 'Delivery Partner Assigned (Vikram Singh)', shortLabel: 'Assigned', icon: '🛵' },
  { key: 'PREPARING', label: 'Partner heading to Dark Store', shortLabel: 'At Store', icon: '🛍️' },
  { key: 'OUT_FOR_DELIVERY', label: 'Order Picked Up & On the Way', shortLabel: 'On the Way', icon: '📦' },
  { key: 'DELIVERED', label: 'Arrived at Doorstep', shortLabel: 'Arrived', icon: '🏠' },
];

export default function LiveOrderTrackerModal({ order, isOpen, onClose }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const animationFrameRef = useRef(null);

  const [currentStatus, setCurrentStatus] = useState(order?.orderStatus || 'CONFIRMED');
  const [selectedTip, setSelectedTip] = useState(order?.deliveryTip || null);
  const [etaMinutes, setEtaMinutes] = useState(11);
  const [mapError, setMapError] = useState(false);
  const [hasLiveGps, setHasLiveGps] = useState(false);
  const [_liveCoords, setLiveCoords] = useState(null);

  // Sync real-time updates via Socket.io (status updates + live rider GPS)
  const handleRiderMoved = (coords) => {
    if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') return;
    setHasLiveGps(true);
    setLiveCoords(coords);

    // Cancel fallback synthetic animation loop once real coordinates stream
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (markerRef.current) {
      markerRef.current.setLngLat([coords.lng, coords.lat]);
    }

    if (mapRef.current) {
      mapRef.current.easeTo({ center: [coords.lng, coords.lat], duration: 1200 });
    }
  };

  useOrderSocket(
    order?._id || order?.id,
    (update) => {
      if (update.status) {
        setCurrentStatus(update.status);
      }
    },
    handleRiderMoved,
  );

  useEffect(() => {
    if (order?.orderStatus) {
      setCurrentStatus(order.orderStatus);
    }
  }, [order?.orderStatus]);

  // ETA countdown interval
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setEtaMinutes((prev) => (prev > 1 ? prev - 1 : 1));
    }, 60000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Initialize Mapbox Canvas
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    const customerCoords =
      order?.deliveryAddress?.coords &&
      typeof order.deliveryAddress.coords.lng === 'number' &&
      typeof order.deliveryAddress.coords.lat === 'number'
        ? [order.deliveryAddress.coords.lng, order.deliveryAddress.coords.lat]
        : DESTINATION_COORDS;

    try {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [
          (STORE_COORDS[0] + customerCoords[0]) / 2,
          (STORE_COORDS[1] + customerCoords[1]) / 2,
        ],
        zoom: 13.5,
        attributionControl: false,
      });

      mapRef.current = map;

      map.on('load', () => {
        // Add Route GeoJSON Line
        const routeGeoJSON = {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [
              STORE_COORDS,
              [77.2200, 28.6360],
              [77.2245, 28.6410],
              customerCoords,
            ],
          },
        };

        map.addSource('route', {
          type: 'geojson',
          data: routeGeoJSON,
        });

        // Background route glow
        map.addLayer({
          id: 'route-glow',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#10b981',
            'line-width': 8,
            'line-opacity': 0.25,
          },
        });

        // Dashed Emerald Path
        map.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#059669',
            'line-width': 4,
            'line-dasharray': [2, 2],
          },
        });

        // 1. Dark Store Marker
        const storeEl = document.createElement('div');
        storeEl.className =
          'w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-lg border-2 border-white text-base font-bold select-none cursor-pointer';
        storeEl.innerHTML = '🏪';
        storeEl.title = 'KiranaHub Dark Store Hub';
        new mapboxgl.Marker(storeEl).setLngLat(STORE_COORDS).addTo(map);

        // 2. Customer Destination Marker
        const destEl = document.createElement('div');
        destEl.className =
          'w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg border-2 border-white text-base font-bold select-none cursor-pointer';
        destEl.innerHTML = '🏠';
        destEl.title = 'Your Delivery Address';
        new mapboxgl.Marker(destEl).setLngLat(customerCoords).addTo(map);

        // 3. Animated Delivery Scooter Marker (🛵)
        const riderEl = document.createElement('div');
        riderEl.className =
          'w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-2xl border-3 border-white text-xl animate-bounce select-none';
        riderEl.innerHTML = '🛵';
        riderEl.title = 'Delivery Partner';

        const initialRiderCoords = order?.deliveryBoy?.currentCoords
          ? [order.deliveryBoy.currentCoords.lng, order.deliveryBoy.currentCoords.lat]
          : STORE_COORDS;

        const riderMarker = new mapboxgl.Marker(riderEl)
          .setLngLat(initialRiderCoords)
          .addTo(map);

        markerRef.current = riderMarker;

        // Smooth Interpolation Animation along the route if live GPS has not arrived yet
        if (!hasLiveGps) {
          const coords = routeGeoJSON.geometry.coordinates;
          let progress = 0;
          const speed = 0.0018;

          const animateMarker = () => {
            progress = (progress + speed) % 1;
            const totalSegments = coords.length - 1;
            const pointIndex = Math.min(
              Math.floor(progress * totalSegments),
              totalSegments - 1,
            );
            const segmentProgress = (progress * totalSegments) % 1;

            const p1 = coords[pointIndex];
            const p2 = coords[pointIndex + 1];

            const currentLng = p1[0] + (p2[0] - p1[0]) * segmentProgress;
            const currentLat = p1[1] + (p2[1] - p1[1]) * segmentProgress;

            riderMarker.setLngLat([currentLng, currentLat]);

            animationFrameRef.current = requestAnimationFrame(animateMarker);
          };

          animateMarker();
        }

        // Fit bounds comfortably
        const bounds = new mapboxgl.LngLatBounds();
        routeGeoJSON.geometry.coordinates.forEach((coord) => bounds.extend(coord));
        map.fitBounds(bounds, { padding: 60 });
      });
    } catch (err) {
      console.warn('Mapbox GL initialization error, falling back to radar view:', err);
      setMapError(true);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isOpen]);

  const handleApplyTip = (amount) => {
    setSelectedTip(amount);
    toast.success(`Thank you! ₹${amount} tip added for ${order?.deliveryBoy?.name || 'Vikram Singh'}`);
  };

  if (!isOpen) return null;

  const currentStageIndex =
    currentStatus === 'DELIVERED'
      ? 4
      : currentStatus === 'OUT_FOR_DELIVERY'
      ? 3
      : currentStatus === 'PICKED_UP'
      ? 2
      : currentStatus === 'PREPARING'
      ? 1
      : 0;

  const riderName = order?.deliveryBoy?.name || order?.deliveryPartner?.name || 'Vikram Singh';
  const riderPhone = order?.deliveryBoy?.phone || order?.deliveryPartner?.phone || '+91 98765 43210';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-white rounded-3xl sm:rounded-4xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col my-auto max-h-[92vh]"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md backdrop-blur-md transition-all hover:scale-105 cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={2.5} />
          </button>

          {/* 1. Header: Live Beacon & Dynamic Countdown */}
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-5 sm:p-6 relative overflow-hidden">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400"></span>
              </span>
              <span className="text-xs font-black tracking-widest uppercase text-emerald-300">
                KiranaHub Hyperlocal Dispatch
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-2xl sm:text-3xl font-black tracking-tight">
                {currentStatus === 'DELIVERED' ? (
                  'Delivered at your Doorstep! 🎉'
                ) : (
                  <>
                    Arriving in <span className="text-amber-300 font-mono">{etaMinutes} Mins</span>
                  </>
                )}
              </h2>
              <span className="text-xs font-bold text-emerald-200 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
                Order #{order?._id?.slice(-6)?.toUpperCase() || 'LIVE'}
              </span>
            </div>

            {/* Stage Progress Stepper */}
            <div className="mt-5 grid grid-cols-5 gap-1.5 sm:gap-2">
              {STAGES.map((stg, idx) => {
                const isPassed = idx <= currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                return (
                  <div key={stg.key} className="flex flex-col items-center text-center">
                    <div
                      className={`w-full h-1.5 rounded-full mb-2 transition-all ${
                        isPassed ? 'bg-amber-400' : 'bg-emerald-950/60'
                      }`}
                    />
                    <span className="text-sm">{stg.icon}</span>
                    <span
                      className={`text-[9px] sm:text-[11px] font-bold mt-1 line-clamp-1 ${
                        isCurrent
                          ? 'text-amber-300 font-black'
                          : isPassed
                          ? 'text-white'
                          : 'text-emerald-400/60'
                      }`}
                    >
                      {stg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-Time Live Status Banner */}
          {currentStatus === 'PICKED_UP' ? (
            <div className="px-5 py-2.5 bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <span>🛍️</span>
                <span>Order Picked Up: Delivery partner is on the way!</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider bg-slate-950 text-amber-300 px-2 py-0.5 rounded-full">
                En Route
              </span>
            </div>
          ) : hasLiveGps || currentStatus === 'OUT_FOR_DELIVERY' ? (
            <div className="px-5 py-2.5 bg-emerald-600 text-white font-black text-xs flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-200" />
                <span>Live GPS active: Partner is moving towards your location</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider bg-emerald-950 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/30">
                Live Telemetry
              </span>
            </div>
          ) : null}

          {/* 2. Mapbox GL Live Canvas */}
          <div className="relative w-full h-[230px] sm:h-[260px] bg-slate-100 overflow-hidden">
            {!mapError ? (
              <div ref={mapContainerRef} className="w-full h-full" />
            ) : (
              /* Fallback Animated Radar Map */
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-100 to-emerald-50 p-6 text-center">
                <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 border-2 border-emerald-300 shadow-inner mb-2">
                  <span className="text-3xl animate-bounce">🛵</span>
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-500 animate-ping opacity-30"></div>
                </div>
                <p className="font-display font-black text-slate-800 text-xs">
                  Live Dispatch Radar Active
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Rider {riderName} is en-route with your fresh groceries
                </p>
              </div>
            )}

            {/* Floating Live Badge */}
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md rounded-full px-3 py-1 shadow-md border border-slate-200/80 flex items-center gap-2 text-xs font-extrabold text-slate-800">
              <Navigation className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>{hasLiveGps ? 'Live GPS Stream Active' : 'GPS Tracking Connected'}</span>
            </div>
          </div>

          {/* 3. Instamart Delivery Partner Card */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 bg-white flex-1">
            {/* Rider Info Strip */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-slate-50 to-emerald-50/50 border border-slate-200/80">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                    alt="Rider"
                    className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
                  />
                  <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">
                    ★ 4.9
                  </span>
                </div>
                <div>
                  <h3 className="font-display font-black text-slate-900 text-sm">
                    {riderName}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Vaccinated & Temp Checked (36.4°C)</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    KiranaHub Fleet #402 • Electric Scooter
                  </p>
                </div>
              </div>

              {/* Call Partner Button */}
              <a
                href={`tel:${riderPhone}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
              >
                <Phone className="w-3.5 h-3.5 fill-current" />
                <span>Call Partner</span>
              </a>
            </div>

            {/* Delivery OTP & Instructions Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Delivery OTP Pill */}
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                    Doorstep Delivery Security
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    Share OTP <span className="font-mono text-emerald-700 font-black">{order?.deliveryOtp || '1234'}</span> with delivery partner at doorstep
                  </span>
                </div>
                <span className="font-mono font-black text-xl text-emerald-700 bg-white px-3 py-1.5 rounded-xl shadow-xs border border-emerald-300 ml-2 shrink-0">
                  {order?.deliveryOtp || '1234'}
                </span>
              </div>

              {/* Delivery Preferences Display */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Your Delivery Instructions
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {order?.deliveryInstructions && (Array.isArray(order.deliveryInstructions) ? order.deliveryInstructions.join(' • ') : order.deliveryInstructions) || 'Leave at door'}
                </span>
              </div>
            </div>

            {/* Tip Your Delivery Partner */}
            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/70">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-amber-950 uppercase tracking-wider">
                  Tip Your Delivery Partner
                </span>
                <span className="text-[11px] font-semibold text-amber-700">
                  100% goes to {riderName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {[10, 20, 30, 50].map((amt) => {
                  const isSelected = selectedTip === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleApplyTip(amt)}
                      className={`flex-1 py-1.5 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 border-amber-600 text-white shadow-xs scale-105'
                          : 'bg-white border-amber-200 text-amber-900 hover:bg-amber-100/60'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
