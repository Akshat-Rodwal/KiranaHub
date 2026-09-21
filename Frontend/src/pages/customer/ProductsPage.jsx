import { useState, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import Container from '../../components/common/Container.jsx';
import ConnectedProductCard from '../../components/product/ConnectedProductCard.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import { ROUTES, PRICE_RANGES, CATEGORY_ALIAS_MAP } from '../../constants/index.js';
import { useCategory } from '../../hooks/useCategory.js';
import { useCategories } from '../../hooks/useCategories.js';
import { useProducts } from '../../hooks/useProducts.js';
import {
  IconFilter,
  IconClose,
  IconChevronDown,
} from '../../utils/icons.jsx';

const PAGE_SIZE = 12;

const sortOptions = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating-desc', label: 'Customer Rating' },
  { value: 'newest', label: 'Newest Arrivals' },
];

export default function ProductsPage() {
  const { slug: routeSlug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryCategoryParam = searchParams.get('category');
  const flashDealParam = searchParams.get('flashDeal') === 'true';
  const bestSellerParam = searchParams.get('bestSeller') === 'true';
  const sortParam = searchParams.get('sort');

  // Resolve aliases (e.g. 'dairy' -> 'dairy-eggs-bread', 'atta-rice-dal' -> 'staples')
  const rawTarget = routeSlug || queryCategoryParam || '';
  const resolvedTarget = CATEGORY_ALIAS_MAP[rawTarget] || rawTarget;
  const isCategoryPage = Boolean(routeSlug || queryCategoryParam);

  // Filters and Sorting State
  const [selectedCategory, setSelectedCategory] = useState(resolvedTarget);
  const [prevTarget, setPrevTarget] = useState(rawTarget);
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [sort, setSort] = useState(sortParam || 'popular');
  const [page, setPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync category slug from URL
  if (prevTarget !== rawTarget) {
    setPrevTarget(rawTarget);
    setSelectedCategory(resolvedTarget);
    setPage(1);
  }

  // Fetch Category info & Categories list
  const categoryQuery = useCategory(resolvedTarget);
  const categoriesQuery = useCategories();
  const categories = categoriesQuery.data || [];

  // Build query params
  const queryParams = useMemo(() => {
    const params = {
      page,
      limit: PAGE_SIZE,
      sort,
    };

    const activeCat = selectedCategory || (isCategoryPage ? resolvedTarget : '');
    if (activeCat) {
      params.category = CATEGORY_ALIAS_MAP[activeCat] || activeCat;
    }

    if (flashDealParam) params.flashDeal = true;
    if (bestSellerParam) params.bestSeller = true;

    if (selectedPriceRange) {
      if (selectedPriceRange.min !== undefined && selectedPriceRange.min > 0) {
        params.minPrice = selectedPriceRange.min;
      }
      if (selectedPriceRange.max !== undefined && selectedPriceRange.max !== Infinity) {
        params.maxPrice = selectedPriceRange.max;
      }
    }

    if (inStockOnly) {
      params.inStock = true;
    }

    if (selectedBrand) {
      params.brand = selectedBrand;
    }

    return params;
  }, [page, sort, selectedCategory, isCategoryPage, resolvedTarget, flashDealParam, bestSellerParam, selectedPriceRange, inStockOnly, selectedBrand]);

  const productsQuery = useProducts(queryParams);

  const category = categoryQuery.data;
  const products = productsQuery.data?.items ?? [];
  const pagination = productsQuery.data?.pagination;

  const rawItems = productsQuery.data?.items;
  const availableBrands = useMemo(() => {
    const brandsSet = new Set(['Amul', 'Tata', 'Fortune', 'Aashirvaad', 'Nestle', 'Dettol', 'Dabur']);
    (rawItems || []).forEach((p) => {
      if (p.brand) brandsSet.add(p.brand);
    });
    return Array.from(brandsSet);
  }, [rawItems]);

  // Active filters count
  const activeFiltersCount =
    (selectedPriceRange ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (selectedBrand ? 1 : 0) +
    (!isCategoryPage && selectedCategory ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedPriceRange(null);
    setInStockOnly(false);
    setSelectedBrand('');
    if (!isCategoryPage) setSelectedCategory('');
    setPage(1);
  };

  const handleCategoryChange = (catSlug) => {
    setPage(1);
    if (isCategoryPage) {
      navigate(catSlug ? ROUTES.CATEGORY.replace(':slug', catSlug) : ROUTES.PRODUCTS);
    } else {
      setSelectedCategory(catSlug);
    }
  };

  const categoryNotFound =
    isCategoryPage && categoryQuery.isError && (categoryQuery.error?.statusCode === 404 || categoryQuery.error?.response?.status === 404);

  if (categoryNotFound && !categoriesQuery.isLoading && categories.length > 0) {
    return (
      <section className="section py-12">
        <Container>
          <EmptyState
            preset="generic"
            title="Aisle not found"
            description={`We couldn't locate the grocery aisle '${rawTarget || resolvedTarget}'. It may have been updated or restocked under a different name.`}
            action="Browse All Products"
            onAction={() => navigate(ROUTES.PRODUCTS)}
          />
        </Container>
      </section>
    );
  }

  const isLoading = productsQuery.isLoading;
  const isCategoryEmptyOrNotFound =
    productsQuery.isError &&
    (productsQuery.error?.response?.status === 404 ||
      productsQuery.error?.statusCode === 404);
  const isError = productsQuery.isError && !isCategoryEmptyOrNotFound;

  const currentCategoryName = isCategoryPage
    ? (category?.name || categories.find((c) => c.slug === resolvedTarget)?.name)
    : categories.find((c) => c.slug === selectedCategory)?.name;

  const title = currentCategoryName || 'All Grocery Products';
  const description = isCategoryPage
    ? category?.description || `Explore fresh products in ${category?.name}.`
    : 'Explore fresh groceries, pantry staples, dairy, and household essentials.';

  // Filter component
  const filterContent = (
    <div className="space-y-6">
      {/* Categories Filter */}
      <div>
        <h3 className="font-display text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
          Categories
        </h3>
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => handleCategoryChange('')}
            className={`w-full text-left px-3 py-1.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${
              !selectedCategory
                ? 'bg-brand-50 text-brand-700 font-semibold'
                : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary'
            }`}
          >
            <span>All Categories</span>
          </button>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.slug)}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-semibold'
                    : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary'
                }`}
              >
                <span className="truncate">{cat.name}</span>
                {cat.productCount > 0 && (
                  <span className="text-xs text-text-muted ml-2">
                    {cat.productCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <hr className="border-border-light" />

      {/* Price Range Filter */}
      <div>
        <h3 className="font-display text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
          Price Range
        </h3>
        <div className="space-y-1.5">
          {PRICE_RANGES.map((range) => {
            const isSelected = selectedPriceRange?.label === range.label;
            return (
              <label
                key={range.label}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-sm cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-brand-50 text-brand-700 font-semibold'
                    : 'text-text-secondary hover:bg-surface-muted'
                }`}
              >
                <input
                  type="radio"
                  name="priceRange"
                  checked={isSelected}
                  onChange={() => {
                    setSelectedPriceRange(isSelected ? null : range);
                    setPage(1);
                  }}
                  className="text-brand-600 focus:ring-brand-500 rounded-full"
                />
                <span>{range.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      <hr className="border-border-light" />

      {/* In-Stock Filter */}
      <div>
        <h3 className="font-display text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
          Availability
        </h3>
        <label className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-sm cursor-pointer text-text-secondary hover:bg-surface-muted">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => {
              setInStockOnly(e.target.checked);
              setPage(1);
            }}
            className="rounded border-border text-brand-600 focus:ring-brand-500"
          />
          <span className={inStockOnly ? 'font-semibold text-brand-700' : ''}>
            In Stock Only
          </span>
        </label>
      </div>

      <hr className="border-border-light" />

      {/* Brand Filter */}
      {availableBrands.length > 0 && (
        <div>
          <h3 className="font-display text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
            Brands
          </h3>
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {availableBrands.map((brand) => {
              const isSelected = selectedBrand === brand;
              return (
                <button
                  key={brand}
                  type="button"
                  onClick={() => {
                    setSelectedBrand(isSelected ? '' : brand);
                    setPage(1);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-sm transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'bg-brand-50 text-brand-700 font-semibold'
                      : 'text-text-secondary hover:bg-surface-muted'
                  }`}
                >
                  <span>{brand}</span>
                  {isSelected && <span className="text-brand-600 font-bold">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {activeFiltersCount > 0 && (
        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={clearAllFilters}
          >
            Reset All Filters
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <section className="py-6 lg:py-10">
      <Container>
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-border-light">
          <div>
            <p className="eyebrow text-brand-600">
              {isCategoryPage ? 'Category' : 'Store Catalog'}
            </p>
            <h1 className="headline mt-1 text-2xl text-text-primary sm:text-3xl font-bold">
              {title}
            </h1>
            <p className="mt-1 text-sm text-text-muted max-w-xl">
              {description}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            {/* Mobile Filter Trigger */}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-text-primary shadow-sm hover:bg-surface-muted transition-colors"
            >
              <IconFilter className="h-4 w-4 text-brand-600" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="relative flex items-center gap-2">
              <span className="hidden sm:inline text-xs font-semibold text-text-muted uppercase tracking-wider">
                Sort By:
              </span>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                  aria-label="Sort products by"
                  className="appearance-none rounded-xl border border-border bg-surface px-4 py-2 pr-9 text-sm font-semibold text-text-primary shadow-sm focus:border-brand-500 focus:outline-none transition-colors cursor-pointer"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <IconChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              </div>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 py-4">
            <span className="text-xs font-medium text-text-muted mr-1">
              Active filters:
            </span>
            {selectedPriceRange && (
              <Badge variant="primary" size="sm" className="flex items-center gap-1.5 py-1">
                <span>{selectedPriceRange.label}</span>
                <button
                  type="button"
                  onClick={() => setSelectedPriceRange(null)}
                  className="hover:text-danger-600 transition-colors"
                  aria-label="Remove price filter"
                >
                  <IconClose className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {inStockOnly && (
              <Badge variant="success" size="sm" className="flex items-center gap-1.5 py-1">
                <span>In Stock Only</span>
                <button
                  type="button"
                  onClick={() => setInStockOnly(false)}
                  className="hover:text-danger-600 transition-colors"
                  aria-label="Remove in-stock filter"
                >
                  <IconClose className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedBrand && (
              <Badge variant="secondary" size="sm" className="flex items-center gap-1.5 py-1">
                <span>Brand: {selectedBrand}</span>
                <button
                  type="button"
                  onClick={() => setSelectedBrand('')}
                  className="hover:text-danger-600 transition-colors"
                  aria-label="Remove brand filter"
                >
                  <IconClose className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {!isCategoryPage && selectedCategory && (
              <Badge variant="secondary" size="sm" className="flex items-center gap-1.5 py-1">
                <span>Category: {currentCategoryName || selectedCategory}</span>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('')}
                  className="hover:text-danger-600 transition-colors"
                  aria-label="Remove category filter"
                >
                  <IconClose className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline ml-2"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Main Grid with Sidebar */}
        <div className="mt-6 lg:grid lg:grid-cols-4 lg:gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 sticky top-24 rounded-3xl border border-border-light bg-surface p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <IconFilter className="h-4 w-4 text-brand-600" />
                <h2 className="font-display text-sm font-bold text-text-primary">
                  Filter Catalog
                </h2>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs font-medium text-text-muted hover:text-brand-600"
                >
                  Reset
                </button>
              )}
            </div>
            {filterContent}
          </aside>

          {/* Products Column */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-3">
                {Array.from({ length: PAGE_SIZE }, (_, index) => (
                  <div
                    key={index}
                    className="skeleton h-72 w-full rounded-2xl"
                    aria-hidden="true"
                  />
                ))}
              </div>
            ) : isError ? (
              <EmptyState
                preset="generic"
                title="Failed to load products"
                description="We encountered an issue fetching the catalog. Please try again."
                action="Retry"
                onAction={() => productsQuery.refetch()}
              />
            ) : products.length === 0 ? (
              <EmptyState
                preset="generic"
                title="No matching products"
                description="Try changing or resetting your filters to find what you are looking for."
                action="Clear All Filters"
                onAction={clearAllFilters}
              />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-3">
                  {products.map((product) => (
                    <ConnectedProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-3 pt-6 border-t border-border-light">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!pagination.hasPrevPage}
                      onClick={() => {
                        setPage((current) => current - 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      Previous
                    </Button>
                    <span className="text-sm font-medium text-text-secondary">
                      Page <span className="font-bold text-text-primary">{pagination.page}</span> of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!pagination.hasNextPage}
                      onClick={() => {
                        setPage((current) => current + 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Container>

      {/* Mobile Filter Slide-Over Drawer */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-y-0 right-0 max-w-xs w-full bg-surface shadow-2xl p-6 overflow-y-auto flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-border-light mb-6">
                  <div className="flex items-center gap-2">
                    <IconFilter className="h-5 w-5 text-brand-600" />
                    <h2 className="font-display text-base font-bold text-text-primary">
                      Filters
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-1 rounded-lg text-text-muted hover:text-text-primary"
                  >
                    <IconClose className="h-5 w-5" />
                  </button>
                </div>
                {filterContent}
              </div>

              <div className="pt-6 border-t border-border-light mt-6">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => setIsMobileFilterOpen(false)}
                >
                  Show Results ({pagination?.total ?? products.length})
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
