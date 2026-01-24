#!/usr/bin/env node

/**
 * Generate Admin Password Hash
 *
 * Usage: node scripts/generate-admin-hash.js <password>
 *
 * Copy the output hash to your .env.local or Vercel environment variables:
 * ADMIN_PASSWORD_HASH=<the hash>
 */

const crypto = require('crypto');

const password = process.argv[2];

if (!password) {
  console.log('Usage: node scripts/generate-admin-hash.js <password>');
  console.log('');
  console.log('Example:');
  console.log('  node scripts/generate-admin-hash.js MySecurePassword123');
  process.exit(1);
}

const hash = crypto.createHash('sha256').update(password).digest('hex');

console.log('');
console.log('Password hash generated successfully!');
console.log('');
console.log('Add this to your .env.local file or Vercel environment variables:');
console.log('');
console.log(`ADMIN_PASSWORD_HASH=${hash}`);
console.log('');
