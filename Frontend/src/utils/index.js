export const formatCurrency = (amount, currency = 'INR', locale = 'en-IN') => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(Number(amount));
  } catch {
    return `₹${Number(amount).toFixed(0)}`;
  }
};

export const formatPrice = (amount) => formatCurrency(amount);

export const formatNumber = (num, locale = 'en-IN') => {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return new Intl.NumberFormat(locale).format(Number(num));
};

export const calculateDiscount = (originalPrice, sellingPrice) => {
  if (!originalPrice || !sellingPrice || originalPrice <= sellingPrice) return 0;
  return Math.round(((originalPrice - sellingPrice) / originalPrice) * 100);
};

export const formatDate = (date, options = {}) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const { style = 'short', locale = 'en-IN' } = options;
  const presets = {
    short: { day: 'numeric', month: 'short', year: 'numeric' },
    long: { day: 'numeric', month: 'long', year: 'numeric' },
    withTime: { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' },
  };
  if (style === 'relative') return getRelativeTime(d);
  return d.toLocaleDateString(locale, presets[style] || presets.short);
};

export const getRelativeTime = (date) => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHr / 24);
  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hr ago`;
  if (diffDay < 7) return `${diffDay} days ago`;
  return formatDate(date, { style: 'short' });
};

export const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '...';
};

export const classNames = (...classes) =>
  classes.filter(Boolean).join(' ');

export const debounce = (func, wait = 300) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};

export const generateInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());

export const validatePhone = (phone) => /^[6-9]\d{9}$/.test(String(phone));

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default {
  formatCurrency,
  formatPrice,
  formatNumber,
  calculateDiscount,
  formatDate,
  getRelativeTime,
  slugify,
  truncateText,
  classNames,
  debounce,
  generateInitials,
  validateEmail,
  validatePhone,
  sleep,
};
