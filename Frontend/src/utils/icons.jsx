const Svg = ({ children, className = 'w-5 h-5', ...rest }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...rest}
  >
    {children}
  </svg>
);

export const IconSearch = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.35-4.35" />
  </Svg>
);

export const IconShoppingBag = (p) => (
  <Svg {...p}>
    <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </Svg>
);

export const IconCart = (p) => (
  <Svg {...p}>
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
  </Svg>
);

export const IconHeart = (p) => (
  <Svg {...p}>
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </Svg>
);

export const IconUser = (p) => (
  <Svg {...p}>
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Svg>
);

export const IconHome = (p) => (
  <Svg {...p}>
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </Svg>
);

export const IconGrid = (p) => (
  <Svg {...p}>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </Svg>
);

export const IconCategory = (p) => (
  <Svg {...p}>
    <path d="M3 7h18M6 12h12M10 17h4" />
  </Svg>
);

export const IconMenu = (p) => (
  <Svg {...p}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </Svg>
);

export const IconClose = (p) => (
  <Svg {...p} strokeWidth="2.4">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </Svg>
);

export const IconPlus = (p) => (
  <Svg {...p} strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </Svg>
);

export const IconMinus = (p) => (
  <Svg {...p} strokeWidth="3">
    <line x1="5" y1="12" x2="19" y2="12" />
  </Svg>
);

export const IconLocation = (p) => (
  <Svg {...p}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </Svg>
);

export const IconPhone = (p) => (
  <Svg {...p}>
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
  </Svg>
);

export const IconOffer = (p) => (
  <Svg {...p}>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </Svg>
);

export const IconChevronRight = (p) => (
  <Svg {...p} strokeWidth="2.5">
    <polyline points="9 18 15 12 9 6" />
  </Svg>
);

export const IconChevronLeft = (p) => (
  <Svg {...p} strokeWidth="2.5">
    <polyline points="15 18 9 12 15 6" />
  </Svg>
);

export const IconChevronDown = (p) => (
  <Svg {...p} strokeWidth="2.5">
    <polyline points="6 9 12 15 18 9" />
  </Svg>
);

export const IconArrowRight = (p) => (
  <Svg {...p} strokeWidth="2.2">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </Svg>
);

export const IconBell = (p) => (
  <Svg {...p}>
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </Svg>
);

export const IconStar = (p) => (
  <Svg {...p} fill="currentColor" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </Svg>
);

export const IconTruck = (p) => (
  <Svg {...p}>
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </Svg>
);

export const IconShield = (p) => (
  <Svg {...p}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </Svg>
);

export const IconRefresh = (p) => (
  <Svg {...p}>
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
  </Svg>
);

export const IconHeadset = (p) => (
  <Svg {...p}>
    <path d="M3 18v-6a9 9 0 0118 0v6" />
    <path d="M21 19a2 2 0 01-2 2h-1v-6h3v4zM3 19a2 2 0 002 2h1v-6H3v4z" />
  </Svg>
);

export const IconFilter = (p) => (
  <Svg {...p}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </Svg>
);

export const IconSort = (p) => (
  <Svg {...p}>
    <path d="M3 6h18M6 12h12M10 18h4" />
  </Svg>
);

export const IconLeaf = (p) => (
  <Svg {...p}>
    <path d="M11 20A7 7 0 019.8 6.1C15.5 5 17 4.48 19.2 2.5c0 7.5-3.5 13.2-8.2 15.5z" />
    <path d="M2 21s.6-7 5-9" />
  </Svg>
);

export const IconClock = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </Svg>
);

export const IconRupee = (p) => (
  <Svg {...p}>
    <path d="M6 3h12M6 8h12M6 13l10-5M6 13l0 8M6 13h5a4 4 0 110 8H6" />
  </Svg>
);

export const IconTag = (p) => (
  <Svg {...p}>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </Svg>
);

export const IconEye = (p) => (
  <Svg {...p}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);

export const IconEyeOff = (p) => (
  <Svg {...p}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </Svg>
);

export const IconMail = (p) => (
  <Svg {...p}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </Svg>
);

export const IconLock = (p) => (
  <Svg {...p}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Svg>
);

export const IconLogOut = (p) => (
  <Svg {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </Svg>
);

export const IconCheck = (props) => (
  <Svg {...props}>
    <polyline points="20 6 9 17 4 12" />
  </Svg>
);

export default {
  IconCheck,
  IconSearch,
  IconShoppingBag,
  IconCart,
  IconHeart,
  IconUser,
  IconHome,
  IconGrid,
  IconCategory,
  IconMenu,
  IconClose,
  IconPlus,
  IconMinus,
  IconLocation,
  IconPhone,
  IconOffer,
  IconChevronRight,
  IconChevronLeft,
  IconChevronDown,
  IconArrowRight,
  IconBell,
  IconStar,
  IconTruck,
  IconShield,
  IconRefresh,
  IconHeadset,
  IconFilter,
  IconSort,
  IconLeaf,
  IconClock,
  IconRupee,
  IconTag,
  IconEye,
  IconEyeOff,
  IconMail,
  IconLock,
  IconLogOut,
};
