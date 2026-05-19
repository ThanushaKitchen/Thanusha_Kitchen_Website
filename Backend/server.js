// ============================================================
//  server.js
//  Main entry point for Thanusha's Kitchen backend server.
//  Run with: node server.js
//  Dev mode:  npm run dev  (auto-restarts on file changes)
// ============================================================

// Load environment variables from .env file FIRST
require('dotenv').config();

const express      = require('express');
const cors         = require('cors');
const routes       = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ────────────────────────────────────────────────

// CORS — tells the browser to allow requests from your frontend
// Without this, the browser will block all API calls
// app.use(cors({
//   origin: [
//     process.env.FRONTEND_URL,          // from .env e.g. http://127.0.0.1:5500
//     'http://localhost:5500',           // VS Code Live Server
//     'http://127.0.0.1:5500',          // VS Code Live Server alternate
//     'http://localhost:3000',           // common dev port
//     'https://thanusha-kitchen9.netlify.app' ,// deployed frontend URL
//   ],
//   origin: true,
//   methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true
// }));

app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.options('*', cors());

// Parse incoming JSON request bodies
// e.g. when checkout.html sends order data
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// ── Routes ───────────────────────────────────────────────────
// All routes are prefixed with /api
// e.g. /api/products, /api/orders, /api/payment/create
app.use('/api', routes);

// ── Root endpoint ────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message:  "Welcome to Thanusha's Kitchen API",
    version:  '1.0.0',
    status:   'running',
    endpoints: {
      products:        'GET  /api/products',
      singleProduct:   'GET  /api/products/:id',
      createOrder:     'POST /api/orders',
      getOrder:        'GET  /api/orders/:orderNumber',
      createPayment:   'POST /api/payment/create',
      verifyPayment:   'POST /api/payment/verify',
      contact:         'POST /api/contact',
      validateCoupon:  'POST /api/coupons/validate',
      health:          'GET  /api/health',
    }
  });
});

// ── 404 handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`
  });
});

// ── Global error handler ──────────────────────────────────────
app.use(errorHandler);

// ── Start the server ──────────────────────────────────────────
// app.listen(PORT, () => {
//   console.log('');
//   console.log("🌶️  Thanusha's Kitchen Backend");
//   console.log('================================');
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
//   console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
//   console.log(`📦 API Base: http://localhost:${PORT}/api`);
//   console.log('');
// });

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log('');
    console.log("🌶️  Thanusha's Kitchen Backend");
    console.log('================================');
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📦 API Base: http://localhost:${PORT}/api`);
    console.log('');
  });
}
module.exports = app;
