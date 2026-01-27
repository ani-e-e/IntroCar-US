/**
 * Multi-tenant Configuration for IntroCar Reseller Sites
 *
 * Each tenant has:
 * - name: Display name
 * - slug: URL-friendly identifier (used in routes)
 * - domain: Production domain (for Vercel deployment)
 * - colors: Theme colors (primary, accent, secondary, background)
 * - logo: Optional custom logo path
 * - skuFilter: Filter tag for products (null = all products)
 * - orderEmail: Email for order notifications (null = use webhooks)
 * - features: Feature flags ('full' = all features, 'light' = reduced features)
 * - companyInfo: Company contact details
 */

export const tenants = {
  // Main IntroCar US site (default)
  'introcar-us': {
    name: 'IntroCar US',
    slug: 'introcar-us',
    domain: 'intro-car-us.vercel.app',
    colors: {
      primary: '#1e3a5f',      // Deep navy blue
      primaryDark: '#142840',  // Darker navy
      accent: '#c9a227',       // Gold
      accentLight: '#d4b84a',  // Light gold
      secondary: '#2d4a6f',    // Mid blue
      background: '#f8f9fa',   // Light gray
      text: '#1a1a1a',         // Near black
      textLight: '#666666',    // Medium gray
    },
    logo: '/images/logos/introcar-logo.png',
    skuFilter: null,           // All SKUs
    orderEmail: null,          // Use webhooks for order processing
    features: ['full'],
    showPrices: true,
    showCart: true,
    checkoutEnabled: true,
    companyInfo: {
      name: 'IntroCar International Ltd',
      phone: '+44 (0)20 8546 2027',
      email: 'sales@introcar.co.uk',
      address: 'Kingston upon Thames, UK',
    }
  },

  // Albers Motorcars - US reseller (Zionsville, Indiana)
  'albers-rb': {
    name: 'Albers Motorcars',
    slug: 'albers-rb',
    domain: 'albers.introcar.com',
    colors: {
      primary: '#2D5A27',      // Dark green (from Albers logo)
      primaryDark: '#1F4019',  // Darker green
      accent: '#4CAF50',       // Light green for buttons
      accentLight: '#81C784',  // Lighter green
      secondary: '#388E3C',    // Mid green
      background: '#f8faf8',   // Very light green tint
      text: '#1a1a1a',         // Near black
      textLight: '#666666',    // Medium gray
    },
    logo: '/images/resellers/albersRB-logo.png',
    skuFilter: 'prestige_parts',  // Prestige Parts products only
    orderEmail: 'parts@albersrb.com',
    features: ['light'],
    showPrices: true,          // Show prices on reseller site
    showCart: true,            // Enable cart functionality
    checkoutEnabled: true,     // Enable check payment checkout
    companyInfo: {
      name: 'Albers Motorcars',
      tagline: 'Specializing in Rolls-Royce & Bentley since 1963',
      phone: '(317) 873-2360',
      email: 'parts@albersrb.com',
      salesEmail: 'sales@albersrb.com',
      address: '360 S. First St., Zionsville, IN 46077',
      partsAddress: '190 W. Sycamore St., Zionsville, IN 46077',
      hours: 'Mon-Fri 8:00 AM - 4:30 PM',
      website: 'https://albersrb.com',
    }
  },

  // Placeholder for additional resellers (to be configured)
  'reseller-2': {
    name: 'Reseller 2',
    slug: 'reseller-2',
    domain: 'reseller2.introcar.com',
    colors: {
      primary: '#2E7D32',      // Green
      primaryDark: '#1B5E20',
      accent: '#FFC107',       // Amber
      accentLight: '#FFD54F',
      secondary: '#388E3C',
      background: '#f5f8f5',
      text: '#1a1a1a',
      textLight: '#666666',
    },
    logo: null,
    skuFilter: 'reseller_2',
    orderEmail: 'orders@reseller2.com',
    features: ['light'],
    showPrices: false,
    showCart: false,
    checkoutEnabled: false,
    companyInfo: {
      name: 'Reseller 2',
      phone: null,
      email: 'orders@reseller2.com',
      address: null,
    }
  },

  'reseller-3': {
    name: 'Reseller 3',
    slug: 'reseller-3',
    domain: 'reseller3.introcar.com',
    colors: {
      primary: '#1565C0',      // Blue
      primaryDark: '#0D47A1',
      accent: '#FF9800',       // Orange
      accentLight: '#FFB74D',
      secondary: '#1976D2',
      background: '#f5f7fa',
      text: '#1a1a1a',
      textLight: '#666666',
    },
    logo: null,
    skuFilter: 'reseller_3',
    orderEmail: 'orders@reseller3.com',
    features: ['light'],
    showPrices: false,
    showCart: false,
    checkoutEnabled: false,
    companyInfo: {
      name: 'Reseller 3',
      phone: null,
      email: 'orders@reseller3.com',
      address: null,
    }
  },

  'reseller-4': {
    name: 'Reseller 4',
    slug: 'reseller-4',
    domain: 'reseller4.introcar.com',
    colors: {
      primary: '#6A1B9A',      // Purple
      primaryDark: '#4A148C',
      accent: '#00BCD4',       // Cyan
      accentLight: '#4DD0E1',
      secondary: '#7B1FA2',
      background: '#faf5fc',
      text: '#1a1a1a',
      textLight: '#666666',
    },
    logo: null,
    skuFilter: 'reseller_4',
    orderEmail: 'orders@reseller4.com',
    features: ['light'],
    showPrices: false,
    showCart: false,
    checkoutEnabled: false,
    companyInfo: {
      name: 'Reseller 4',
      phone: null,
      email: 'orders@reseller4.com',
      address: null,
    }
  },
};

/**
 * Get tenant configuration by slug
 */
export function getTenant(slug) {
  return tenants[slug] || tenants['introcar-us'];
}

/**
 * Get tenant by domain (for middleware routing)
 */
export function getTenantByDomain(domain) {
  const tenant = Object.values(tenants).find(t => t.domain === domain);
  return tenant || tenants['introcar-us'];
}

/**
 * Get default tenant
 */
export function getDefaultTenant() {
  return tenants['introcar-us'];
}

/**
 * Get all tenant slugs
 */
export function getAllTenantSlugs() {
  return Object.keys(tenants);
}

/**
 * Check if a tenant is a "light" reseller site
 */
export function isLightSite(tenant) {
  return tenant?.features?.includes('light');
}

/**
 * Generate CSS variables from tenant colors
 */
export function getTenantCSSVariables(tenant) {
  if (!tenant?.colors) return {};

  return {
    '--color-primary': tenant.colors.primary,
    '--color-primary-dark': tenant.colors.primaryDark,
    '--color-accent': tenant.colors.accent,
    '--color-accent-light': tenant.colors.accentLight,
    '--color-secondary': tenant.colors.secondary,
    '--color-background': tenant.colors.background,
    '--color-text': tenant.colors.text,
    '--color-text-light': tenant.colors.textLight,
  };
}
