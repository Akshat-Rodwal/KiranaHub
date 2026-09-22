import Hero from '../../components/home/Hero.jsx';
import TopSingleBanner from '../../components/home/TopSingleBanner.jsx';
import CategorySection from '../../components/home/CategorySection.jsx';
import InstamartPromoCarousel from '../../components/home/InstamartPromoCarousel.jsx';
import StoreInfoSection from '../../components/home/StoreInfoSection.jsx';
import NewsletterSection from '../../components/home/NewsletterSection.jsx';
import ProductSection from '../../components/product/ProductSection.jsx';
import { ROUTES } from '../../constants/index.js';
import { useProducts } from '../../hooks/useProducts.js';

export default function HomePage() {
  const flashDealsQuery = useProducts({ flashDeal: true, limit: 6 });
  const staplesQuery = useProducts({ category: 'staples', limit: 6 });

  return (
    <div className="bg-[#f7f9f7] min-h-screen">
      {/* 1. Top Delivery & Promo Ticker (Compact Glassmorphic Bar) */}
      <Hero />

      {/* 2. Single Graphical Hero Banner */}
      <TopSingleBanner />

      {/* 3. Shop by Category Directly Below Top Banner */}
      <CategorySection />

      {/* 4. Swiggy Instamart 3-Card Promo Carousel */}
      <InstamartPromoCarousel />

      {/* 5. Shelf A: Trending / Flash Deals */}
      <ProductSection
        badge="⚡ Super Saver Deals"
        title="Trending / Flash Deals"
        subtitle="Limited-time discounted prices on everyday top essentials"
        products={flashDealsQuery.data?.items ?? []}
        isLoading={flashDealsQuery.isLoading}
        isError={flashDealsQuery.isError}
        onRetry={flashDealsQuery.refetch}
        to={`${ROUTES.PRODUCTS}?flashDeal=true`}
        viewAllLabel="View All →"
        dense
      />

      {/* 6. Shelf B: Daily Staples & Essentials */}
      <ProductSection
        badge="🌾 Kitchen Staples"
        title="Daily Staples & Essentials"
        subtitle="Unpolished pulses, stone-ground flours and aged basmati rice"
        products={staplesQuery.data?.items ?? []}
        isLoading={staplesQuery.isLoading}
        isError={staplesQuery.isError}
        onRetry={staplesQuery.refetch}
        to={`${ROUTES.PRODUCTS}?category=staples`}
        viewAllLabel="View All →"
        dense
      />

      {/* 7. Remaining Sections: Trust Badges & Newsletter */}
      <StoreInfoSection />
      <NewsletterSection />
    </div>
  );
}
