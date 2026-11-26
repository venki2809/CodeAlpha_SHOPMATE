'use strict';
const router = require('express').Router();
const ctrl = require('../controllers/productController');
const wrap = fn => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);
router.get('/', wrap(ctrl.list));
router.get('/:id', wrap(ctrl.detail));
module.exports = router;
