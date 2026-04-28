// ============================================================
//  routes/index.js
//  All API routes for Thanusha's Kitchen backend.
//  Each route maps a URL + HTTP method to a controller function.
// ============================================================

const express = require('express');
const router  = express.Router();

// Import controllers
const { getAllProducts, getProductById }   = require('../controllers/productController');
const { createOrder, getOrderByNumber }    = require('../controllers/orderController');
const { createPayment, verifyPayment }     = require('../controllers/paymentController');
const { submitContact, validateCoupon }    = require('../controllers/contactController');

// ── PRODUCTS ─────────────────────────────────────────────────
// GET  /api/products        → all active products
// GET  /api/products/:id    → single product
router.get('/products',     getAllProducts);
router.get('/products/:id', getProductById);

// ── ORDERS ───────────────────────────────────────────────────
// POST /api/orders               → place a new order
// GET  /api/orders/:orderNumber  → look up an order
router.post('/orders',              createOrder);
router.get('/orders/:orderNumber',  getOrderByNumber);

// ── PAYMENTS ─────────────────────────────────────────────────
// POST /api/payment/create  → create Razorpay order
// POST /api/payment/verify  → verify payment after completion
router.post('/payment/create', createPayment);
router.post('/payment/verify', verifyPayment);

// ── CONTACT ──────────────────────────────────────────────────
// POST /api/contact → save contact form message
router.post('/contact', submitContact);

// ── COUPONS ──────────────────────────────────────────────────
// POST /api/coupons/validate → check if coupon code is valid
router.post('/coupons/validate', validateCoupon);

// ── HEALTH CHECK ─────────────────────────────────────────────
// GET /api/health → quickly check if the server is running
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: "Thanusha's Kitchen API is running!",
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
