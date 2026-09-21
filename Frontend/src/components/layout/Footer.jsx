import { Link } from 'react-router-dom';
import Container from '../common/Container.jsx';
import { ROUTES } from '../../constants/index.js';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-stone-200/80 pt-12 pb-16 text-stone-600 text-xs sm:text-[13px]">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12">
          
          {/* Column 1: Useful Links (Span 4) */}
          <div className="md:col-span-4">
            <h3 className="font-display font-black text-sm sm:text-base text-stone-900 mb-4 tracking-tight">
              Useful Links
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2.5 text-stone-500 font-medium">
              <Link to={ROUTES.HOME} className="hover:text-stone-900 transition-colors">About Us</Link>
              <Link to={ROUTES.PRODUCTS} className="hover:text-stone-900 transition-colors">Shop All</Link>
              <Link to={ROUTES.CATEGORIES} className="hover:text-stone-900 transition-colors">Categories</Link>
              <Link to={ROUTES.HOME} className="hover:text-stone-900 transition-colors">Partner</Link>
              <Link to={ROUTES.HOME} className="hover:text-stone-900 transition-colors">Franchise</Link>
              <Link to={ROUTES.HOME} className="hover:text-stone-900 transition-colors">Seller</Link>
              <Link to={ROUTES.HOME} className="hover:text-stone-900 transition-colors">Warehouse</Link>
              <Link to={ROUTES.HOME} className="hover:text-stone-900 transition-colors">Deliver</Link>
              <Link to={ROUTES.HOME} className="hover:text-stone-900 transition-colors">Resources</Link>
              <Link to={ROUTES.HOME} className="hover:text-stone-900 transition-colors">Recipes</Link>
              <Link to={ROUTES.HOME} className="hover:text-stone-900 transition-colors">Privacy Policy</Link>
              <Link to={ROUTES.HOME} className="hover:text-stone-900 transition-colors">Terms of Use</Link>
              <Link to={ROUTES.HOME} className="hover:text-stone-900 transition-colors">FAQs</Link>
              <Link to={ROUTES.HOME} className="hover:text-stone-900 transition-colors">Security</Link>
              <Link to={ROUTES.HOME} className="hover:text-stone-900 transition-colors">Contact Support</Link>
            </div>
          </div>

          {/* Column 2: Categories (Span 8) */}
          <div className="md:col-span-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-black text-sm sm:text-base text-stone-900 tracking-tight">
                Categories
              </h3>
              <Link
                to={ROUTES.CATEGORIES}
                className="font-extrabold text-[#0c831f] hover:text-[#0a6d1a] transition-colors"
              >
                see all
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2.5 text-stone-500 font-medium">
              <Link to="/category/fruits-vegetables" className="hover:text-stone-900 transition-colors">Vegetables & Fruits</Link>
              <Link to="/category/dairy-eggs-bread" className="hover:text-stone-900 transition-colors">Dairy, Bread & Eggs</Link>
              <Link to="/category/staples" className="hover:text-stone-900 transition-colors">Atta, Rice & Dal</Link>
              <Link to="/category/spices-masala" className="hover:text-stone-900 transition-colors">Oil, Ghee & Masala</Link>
              <Link to="/category/snacks" className="hover:text-stone-900 transition-colors">Chips & Namkeen</Link>
              <Link to="/category/beverages" className="hover:text-stone-900 transition-colors">Drinks & Juices</Link>
              <Link to="/category/breakfast-instant" className="hover:text-stone-900 transition-colors">Instant Food</Link>
              <Link to="/category/baby-care" className="hover:text-stone-900 transition-colors">Baby Care</Link>
              <Link to="/category/home-care" className="hover:text-stone-900 transition-colors">Cleaning Essentials</Link>
              <Link to="/category/personal-care" className="hover:text-stone-900 transition-colors">Personal Care</Link>
              <Link to="/category/beverages" className="hover:text-stone-900 transition-colors">Tea, Coffee & Drinks</Link>
              <Link to="/products" className="hover:text-stone-900 transition-colors">All Products</Link>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & App Downloads */}
        <div className="pt-8 border-t border-stone-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
          <div>
            <p className="font-bold text-stone-800">
              © KiranaHub Commerce Private Limited, 2016-2026
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-bold text-stone-700">Download App:</span>
            <span className="px-2.5 py-1 rounded-lg border border-stone-200 bg-stone-50 font-bold text-stone-800 text-[10px]">
              App Store
            </span>
            <span className="px-2.5 py-1 rounded-lg border border-stone-200 bg-stone-50 font-bold text-stone-800 text-[10px]">
              Google Play
            </span>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-4 text-[10px] text-stone-400 leading-relaxed text-center sm:text-left">
          &ldquo;KiranaHub&rdquo; is an artisan hyperlocal quick commerce platform owned and managed by KiranaHub Commerce Private Limited. Express delivery within 8-10 minutes is powered by dark stores across verified service pin codes.
        </div>
      </Container>
    </footer>
  );
}
