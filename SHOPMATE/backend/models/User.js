'use strict';
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true },
  passwordHash: { type: String, required: true, select: false },
  phone: { type: String, default: '' }, address: { type: String, default: '' },
  city: { type: String, default: '' }, postalCode: { type: String, default: '' }
}, { timestamps: true });
module.exports = mongoose.model('User', userSchema);
