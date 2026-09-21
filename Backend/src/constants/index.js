export const DB_MODELS = {
  USER: 'User',
  PRODUCT: 'Product',
  CATEGORY: 'Category',
  ORDER: 'Order',
  CART: 'Cart',
  WISHLIST: 'Wishlist',
  ADDRESS: 'Address',
  COUPON: 'Coupon',
  REVIEW: 'Review',
  BANNER: 'Banner',
  NOTIFICATION: 'Notification',
  STORE_SETTING: 'StoreSetting',
};

export const USER_ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  DELIVERY: 'delivery',
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

export const common = {
  DB_MODELS,
  USER_ROLES,
  ORDER_STATUS,
};

export default common;
