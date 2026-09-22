import {
  Search,
  ShoppingBag,
  ShoppingCart,
  Heart,
  User,
  Home,
  LayoutGrid,
  Menu,
  X,
  Plus,
  Minus,
  MapPin,
  Phone,
  Tag,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ArrowRight,
  Bell,
  Star,
  Truck,
  Shield,
  ShieldCheck,
  RotateCcw,
  Headphones,
  Filter,
  ArrowUpDown,
  Leaf,
  Clock,
  IndianRupee,
  Eye,
  EyeOff,
  Mail,
  Lock,
  LogOut,
  Check,
  Zap,
} from 'lucide-react';

// Standardized Lucide Icon wrapper with consistent strokeWidth={2}
const createIcon = (LucideIcon) => {
  const IconComponent = ({ className = 'w-5 h-5', strokeWidth = 2, ...props }) => (
    <LucideIcon className={className} strokeWidth={strokeWidth} {...props} />
  );
  IconComponent.displayName = `Icon(${LucideIcon.displayName || LucideIcon.name || 'Component'})`;
  return IconComponent;
};

export const IconSearch = createIcon(Search);
export const IconShoppingBag = createIcon(ShoppingBag);
export const IconCart = createIcon(ShoppingCart);
export const IconHeart = createIcon(Heart);
export const IconUser = createIcon(User);
export const IconHome = createIcon(Home);
export const IconGrid = createIcon(LayoutGrid);
export const IconCategory = createIcon(LayoutGrid);
export const IconMenu = createIcon(Menu);
export const IconClose = createIcon(X);
export const IconPlus = createIcon(Plus);
export const IconMinus = createIcon(Minus);
export const IconLocation = createIcon(MapPin);
export const IconPhone = createIcon(Phone);
export const IconOffer = createIcon(Tag);
export const IconChevronRight = createIcon(ChevronRight);
export const IconChevronLeft = createIcon(ChevronLeft);
export const IconChevronDown = createIcon(ChevronDown);
export const IconArrowRight = createIcon(ArrowRight);
export const IconBell = createIcon(Bell);
export const IconStar = createIcon(Star);
export const IconTruck = createIcon(Truck);
export const IconShield = createIcon(Shield);
export const IconShieldCheck = createIcon(ShieldCheck);
export const IconRefresh = createIcon(RotateCcw);
export const IconHeadset = createIcon(Headphones);
export const IconFilter = createIcon(Filter);
export const IconSort = createIcon(ArrowUpDown);
export const IconLeaf = createIcon(Leaf);
export const IconClock = createIcon(Clock);
export const IconRupee = createIcon(IndianRupee);
export const IconTag = createIcon(Tag);
export const IconEye = createIcon(Eye);
export const IconEyeOff = createIcon(EyeOff);
export const IconMail = createIcon(Mail);
export const IconLock = createIcon(Lock);
export const IconLogOut = createIcon(LogOut);
export const IconCheck = createIcon(Check);
export const IconZap = createIcon(Zap);

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
  IconShieldCheck,
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
  IconZap,
};
