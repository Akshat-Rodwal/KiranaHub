# 🛒 KiranaHub — Kirana & General Store E-Commerce Platform

A production-grade, full-stack MERN e-commerce platform for local Kirana & General Stores.
Inspired by modern quick-commerce UX with a focus on performance, accessibility, and clean architecture.

---

## 🏗️ Tech Stack

### Frontend
- **React 19** — UI library
- **Vite** — Build tool & dev server
- **Tailwind CSS v4** — Utility-first styling with custom theme tokens
- **React Router** — Client-side routing
- **TanStack Query (React Query)** — Server state management
- **Zustand** — Client state (cart, wishlist, auth, UI)
- **Framer Motion** — Micro-interactions & page transitions
- **Axios** — HTTP client with interceptors
- **JavaScript** (ES Modules)

### Backend
- **Node.js + Express.js** — REST API server
- **MongoDB + Mongoose** — Database & ODM
- **JWT + bcrypt** — Authentication & password hashing (future phase)
- **CORS + Helmet + HPP + Rate Limit** — Security middleware
- **Morgan** — HTTP logging
- **Centralized Error Handling** — Consistent API responses
- **Environment-based config** — 12-factor compliant

---

## 📁 Project Structure

```
General Stroe app/
│
├── Frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src/
│   │   ├── assets/                  # Static images, icons
│   │   ├── components/
│   │   │   ├── common/              # Reusable (Button, Card, Input, Modal, ...)
│   │   │   └── ui/                  # Domain-specific UI (ProductCard, Navbar, ...)
│   │   ├── layouts/                 # MainLayout, AdminLayout, CheckoutLayout, ...
│   │   ├── pages/
│   │   │   ├── customer/            # Home, Categories, Product, Cart, ...
│   │   │   └── admin/               # Dashboard, Products, Orders, ...
│   │   ├── routes/                  # Route config + protected route wrappers
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── services/                # API layer (axios client, domain services)
│   │   ├── store/                   # Zustand stores (cart, auth, wishlist)
│   │   ├── utils/                   # Pure helpers (formatters, validators, ...)
│   │   ├── constants/               # Routes, keys, enums, config
│   │   ├── contexts/                # React Context providers (if needed)
│   │   ├── App.jsx                  # App root with routes
│   │   ├── main.jsx                 # React entry + providers (Router, QueryClient)
│   │   └── index.css                # Tailwind imports + custom theme tokens
│   ├── .env                         # Local env (VITE_*)
│   ├── .env.example                 # Template
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── Backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js               # dotenv loader + typed config
│   │   │   └── db.js                # MongoDB/Mongoose connection manager
│   │   ├── controllers/             # Request handlers (business orchestration)
│   │   ├── middleware/              # auth, errorHandler, notFound, rateLimit, ...
│   │   ├── models/                  # Mongoose schemas (User, Product, Order, ...)
│   │   ├── routes/                  # Express routers (v1 mounted under /api/v1)
│   │   │   ├── index.js             # v1 aggregator + /api/v1 landing
│   │   │   └── health.routes.js
│   │   ├── services/                # Pure business / data services (future phase)
│   │   ├── utils/
│   │   │   ├── ApiResponse.js       # Standard success envelope
│   │   │   ├── ApiError.js          # Standard error envelope with stack control
│   │   │   └── asyncHandler.js      # Promise wrapper + known error mapping
│   │   ├── validators/              # Input validation (future phase)
│   │   ├── constants/
│   │   │   ├── index.js             # DB_MODELS, USER_ROLES, ORDER_STATUS, ...
│   │   │   └── httpStatus.js        # HTTP status codes
│   │   ├── app.js                   # Express app + middleware wiring
│   │   └── server.js                # DB connect + HTTP listen + graceful shutdown
│   ├── .env                         # Local env (PORT, MONGO_URI, JWT, ...)
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** >= 18.x (LTS recommended)
- **npm** or **pnpm** / **yarn**
- **MongoDB** running locally (default: `mongodb://localhost:27017`)
  — or use MongoDB Atlas by updating `MONGO_URI` in `Backend/.env`

---

### 1️⃣ Start the Backend

```bash
cd Backend
npm install        # first time only
npm run dev        # starts with --watch on port 5000
```

Health check once running:
- **Browser / Postman:** `GET http://localhost:5000/api/v1/health`
- **cURL:**
  ```bash
  curl http://localhost:5000/api/v1/health
  ```

If MongoDB is running, the response will show `"status": "healthy"` with uptime, DB host, memory stats, etc.
If MongoDB is **not** reachable, health status will show `"degraded"` (server still runs so you can debug).

---

### 2️⃣ Start the Frontend

```bash
cd Frontend
npm install        # first time only
npm run dev        # Vite dev server (default http://localhost:5173)
```

Open `http://localhost:5173` in your browser. You'll see a placeholder **Phase 1 landing screen**
confirming the architecture is in place.

**Production build:**
```bash
npm run build
npm run preview
```

---

## 🔧 Environment Variables

### Backend (`Backend/.env`)

```dotenv
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/kirana-store
JWT_SECRET=change_me_in_production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=15
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (`Frontend/.env`)

```dotenv
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=KiranaHub
```

---

## ✅ Testing the MongoDB Connection

1. **Start MongoDB** locally or set `MONGO_URI` to your Atlas cluster.
2. Run the backend:
   ```bash
   cd Backend && npm run dev
   ```
3. You will see a banner on the terminal:
   ```
   [MongoDB] Connected successfully
   [MongoDB] Host: localhost
   [MongoDB] Database: kirana-store
   ```
4. Hit the health endpoint — `database.status` should be `"connected"`:
   ```
   GET http://localhost:5000/api/v1/health
   ```
5. Stop MongoDB, and the same endpoint will return HTTP **503** with
   `"status": "degraded"` — confirming graceful degradation.

---

## 🧱 Architectural Highlights (Phase 1)

### Backend
- **Clean separation:** `routes → controllers → services` (services TBD in Phase 2+)
- **Consistent response shape:** every successful response uses `ApiResponse`
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "...",
    "data": { },
    "timestamp": "2026-09-19T..."
  }
  ```
- **Consistent error shape:** all errors pass through `globalErrorHandler` → uniform JSON with optional stack trace in dev.
- **Async safety:** every route controller wrapped in `asyncHandler` — no unhandled promise rejections.
- **Known error mapping:** Mongoose `ValidationError`, `CastError`, duplicate key `11000`, JWT errors → meaningful HTTP codes.
- **Security defaults:** Helmet headers, CORS origin whitelist, JSON body size limit, HPACK param pollution protection, API-wide rate limiter (skipped on health endpoint).
- **Graceful shutdown:** SIGINT / SIGTERM close the HTTP server + disconnect Mongo before exit.

### Frontend
- **Tailwind v4 theme tokens:** brand palette, semantic colors (success/warning/danger/info), neutral stone-based surfaces, shadows, radii, font stacks, spacing.
- **Axios client singleton** with request auth interceptor + 401 refresh-token flow.
- **Zustand stores** scaffolded: `useCartStore` (with coupons & totals), `useAuthStore` (session persistence), `useWishlistStore`.
- **TanStack Query** wired globally with sane defaults (5 min stale, no refetch on tab).
- **React Router** with future route constants (`ROUTES` map in `constants/index.js`).

---

## 🧰 Scripts Reference

### Frontend
| Script | Description |
|--------|-------------|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview built app locally |
| `npm run lint` | oxlint static analysis |

### Backend
| Script | Description |
|--------|-------------|
| `npm run dev` | Dev server with `--watch` (no restart needed) |
| `npm start` | Production (non-watch) |
| `npm run seed` | DB seed script (placeholder — future phase) |

---

## 🔭 Left for Future Phases

- Authentication (JWT access + refresh, bcrypt, register/login endpoints, protected routes)
- Mongoose models: `User`, `Product`, `Category`, `Order`, `Cart`, `Address`, `Coupon`, `Review`, `Banner`, `Notification`, `StoreSetting`
- Customer-side pages: Home, Categories, Product listing/detail, Search, Filters, Cart, Checkout, Orders, Profile, Coupons, Reviews, Notifications
- Admin-side pages: Dashboard, Products CRUD, Categories, Inventory, Orders, Customers, Coupons, Banners, Homepage management, Reviews, Delivery, Analytics, Store settings
- Input validation layer (`validators/` with Joi / Zod)
- File uploads for product images & banners
- Tests, CI pipeline, Docker setup
