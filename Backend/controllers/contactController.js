// ============================================================
//  controllers/contactController.js
//  Saves contact form submissions to the database
// ============================================================

const pool = require('../config/db');

// ── POST /api/contact ────────────────────────────────────────
// Saves a message from the contact form on index.html
const submitContact = async (req, res) => {
  try {
    const { firstName, lastName, email, subject, message } = req.body;

    // Basic validation
    if (!firstName || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'First name, email and message are required'
      });
    }

    await pool.query(
      `INSERT INTO contact_messages
         (first_name, last_name, email, subject, message)
       VALUES ($1, $2, $3, $4, $5)`,
      [firstName, lastName || '', email.toLowerCase(), subject || null, message]
    );

    console.log(`📩 New contact message from: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Message received! We will get back to you within 24 hours.'
    });

  } catch (err) {
    console.error('submitContact error:', err);
    res.status(500).json({ success: false, message: 'Failed to send message. Please try again.' });
  }
};

module.exports = { submitContact };


// ============================================================
//  controllers/couponController.js
//  Validates coupon codes from the checkout page
// ============================================================

// ── POST /api/coupons/validate ───────────────────────────────
// Checks if a coupon code is valid and returns the discount amount
const validateCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const result = await pool.query(
      `SELECT id, code, discount_amount, min_order_value
       FROM coupons
       WHERE code = $1
         AND is_active = TRUE
         AND (valid_until IS NULL OR valid_until > NOW())
         AND (max_uses IS NULL OR used_count < max_uses)`,
      [code.toUpperCase()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired coupon code'
      });
    }

    const coupon = result.rows[0];

    // Check minimum order value
    if (subtotal < parseFloat(coupon.min_order_value)) {
      return res.status(400).json({
        success: false,
        message: `Minimum order of ₹${coupon.min_order_value} required for this coupon`
      });
    }

    res.json({
      success:        true,
      code:           coupon.code,
      discountAmount: parseFloat(coupon.discount_amount),
      message:        `Coupon applied! You saved ₹${coupon.discount_amount}`
    });

  } catch (err) {
    console.error('validateCoupon error:', err);
    res.status(500).json({ success: false, message: 'Failed to validate coupon' });
  }
};

module.exports = { submitContact, validateCoupon };
