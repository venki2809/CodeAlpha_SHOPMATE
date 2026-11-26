'use strict';
const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { startDatabase, stopDatabase, getMode } = require('../config/database');
const repo = require('../services/repository');
(async () => {
  try {
    await startDatabase();
    await repo.initializeRepository();
    const result = await repo.listProducts({ limit: '36' });
    console.log(`✅ SHOPMATE seed ready: ${result.pagination.total} products, database=${getMode()}.`);
  } catch (err) { console.error('Seed failed:', err.message); process.exitCode = 1; }
  finally { await stopDatabase(); }
})();
