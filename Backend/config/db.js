// ============================================================
//  config/db.js
//  PostgreSQL connection pool.
//  All database queries in the app use this pool.
// ============================================================

const { Pool } = require('pg');

// Create a connection pool using values from .env
const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Test the connection when the server starts
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Connected to PostgreSQL database:', process.env.DB_NAME);
    release();
  }
});

module.exports = pool;
