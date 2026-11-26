'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');
const { randomBytes } = require('node:crypto');
const { localFolder } = require('../config/database');
const seed = require('../data/sampleProducts.json');
let state;
let queue = Promise.resolve();
const filename = path.join(localFolder, 'shopmate-data.json');
const id = () => randomBytes(12).toString('hex');

async function persist(value) {
  await fs.mkdir(localFolder, { recursive: true });
  const temporary = path.join(localFolder, `data-${process.pid}-${randomBytes(3).toString('hex')}.tmp`);
  await fs.writeFile(temporary, JSON.stringify(value, null, 2), { encoding: 'utf8', mode: 0o600 });
  await fs.rename(temporary, filename);
}
async function initJSON(demoUser) {
  if (state) return;
  try { state = JSON.parse(await fs.readFile(filename, 'utf8')); }
  catch (e) { if (e.code !== 'ENOENT') throw e; state = { users: [], products: seed, orders: [] }; }
  if (!Array.isArray(state.users) || !Array.isArray(state.products) || !Array.isArray(state.orders)) throw new Error('Invalid JSON demo database.');
  if (!state.users.some(u => u.email === demoUser.email)) state.users.push({ ...demoUser, _id: 'dddddddddddddddddddddddd' });
  await persist(state);
}
function snapshot() {
  if (!state) throw new Error('JSON database is not initialized.');
  return structuredClone(state);
}
function transaction(change) {
  // Only commit the new file if all validation and mutations succeed.
  const run = async () => {
    const next = snapshot();
    const result = await change(next, id);
    await persist(next);
    state = next;
    return result;
  };
  const completion = queue.then(run);
  queue = completion.catch(() => {});
  return completion;
}
module.exports = { initJSON, snapshot, transaction, id, filename };
