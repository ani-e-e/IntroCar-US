/**
 * Simple in-memory rate limiter for API routes
 * For production with multiple instances, consider using Redis
 */

const rateLimit = new Map();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimit.entries()) {
    if (now - value.timestamp > 60000) {
      rateLimit.delete(key);
    }
  }
}, 300000);

/**
 * Check if request should be rate limited
 * @param {string} identifier - Unique identifier (IP address or API key)
 * @param {number} limit - Max requests per window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {{ success: boolean, remaining: number, reset: number }}
 */
export function checkRateLimit(identifier, limit = 60, windowMs = 60000) {
  const now = Date.now();
  const key = identifier;

  const record = rateLimit.get(key);

  if (!record || now - record.timestamp > windowMs) {
    // New window
    rateLimit.set(key, {
      count: 1,
      timestamp: now,
    });
    return {
      success: true,
      remaining: limit - 1,
      reset: Math.ceil((now + windowMs) / 1000),
    };
  }

  if (record.count >= limit) {
    // Rate limited
    return {
      success: false,
      remaining: 0,
      reset: Math.ceil((record.timestamp + windowMs) / 1000),
    };
  }

  // Increment count
  record.count++;
  rateLimit.set(key, record);

  return {
    success: true,
    remaining: limit - record.count,
    reset: Math.ceil((record.timestamp + windowMs) / 1000),
  };
}

/**
 * Get client IP from request headers
 * @param {Request} request
 * @returns {string}
 */
export function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}
