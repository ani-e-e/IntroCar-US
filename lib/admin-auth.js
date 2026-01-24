// Simple admin authentication
// In production, use environment variable for the password hash

import { cookies } from 'next/headers';
import crypto from 'crypto';

const ADMIN_SESSION_COOKIE = 'admin_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

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

// Generate a session token
export function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Store session (in production, use Redis or database)
const sessions = new Map();

export function createSession() {
  const token = generateSessionToken();
  const expires = Date.now() + SESSION_DURATION;
  sessions.set(token, { expires });
  return { token, expires };
}

export function validateSession(token) {
  if (!token) return false;
  const session = sessions.get(token);
  if (!session) return false;
  if (Date.now() > session.expires) {
    sessions.delete(token);
    return false;
  }
  return true;
}

export function destroySession(token) {
  sessions.delete(token);
}

// Helper to check if current request is authenticated
export async function isAuthenticated() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return validateSession(sessionToken);
}

// Generate a password hash (run once to get your hash)
export function generatePasswordHash(password) {
  return hashPassword(password);
}
