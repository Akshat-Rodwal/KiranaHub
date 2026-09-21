import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import AnnouncementStrip from '../components/home/AnnouncementStrip.jsx';
import Navbar from '../components/navigation/Navbar.jsx';
import MobileBottomNavigation from '../components/navigation/MobileBottomNavigation.jsx';
import Footer from '../components/layout/Footer.jsx';
import ToastContainer from '../components/common/Toast.jsx';
import CartDrawer from '../components/cart/CartDrawer.jsx';
import MobileFloatingCartPill from '../components/cart/MobileFloatingCartPill.jsx';
import { ModalProvider } from '../components/common/Modal.jsx';
import PageTransition from '../components/common/PageTransition.jsx';

export default function CustomerLayout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <ModalProvider>
      <div className="flex min-h-screen flex-col bg-surface-soft text-text-primary antialiased">
        <AnnouncementStrip />
        <Navbar />

        <AnimatePresence mode="wait" initial={false}>
          <PageTransition key={location.pathname}>
            <div className="pb-20 md:pb-0">
              <main className="flex-1">
                <Outlet />
              </main>
              <Footer />
            </div>
          </PageTransition>
        </AnimatePresence>

        <MobileFloatingCartPill />
        <MobileBottomNavigation />
        <CartDrawer />
        <ToastContainer position="top-right" />
      </div>
    </ModalProvider>
  );
}
