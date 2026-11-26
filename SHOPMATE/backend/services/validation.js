'use strict';
const CATEGORIES = ['Clothing', 'Shoes', 'Watches', 'Electronics', 'Accessories'];
const field = (value, max = 120) => typeof value === 'string' ? value.trim().slice(0, max + 1) : '';
const emailOf = value => field(value, 254).toLowerCase();
const validEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
const validPassword = value => typeof value === 'string' && value.length >= 8 && value.length <= 128;
const validId = value => typeof value === 'string' && /^[a-f0-9]{24}$/i.test(value);
const shippingFor = subtotal => subtotal >= 2999 ? 0 : 99;
const money = n => Math.round((n + Number.EPSILON) * 100) / 100;
const failure = (message, status = 400) => Object.assign(new Error(message), { status });
function validateAddress(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw failure('Please complete your delivery details.');
  const address = {
    name: field(raw.name, 80), email: emailOf(raw.email), phone: field(raw.phone, 24),
    street: field(raw.street, 200), city: field(raw.city, 80),
    state: field(raw.state, 80), postalCode: field(raw.postalCode, 12)
  };
  if (address.name.length < 2 || !validEmail(address.email) || !/^[+\d\s()-]{7,20}$/.test(address.phone) ||
    address.street.length < 5 || address.city.length < 2 || address.state.length < 2 ||
    !/^[A-Za-z\d -]{4,12}$/.test(address.postalCode)) {
    throw failure('Please complete your contact details and delivery address.');
  }
  return address;
}
function validateItems(items) {
  if (!Array.isArray(items) || !items.length || items.length > 30) throw failure('Cart must contain 1–30 products.');
  const used = new Set();
  return items.map(item => {
    if (!item || !validId(item.productId) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 10) {
      throw failure('Invalid products or quantities. Maximum 10 of each product.');
    }
    const productId = item.productId.toLowerCase();
    if (used.has(productId)) throw failure('A product appears twice in your cart.');
    used.add(productId);
    return { productId, quantity: item.quantity };
  });
}
function filterCatalog(list, params = {}) {
  const { category, search, featured, newArrival, offers, sort } = params;
  if (category && category !== 'All' && !CATEGORIES.includes(category)) throw failure('Unknown category.');
  let output = list.filter(p => (!category || category === 'All' || p.category === category)
    && (!search || p.name.toLowerCase().includes(String(search).trim().toLowerCase().slice(0, 80)))
    && (!featured || featured === 'false' || p.isFeatured)
    && (!newArrival || newArrival === 'false' || p.isNew)
    && (!offers || offers === 'false' || p.isOffer));
  if (sort === 'price_asc') output.sort((a,b) => a.price - b.price);
  else if (sort === 'price_desc') output.sort((a,b) => b.price - a.price);
  else if (sort === 'rating') output.sort((a,b) => b.rating - a.rating);
  else output.sort((a,b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const page = Math.max(1, Math.min(10000, parseInt(params.page, 10) || 1));
  const limit = Math.max(1, Math.min(36, parseInt(params.limit, 10) || 12));
  return { products: output.slice((page - 1) * limit, page * limit),
    pagination: { page, limit, total: output.length, pages: Math.ceil(output.length / limit) } };
}
module.exports = { CATEGORIES, field, emailOf, validEmail, validPassword, validId, shippingFor, money, failure, validateAddress, validateItems, filterCatalog };
