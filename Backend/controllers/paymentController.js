// ============================================================
//  controllers/paymentController.js
//  Handles Razorpay payment creation and verification.
//  Flow:
//   1. Frontend calls POST /api/payment/create
//   2. Backend creates Razorpay order → returns razorpay_order_id
//   3. Frontend opens Razorpay popup with razorpay_order_id
//   4. Customer pays
//   5. Frontend calls POST /api/payment/verify with payment details
//   6. Backend verifies signature → marks order as confirmed
// ============================================================

const Razorpay = require('razorpay');
const crypto  = require('crypto');
const pool    = require('../config/db');

// Initialise Razorpay with keys from .env
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── POST /api/payment/create ─────────────────────────────────
// Creates a Razorpay order before the payment popup opens
const createPayment = async (req, res) => {
  try {
    const { orderId, amount } = req.body;
    // amount comes in rupees — Razorpay needs paise (1 rupee = 100 paise)
    const amountInPaise = Math.round(parseFloat(amount) * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount:   amountInPaise,
      currency: 'INR',
      receipt:  orderId,
    });

    // Save the Razorpay order ID in our payments table
    await pool.query(
      `UPDATE payments
       SET razorpay_order_id = $1
       WHERE order_id = $2`,
      [razorpayOrder.id, orderId]
    );

    res.json({
      success:          true,
      razorpayOrderId:  razorpayOrder.id,
      amount:           amountInPaise,
      currency:         'INR',
      // Send the KEY_ID to frontend (never send KEY_SECRET to frontend)
      keyId:            process.env.RAZORPAY_KEY_ID,
    });

  } catch (err) {
    console.error('createPayment error:', err);
    res.status(500).json({ success: false, message: 'Failed to create payment' });
  }
};

// ── POST /api/payment/verify ─────────────────────────────────
// Verifies Razorpay signature after customer completes payment.
// This is the security step — ensures payment is genuine.
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = req.body;

    // ── Verify the signature ─────────────────────────────────
    // Razorpay signs: razorpay_order_id + "|" + razorpay_payment_id
    // We verify this using our KEY_SECRET
    const signatureBody = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(signatureBody)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      // Signature mismatch — payment is NOT genuine
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed. Invalid signature.'
      });
    }

    // ── Signature is valid — update payment record ───────────
    await pool.query(
      `UPDATE payments SET
         razorpay_payment_id = $1,
         razorpay_signature  = $2,
         status              = 'success',
         updated_at          = NOW()
       WHERE order_id = $3`,
      [razorpay_payment_id, razorpay_signature, orderId]
    );

    // ── Mark the order as confirmed ──────────────────────────
    await pool.query(
      `UPDATE orders SET status = 'confirmed', updated_at = NOW()
       WHERE id = $1`,
      [orderId]
    );

    console.log(`✅ Payment verified for order: ${orderId}`);

    res.json({
      success: true,
      message: 'Payment verified successfully'
    });

  } catch (err) {
    console.error('verifyPayment error:', err);
    res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
};

module.exports = { createPayment, verifyPayment };
