'use strict';
const repo = require('../services/repository');
const { validId, validateAddress, validateItems, failure } = require('../services/validation');
async function create(req, res) {
  if (req.body?.paymentMethod && req.body.paymentMethod !== 'COD') throw failure('Only demo Cash on Delivery is available.');
  const address = validateAddress(req.body?.shippingAddress);
  const input = validateItems(req.body?.items);
  const order = await repo.placeOrder(req.user._id, input, address);
  res.status(201).json({ message: 'Demo order saved on server.', order });
}
async function mine(req, res) { res.json({ orders: await repo.listOrders(req.user._id) }); }
async function detail(req, res) {
  if (!validId(req.params.id)) throw failure('Invalid order ID.');
  const order = await repo.findOrder(req.params.id, req.user._id);
  if (!order) throw failure('Order not found.', 404);
  res.json({ order });
}
module.exports = { create, mine, detail };
