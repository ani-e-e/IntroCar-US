/**
 * Client-side Data Module (Fallback)
 * 
 * This is used when the API isn't available.
 * Contains sample data for development.
 */

// Sample products (matches your data structure)
const sampleProducts = [
  {
    id: 1,
    sku: 'UB83268A',
    description: 'Steering Rack Gaiter Kit - Prestige Parts',
    price: 89.99,
    stockType: 'Prestige Parts',
    parentSku: 'UB83268',
    categories: 'Steering/Rack & Column',
    nlaDate: null,
    image: null,
    inStock: true,
  },
  {
    id: 2,
    sku: '3W0317801JA-A',
    description: 'Power Steering Fluid Reservoir',
    price: 245.00,
    stockType: 'Original Equipment',
    parentSku: '3W0317801JA',
    categories: 'Steering/Power Steering',
    nlaDate: '24th January 2025',
    image: null,
    inStock: true,
  },
  {
    id: 3,
    sku: 'RD4162X',
    description: 'Brake Disc Front - Drilled & Grooved Performance',
    price: 389.00,
    stockType: 'Uprated',
    parentSku: 'RD4162',
    categories: 'Brakes & Hydraulics/Discs (Rotors)',
    nlaDate: null,
    image: null,
    inStock: true,
  },
  {
    id: 4,
    sku: 'RH2594X',
    description: 'Brake Disc Rear - Drilled & Grooved Performance',
    price: 349.00,
    stockType: 'Uprated',
    parentSku: 'RH2594',
    categories: 'Brakes & Hydraulics/Discs (Rotors)',
    nlaDate: null,
    image: null,
    inStock: true,
  },
  {
    id: 5,
    sku: 'CD550X',
    description: 'Clutch Kit Complete - Heavy Duty',
    price: 1249.00,
    stockType: 'Prestige Parts',
    parentSku: 'CD550',
    categories: 'Gearbox/Clutch',
    nlaDate: null,
    image: null,
    inStock: true,
  },
  {
    id: 6,
    sku: '3W0906283AX',
    description: 'Oxygen Sensor - Lambda Probe',
    price: 189.00,
    stockType: 'Original Equipment',
    parentSku: '3W0906283A',
    categories: 'Fuel System/Fuel Injection',
    nlaDate: '19th September 2024',
    image: null,
    inStock: true,
  },
  {
    id: 7,
    sku: 'PF21395PCA',
    description: 'Oil Filter - Premium Quality',
    price: 24.99,
    stockType: 'Prestige Parts',
    parentSku: 'PF21395',
    categories: 'Service & Maintenance/Service Schedule Components & Kits',
    nlaDate: null,
    image: null,
    inStock: true,
  },
  {
    id: 8,
    sku: 'N90434903A',
    description: 'Sump Plug with Washer',
    price: 12.50,
    stockType: 'Original Equipment',
    parentSku: 'N90434903',
    categories: 'Service & Maintenance/Service Schedule Components & Kits',
    nlaDate: null,
    image: null,
    inStock: true,
  },
];

export function filterProducts({ 
  search = '', 
  category = '', 
  stockType = '', 
  nlaOnly = false,
  inStockOnly = false,
  page = 1,
  limit = 24 
}) {
  let products = [...sampleProducts];
  
  if (search) {
    const searchLower = search.toLowerCase();
    products = products.filter(p =>
      p.sku?.toLowerCase().includes(searchLower) ||
      p.description?.toLowerCase().includes(searchLower) ||
      p.parentSku?.toLowerCase().includes(searchLower)
    );
  }

  if (category) {
    const catLower = category.toLowerCase();
    products = products.filter(p =>
      p.categories?.toLowerCase().includes(catLower)
    );
  }

  if (stockType) {
    products = products.filter(p =>
      p.stockType?.toLowerCase() === stockType.toLowerCase()
    );
  }

  if (nlaOnly) {
    products = products.filter(p => p.nlaDate && p.nlaDate !== '');
  }

  if (inStockOnly) {
    products = products.filter(p => p.inStock !== false);
  }

  const total = products.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const paginatedProducts = products.slice(startIndex, startIndex + limit);

  return {
    products: paginatedProducts,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    }
  };
}

export function getCategories() {
  const categories = new Set();
  sampleProducts.forEach(p => {
    if (p.categories) {
      const mainCat = p.categories.split('/')[0];
      categories.add(mainCat);
    }
  });
  return Array.from(categories).sort();
}

export function getStockTypes() {
  const types = new Set();
  sampleProducts.forEach(p => {
    if (p.stockType) types.add(p.stockType);
  });
  return Array.from(types).sort();
}

export function getProductBySku(sku) {
  return sampleProducts.find(p => p.sku === sku) || null;
}

export function getRelatedProducts(sku, limit = 4) {
  const product = getProductBySku(sku);
  if (!product) return [];

  const mainCategory = product.categories?.split('/')[0];
  if (!mainCategory) return [];

  return sampleProducts
    .filter(p => p.sku !== sku && p.categories?.startsWith(mainCategory))
    .slice(0, limit);
}
