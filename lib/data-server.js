/**
 * Server-side Data Layer for IntroCar US
 * 
 * CORRECT file names from user's data folder:
 * - products.json
 * - products-index.json
 * - fitment-lookup.json
 * - supercessions.json
 * - supersession-forward.json
 * - supersession-lookup.json
 * - chassis.json
 * - applications.json
 * - image-urls.json
 */

import fs from 'fs';
import path from 'path';

// Cache
let productsCache = null;
let productsIndexCache = null;
let vehiclesCache = null;
let supersessionLookupCache = null;
let fitmentLookupCache = null;

const STOCK_TYPE_PRIORITY = {
  'Prestige Parts': 1,
  'Prestige Parts (OE)': 2,
  'Uprated': 3,
  'Original Equipment': 10,
  'Aftermarket': 11,
  'Aftermarket Product': 11,
  'Reconditioned Exchange': 12,
  'Used': 13,
  'Rebuilt': 14,
  'Bundle': 15,
};

function getStockTypePriority(stockType) {
  return STOCK_TYPE_PRIORITY[stockType] || 99;
}

function loadJsonFile(filename) {
  try {
    const filepath = path.join(process.cwd(), 'data', 'json', filename);
    if (fs.existsSync(filepath)) {
      const data = fs.readFileSync(filepath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn(`Could not load ${filename}:`, error.message);
  }
  return null;
}

export function loadProducts() {
  if (!productsCache) {
    productsCache = loadJsonFile('products.json');
    if (productsCache) {
      console.log(`Loaded ${productsCache.length} products from JSON`);
    }
  }
  return productsCache || [];
}

export function loadProductsIndex() {
  if (!productsIndexCache) {
    productsIndexCache = loadJsonFile('products-index.json');
  }
  return productsIndexCache || [];
}

export function loadVehicles() {
  if (!vehiclesCache) {
    vehiclesCache = loadJsonFile('vehicles.json');
  }
  return vehiclesCache || null;
}

export function loadSupersessionLookup() {
  if (!supersessionLookupCache) {
    supersessionLookupCache = loadJsonFile('supersession-lookup.json');
  }
  return supersessionLookupCache || {};
}

export function loadFitmentLookup() {
  if (!fitmentLookupCache) {
    fitmentLookupCache = loadJsonFile('fitment-lookup.json');
  }
  return fitmentLookupCache || {};
}

function extractBaseSku(sku) {
  if (!sku) return '';
  return sku.replace(/[-_]?[AXUOR]$/i, '').toUpperCase().trim();
}

export function filterProducts({ 
  search = '', 
  category = '', 
  stockType = '', 
  make = '', 
  model = '', 
  year = '', 
  nlaOnly = false,
  inStockOnly = false,
  page = 1,
  limit = 24,
  sort = 'relevance'
}) {
  let products = loadProducts();
  const fitmentLookup = loadFitmentLookup();
  const supersessionLookup = loadSupersessionLookup();
  
  let supersessionMatch = null;
  let searchType = null;
  
  // SEARCH
  if (search) {
    const searchLower = search.toLowerCase().trim();
    const searchUpper = search.toUpperCase().trim();
    const searchBase = extractBaseSku(search);
    
    const exactSupersession = supersessionLookup[searchUpper];
    if (exactSupersession) {
      const currentSkus = Array.isArray(exactSupersession) ? exactSupersession : [exactSupersession];
      supersessionMatch = { oldSku: searchUpper, currentSkus };
      searchType = 'supersession';
      
      products = products.filter(p =>
        currentSkus.some(sku => 
          p.parentSku?.toUpperCase() === sku.toUpperCase() ||
          p.sku?.toUpperCase().startsWith(sku.toUpperCase())
        )
      );
    } else {
      const exactMatches = [];
      const parentSkuMatches = [];
      const skuMatches = [];
      const descriptionMatches = [];
      
      products.forEach(p => {
        const pSkuUpper = (p.sku || '').toUpperCase();
        const pParentSkuUpper = (p.parentSku || '').toUpperCase();
        const pBaseSku = extractBaseSku(p.sku);
        const pBaseParentSku = extractBaseSku(p.parentSku);
        
        if (pSkuUpper === searchUpper) {
          exactMatches.push(p);
        } else if (pBaseSku === searchBase || pBaseParentSku === searchBase || pParentSkuUpper === searchUpper) {
          parentSkuMatches.push(p);
        } else if (pSkuUpper.includes(searchUpper)) {
          skuMatches.push(p);
        } else if (p.description?.toLowerCase().includes(searchLower)) {
          descriptionMatches.push(p);
        }
      });
      
      products = [...exactMatches, ...parentSkuMatches, ...skuMatches, ...descriptionMatches];
      if (parentSkuMatches.length > 0 && exactMatches.length === 0) {
        searchType = 'variant';
      }
    }
  }
  
  // MAKE FILTER
  if (make) {
    const skusForMake = new Set();
    Object.entries(fitmentLookup).forEach(([parentSku, fitments]) => {
      if (Array.isArray(fitments) && fitments.some(f => f.make === make)) {
        skusForMake.add(parentSku);
      }
    });
    products = products.filter(p => skusForMake.has(p.parentSku));
  }
  
  // MODEL FILTER
  if (model) {
    const skusForModel = new Set();
    Object.entries(fitmentLookup).forEach(([parentSku, fitments]) => {
      if (Array.isArray(fitments) && fitments.some(f => f.model === model)) {
        skusForModel.add(parentSku);
      }
    });
    products = products.filter(p => skusForModel.has(p.parentSku));
  }
  
  // CATEGORY FILTER
  if (category) {
    const catLower = category.toLowerCase();
    products = products.filter(p => p.categories?.toLowerCase().includes(catLower));
  }
  
  // STOCK TYPE FILTER
  if (stockType) {
    products = products.filter(p => p.stockType?.toLowerCase() === stockType.toLowerCase());
  }
  
  // NLA FILTER
  if (nlaOnly) {
    products = products.filter(p => p.nlaDate && p.nlaDate !== '');
  }
  
  // IN STOCK FILTER
  if (inStockOnly) {
    products = products.filter(p => 
      (p.availableNow && p.availableNow > 0) || 
      (p.available1to3Days && p.available1to3Days > 0) ||
      p.inStock === true
    );
  }
  
  // SORT
  if (sort === 'relevance' || !sort) {
    products.sort((a, b) => {
      const priorityA = getStockTypePriority(a.stockType);
      const priorityB = getStockTypePriority(b.stockType);
      if (priorityA !== priorityB) return priorityA - priorityB;
      
      const inStockA = (a.availableNow > 0 || a.available1to3Days > 0) ? 0 : 1;
      const inStockB = (b.availableNow > 0 || b.available1to3Days > 0) ? 0 : 1;
      if (inStockA !== inStockB) return inStockA - inStockB;
      
      return (a.sku || '').localeCompare(b.sku || '');
    });
  }
  
  // PAGINATION
  const total = products.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const paginatedProducts = products.slice(startIndex, startIndex + limit);
  
  return {
    products: paginatedProducts,
    pagination: { page, limit, total, totalPages, hasMore: page < totalPages },
    supersessionMatch,
    searchType,
  };
}

export function getCategories() {
  const products = loadProducts();
  const categories = new Set();
  products.forEach(p => {
    if (p.categories) {
      p.categories.split('|').forEach(cat => {
        const mainCat = cat.split('/')[0].trim();
        if (mainCat) categories.add(mainCat);
      });
    }
  });
  return Array.from(categories).sort();
}

export function getStockTypes() {
  const products = loadProducts();
  const types = new Set();
  products.forEach(p => {
    if (p.stockType) types.add(p.stockType);
  });
  return Array.from(types).sort();
}

export function getVehicleData() {
  const fitmentLookup = loadFitmentLookup();
  const data = {};
  
  Object.values(fitmentLookup).forEach(fitments => {
    if (!Array.isArray(fitments)) return;
    fitments.forEach(f => {
      if (!f.make) return;
      if (!data[f.make]) {
        data[f.make] = { models: new Set() };
      }
      if (f.model) {
        data[f.make].models.add(f.model);
      }
    });
  });
  
  Object.keys(data).forEach(make => {
    data[make].models = Array.from(data[make].models).sort();
  });
  
  return data;
}

export function getProductBySku(sku) {
  const products = loadProducts();
  const fitmentLookup = loadFitmentLookup();
  
  const product = products.find(p => p.sku?.toUpperCase() === sku.toUpperCase());
  if (!product) return null;
  
  const parentSku = product.parentSku || product.sku;
  const fitment = fitmentLookup[parentSku] || [];
  
  const catalogueUrl = product.cmsPageUrl 
    ? `https://www.introcar.co.uk${product.cmsPageUrl.startsWith('/') ? '' : '/'}${product.cmsPageUrl}`
    : null;
  
  return { ...product, fitment, catalogueUrl };
}
