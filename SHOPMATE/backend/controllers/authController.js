'use strict';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const repo = require('../services/repository');
const { emailOf, field, validEmail, validPassword, failure } = require('../services/validation');
let secret;
function configureSecret(value) { secret = value; }
const tokenFor = user => jwt.sign({ id: user._id }, secret, { expiresIn: '7d', algorithm: 'HS256' });
async function register(req, res) {
  const name = field(req.body?.name, 80), email = emailOf(req.body?.email), password = req.body?.password;
  if (name.length < 2 || name.length > 80 || !validEmail(email) || !validPassword(password)) {
    throw failure('Enter a name (2–80 chars), valid email and password (8–128 chars).');
  }
  const user = await repo.register({ name, email, password });
  res.status(201).json({ token: tokenFor(user), user });
}
async function login(req, res) {
  const email = emailOf(req.body?.email), password = req.body?.password;
  if (!validEmail(email) || typeof password !== 'string') throw failure('Enter a valid email and password.');
  const candidate = await repo.findUserByEmail(email);
  if (!candidate || !await bcrypt.compare(password, candidate.passwordHash)) throw failure('Incorrect email or password.', 401);
  const user = repo.clean(candidate);
  res.json({ token: tokenFor(user), user });
}
async function profile(req, res) { res.json({ user: req.user }); }
async function updateProfile(req, res) {
  const fields = req.body || {};
  const updates = {};
  for (const key of ['name', 'phone', 'address', 'city', 'postalCode']) {
    if (Object.hasOwn(fields, key)) {
      if (typeof fields[key] !== 'string') throw failure(`Invalid ${key}.`);
      const limit = key === 'address' ? 200 : 80;
      updates[key] = field(fields[key], limit);
      if (updates[key].length > limit) throw failure(`${key} is too long.`);
    }
  }
  const name = updates.name ?? req.user.name;
  if (name.length < 2 || name.length > 80) throw failure('Name must contain 2–80 characters.');
  if (updates.phone && !/^[+\d\s()-]{7,20}$/.test(updates.phone)) throw failure('Enter a valid phone number.');
  const user = await repo.updateUser(req.user._id, updates);
  res.json({ user });
}
module.exports = { configureSecret, register, login, profile, updateProfile };
