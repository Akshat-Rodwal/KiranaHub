import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

import { ROUTES } from './constants/index.js';
import useAuthStore from './store/useAuthStore.js';
import CustomerLayout from './layouts/CustomerLayout.jsx';
import HomePage from './pages/customer/HomePage.jsx';
import CategoriesPage from './pages/customer/CategoriesPage.jsx';
import ProductsPage from './pages/customer/ProductsPage.jsx';
import ProductDetailPage from './pages/customer/ProductDetailPage.jsx';
import SearchPage from './pages/customer/SearchPage.jsx';
import CartPage from './pages/customer/CartPage.jsx';
import WishlistPage from './pages/customer/WishlistPage.jsx';
import AccountPage from './pages/customer/AccountPage.jsx';
import LoginPage from './pages/customer/LoginPage.jsx';
import RegisterPage from './pages/customer/RegisterPage.jsx';
import ForgotPasswordPage from './pages/customer/ForgotPasswordPage.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import AdminOrdersPage from './pages/admin/AdminOrdersPage.jsx';
import AdminProductsPage from './pages/admin/AdminProductsPage.jsx';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage.jsx';
import AdminSettingsPage from './pages/admin/AdminSettingsPage.jsx';
import AdminBannersPage from './pages/admin/AdminBannersPage.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import OrdersPage from './pages/customer/OrdersPage.jsx';
import CheckoutPage from './pages/customer/CheckoutPage.jsx';
import OrderSuccessPage from './pages/customer/OrderSuccessPage.jsx';
import DeliveryPartnerPage from './pages/delivery/DeliveryPartnerPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

function App() {
  useEffect(() => {
    useAuthStore.getState().initialize();
  }, []);

  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        {/* Public Storefront */}
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.CATEGORIES} element={<CategoriesPage />} />
        <Route path={ROUTES.CATEGORY} element={<ProductsPage />} />
        <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />
        <Route path={ROUTES.PRODUCT} element={<ProductDetailPage />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route path={ROUTES.SEARCH} element={<SearchPage />} />
        <Route path={ROUTES.CART} element={<CartPage />} />
        <Route path={ROUTES.WISHLIST} element={<WishlistPage />} />

        {/* Public Auth Routes */}
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />

        {/* Customer Protected Routes */}
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ACCOUNT}
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PROFILE}
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ORDERS}
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ORDER}
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CHECKOUT}
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-success/:orderId"
          element={
            <ProtectedRoute>
              <OrderSuccessPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Dedicated Delivery Partner Fleet App */}
      <Route path="/delivery" element={<DeliveryPartnerPage />} />

      {/* Admin/Manager Protected Operations */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="banners" element={<AdminBannersPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
