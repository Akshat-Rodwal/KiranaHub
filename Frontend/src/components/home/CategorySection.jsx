import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Container from '../common/Container.jsx';
import CategoryCard from '../ui/CategoryCard.jsx';
import { ROUTES } from '../../constants/index.js';
import { useCategories } from '../../hooks/useCategories.js';

export default function CategorySection() {
  const { data: categories = [], isLoading } = useCategories();

  // Filter to active categories only
  const activeCategories = Array.isArray(categories)
    ? categories.filter((c) => c.isActive !== false)
    : [];

  // Skeleton loader for quick-commerce rounded category cards
  const renderSkeletons = () => (
    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3 sm:gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center justify-start shrink-0 animate-pulse">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-100/90 border border-slate-200/50 p-3.5 mb-2" />
          <div className="h-3 w-16 bg-slate-100 rounded-md" />
        </div>
      ))}
    </div>
  );

  // If not loading and no active categories exist, gracefully return null
  if (!isLoading && activeCategories.length === 0) {
    return null;
  }

  const isDualRowMobile = activeCategories.length > 6;

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

        {isLoading ? (
          renderSkeletons()
        ) : (
          <>
            {/* 1. Mobile Layout: Horizontal Scroll with Sleek Peek */}
            <div
              className={`md:hidden grid ${
                isDualRowMobile ? 'grid-rows-2' : 'grid-rows-1'
              } grid-flow-col auto-cols-[86px] sm:auto-cols-[100px] gap-2.5 sm:gap-3 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-2 pt-1 -mx-3 px-3 sm:mx-0 sm:px-0`}
            >
              {activeCategories.map((category) => (
                <CategoryCard
                  key={category._id || category.slug}
                  slug={category.slug}
                  name={category.name}
                  icon={category.icon}
                  image={category.image}
                  count={category.itemCount || category.productCount}
                  to={ROUTES.CATEGORY.replace(':slug', category.slug)}
                />
              ))}
            </div>

            {/* 2. Desktop Layout: Responsive Grid for Database Categories */}
            <div className="hidden md:grid md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 gap-3 lg:gap-4 justify-items-center">
              {activeCategories.map((category) => (
                <CategoryCard
                  key={category._id || category.slug}
                  slug={category.slug}
                  name={category.name}
                  icon={category.icon}
                  image={category.image}
                  count={category.itemCount || category.productCount}
                  to={ROUTES.CATEGORY.replace(':slug', category.slug)}
                />
              ))}
            </div>
          </>
        )}
      </Container>
    </motion.section>
  );
}
