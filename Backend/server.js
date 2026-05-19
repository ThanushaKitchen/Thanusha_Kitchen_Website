require('dotenv').config();

const express      = require('express');
const cors         = require('cors');
const routes       = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');

const app = express();

/* =====================================================
   CORS — manually set headers so ALL origins work
   This fixes "Failed to fetch" from Netlify/Vercel
===================================================== */
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

/* =====================================================
   Body Parsers
===================================================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =====================================================
   Routes
===================================================== */
app.use('/api', routes);

/* =====================================================
   Root
===================================================== */
app.get('/', (req, res) => {
  res.json({
    message: "Thanusha's Kitchen API is running!",
    status:  'running',
    version: '1.0.0'
  });
});

/* =====================================================
   404 Handler
===================================================== */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`
  });
});

/* =====================================================
   Error Handler
===================================================== */
app.use(errorHandler);

/* =====================================================
   Start server — local only, NOT on Vercel
===================================================== */
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;