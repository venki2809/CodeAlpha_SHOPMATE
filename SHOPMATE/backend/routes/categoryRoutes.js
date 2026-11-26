'use strict';
const router = require('express').Router();
const ctrl = require('../controllers/productController');
router.get('/', ctrl.categories);
module.exports = router;
