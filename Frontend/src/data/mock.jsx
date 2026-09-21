import {
  IconCategory,
  IconClock,
  IconGrid,
  IconHeadset,
  IconLeaf,
  IconOffer,
  IconShield,
  IconShoppingBag,
  IconTruck,
} from '../utils/icons.jsx';

const makeProductImage = (label, primary, secondary) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
      <defs>
        <linearGradient id="bg" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="${primary}" />
          <stop offset="100%" stop-color="${secondary}" />
        </linearGradient>
      </defs>
      <rect width="640" height="480" rx="44" fill="url(#bg)" />
      <circle cx="120" cy="92" r="56" fill="rgba(255,255,255,0.16)" />
      <circle cx="542" cy="366" r="84" fill="rgba(255,255,255,0.14)" />
      <rect x="120" y="120" width="400" height="220" rx="40" fill="rgba(255,255,255,0.92)" />
      <rect x="150" y="154" width="340" height="26" rx="13" fill="rgba(16,24,40,0.08)" />
      <rect x="150" y="206" width="280" height="28" rx="14" fill="rgba(16,24,40,0.12)" />
      <rect x="150" y="292" width="136" height="56" rx="18" fill="${primary}" />
      <text x="170" y="328" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="700" fill="#ffffff">${label}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const homeCategories = [
  { id: 'fruits', name: 'Fruits & Veggies', count: 124, colorIndex: 0, icon: <IconLeaf className="w-full h-full" /> },
  { id: 'dairy', name: 'Dairy & Eggs', count: 46, colorIndex: 1, icon: <IconShoppingBag className="w-full h-full" /> },
  { id: 'staples', name: 'Staples', count: 82, colorIndex: 2, icon: <IconGrid className="w-full h-full" /> },
  { id: 'snacks', name: 'Snacks', count: 64, colorIndex: 3, icon: <IconOffer className="w-full h-full" /> },
  { id: 'beverages', name: 'Beverages', count: 58, colorIndex: 4, icon: <IconCategory className="w-full h-full" /> },
  { id: 'home-care', name: 'Home Care', count: 37, colorIndex: 5, icon: <IconShield className="w-full h-full" /> },
  { id: 'baby-care', name: 'Baby Care', count: 29, colorIndex: 6, icon: <IconHeadset className="w-full h-full" /> },
  { id: 'daily-needs', name: 'Daily Needs', count: 91, colorIndex: 7, icon: <IconClock className="w-full h-full" /> },
];

export const promoHighlights = [
  {
    id: 'delivery',
    title: 'Lightning Fast Delivery',
    description: 'Fresh groceries delivered across nearby neighborhoods in under 35 minutes.',
    icon: IconTruck,
    tone: 'brand',
  },
  {
    id: 'fresh',
    title: 'Farm Fresh Promise',
    description: 'Seasonal fruits, vegetables, and dairy sourced daily for better quality.',
    icon: IconLeaf,
    tone: 'accent',
  },
  {
    id: 'support',
    title: 'Reliable Everyday Service',
    description: 'Live order support, secure payments, and friendly local-store convenience.',
    icon: IconHeadset,
    tone: 'info',
  },
];

export const promoCards = [
  {
    id: 'combo',
    title: 'Combo Offers',
    description: 'Save more with curated family combo deals on monthly essentials.',
    cta: 'Shop Combos',
    background: 'from-brand-50 via-white to-accent-50',
  },
  {
    id: 'essentials',
    title: 'Big Savings',
    description: 'Up to 40% OFF on daily essentials, staples and household picks.',
    cta: 'Shop Now',
    background: 'from-info-50 via-white to-brand-50',
  },
  {
    id: 'mega-sale',
    title: 'Monthly Mega Sale',
    description: "Don't miss out — lowest prices of the month on top brands.",
    cta: 'Explore Now',
    background: 'from-accent-50 via-white to-brand-50',
  },
];

export const products = [
  {
    id: 'alphonso-mangoes',
    slug: 'alphonso-mangoes',
    name: 'Premium Alphonso Mangoes',
    category: 'Fruits',
    brand: 'Ratnagiri Farms',
    originalPrice: 399,
    sellingPrice: 299,
    unit: '1 box',
    rating: 4.8,
    reviewCount: 186,
    stock: 12,
    isNew: true,
    badges: [{ variant: 'sale-soft', size: 'sm', children: 'Seasonal' }],
    image: makeProductImage('Mangoes', '#f59e0b', '#f97316'),
  },
  {
    id: 'a2-milk',
    slug: 'a2-milk',
    name: 'A2 Cow Milk',
    category: 'Dairy',
    brand: 'Morning Basket',
    originalPrice: 84,
    sellingPrice: 72,
    unit: '1 L',
    rating: 4.6,
    reviewCount: 91,
    stock: 16,
    badges: [{ variant: 'stock-soft', size: 'sm', children: 'Fresh Today' }],
    image: makeProductImage('Milk', '#0ea5e9', '#2563eb'),
  },
  {
    id: 'atta-5kg',
    slug: 'atta-5kg',
    name: 'Stoneground Chakki Atta',
    category: 'Staples',
    brand: 'Aashirvaad',
    originalPrice: 349,
    sellingPrice: 299,
    unit: '5 kg',
    rating: 4.7,
    reviewCount: 264,
    stock: 8,
    badges: [{ variant: 'combo', size: 'sm', children: 'Value Pack' }],
    image: makeProductImage('Atta', '#84cc16', '#65a30d'),
  },
  {
    id: 'cold-pressed-oil',
    slug: 'cold-pressed-oil',
    name: 'Cold Pressed Groundnut Oil',
    category: 'Staples',
    brand: 'Pure Harvest',
    originalPrice: 499,
    sellingPrice: 429,
    unit: '1 L',
    rating: 4.5,
    reviewCount: 118,
    stock: 7,
    image: makeProductImage('Oil', '#eab308', '#ca8a04'),
  },
  {
    id: 'masala-oats',
    slug: 'masala-oats',
    name: 'Masala Oats Instant Cups',
    category: 'Snacks',
    brand: 'Urban Pantry',
    originalPrice: 180,
    sellingPrice: 149,
    unit: '6 cups',
    rating: 4.3,
    reviewCount: 76,
    stock: 4,
    badges: [{ variant: 'info-soft', size: 'sm', children: 'Quick Meal' }],
    image: makeProductImage('Oats', '#ec4899', '#db2777'),
  },
  {
    id: 'coconut-water',
    slug: 'coconut-water',
    name: 'Tender Coconut Water',
    category: 'Beverages',
    brand: 'Raw Press',
    originalPrice: 180,
    sellingPrice: 155,
    unit: '1 L',
    rating: 4.4,
    reviewCount: 63,
    stock: 10,
    image: makeProductImage('Water', '#14b8a6', '#0f766e'),
  },
  {
    id: 'dishwash-liquid',
    slug: 'dishwash-liquid',
    name: 'Lemon Dishwash Liquid',
    category: 'Home Care',
    brand: 'Shine Home',
    originalPrice: 210,
    sellingPrice: 169,
    unit: '750 ml',
    rating: 4.2,
    reviewCount: 54,
    stock: 13,
    image: makeProductImage('Clean', '#22c55e', '#16a34a'),
  },
  {
    id: 'baby-wipes',
    slug: 'baby-wipes',
    name: 'Sensitive Baby Wipes',
    category: 'Baby Care',
    brand: 'Little Bloom',
    originalPrice: 249,
    sellingPrice: 209,
    unit: '72 wipes',
    rating: 4.7,
    reviewCount: 88,
    stock: 5,
    badges: [{ variant: 'new-soft', size: 'sm', children: 'Gentle Care' }],
    image: makeProductImage('Wipes', '#8b5cf6', '#7c3aed'),
  },
  {
    id: 'apple-red',
    slug: 'apple-red',
    name: 'Apple Red Delicious',
    category: 'Fruits',
    brand: 'Kashmiri Orchards',
    originalPrice: 199,
    sellingPrice: 159,
    unit: '1 kg',
    rating: 4.6,
    reviewCount: 245,
    stock: 18,
    image: makeProductImage('Apples', '#ef4444', '#b91c1c'),
  },
  {
    id: 'taaza-milk',
    slug: 'taaza-milk',
    name: 'Taaza Toned Milk',
    category: 'Dairy',
    brand: 'Amul',
    originalPrice: 66,
    sellingPrice: 52,
    unit: '1 L',
    rating: 4.8,
    reviewCount: 512,
    stock: 30,
    badges: [{ variant: 'stock-soft', size: 'sm', children: 'Bestseller' }],
    image: makeProductImage('Milk', '#38bdf8', '#0284c7'),
  },
  {
    id: 'sunlite-oil',
    slug: 'sunlite-oil',
    name: 'Sunlite Refined Sunflower Oil',
    category: 'Staples',
    brand: 'Fortune',
    originalPrice: 176,
    sellingPrice: 132,
    unit: '1 L',
    rating: 4.5,
    reviewCount: 362,
    stock: 22,
    image: makeProductImage('Oil', '#facc15', '#eab308'),
  },
  {
    id: 'lays-classic',
    slug: 'lays-classic',
    name: 'Lays Classic Salted Chips',
    category: 'Snacks',
    brand: "Lay's",
    originalPrice: 40,
    sellingPrice: 20,
    unit: '52 g',
    rating: 4.4,
    reviewCount: 785,
    stock: 40,
    image: makeProductImage('Chips', '#fb923c', '#f97316'),
  },
  {
    id: 'tata-tea',
    slug: 'tata-tea',
    name: 'Tata Tea Premium',
    category: 'Beverages',
    brand: 'Tata',
    originalPrice: 140,
    sellingPrice: 108,
    unit: '250 g',
    rating: 4.6,
    reviewCount: 642,
    stock: 25,
    image: makeProductImage('Tea', '#a16207', '#854d0e'),
  },
  {
    id: 'brown-bread',
    slug: 'brown-bread',
    name: '100% Whole Wheat Brown Bread',
    category: 'Staples',
    brand: 'English Oven',
    originalPrice: 60,
    sellingPrice: 48,
    unit: '400 g',
    rating: 4.3,
    reviewCount: 158,
    stock: 9,
    isNew: true,
    image: makeProductImage('Bread', '#d97706', '#b45309'),
  },
  {
    id: 'greek-yogurt',
    slug: 'greek-yogurt',
    name: 'Greek Yogurt Natural',
    category: 'Dairy',
    brand: 'Epigamia',
    originalPrice: 95,
    sellingPrice: 79,
    unit: '400 g',
    rating: 4.5,
    reviewCount: 97,
    stock: 11,
    isNew: true,
    image: makeProductImage('Yogurt', '#e2e8f0', '#94a3b8'),
  },
  {
    id: 'almond-milk',
    slug: 'almond-milk',
    name: 'Unsweetened Almond Milk',
    category: 'Beverages',
    brand: 'Raw Press',
    originalPrice: 299,
    sellingPrice: 249,
    unit: '1 L',
    rating: 4.2,
    reviewCount: 41,
    stock: 6,
    isNew: true,
    image: makeProductImage('Almond', '#d6d3d1', '#a8a29e'),
  },
];

const byId = (ids) => ids.map((id) => products.find((p) => p.id === id)).filter(Boolean);

export const flashDealIds = ['lays-classic', 'taaza-milk', 'alphonso-mangoes', 'sunlite-oil', 'tata-tea', 'apple-red'];
export const bestSellerIds = ['taaza-milk', 'atta-5kg', 'tata-tea', 'cold-pressed-oil', 'apple-red', 'dishwash-liquid'];
export const popularIds = ['apple-red', 'sunlite-oil', 'atta-5kg', 'taaza-milk', 'tata-tea', 'dishwash-liquid', 'coconut-water', 'lays-classic'];
export const newArrivalIds = ['brown-bread', 'greek-yogurt', 'almond-milk', 'alphonso-mangoes', 'baby-wipes'];
export const recommendedIds = ['masala-oats', 'greek-yogurt', 'coconut-water', 'almond-milk', 'apple-red', 'a2-milk'];

export const flashDeals = byId(flashDealIds);
export const bestSellers = byId(bestSellerIds);
export const popularProducts = byId(popularIds);
export const newArrivals = byId(newArrivalIds);
export const recommendedProducts = byId(recommendedIds);

export const frequentlyBought = {
  title: 'Frequently Bought Together',
  description: 'Popular picks our customers love to order together.',
  productIds: ['atta-5kg', 'taaza-milk', 'sunlite-oil'],
};

export const trustedBrands = ['Amul', 'Aashirvaad', 'Tata', 'Nestle', 'Fortune', 'Lay’s', 'Colgate', 'Pampers'];

export const storeInfo = {
  name: 'KiranaHub Fresh Store',
  tagline: 'Freshness you can trust',
  address: '123, Grocery Street, New Delhi – 110001, India',
  phone: '+91 12345 67890',
  email: 'support@kiranahub.in',
  hours: [
    { days: 'Monday – Saturday', time: '8:00 AM – 10:00 PM' },
    { days: 'Sunday', time: '9:00 AM – 9:00 PM' },
  ],
};

export const announcement = {
  icon: IconTruck,
  message: 'Free delivery on orders above ₹499',
  code: 'Use code FRESH50 for 50% OFF up to ₹100',
};
