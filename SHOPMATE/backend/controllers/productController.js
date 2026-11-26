'use strict';
const repo = require('../services/repository');
const { CATEGORIES, failure } = require('../services/validation');
async function list(req, res) { res.json(await repo.listProducts(req.query)); }
async function detail(req, res) {
  const product = await repo.getProduct(req.params.id);
  if (!product) throw failure('Product not found.', 404);
  res.json({ product });
}
function categories(req, res) { res.json({ categories: CATEGORIES }); }
module.exports = { list, detail, categories };
