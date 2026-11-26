'use strict';
const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');
const { localFolder } = require('../config/database');
function getSecret() {
  const configured = process.env.JWT_SECRET;
  if (configured) {
    if (configured.length < 32) throw new Error('JWT_SECRET should contain at least 32 characters.');
    return configured;
  }
  fs.mkdirSync(localFolder, { recursive: true });
  const file = path.join(localFolder, 'jwt-secret');
  if (fs.existsSync(file)) return fs.readFileSync(file, 'utf8').trim();
  const secret = crypto.randomBytes(48).toString('hex');
  fs.writeFileSync(file, secret, { mode: 0o600, flag: 'wx' });
  return secret;
}
module.exports = getSecret;
