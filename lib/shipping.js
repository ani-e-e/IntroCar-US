/**
 * Shipping Calculator for IntroCar US
 *
 * Based on matrix rates from matrixrates.csv
 * Supports weight-based pricing by country and delivery method
 */

// Country codes to full names mapping (common countries)
export const COUNTRY_NAMES = {
  'USA': 'United States',
  'GBR': 'United Kingdom',
  'CAN': 'Canada',
  'AUS': 'Australia',
  'DEU': 'Germany',
  'FRA': 'France',
  'ITA': 'Italy',
  'ESP': 'Spain',
  'NLD': 'Netherlands',
  'BEL': 'Belgium',
  'AUT': 'Austria',
  'CHE': 'Switzerland',
  'JPN': 'Japan',
  'NZL': 'New Zealand',
  'IRL': 'Ireland',
  'SWE': 'Sweden',
  'NOR': 'Norway',
  'DNK': 'Denmark',
  'FIN': 'Finland',
  'PRT': 'Portugal',
  'ARE': 'United Arab Emirates',
  'SAU': 'Saudi Arabia',
  'ZAF': 'South Africa',
  'SGP': 'Singapore',
  'HKG': 'Hong Kong',
  'MEX': 'Mexico',
  'BRA': 'Brazil',
  'ARG': 'Argentina',
  'IND': 'India',
  'CHN': 'China',
};

// Reverse mapping for name to code
export const COUNTRY_CODES = Object.fromEntries(
  Object.entries(COUNTRY_NAMES).map(([code, name]) => [name, code])
);

// Delivery method display names and estimated times
export const DELIVERY_METHODS = {
  'DHL Air Service': {
    name: 'DHL Express Air',
    description: 'International express air freight',
    estimatedDays: '3-5 business days',
    icon: 'plane',
  },
  'DHL Road Service': {
    name: 'DHL Road Freight',
    description: 'European road freight service',
    estimatedDays: '5-10 business days',
    icon: 'truck',
  },
  'Royal Mail Tracked & Signed International': {
    name: 'Royal Mail International',
    description: 'Tracked & signed international delivery',
    estimatedDays: '7-14 business days',
    icon: 'mail',
  },
  'Royal Mail Tracked 24': {
    name: 'Royal Mail Next Day',
    description: 'Next day UK delivery',
    estimatedDays: '1 business day',
    icon: 'mail',
  },
  'Royal Mail Tracked 48 ': {
    name: 'Royal Mail 48hr',
    description: '2-day UK delivery',
    estimatedDays: '2 business days',
    icon: 'mail',
  },
  'Royal Mail Special Delivery': {
    name: 'Royal Mail Special Delivery',
    description: 'Guaranteed UK next day',
    estimatedDays: '1 business day (guaranteed)',
    icon: 'mail',
  },
  'DHL Courier Delivery': {
    name: 'DHL Courier',
    description: 'Premium courier service',
    estimatedDays: '1-2 business days',
    icon: 'truck',
  },
  'DHL Courier Delivery(CI)': {
    name: 'DHL Channel Islands',
    description: 'Channel Islands delivery',
    estimatedDays: '2-3 business days',
    icon: 'truck',
  },
  'DPD Courier': {
    name: 'DPD Courier',
    description: 'UK courier delivery',
    estimatedDays: '1-2 business days',
    icon: 'truck',
  },
  'Customer Collection': {
    name: 'Collect from Warehouse',
    description: 'Collect from our UK warehouse',
    estimatedDays: 'Same day (when ready)',
    icon: 'building',
  },
  'Dimensions Required - You will be contacted to confirm shipping cost': {
    name: 'Quote Required',
    description: 'Large/heavy items require custom shipping quote',
    estimatedDays: 'Contact for estimate',
    icon: 'calculator',
  },
};

// USA shipping rates (DHL Air Service only)
export const USA_RATES = [
  { weightFrom: 0, weightTo: 0.5, price: 33.56 },
  { weightFrom: 0.5, weightTo: 1, price: 37.00 },
  { weightFrom: 1, weightTo: 2, price: 42.15 },
  { weightFrom: 2, weightTo: 3, price: 47.13 },
  { weightFrom: 3, weightTo: 4, price: 51.95 },
  { weightFrom: 4, weightTo: 5, price: 56.77 },
  { weightFrom: 5, weightTo: 6, price: 61.37 },
  { weightFrom: 6, weightTo: 7, price: 65.97 },
  { weightFrom: 7, weightTo: 8, price: 70.57 },
  { weightFrom: 8, weightTo: 9, price: 75.18 },
  { weightFrom: 9, weightTo: 10, price: 79.78 },
  { weightFrom: 10, weightTo: 12.5, price: 87.25 },
  { weightFrom: 12.5, weightTo: 15, price: 96.07 },
  { weightFrom: 15, weightTo: 20, price: 113.71 },
  { weightFrom: 20, weightTo: 25, price: 131.51 },
  { weightFrom: 25, weightTo: 30, price: 149.30 },
  { weightFrom: 30, weightTo: 40, price: 193.61 },
  { weightFrom: 40, weightTo: 50, price: 239.21 },
  { weightFrom: 50, weightTo: 60, price: 282.33 },
  { weightFrom: 60, weightTo: 69.99, price: 327.53 },
  { weightFrom: 70, weightTo: 80, price: 401.04 },
  { weightFrom: 80, weightTo: 90, price: 452.32 },
  { weightFrom: 90, weightTo: 100, price: 503.59 },
];

/**
 * Calculate shipping cost for USA
 * @param {number} weightKg - Total weight in kilograms
 * @returns {object} Shipping options with prices
 */
export function calculateUSAShipping(weightKg) {
  // If over 100kg, needs custom quote
  if (weightKg > 100) {
    return {
      success: true,
      needsQuote: true,
      message: 'Items over 100kg require a custom shipping quote. We will contact you to confirm the shipping cost.',
      options: [{
        method: 'Dimensions Required - You will be contacted to confirm shipping cost',
        ...DELIVERY_METHODS['Dimensions Required - You will be contacted to confirm shipping cost'],
        price: null,
        currency: 'USD',
      }],
    };
  }

  // Find matching rate
  const rate = USA_RATES.find(r => weightKg > r.weightFrom && weightKg <= r.weightTo);

  if (!rate) {
    // Default to first rate if very light
    const defaultRate = USA_RATES[0];
    return {
      success: true,
      needsQuote: false,
      options: [{
        method: 'DHL Air Service',
        ...DELIVERY_METHODS['DHL Air Service'],
        price: defaultRate.price,
        currency: 'USD',
        weightKg,
      }],
    };
  }

  return {
    success: true,
    needsQuote: false,
    options: [{
      method: 'DHL Air Service',
      ...DELIVERY_METHODS['DHL Air Service'],
      price: rate.price,
      currency: 'USD',
      weightKg,
    }],
  };
}

/**
 * Convert pounds to kilograms
 * @param {number} lbs - Weight in pounds
 * @returns {number} Weight in kilograms
 */
export function lbsToKg(lbs) {
  return lbs * 0.453592;
}

/**
 * Convert kilograms to pounds
 * @param {number} kg - Weight in kilograms
 * @returns {number} Weight in pounds
 */
export function kgToLbs(kg) {
  return kg * 2.20462;
}

/**
 * Format price for display
 * @param {number} price - Price value
 * @param {string} currency - Currency code
 * @returns {string} Formatted price
 */
export function formatShippingPrice(price, currency = 'USD') {
  if (price === null || price === undefined) {
    return 'Quote Required';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(price);
}

/**
 * Calculate cart weight from items
 * @param {Array} items - Cart items with weight property
 * @returns {number} Total weight in kg
 */
export function calculateCartWeight(items) {
  return items.reduce((total, item) => {
    const itemWeight = item.weight || 0.5; // Default 0.5kg if no weight specified
    return total + (itemWeight * (item.quantity || 1));
  }, 0);
}

/**
 * Get shipping estimate for cart
 * @param {Array} items - Cart items
 * @param {string} countryCode - Destination country code
 * @returns {object} Shipping calculation result
 */
export function getShippingEstimate(items, countryCode = 'USA') {
  const weightKg = calculateCartWeight(items);

  // For now, we primarily support USA
  if (countryCode === 'USA') {
    return calculateUSAShipping(weightKg);
  }

  // For other countries, return quote required
  return {
    success: true,
    needsQuote: true,
    message: `Shipping to ${COUNTRY_NAMES[countryCode] || countryCode} requires a quote. Please contact us.`,
    options: [{
      method: 'International Shipping',
      name: 'International Shipping',
      description: 'Contact us for international shipping rates',
      estimatedDays: 'Contact for estimate',
      icon: 'globe',
      price: null,
      currency: 'USD',
    }],
  };
}

/**
 * Free shipping threshold (USD)
 */
export const FREE_SHIPPING_THRESHOLD = 500;

/**
 * Check if order qualifies for free shipping
 * @param {number} subtotal - Order subtotal
 * @returns {boolean}
 */
export function qualifiesForFreeShipping(subtotal) {
  return subtotal >= FREE_SHIPPING_THRESHOLD;
}

/**
 * Get shipping display info for product page
 * @param {number} weight - Product weight in kg
 * @returns {object} Shipping info for display
 */
export function getProductShippingInfo(weight = 0.5) {
  const estimate = calculateUSAShipping(weight);

  if (estimate.needsQuote) {
    return {
      message: 'Shipping quote required for this item',
      price: null,
      deliveryEstimate: 'Contact us',
    };
  }

  const option = estimate.options[0];
  return {
    message: `Ships via ${option.name}`,
    price: option.price,
    priceFormatted: formatShippingPrice(option.price),
    deliveryEstimate: option.estimatedDays,
  };
}
