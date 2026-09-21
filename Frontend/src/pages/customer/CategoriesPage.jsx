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
import Container from '../../components/common/Container.jsx';
import CategoryCard from '../../components/ui/CategoryCard.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { ROUTES } from '../../constants/index.js';
import { useCategories } from '../../hooks/useCategories.js';

const BLINKIT_CATEGORIES = [
  { slug: 'paan-corner', name: 'Paan Corner', icon: Sparkles },
  { slug: 'dairy-bread-eggs', name: 'Dairy, Bread & Eggs', icon: Milk },
  { slug: 'fruits-vegetables', name: 'Fruits & Vegetables', icon: Apple },
  { slug: 'cold-drinks-juices', name: 'Cold Drinks & Juices', icon: Coffee },
  { slug: 'snacks-munchies', name: 'Snacks & Munchies', icon: Cookie },
  { slug: 'breakfast-instant', name: 'Breakfast & Instant Food', icon: Utensils },
  { slug: 'sweet-tooth', name: 'Sweet Tooth', icon: Gift },
  { slug: 'bakery-biscuits', name: 'Bakery & Biscuits', icon: Cookie },
  { slug: 'tea-coffee-drinks', name: 'Tea, Coffee & Milk Drinks', icon: Coffee },
  { slug: 'atta-rice-dal', name: 'Atta, Rice & Dal', icon: Wheat },
  { slug: 'masala-oil', name: 'Masala, Oil & More', icon: Flame },
  { slug: 'sauces-spreads', name: 'Sauces & Spreads', icon: Droplets },
  { slug: 'chicken-meat-fish', name: 'Chicken, Meat & Fish', icon: Fish },
  { slug: 'organic-healthy', name: 'Organic & Healthy Living', icon: Salad },
  { slug: 'baby-care', name: 'Baby Care', icon: Baby },
  { slug: 'pharma-wellness', name: 'Pharma & Wellness', icon: Pill },
  { slug: 'cleaning-essentials', name: 'Cleaning Essentials', icon: Home },
  { slug: 'home-office', name: 'Home & Office', icon: Home },
  { slug: 'personal-care', name: 'Personal Care', icon: Heart },
  { slug: 'pet-care', name: 'Pet Care', icon: PawPrint },
];

export default function CategoriesPage() {
  const { data: serverCategories, isLoading, isError, refetch } = useCategories();

  // Combine server categories with default 20 Blinkit categories
  const categoriesToRender = (serverCategories && serverCategories.length > 0)
    ? serverCategories.map((c) => {
        const defaultMatch = BLINKIT_CATEGORIES.find(
          (b) => b.slug === c.slug || c.name.toLowerCase().includes(b.name.split(' ')[0].toLowerCase())
        );
        return {
          id: c.id,
          name: c.name,
          count: c.productCount,
          image: c.image,
          icon: defaultMatch?.icon,
          to: ROUTES.CATEGORY.replace(':slug', c.slug),
        };
      })
    : BLINKIT_CATEGORIES.map((c) => ({
        id: c.slug,
        name: c.name,
        icon: c.icon,
        to: `${ROUTES.PRODUCTS}?category=${c.slug}`,
      }));

  return (
    <div className="py-8 lg:py-12 bg-[#f7f9f7] min-h-[75vh]">
      <Container>
        <div className="max-w-xl mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs px-3 py-1 mb-2">
            ⚡ 20 Department Aisles
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            All Grocery Aisles
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Select an aisle to explore farm-fresh products, pantry staples, and rapid 8-minute delivery items.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-x-2 gap-y-4 sm:gap-x-3 sm:gap-y-5">
            {Array.from({ length: 20 }, (_, index) => (
              <div key={index} className="flex flex-col items-center gap-2 animate-pulse" aria-hidden="true">
                <div className="h-20 w-20 rounded-2xl bg-stone-200" />
                <div className="h-3 w-14 rounded-md bg-stone-200" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            preset="generic"
            title="Something went wrong"
            description="We couldn't load the categories. Please try again."
            action="Retry"
            onAction={refetch}
          />
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-x-2 gap-y-4 sm:gap-x-3 sm:gap-y-5">
            {categoriesToRender.map((category) => (
              <CategoryCard
                key={category.id}
                name={category.name}
                icon={category.icon}
                image={category.image}
                count={category.count}
                to={category.to}
              />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
