'use strict';
const jwt = require('jsonwebtoken');
const repo = require('../services/repository');
const { failure } = require('../services/validation');
function makeAuth(secret) {
  return async function requireAuth(req, res, next) {
    try {
      const match = /^Bearer\s+(.+)$/i.exec(req.headers.authorization || '');
      if (!match) throw failure('Please sign in to continue.', 401);
      const decoded = jwt.verify(match[1], secret, { algorithms: ['HS256'] });
      const user = await repo.findUserById(decoded.id);
      if (!user) throw failure('Your account is no longer available.', 401);
      req.user = user;
      next();
    } catch (e) {
      if (e.name === 'TokenExpiredError' || e.name === 'JsonWebTokenError') return next(failure('Your session has expired. Please sign in again.', 401));
      next(e);
    }
  };
}
module.exports = makeAuth;
