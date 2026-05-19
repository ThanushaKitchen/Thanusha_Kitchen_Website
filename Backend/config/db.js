// ============================================================
//  config/db.js
//  Works with Supabase (DATABASE_URL) on Vercel
//  and local PostgreSQL in development
// ============================================================

const { Pool } = require('pg');

// Supabase uses DATABASE_URL with SSL
// Local PostgreSQL uses individual variables
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false  // required for Supabase
      }
    })
  : new Pool({
      host:     process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME     || 'thanusha_kitchen',
      user:     process.env.DB_USER     || 'postgres',
      password: process.env.DB_PASSWORD || '',
    });

pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Connected to Supabase PostgreSQL');
    release();
  }
});

module.exports = pool;