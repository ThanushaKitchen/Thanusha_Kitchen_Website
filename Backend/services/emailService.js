// ============================================================
//  services/emailService.js
//  Handles all email sending for Thanusha's Kitchen
//  Uses Nodemailer with Gmail
// ============================================================

const nodemailer = require('nodemailer');

// Create reusable transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection on server start
transporter.verify((err, success) => {
  if (err) {
    console.error('❌ Email service failed:', err.message);
  } else {
    console.log('✅ Email service ready');
  }
});

/* =====================================================
   BUILD ORDER CONFIRMATION EMAIL HTML
===================================================== */
function buildOrderEmailHTML(orderNumber, payload) {
  const { customer, address, delivery, payment, items, subtotal, totalAmount } = payload;

  const paymentLabels = {
    upi:        'UPI Payment',
    card:       'Credit / Debit Card',
    netbanking: 'Net Banking',
    cod:        'Cash on Delivery'
  };

  const itemRows = items.map(item => `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #E8D5B0;color:#2C2C2C;font-size:14px;">
        ${item.name}
        <div style="font-size:12px;color:#6B6B6B;">${item.weight}</div>
      </td>
      <td style="padding:12px 16px;border-bottom:1px solid #E8D5B0;text-align:center;color:#6B6B6B;font-size:14px;">
        ${item.qty}
      </td>
      <td style="padding:12px 16px;border-bottom:1px solid #E8D5B0;text-align:right;font-weight:700;color:#C0392B;font-size:14px;">
        ₹${item.price * item.qty}
      </td>
    </tr>
  `).join('');

  const deliveryLabel = delivery.type === 'express'
    ? 'Express Delivery (2–3 days)'
    : 'Standard Delivery (5–7 days)';

  const codNotice = payment.method === 'cod' ? `
    <div style="background:#fff3e0;border:1px solid #ffcc80;border-radius:8px;padding:14px 16px;margin:20px 0;">
      <p style="margin:0;color:#e67e22;font-weight:700;font-size:14px;">
        💵 Cash on Delivery Order
      </p>
      <p style="margin:6px 0 0;color:#6B6B6B;font-size:13px;">
        Please keep exact change ready at the time of delivery.
      </p>
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body style="margin:0;padding:0;background:#FDF6EC;font-family:Arial,sans-serif;">

      <!-- Wrapper -->
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;margin-top:20px;margin-bottom:20px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <div style="background:#C0392B;padding:32px 32px 24px;text-align:center;">
          <h1 style="margin:0;color:white;font-size:24px;font-family:Georgia,serif;">
            🌶️ Thanusha's Kitchen
          </h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
            Authentic Homemade Andhra Pickles
          </p>
        </div>

        <!-- Success Banner -->
        <div style="background:#eafaf1;padding:24px 32px;text-align:center;border-bottom:1px solid #a9dfbf;">
          <div style="width:56px;height:56px;background:#27ae60;border-radius:50%;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;">
            <span style="color:white;font-size:24px;">✓</span>
          </div>
          <h2 style="margin:0;color:#1e8449;font-size:20px;">Order Placed Successfully!</h2>
          <p style="margin:6px 0 0;color:#6B6B6B;font-size:14px;">
            Thank you for ordering, ${customer.firstName}! Your pickles are being prepared.
          </p>
        </div>

        <!-- Body -->
        <div style="padding:28px 32px;">

          <!-- Order Number + Date -->
          <div style="display:flex;justify-content:space-between;margin-bottom:24px;background:#FDF6EC;border-radius:8px;padding:16px;">
            <div>
              <div style="font-size:11px;color:#6B6B6B;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Order Number</div>
              <div style="font-size:20px;font-weight:700;color:#C0392B;font-family:Georgia,serif;">
                #${orderNumber}
              </div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:11px;color:#6B6B6B;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Order Date</div>
              <div style="font-size:14px;font-weight:700;color:#6E2C00;">
                ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <h3 style="color:#6E2C00;font-size:16px;margin:0 0 12px;font-family:Georgia,serif;">
            🛒 Order Items
          </h3>
          <table style="width:100%;border-collapse:collapse;border:1px solid #E8D5B0;border-radius:8px;overflow:hidden;margin-bottom:24px;">
            <thead>
              <tr style="background:#C0392B;">
                <th style="padding:12px 16px;text-align:left;color:white;font-size:13px;font-weight:700;">Item</th>
                <th style="padding:12px 16px;text-align:center;color:white;font-size:13px;font-weight:700;">Qty</th>
                <th style="padding:12px 16px;text-align:right;color:white;font-size:13px;font-weight:700;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
            <tfoot>
              <tr style="background:#FDF6EC;">
                <td colspan="2" style="padding:10px 16px;font-size:13px;color:#6B6B6B;">Subtotal</td>
                <td style="padding:10px 16px;text-align:right;font-size:13px;color:#2C2C2C;">₹${subtotal}</td>
              </tr>
              <tr style="background:#FDF6EC;">
                <td colspan="2" style="padding:10px 16px;font-size:13px;color:#6B6B6B;">Delivery</td>
                <td style="padding:10px 16px;text-align:right;font-size:13px;color:#2C2C2C;">
                  ${delivery.charge === 0 ? 'FREE' : '₹' + delivery.charge}
                </td>
              </tr>
              <tr style="background:#FDF6EC;border-top:2px solid #E8D5B0;">
                <td colspan="2" style="padding:14px 16px;font-size:16px;font-weight:700;color:#6E2C00;font-family:Georgia,serif;">Total</td>
                <td style="padding:14px 16px;text-align:right;font-size:18px;font-weight:700;color:#C0392B;font-family:Georgia,serif;">₹${totalAmount}</td>
              </tr>
            </tfoot>
          </table>

          ${codNotice}

          <!-- Two columns — Delivery + Payment -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">

            <div style="background:#FDF6EC;border-radius:8px;padding:16px;">
              <div style="font-size:11px;color:#6B6B6B;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">
                📍 Delivery Address
              </div>
              <div style="font-size:13px;color:#6E2C00;line-height:1.7;">
                <strong>${customer.firstName} ${customer.lastName}</strong><br/>
                ${address.line1}<br/>
                ${address.line2 ? address.line2 + '<br/>' : ''}
                ${address.city}, ${address.state}<br/>
                Pincode: ${address.pincode}
              </div>
            </div>

            <div style="background:#FDF6EC;border-radius:8px;padding:16px;">
              <div style="font-size:11px;color:#6B6B6B;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">
                🚚 Delivery & Payment
              </div>
              <div style="font-size:13px;color:#6E2C00;line-height:1.7;">
                <strong>${deliveryLabel}</strong><br/>
                ${paymentLabels[payment.method] || payment.method}<br/>
                <span style="color:#27ae60;font-weight:700;">Status: Pending</span>
              </div>
            </div>

          </div>

          <!-- What happens next -->
          <div style="background:#FDF6EC;border-left:4px solid #C0392B;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:24px;">
            <h4 style="margin:0 0 10px;color:#6E2C00;font-size:14px;">What happens next?</h4>
            <p style="margin:0 0 6px;font-size:13px;color:#6B6B6B;">
              📞 We will call you within 24 hours to confirm your order.
            </p>
            <p style="margin:0 0 6px;font-size:13px;color:#6B6B6B;">
              📦 Your pickles will be freshly packed and dispatched.
            </p>
            <p style="margin:0;font-size:13px;color:#6B6B6B;">
              🚚 You will receive a tracking number once dispatched.
            </p>
          </div>

          <!-- Contact -->
          <p style="font-size:13px;color:#6B6B6B;text-align:center;margin:0;">
            Questions? Contact us at
            <a href="mailto:orders@thanushaskitchen.com" style="color:#C0392B;font-weight:700;">
              orders@thanushaskitchen.com
            </a>
            or call <strong style="color:#6E2C00;">+91 98765 43210</strong>
          </p>

        </div>

        <!-- Footer -->
        <div style="background:#6E2C00;padding:20px 32px;text-align:center;">
          <p style="margin:0;color:rgba(255,255,255,0.8);font-size:12px;">
            © 2025 Thanusha's Kitchen | Rajahmundry, Andhra Pradesh
          </p>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.6);font-size:11px;">
            100% Homemade · Zero Preservatives · Made with Love ❤️
          </p>
        </div>

      </div>

    </body>
    </html>
  `;
}

/* =====================================================
   SEND ORDER CONFIRMATION EMAIL
   Called from orderController.js after order is saved
===================================================== */
async function sendOrderConfirmation(orderNumber, payload) {
  const { customer } = payload;

  try {
    await transporter.sendMail({
      from:    process.env.EMAIL_FROM,
      to:      customer.email,
      subject: `✅ Order Confirmed — #${orderNumber} | Thanusha's Kitchen`,
      html:    buildOrderEmailHTML(orderNumber, payload)
    });

    console.log(`📧 Confirmation email sent to: ${customer.email}`);
    return true;

  } catch (err) {
    // Email failure should NOT stop the order from being placed
    console.error('❌ Email sending failed:', err.message);
    return false;
  }
}

/* =====================================================
   SEND ORDER NOTIFICATION TO OWNER
   Notifies Thanusha when a new order comes in
===================================================== */
async function sendOwnerNotification(orderNumber, payload) {
  const { customer, items, totalAmount, payment } = payload;

  const itemList = items.map(i => `${i.name} x${i.qty} — ₹${i.price * i.qty}`).join('\n');

  try {
    await transporter.sendMail({
      from:    process.env.EMAIL_FROM,
      to:      process.env.EMAIL_USER,   // send to yourself
      subject: `🛒 New Order #${orderNumber} — ₹${totalAmount}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px;">
          <h2 style="color:#C0392B;">New Order Received! 🎉</h2>
          <p><strong>Order:</strong> #${orderNumber}</p>
          <p><strong>Customer:</strong> ${customer.firstName} ${customer.lastName}</p>
          <p><strong>Email:</strong> ${customer.email}</p>
          <p><strong>Phone:</strong> ${customer.phone}</p>
          <p><strong>Payment:</strong> ${payment.method.toUpperCase()}</p>
          <p><strong>Total:</strong> ₹${totalAmount}</p>
          <hr/>
          <h3>Items:</h3>
          <pre style="background:#f5f5f5;padding:12px;border-radius:6px;">${itemList}</pre>
          <p style="color:#6B6B6B;font-size:12px;">
            Login to PG Admin to see full order details.
          </p>
        </div>
      `
    });

    console.log(`📧 Owner notification sent`);
  } catch (err) {
    console.error('❌ Owner notification failed:', err.message);
  }
}

module.exports = { sendOrderConfirmation, sendOwnerNotification };