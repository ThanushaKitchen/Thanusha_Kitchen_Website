// ============================================================
//  config/db.js
//  PostgreSQL connection — works with Supabase
// ============================================================

const { Pool } = require('pg');

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false  // required for Supabase
      }
    })
  : new Pool({
      host:     process.env.DB_HOST,
      port:     parseInt(process.env.DB_PORT),
      database: process.env.DB_NAME,
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Supabase connection failed:', err.message);
  } else {
    console.log('✅ Connected to Supabase PostgreSQL');
    release();
  }
});

module.exports = pool;