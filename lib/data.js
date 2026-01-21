/**
 * Client-side Data Module for IntroCar US
 * 
 * This provides sample/fallback data for client components.
 * Real data is loaded via API calls.
 */

// Sample products for fallback
export const sampleProducts = [
  {
    id: 1,
    sku: 'UB83268A',
    description: 'Steering Rack Gaiter Kit - Prestige Parts',
    price: 89.99,
    stockType: 'Prestige Parts',
    parentSku: 'UB83268',
    categories: 'Steering/Rack & Column',
    nlaDate: null,
    inStock: true,
    supersessions: [],
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
    inStock: true,
    supersessions: [],
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
    inStock: true,
    supersessions: [],
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
    inStock: true,
    supersessions: [],
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
    inStock: true,
    supersessions: [],
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
    inStock: true,
    supersessions: [],
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
    inStock: true,
    supersessions: [],
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
    inStock: true,
    supersessions: [],
  },
];

// Default vehicle data for selector
export const defaultVehicleData = {
  'Bentley': {
    models: [
      'Arnage', 'Azure', 'Bentayga', 'Brooklands', 'Continental GT',
      'Continental Flying Spur', 'Continental R', 'Continental T',
      'Eight', 'Mulsanne', 'R Type', 'S1', 'S2', 'S3',
      'T1', 'T2', 'Turbo R', 'Turbo RT'
    ],
    years: Array.from({ length: 2025 - 1946 + 1 }, (_, i) => 2025 - i)
  },
  'Rolls-Royce': {
    models: [
      'Camargue', 'Corniche', 'Cullinan', 'Dawn', 'Ghost', 
      'Phantom', 'Silver Cloud I', 'Silver Cloud II', 'Silver Cloud III',
      'Silver Dawn', 'Silver Seraph', 'Silver Shadow', 'Silver Shadow II',
      'Silver Spirit', 'Silver Spur', 'Silver Wraith', 'Wraith'
    ],
    years: Array.from({ length: 2025 - 1946 + 1 }, (_, i) => 2025 - i)
  }
};

// Helper functions for client-side filtering of sample data
export function filterSampleProducts(filters) {
  let products = [...sampleProducts];
  
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    products = products.filter(p =>
      p.sku?.toLowerCase().includes(searchLower) ||
      p.description?.toLowerCase().includes(searchLower)
    );
  }
  
  if (filters.category) {
    products = products.filter(p =>
      p.categories?.toLowerCase().includes(filters.category.toLowerCase())
    );
  }
  
  if (filters.stockType) {
    products = products.filter(p =>
      p.stockType?.toLowerCase() === filters.stockType.toLowerCase()
    );
  }
  
  if (filters.nlaOnly) {
    products = products.filter(p => p.nlaDate);
  }
  
  return products;
}

export function getSampleCategories() {
  const categories = new Set();
  sampleProducts.forEach(p => {
    if (p.categories) {
      const mainCat = p.categories.split('/')[0];
      categories.add(mainCat);
    }
  });
  return Array.from(categories).sort();
}

export function getSampleStockTypes() {
  const types = new Set();
  sampleProducts.forEach(p => {
    if (p.stockType) types.add(p.stockType);
  });
  return Array.from(types).sort();
}
