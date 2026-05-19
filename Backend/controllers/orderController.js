// ============================================================
//  controllers/orderController.js
//  Handles order creation and retrieval.
//  Called when customer clicks "Place Order" on checkout.html
// ============================================================

const { sendOrderConfirmation, sendOwnerNotification } = require('../services/emailService');
const pool   = require('../config/db');

// ── Helper: generate order number like TK-482931 ─────────────
function generateOrderNumber() {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `TK-${num}`;
}

// ── POST /api/orders ─────────────────────────────────────────
// Creates a new order from the checkout form data.
// Body expected from checkout.html:
// {
//   customer: { firstName, lastName, email, phone },
//   address:  { line1, line2, city, state, pincode },
//   delivery: { type, charge, note },
//   payment:  { method },
//   items:    [{ id, name, weight, price, qty }],
//   coupon:   { code, discountAmount } | null,
//   subtotal, totalAmount
// }
const createOrder = async (req, res) => {
  // Use a transaction so if anything fails, nothing is saved
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const {
      customer,
      address,
      delivery,
      payment,
      items,
      coupon,
      subtotal,
      totalAmount
    } = req.body;

    // ── 1. Find or create the customer ──────────────────────
    let customerId = null;

    const existingCustomer = await client.query(
      'SELECT id FROM customers WHERE email = $1',
      [customer.email.toLowerCase()]
    );

    if (existingCustomer.rows.length > 0) {
      // Customer already exists — use their ID
      customerId = existingCustomer.rows[0].id;

      // Update their phone in case it changed
      await client.query(
        'UPDATE customers SET phone = $1, updated_at = NOW() WHERE id = $2',
        [customer.phone, customerId]
      );

    } else {
      // New customer — create a record
      const newCustomer = await client.query(
        `INSERT INTO customers (first_name, last_name, email, phone)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [customer.firstName, customer.lastName, customer.email.toLowerCase(), customer.phone]
      );
      customerId = newCustomer.rows[0].id;
    }

    // ── 2. Look up coupon if one was used ───────────────────
    let couponId       = null;
    let discountAmount = 0;

    if (coupon && coupon.code) {
      const couponResult = await client.query(
        `SELECT id, discount_amount FROM coupons
         WHERE code = $1
           AND is_active = TRUE
           AND (valid_until IS NULL OR valid_until > NOW())
           AND (max_uses IS NULL OR used_count < max_uses)`,
        [coupon.code.toUpperCase()]
      );

      if (couponResult.rows.length > 0) {
        couponId       = couponResult.rows[0].id;
        discountAmount = parseFloat(couponResult.rows[0].discount_amount);

        // Increment the coupon used count
        await client.query(
          'UPDATE coupons SET used_count = used_count + 1 WHERE id = $1',
          [couponId]
        );
      }
    }

    // ── 3. Create the order ─────────────────────────────────
    const orderNumber = generateOrderNumber();

    const orderResult = await client.query(
      `INSERT INTO orders (
        order_number,
        customer_id,
        customer_first_name, customer_last_name,
        customer_email, customer_phone,
        address_line1, address_line2,
        city, state, pincode,
        delivery_type, delivery_charge, delivery_note,
        coupon_id, coupon_code, discount_amount,
        subtotal, total_amount,
        payment_method, status
      ) VALUES (
        $1,  $2,
        $3,  $4,
        $5,  $6,
        $7,  $8,
        $9,  $10, $11,
        $12, $13, $14,
        $15, $16, $17,
        $18, $19,
        $20, 'pending'
      ) RETURNING id, order_number`,
      [
        orderNumber,
        customerId,
        customer.firstName, customer.lastName || '',
        customer.email.toLowerCase(), customer.phone,
        address.line1, address.line2 || null,
        address.city, address.state, address.pincode,
        delivery.type, delivery.charge, delivery.note || null,
        couponId, coupon?.code?.toUpperCase() || null, discountAmount,
        subtotal, totalAmount,
        payment.method
      ]
    );

    const orderId = orderResult.rows[0].id;

    // ── 4. Insert order items ────────────────────────────────
    for (const item of items) {
      const lineTotal = item.price * item.qty;

      await client.query(
        `INSERT INTO order_items
           (order_id, product_id, product_name, product_weight, unit_price, quantity, line_total)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [orderId, item.id, item.name, item.weight, item.price, item.qty, lineTotal]
      );

      // Reduce stock
      await client.query(
        'UPDATE products SET stock_qty = stock_qty - $1 WHERE id = $2',
        [item.qty, item.id]
      );
    }

    // ── 5. Create a pending payment record ───────────────────
    await client.query(
      `INSERT INTO payments (order_id, payment_method, amount, status)
       VALUES ($1, $2, $3, 'pending')`,
      [orderId, payment.method, totalAmount]
    );

    // ── 6. Commit everything ────────────────────────────────
    await client.query('COMMIT');

    console.log(`✅ Order created: ${orderNumber}`);

    // Send emails (don't await — don't block the response)
    sendOrderConfirmation(orderNumber, req.body);
    sendOwnerNotification(orderNumber, req.body);

    res.status(201).json({
      success:     true,
      orderNumber: orderNumber,
      orderId:     orderId,
      message:     'Order placed successfully'
    });

  } catch (err) {
    // If anything went wrong, undo all changes
    await client.query('ROLLBACK');
    console.error('createOrder error:', err);
    res.status(500).json({ success: false, message: 'Failed to place order. Please try again.' });

  } finally {
    client.release();
  }
};

// ── GET /api/orders/:orderNumber ────────────────────────────
// Lets a customer look up their order by order number
const getOrderByNumber = async (req, res) => {
  try {
    const { orderNumber } = req.params;

    // Get order details
    const orderResult = await pool.query(
      `SELECT
         o.order_number, o.status, o.total_amount,
         o.delivery_type, o.delivery_charge,
         o.customer_first_name, o.customer_last_name,
         o.customer_email,
         o.address_line1, o.address_line2, o.city, o.state, o.pincode,
         o.payment_method, o.created_at
       FROM orders o
       WHERE o.order_number = $1`,
      [orderNumber.toUpperCase()]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Get order items
    const itemsResult = await pool.query(
      `SELECT product_name, product_weight, unit_price, quantity, line_total
       FROM order_items WHERE order_id = (
         SELECT id FROM orders WHERE order_number = $1
       )`,
      [orderNumber.toUpperCase()]
    );

    res.json({
      success: true,
      data: {
        order: orderResult.rows[0],
        items: itemsResult.rows
      }
    });

  } catch (err) {
    console.error('getOrderByNumber error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch order' });
  }
};

module.exports = { createOrder, getOrderByNumber };
