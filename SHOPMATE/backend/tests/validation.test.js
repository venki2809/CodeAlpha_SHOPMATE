'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const samples = require('../data/sampleProducts.json');
const { validateItems, validateAddress, shippingFor, filterCatalog, validPassword } = require('../services/validation');
test('20 seeded photos and five categories', () => {
  assert.equal(samples.length, 20);
  assert.equal(new Set(samples.map(p => p.category)).size, 5);
  assert.ok(samples.every(p => p.image.startsWith('https://images.unsplash.com/')));
});
test('server-derived shipping', () => {
  assert.equal(shippingFor(2998), 99);
  assert.equal(shippingFor(2999), 0);
});
test('reject duplicated products and invalid quantity', () => {
  const id = samples[0]._id;
  assert.throws(() => validateItems([{productId:id,quantity:1},{productId:id,quantity:2}]), /twice/);
  assert.throws(() => validateItems([{productId:id,quantity:11}]), /Invalid/);
});
test('search filters category and price sort', () => {
  const listing = filterCatalog(samples, {category:'Shoes', sort:'price_asc'});
  assert.equal(listing.pagination.total, 4);
  assert.equal(listing.products[0].price, 2299);
});
test('checkout address input validation', () => {
  assert.throws(() => validateAddress({name:'x'}), /complete/);
  assert.equal(validateAddress({name:'Customer', email:'a@b.com', phone:'9876543210',street:'12 Main Street',city:'Chennai',state:'Tamil Nadu',postalCode:'600001'}).city,'Chennai');
});
test('password validation', () => { assert.equal(validPassword('Password123'),true); assert.equal(validPassword('abc'), false); });
