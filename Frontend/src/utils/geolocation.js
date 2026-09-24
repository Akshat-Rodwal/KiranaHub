/**
 * Utility for browser GPS detection & Mapbox Reverse Geocoding
 */

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';

export const getCurrentGpsCoordinates = () => {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      return reject(new Error('Geolocation is not supported by your browser.'));
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (err) => {
        let msg = 'Unable to retrieve your location.';
        if (err.code === 1) msg = 'Location access was denied. Please allow location permissions in your browser.';
        else if (err.code === 2) msg = 'Position unavailable. Please check your GPS/network.';
        else if (err.code === 3) msg = 'Location request timed out. Please try again.';
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  });
};

export const reverseGeocodeCoords = async (lat, lng) => {
  if (!MAPBOX_TOKEN) {
    throw new Error('Mapbox access token is not configured.');
  }

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch address details from Mapbox.');
  }

  const data = await res.json();
  const features = data?.features || [];

  if (features.length === 0) {
    return {
      addressLine1: 'Identified Current Location',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      fullAddress: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      coords: { lat, lng },
    };
  }

  const primaryFeature = features[0];
  const context = primaryFeature.context || [];

  let pincode = '';
  let city = '';
  let state = '';

  for (const item of context) {
    if (item.id.startsWith('postcode')) {
      pincode = item.text;
    } else if (item.id.startsWith('place') || item.id.startsWith('locality')) {
      if (!city) city = item.text;
    } else if (item.id.startsWith('region')) {
      state = item.text;
    }
  }

  // Fallbacks if context hierarchy was partial
  if (!city && features.length > 1) {
    const placeFeature = features.find((f) => f.place_type?.includes('place'));
    if (placeFeature) city = placeFeature.text;
  }
  if (!state && features.length > 1) {
    const regionFeature = features.find((f) => f.place_type?.includes('region'));
    if (regionFeature) state = regionFeature.text;
  }

  const addressLine1 = primaryFeature.text || primaryFeature.place_name?.split(',')?.[0] || 'Current Location';

  return {
    addressLine1,
    city: city || 'New Delhi',
    state: state || 'Delhi',
    pincode: pincode || '110001',
    fullAddress: primaryFeature.place_name || `${addressLine1}, ${city}, ${state}`,
    coords: { lat, lng },
  };
};

export const detectCurrentLocation = async () => {
  const coords = await getCurrentGpsCoordinates();
  const address = await reverseGeocodeCoords(coords.lat, coords.lng);
  return { ...address, coords };
};
