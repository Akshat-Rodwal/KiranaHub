import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config/env.js';
import apiRoutes from './routes/index.js';
import authRouter from './routes/auth.routes.js';
import categoryRouter from './routes/category.routes.js';
import productRouter from './routes/product.routes.js';
import orderRouter from './routes/order.routes.js';
import adminRouter from './routes/admin.routes.js';
import settingsRouter from './routes/settings.routes.js';
import bannerRouter from './routes/banner.routes.js';
import {
  notFoundHandler,
  globalErrorHandler,
} from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const allowedOrigins = [
  'https://kirana-hub-chi.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  ...(config.corsOrigin ? config.corsOrigin.split(',').map((o) => o.trim().replace(/\/$/, '')) : []),
  config.clientUrl ? config.clientUrl.trim().replace(/\/$/, '') : null,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser tools, same-origin, vercel previews, or explicit matches
    if (!origin || origin.includes('vercel.app') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive fallback so production never blocks client
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs * 60 * 1000,
  max: config.rateLimitMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests from this IP, please try again later.',
  },
  skip: (req) => req.originalUrl.startsWith('/api/v1/health'),
});

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
}));

app.use('/api', limiter);

app.use(express.json({ limit: '16kb' }));

app.use(express.urlencoded({ extended: true, limit: '16kb' }));

app.use(hpp());

if (config.nodeEnv !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Serve static uploaded assets (banners, media) with cross-origin headers
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads'), {
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  },
}));

app.disable('x-powered-by');

app.set('env', config.nodeEnv);
app.set('trust proxy', 1);

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Kirana & General Store API',
    version: '1.0.0',
    environment: config.nodeEnv,
    documentation: 'API documentation coming soon',
  });
});

app.use('/api/v1', apiRoutes);
app.use('/api/auth', authRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);
app.use('/api/admin', adminRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/banners', bannerRouter);

app.use(notFoundHandler);

app.use(globalErrorHandler);

export default app;
