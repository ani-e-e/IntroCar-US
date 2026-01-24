// Simple admin authentication using signed cookies
// Works with serverless (no in-memory session storage needed)

import crypto from 'crypto';

// Hash the password for comparison
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Verify password against stored hash
export function verifyPassword(password) {
  const storedHash = process.env.ADMIN_PASSWORD_HASH;
  if (!storedHash) {
    console.error('ADMIN_PASSWORD_HASH not set in environment variables');
    return false;
  }
  return hashPassword(password) === storedHash;
}

// Create a signed session token (self-contained, no server storage needed)
export function createSession() {
  const expires = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
  const payload = `admin:${expires}`;
  const secret = process.env.ADMIN_PASSWORD_HASH || 'fallback-secret';
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return {
    token: `${Buffer.from(payload).toString('base64')}.${signature}`,
    expires,
  };
}

// Validate a session token
export function validateSession(token) {
  if (!token) return false;

  try {
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return false;

    const payload = Buffer.from(payloadB64, 'base64').toString();
    const [prefix, expiresStr] = payload.split(':');

    if (prefix !== 'admin') return false;

    const expires = parseInt(expiresStr);
    if (Date.now() > expires) return false;

    // Verify signature
    const secret = process.env.ADMIN_PASSWORD_HASH || 'fallback-secret';
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return signature === expectedSignature;
  } catch (err) {
    return false;
  }
}

// No-op for logout (cookie deletion handles this)
export function destroySession() {}

// Generate a password hash (run once to get your hash)
export function generatePasswordHash(password) {
  return hashPassword(password);
}
