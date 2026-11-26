'use strict';
const router = require('express').Router();
const ctrl = require('../controllers/orderController');
const wrap = fn => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);
module.exports = requireAuth => {
  router.use(requireAuth);
  router.get('/', wrap(ctrl.mine));
  router.post('/', wrap(ctrl.create));
  router.get('/:id', wrap(ctrl.detail));
  return router;
};
