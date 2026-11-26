'use strict';
const mongoose = require('mongoose');
const CATEGORIES = ['Clothing', 'Shoes', 'Watches', 'Electronics', 'Accessories'];
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  category: { type: String, required: true, enum: CATEGORIES },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, default: null },
  image: { type: String, required: true }, images: { type: [String], default: [] },
  description: { type: String, required: true }, details: { type: [String], default: [] },
  rating: { type: Number, min: 0, max: 5, default: 4.5 },
  reviewCount: { type: Number, default: 0 }, stock: { type: Number, min: 0, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isOffer: { type: Boolean, default: false }
}, { timestamps: true });
module.exports = mongoose.model('Product', productSchema);
module.exports.CATEGORIES = CATEGORIES;
