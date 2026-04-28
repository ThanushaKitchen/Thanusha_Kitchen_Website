// ============================================================
//  controllers/productController.js
//  Handles all product-related API logic.
// ============================================================

const pool = require('../config/db');

// ── GET /api/products ────────────────────────────────────────
// Returns all active products grouped by category.
// This replaces your products.js file on the frontend.
const getAllProducts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.id,
        p.name,
        p.subtitle,
        p.description,
        p.price,
        p.weight,
        p.badge,
        p.spice,
        p.img_url     AS img,
        p.stock_qty,
        c.slug        AS category,
        c.label       AS category_label
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE p.is_active = TRUE
      ORDER BY c.id ASC, p.id ASC
    `);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (err) {
    console.error('getAllProducts error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};

// ── GET /api/products/:id ────────────────────────────────────
// Returns a single product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT p.*, c.slug AS category, c.label AS category_label
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE p.id = $1 AND p.is_active = TRUE
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: result.rows[0] });

  } catch (err) {
    console.error('getProductById error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
};

module.exports = { getAllProducts, getProductById };
