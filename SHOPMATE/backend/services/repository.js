'use strict';
const bcrypt = require('bcryptjs');
const { getMode } = require('../config/database');
const json = require('./jsonDatabase');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const sample = require('../data/sampleProducts.json');
const { failure, shippingFor, money, filterCatalog } = require('./validation');

function clean(doc) {
  if (!doc) return null;
  const value = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  if (value._id != null) value._id = String(value._id);
  if (value.user != null) value.user = String(value.user);
  if (value.passwordHash) delete value.passwordHash;
  if ('isNewArrival' in value) { value.isNew = Boolean(value.isNewArrival); delete value.isNewArrival; }
  delete value.__v;
  return value;
}
const mongo = () => getMode() !== 'json';
async function initializeRepository() {
  const demo = { name: 'Demo Customer', email: 'demo@shopmate.test',
    passwordHash: await bcrypt.hash('Demo@12345', 10), phone: '9876543210',
    address: '18 Market Street', city: 'Chennai', postalCode: '600001' };
  if (!mongo()) { await json.initJSON(demo); return; }
  await Product.bulkWrite(sample.map(({ isNew, ...p }) => ({ updateOne: {
    filter: { slug: p.slug }, update: { $setOnInsert: { ...p, isNewArrival: Boolean(isNew) } }, upsert: true
  } })));
  if (!(await User.exists({ email: demo.email }))) await User.create(demo);
}
async function findUserByEmail(email) {
  return mongo() ? User.findOne({ email }).select('+passwordHash').lean() :
    json.snapshot().users.find(u => u.email === email) || null;
}
async function findUserById(id) {
  if (mongo()) return clean(await User.findById(id).lean());
  return clean(json.snapshot().users.find(u => u._id === id));
}
async function register({ name, email, password }) {
  const passwordHash = await bcrypt.hash(password, 10);
  if (mongo()) {
    if (await User.exists({ email })) throw failure('This email is already registered.', 409);
    return clean(await User.create({ name, email, passwordHash }));
  }
  return json.transaction((db, newId) => {
    if (db.users.some(u => u.email === email)) throw failure('This email is already registered.', 409);
    const user = { _id: newId(), name, email, passwordHash, phone: '', address: '', city: '',
      postalCode: '', createdAt: new Date().toISOString() };
    db.users.push(user);
    return clean(user);
  });
}
async function updateUser(id, updates) {
  if (mongo()) return clean(await User.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true }).lean());
  return json.transaction(db => {
    const user = db.users.find(u => u._id === id);
    if (!user) throw failure('Your account was not found.', 401);
    Object.assign(user, updates);
    return clean(user);
  });
}
async function listProducts(params) {
  const list = mongo() ? (await Product.find().lean()).map(clean) : json.snapshot().products;
  return filterCatalog(list, params);
}
async function getProduct(key) {
  if (mongo()) {
    const query = /^[0-9a-f]{24}$/i.test(key) ? { $or: [{ slug: key }, { _id: key }] } : { slug: key };
    return clean(await Product.findOne(query).lean());
  }
  return json.snapshot().products.find(p => p._id === key || p.slug === key) || null;
}
async function listOrders(userId) {
  const rows = mongo() ? await Order.find({ user: userId }).sort({ createdAt: -1 }).limit(100).lean() :
    json.snapshot().orders.filter(o => o.user === userId).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0,100);
  return rows.map(clean);
}
async function findOrder(id, userId) {
  const row = mongo() ? await Order.findOne({ _id: id, user: userId }).lean() :
    json.snapshot().orders.find(o => o._id === id && o.user === userId);
  return clean(row);
}
function orderLines(products, input) {
  const lines = [];
  for (const { productId, quantity } of input) {
    const product = products.find(p => String(p._id) === productId);
    if (!product) throw failure('A product in your cart is no longer available.', 409);
    if (product.stock < quantity) throw failure(`${product.name} has insufficient stock. Please update your bag.`, 409);
    lines.push({ product: productId, name: product.name, image: product.image, price: product.price, quantity });
  }
  return lines;
}
function assembleOrder(userId, lines, address) {
  const subtotal = money(lines.reduce((sum, line) => sum + line.price * line.quantity, 0));
  const shippingFee = shippingFor(subtotal);
  return { user: userId, items: lines, shippingAddress: address, subtotal, shippingFee,
    total: money(subtotal + shippingFee), paymentMethod: 'COD', status: 'Placed' };
}
let mongoOrderQueue = Promise.resolve();
function mongoExclusive(fn) {
  const job = mongoOrderQueue.then(fn);
  mongoOrderQueue = job.catch(() => {});
  return job;
}
async function placeOrder(userId, input, address) {
  if (!mongo()) {
    return json.transaction((db, id) => {
      const lines = orderLines(db.products, input);
      for (const line of lines) db.products.find(p => p._id === line.product).stock -= line.quantity;
      const now = new Date().toISOString();
      const order = { ...assembleOrder(userId, lines, address), _id: id(), createdAt: now, updatedAt: now };
      db.orders.push(order);
      return order;
    });
  }
  // Serializes this demo server's checkouts. Conditional stock changes prevent overselling.
  // A deployed shop with multiple processes should instead use a MongoDB replica-set transaction.
  return mongoExclusive(async () => {
    const products = (await Product.find({ _id: { $in: input.map(line => line.productId) } }).lean()).map(clean);
    const lines = orderLines(products, input);
    const deducted = [];
    try {
      for (const line of lines) {
        const result = await Product.updateOne({ _id: line.product, stock: { $gte: line.quantity } },
          { $inc: { stock: -line.quantity } });
        if (result.modifiedCount !== 1) throw failure(`${line.name} has insufficient stock.`, 409);
        deducted.push(line);
      }
      return clean(await Order.create(assembleOrder(userId, lines, address)));
    } catch (error) {
      for (const line of deducted) await Product.updateOne({ _id: line.product }, { $inc: { stock: line.quantity } }).catch(() => {});
      throw error;
    }
  });
}
module.exports = { initializeRepository, findUserByEmail, findUserById, register, updateUser,
  listProducts, getProduct, listOrders, findOrder, placeOrder, clean };
