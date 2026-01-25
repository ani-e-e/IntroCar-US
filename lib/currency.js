/**
 * Currency Conversion Library for IntroCar US
 *
 * Flow: GBP (database) → USD (display & charge) → GBP (settlement) → GBP (Magento)
 *
 * All prices in the database are stored in GBP.
 * This library handles conversion to USD for display and Stripe charges.
 * Fixer.io is used for daily exchange rates.
 */

// In-memory cache for exchange rate
let cachedRate = null;
let cacheTimestamp = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Fallback rate if API fails (should be updated periodically)
const FALLBACK_RATE = 1.27; // GBP to USD fallback

/**
 * Fetch the current GBP to USD exchange rate from fixer.io
 * Caches the rate for 24 hours to minimize API calls
 */
export async function getExchangeRate() {
  const now = Date.now();

  // Return cached rate if still valid
  if (cachedRate && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedRate;
  }

  try {
    const apiKey = process.env.FIXER_API_KEY;

    if (!apiKey) {
      console.warn('FIXER_API_KEY not configured, using fallback rate');
      return FALLBACK_RATE;
    }

    // Fixer.io free tier only supports EUR as base, so we need to convert
    // GBP/USD = USD rate / GBP rate (both relative to EUR)
    const response = await fetch(
      `http://data.fixer.io/api/latest?access_key=${apiKey}&symbols=GBP,USD`,
      { next: { revalidate: 86400 } } // Next.js cache for 24 hours
    );

    if (!response.ok) {
      throw new Error(`Fixer API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(`Fixer API error: ${data.error?.info || 'Unknown error'}`);
    }

    // Calculate GBP to USD rate
    // EUR/GBP and EUR/USD gives us: USD/GBP = EUR/GBP * USD/EUR = (1/GBP) * USD
    const gbpRate = data.rates.GBP;
    const usdRate = data.rates.USD;
    const gbpToUsd = usdRate / gbpRate;

    // Cache the rate
    cachedRate = gbpToUsd;
    cacheTimestamp = now;

    console.log(`Exchange rate updated: 1 GBP = ${gbpToUsd.toFixed(4)} USD`);

    return gbpToUsd;
  } catch (error) {
    console.error('Failed to fetch exchange rate:', error);

    // Return cached rate if available, otherwise fallback
    if (cachedRate) {
      console.warn('Using stale cached rate');
      return cachedRate;
    }

    console.warn('Using fallback exchange rate');
    return FALLBACK_RATE;
  }
}

/**
 * Convert GBP amount to USD
 * @param {number} gbpAmount - Amount in GBP
 * @param {number} rate - Exchange rate (GBP to USD)
 * @returns {number} Amount in USD
 */
export function convertGbpToUsd(gbpAmount, rate) {
  if (typeof gbpAmount !== 'number' || isNaN(gbpAmount)) {
    return 0;
  }
  return Math.round(gbpAmount * rate * 100) / 100; // Round to 2 decimal places
}

/**
 * Convert USD amount back to GBP (for Magento orders)
 * @param {number} usdAmount - Amount in USD
 * @param {number} rate - Exchange rate (GBP to USD)
 * @returns {number} Amount in GBP
 */
export function convertUsdToGbp(usdAmount, rate) {
  if (typeof usdAmount !== 'number' || isNaN(usdAmount) || rate === 0) {
    return 0;
  }
  return Math.round((usdAmount / rate) * 100) / 100; // Round to 2 decimal places
}

/**
 * Format price for display
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code ('USD' or 'GBP')
 * @returns {string} Formatted price string
 */
export function formatPrice(amount, currency = 'USD') {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return currency === 'USD' ? '$0.00' : '£0.00';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format price in USD from GBP source
 * Convenience function for display
 * @param {number} gbpAmount - Amount in GBP (from database)
 * @param {number} rate - Exchange rate
 * @returns {string} Formatted USD price
 */
export function formatGbpAsUsd(gbpAmount, rate) {
  const usdAmount = convertGbpToUsd(gbpAmount, rate);
  return formatPrice(usdAmount, 'USD');
}

/**
 * Get rate info for debugging/display
 * @returns {object} Rate information
 */
export function getRateInfo() {
  return {
    rate: cachedRate,
    timestamp: cacheTimestamp ? new Date(cacheTimestamp).toISOString() : null,
    age: cacheTimestamp ? Math.round((Date.now() - cacheTimestamp) / 1000 / 60) : null, // minutes
    fallback: FALLBACK_RATE,
  };
}

/**
 * Force refresh the exchange rate (for admin use)
 */
export async function refreshExchangeRate() {
  cachedRate = null;
  cacheTimestamp = null;
  return await getExchangeRate();
}

// Client-side helper - stores rate in memory for client components
let clientRate = null;

export function setClientRate(rate) {
  clientRate = rate;
}

export function getClientRate() {
  return clientRate || FALLBACK_RATE;
}
