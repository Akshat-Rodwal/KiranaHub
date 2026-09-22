import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Milk,
  Apple,
  Coffee,
  Cookie,
  Utensils,
  Gift,
  Wheat,
  Flame,
  Droplets,
  Fish,
  Salad,
  Baby,
  Pill,
  Home,
  Heart,
  PawPrint,
} from 'lucide-react';
import Container from '../common/Container.jsx';
import CategoryCard from '../ui/CategoryCard.jsx';
import { ROUTES, CATEGORY_ALIAS_MAP } from '../../constants/index.js';
import { useCategories } from '../../hooks/useCategories.js';

const BLINKIT_CATEGORIES = [
  { slug: 'paan-corner', name: 'Paan Corner', icon: Sparkles, packImage: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=300&q=80' },
  { slug: 'dairy-bread-eggs', name: 'Dairy, Bread & Eggs', icon: Milk, packImage: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=300&q=80' },
  { slug: 'fruits-vegetables', name: 'Fruits & Vegetables', icon: Apple, packImage: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=300&q=80' },
  { slug: 'cold-drinks-juices', name: 'Cold Drinks & Juices', icon: Coffee, packImage: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=300&q=80' },
  { slug: 'snacks-munchies', name: 'Snacks & Munchies', icon: Cookie, packImage: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=300&q=80' },
  { slug: 'breakfast-instant', name: 'Breakfast & Instant Food', icon: Utensils, packImage: 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&w=300&q=80' },
  { slug: 'sweet-tooth', name: 'Sweet Tooth', icon: Gift, packImage: 'https://images.unsplash.com/photo-1548365328-8c6db3220e4c?auto=format&fit=crop&w=300&q=80' },
  { slug: 'bakery-biscuits', name: 'Bakery & Biscuits', icon: Cookie, packImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80' },
  { slug: 'tea-coffee-drinks', name: 'Tea, Coffee & Milk Drinks', icon: Coffee, packImage: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=300&q=80' },
  { slug: 'atta-rice-dal', name: 'Atta, Rice & Dal', icon: Wheat, packImage: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80' },
  { slug: 'masala-oil', name: 'Masala, Oil & More', icon: Flame, packImage: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=300&q=80' },
  { slug: 'sauces-spreads', name: 'Sauces & Spreads', icon: Droplets, packImage: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=300&q=80' },
  { slug: 'chicken-meat-fish', name: 'Chicken, Meat & Fish', icon: Fish, packImage: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=300&q=80' },
  { slug: 'organic-healthy', name: 'Organic & Healthy Living', icon: Salad, packImage: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=300&q=80' },
  { slug: 'baby-care', name: 'Baby Care', icon: Baby, packImage: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=300&q=80' },
  { slug: 'pharma-wellness', name: 'Pharma & Wellness', icon: Pill, packImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=300&q=80' },
  { slug: 'cleaning-essentials', name: 'Cleaning Essentials', icon: Home, packImage: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=300&q=80' },
  { slug: 'home-office', name: 'Home & Office', icon: Home, packImage: 'https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?auto=format&fit=crop&w=300&q=80' },
  { slug: 'personal-care', name: 'Personal Care', icon: Heart, packImage: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=300&q=80' },
  { slug: 'pet-care', name: 'Pet Care', icon: PawPrint, packImage: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=300&q=80' },
];

export default function CategorySection() {
  const { data: serverCategories } = useCategories();

  // Merge server category images/counts if available, ensuring real pack imagery
  const displayCategories = BLINKIT_CATEGORIES.map((cat) => {
    const resolvedSlug = CATEGORY_ALIAS_MAP[cat.slug] || cat.slug;
    const matched = serverCategories?.find(
      (c) =>
        c.slug === resolvedSlug ||
        c.slug === cat.slug ||
        c.name.toLowerCase().includes(cat.name.split(' ')[0].toLowerCase())
    );
    const targetSlug = matched?.slug || resolvedSlug;
    const isSvgInitial = matched?.image && matched.image.startsWith('data:image/svg');
    const finalImage = (!matched?.image || isSvgInitial) ? cat.packImage : matched.image;

    return {
      ...cat,
      image: finalImage,
      count: matched?.productCount,
      to: ROUTES.CATEGORY.replace(':slug', targetSlug),
    };
  });

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="py-4 sm:py-6 bg-[#f7f9f7]"
    >
      <Container>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="font-display text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Shop by Category
          </h2>
          <Link
            to={ROUTES.CATEGORIES}
            className="text-xs sm:text-sm font-extrabold text-[#0c831f] hover:text-[#0a6d1a] transition-colors"
          >
            see all →
          </Link>
        </div>

        {/* 1. Mobile Layout: Dual-Row Horizontal Scroll with Hidden Scrollbars */}
        <div className="md:hidden grid grid-rows-2 grid-flow-col auto-cols-[82px] sm:auto-cols-[96px] gap-2.5 sm:gap-3 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-2 pt-1 -mx-3 px-3 sm:mx-0 sm:px-0">
          {displayCategories.map((category) => (
            <CategoryCard
              key={category.slug}
              name={category.name}
              icon={category.icon}
              image={category.image}
              count={category.count}
              to={category.to}
            />
          ))}
        </div>

        {/* 2. Desktop Layout: Clean 8-Column Grid */}
        <div className="hidden md:grid md:grid-cols-8 gap-3 lg:gap-4">
          {displayCategories.map((category) => (
            <CategoryCard
              key={category.slug}
              name={category.name}
              icon={category.icon}
              image={category.image}
              count={category.count}
              to={category.to}
            />
          ))}
        </div>
      </Container>
    </motion.section>
  );
}
