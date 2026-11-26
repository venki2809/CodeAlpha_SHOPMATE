'use strict';
const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const auth = require('../controllers/authController');
const wrap = fn => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);
const loginLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 60, standardHeaders: 'draft-7', legacyHeaders: false });
module.exports = requireAuth => {
  router.post('/register', loginLimit, wrap(auth.register));
  router.post('/login', loginLimit, wrap(auth.login));
  router.get('/me', requireAuth, wrap(auth.profile));
  router.put('/profile', requireAuth, wrap(auth.updateProfile));
  return router;
};
