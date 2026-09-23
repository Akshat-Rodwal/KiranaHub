import Container from '../../components/common/Container.jsx';
import CategoryCard from '../../components/ui/CategoryCard.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { ROUTES } from '../../constants/index.js';
import { useCategories } from '../../hooks/useCategories.js';

export default function CategoriesPage() {
  const { data: serverCategories, isLoading, isError, refetch } = useCategories();

  const categories = Array.isArray(serverCategories)
    ? serverCategories.filter((c) => c.isActive !== false)
    : [];

  return (
    <div className="py-8 lg:py-12 bg-[#f7f9f7] min-h-[75vh]">
      <Container>
        <div className="max-w-xl mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs px-3 py-1 mb-2">
            ⚡ Quick-Commerce Aisles
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            All Grocery Aisles
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Select an aisle to explore farm-fresh products, pantry staples, and rapid 10-minute delivery items.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-x-2 gap-y-4 sm:gap-x-3 sm:gap-y-5">
            {Array.from({ length: 10 }, (_, index) => (
              <div key={index} className="flex flex-col items-center gap-2 animate-pulse" aria-hidden="true">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-100/90 border border-slate-200/50" />
                <div className="h-3 w-14 rounded-md bg-slate-100" />
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
        ) : categories.length === 0 ? (
          <EmptyState
            preset="empty-catalog"
            title="No categories found"
            description="Our shelves are being restocked. Please check back shortly."
          />
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-x-2 gap-y-5 sm:gap-x-3 sm:gap-y-6">
            {categories.map((category) => (
              <CategoryCard
                key={category._id || category.slug}
                slug={category.slug}
                name={category.name}
                icon={category.icon}
                image={category.image}
                count={category.itemCount || category.productCount}
                showCount={true}
                to={ROUTES.CATEGORY.replace(':slug', category.slug)}
              />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
