'use strict';
const path = require('node:path');
const fs = require('node:fs');
const mongoose = require('mongoose');
let embeddedMongo = null;
let mode = 'starting';
const localFolder = path.join(__dirname, '..', '.local');

async function startDatabase() {
  const preference = String(process.env.DATA_MODE || 'auto').toLowerCase();
  if (!['auto', 'mongo', 'json'].includes(preference)) throw new Error('DATA_MODE must be auto, mongo or json');
  if (preference === 'json') { mode = 'json'; return mode; }
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
      mode = 'mongodb';
    } else {
      fs.mkdirSync(path.join(localFolder, 'mongodb'), { recursive: true });
      const { MongoMemoryServer } = require('mongodb-memory-server');
      embeddedMongo = await MongoMemoryServer.create({
        instance: { storageEngine: 'wiredTiger', dbPath: path.join(localFolder, 'mongodb') },
        binary: { version: process.env.MONGOMS_VERSION || '7.0.24' }
      });
      await mongoose.connect(embeddedMongo.getUri('shopmate'), { serverSelectionTimeoutMS: 9000 });
      mode = 'mongodb-local';
    }
  } catch (error) {
    if (embeddedMongo) { await embeddedMongo.stop().catch(() => {}); embeddedMongo = null; }
    await mongoose.disconnect().catch(() => {});
    if (preference === 'mongo') throw error;
    console.warn(`MongoDB unavailable (${error.message}). Using persistent local JSON demo database instead.`);
    mode = 'json';
  }
  return mode;
}
const getMode = () => mode;
async function stopDatabase() {
  await mongoose.disconnect().catch(() => {});
  if (embeddedMongo) await embeddedMongo.stop().catch(() => {});
}
module.exports = { startDatabase, stopDatabase, getMode, localFolder };
