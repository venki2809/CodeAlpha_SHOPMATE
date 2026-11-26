'use strict';
const mongoose = require('mongoose');
const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true }, image: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1, max: 10 }
}, { _id: false });
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: { type: [orderItemSchema], default: [] },
  shippingAddress: {
    name: String, email: String, phone: String, street: String,
    city: String, state: String, postalCode: String
  },
  subtotal: { type: Number, required: true }, shippingFee: { type: Number, required: true },
  total: { type: Number, required: true },
  paymentMethod: { type: String, default: 'COD', enum: ['COD'] },
  status: { type: String, default: 'Placed' }
}, { timestamps: true });
orderSchema.index({ user: 1, createdAt: -1 });
module.exports = mongoose.model('Order', orderSchema);
