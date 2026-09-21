export const APP_NAME = import.meta.env.VITE_APP_NAME || "KiranaHub";
export const APP_TAGLINE = "Your Local Kirana & General Store";

export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

export const ROUTES = {
    HOME: "/",
    CATEGORIES: "/categories",
    CATEGORY: "/category/:slug",
    PRODUCTS: "/products",
    PRODUCT: "/product/:id",
    SEARCH: "/search",
    CART: "/cart",
    WISHLIST: "/wishlist",
    ACCOUNT: "/account",
    CHECKOUT: "/checkout",
    ORDERS: "/orders",
    ORDER: "/orders/:id",
    PROFILE: "/profile",
    ADDRESSES: "/profile/addresses",
    COUPONS: "/coupons",
    NOTIFICATIONS: "/notifications",
    LOGIN: "/login",
    REGISTER: "/register",
    FORGOT_PASSWORD: "/forgot-password",
    ADMIN: {
        ROOT: "/admin",
        DASHBOARD: "/admin/dashboard",
        PRODUCTS: "/admin/products",
        CATEGORIES: "/admin/categories",
        INVENTORY: "/admin/inventory",
        ORDERS: "/admin/orders",
        CUSTOMERS: "/admin/customers",
        COUPONS: "/admin/coupons",
        BANNERS: "/admin/banners",
        REVIEWS: "/admin/reviews",
        DELIVERY: "/admin/delivery",
        ANALYTICS: "/admin/analytics",
        SETTINGS: "/admin/settings",
    },
};

export const STORAGE_KEYS = {
    ACCESS_TOKEN: "accessToken",
    REFRESH_TOKEN: "refreshToken",
    USER: "user",
    CART: "cart",
    WISHLIST: "wishlist",
};

export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 12,
    DEFAULT_PRODUCT_LIMIT: 20,
    MAX_LIMIT: 50,
};

export const PRICE_RANGES = [
    { label: "Under ₹100", min: 0, max: 100 },
    { label: "₹100 - ₹250", min: 100, max: 250 },
    { label: "₹250 - ₹500", min: 250, max: 500 },
    { label: "₹500 - ₹1000", min: 500, max: 1000 },
    { label: "Above ₹1000", min: 1000, max: Infinity },
];

export const CATEGORY_ALIAS_MAP = {
  dairy: 'dairy-eggs-bread',
  'dairy-bread-eggs': 'dairy-eggs-bread',
  'dairy-eggs-bread': 'dairy-eggs-bread',
  atta: 'staples',
  'atta-rice-dal': 'staples',
  staples: 'staples',
  snacks: 'snacks',
  'snacks-munchies': 'snacks',
  drinks: 'beverages',
  'cold-drinks-juices': 'beverages',
  'tea-coffee-drinks': 'beverages',
  beverages: 'beverages',
  cleaning: 'home-care',
  'cleaning-essentials': 'home-care',
  'home-office': 'home-care',
  'home-care': 'home-care',
  personal: 'personal-care',
  'personal-care': 'personal-care',
  baby: 'baby-care',
  'baby-care': 'baby-care',
  fruits: 'fruits-vegetables',
  'fruits-vegetables': 'fruits-vegetables',
  spices: 'spices-masala',
  'spices-masala': 'spices-masala',
  'masala-oil': 'spices-masala',
  'oil-ghee-masala': 'spices-masala',
  breakfast: 'breakfast-instant',
  'breakfast-instant': 'breakfast-instant',
};

export const DELIVERY_OPTIONS = [
    {
        id: "standard",
        label: "Standard Delivery",
        time: "2-3 days",
        price: 0,
        freeAbove: 499,
    },
    {
        id: "express",
        label: "Express Delivery",
        time: "Same day",
        price: 49,
        freeAbove: 999,
    },
    {
        id: "pickup",
        label: "Store Pickup",
        time: "Ready in 2 hours",
        price: 0,
        freeAbove: 0,
    },
];

export default {
    APP_NAME,
    APP_TAGLINE,
    API_BASE_URL,
    ROUTES,
    STORAGE_KEYS,
    PAGINATION,
    PRICE_RANGES,
    DELIVERY_OPTIONS,
};
