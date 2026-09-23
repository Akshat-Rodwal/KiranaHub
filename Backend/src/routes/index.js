import express from 'express';
import healthRouter from './health.routes.js';
import categoryRouter from './category.routes.js';
import productRouter from './product.routes.js';
import authRouter from './auth.routes.js';
import orderRouter from './order.routes.js';
import adminRouter from './admin.routes.js';
import settingsRouter from './settings.routes.js';
import bannerRouter from './banner.routes.js';
import paymentRouter from './payment.routes.js';
import cartRouter from './cart.routes.js';
import bundleRouter from './bundle.routes.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Kirana & General Store API v1',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/v1/health',
      categories: 'GET /api/v1/categories',
      categoryBySlug: 'GET /api/v1/categories/:slug',
      products: 'GET /api/v1/products',
      productBySlug: 'GET /api/v1/products/:slug',
      banners: 'GET /api/v1/banners',
      payments: {
        createOrder: 'POST /api/v1/payments/create-order',
        verify: 'POST /api/v1/payments/verify',
      },
      cart: {
        reserveStock: 'POST /api/v1/cart/reserve-stock',
        releaseStock: 'POST /api/v1/cart/release-stock',
      },
      auth: {
        register: 'POST /api/v1/auth/register',
        login: 'POST /api/v1/auth/login',
        me: 'GET /api/v1/auth/me',
        refreshToken: 'POST /api/v1/auth/refresh-token',
        logout: 'POST /api/v1/auth/logout',
      },
    },
  });
});

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/categories', categoryRouter);
router.use('/products', productRouter);
router.use('/orders', orderRouter);
router.use('/admin', adminRouter);
router.use('/settings', settingsRouter);
router.use('/banners', bannerRouter);
router.use('/payments', paymentRouter);
router.use('/cart', cartRouter);
router.use('/bundles', bundleRouter);

export default router;
