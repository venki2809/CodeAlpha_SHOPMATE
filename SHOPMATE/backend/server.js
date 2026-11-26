'use strict';
const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { startDatabase, stopDatabase, getMode } = require('./config/database');
const getSecret = require('./services/secret');
const auth = require('./controllers/authController');
const repo = require('./services/repository');
const makeAuth = require('./middleware/auth');
const { notFound, handleErrors } = require('./middleware/error');

function makeApp(secret) {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: (origin, done) => {
    const allowed = !origin || /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}):5173$/.test(origin) ||
      origin === process.env.CLIENT_URL;
    done(allowed ? null : new Error('Origin not permitted'), allowed);
  } }));
  app.use(express.json({ limit: '60kb' }));
  app.use('/api', rateLimit({ windowMs: 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false }));
  app.get('/api/health', (req,res) => res.json({ ok: true, service: 'SHOPMATE API', database: getMode(),
    products: 20, time: new Date().toISOString() }));
  const requireAuth = makeAuth(secret);
  app.use('/api/auth', require('./routes/authRoutes')(requireAuth));
  app.use('/api/products', require('./routes/productRoutes'));
  app.use('/api/categories', require('./routes/categoryRoutes'));
  app.use('/api/orders', require('./routes/orderRoutes')(requireAuth));
  if (process.env.NODE_ENV === 'production') {
    const webDir = path.join(__dirname, '..', 'frontend', 'dist');
    app.use(express.static(webDir));
    app.get(/^\/(?!api\/).*/, (req,res) => res.sendFile(path.join(webDir, 'index.html')));
  }
  app.use(notFound);
  app.use(handleErrors);
  return app;
}
async function start() {
  const secret = getSecret();
  auth.configureSecret(secret);
  await startDatabase();
  await repo.initializeRepository();
  const app = makeApp(secret);
  const port = Number(process.env.PORT) || 5000;
  const server = app.listen(port, () => {
    console.log(`🛍️ SHOPMATE Backend ready: http://localhost:${port}/api/health`);
    console.log(`📦 Database mode: ${getMode()} (no Atlas setup necessary)`);
    console.log(`🌐 Open website: http://localhost:${process.env.NODE_ENV === 'production' ? port : 5173}/`);
    console.log('🔑 Demo login: demo@shopmate.test / Demo@12345');
  });
  const stop = async () => { server.close(); await stopDatabase(); process.exit(0); };
  process.once('SIGINT', stop); process.once('SIGTERM', stop);
  return server;
}
if (require.main === module) start().catch(error => { console.error('SHOPMATE backend failed to start:', error); process.exit(1); });
module.exports = { makeApp, start };
