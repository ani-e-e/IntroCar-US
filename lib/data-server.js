/**
 * Server-side Data Layer for IntroCar US
 *
 * Features:
 * - SKU search with variant matching (UE40893 finds -A, -X, -U, etc.)
 * - Supersession lookup (old part numbers → current)
 * - Smart sorting: Popularity → Prestige Parts → In Stock → Others
 * - Make/Model/Year filtering via fitment data
 * - Category and subcategory filtering
 * - NLA (No Longer Available) filtering
 */

import fs from 'fs';
import path from 'path';

// Cache
let productsCache = null;
let productsIndexCache = null;
let vehiclesCache = null;
let supersessionLookupCache = null;
let fitmentLookupCache = null;
let popularityCache = null;

// Stock Type Priority (lower = better)
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

export function loadPopularity() {
  if (!popularityCache) {
    popularityCache = loadJsonFile('popularity.json');
  }
  return popularityCache || {};
}

// Extract base SKU without suffix (-A, -X, -U, -O, -R)
function extractBaseSku(sku) {
  if (!sku) return '';
  return sku.replace(/[-_]?[AXUOR]$/i, '').toUpperCase().trim();
}

// Get popularity score for a SKU (higher = more popular)
function getPopularityScore(sku, popularity) {
  if (!sku || !popularity) return 0;
  // Check exact SKU match
  if (popularity[sku]) return popularity[sku];
  // Check parent SKU
  const baseSku = extractBaseSku(sku);
  // Try common suffixes
  for (const suffix of ['-X', '-A', '-U', '-O', '-R', '']) {
    const testSku = baseSku + suffix;
    if (popularity[testSku]) return popularity[testSku];
  }
  return 0;
}

/**
 * Filter and search products with smart prioritization
 */
export function filterProducts({
  search = '',
  category = '',
  subcategory = '',
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
  const popularity = loadPopularity();

  let supersessionMatch = null;
  let searchType = null;

  // ============================================
  // SEARCH
  // ============================================
  if (search) {
    const searchLower = search.toLowerCase().trim();
    const searchUpper = search.toUpperCase().trim();
    const searchBase = extractBaseSku(search);

    // Check if this is an old part number (supersession)
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
      // Normal search - find matches by priority
      const exactMatches = [];
      const parentSkuMatches = [];
      const skuMatches = [];
      const supersessionContentMatches = [];
      const descriptionMatches = [];

      products.forEach(p => {
        const pSkuUpper = (p.sku || '').toUpperCase();
        const pParentSkuUpper = (p.parentSku || '').toUpperCase();
        const pBaseSku = extractBaseSku(p.sku);
        const pBaseParentSku = extractBaseSku(p.parentSku);

        // Exact SKU match
        if (pSkuUpper === searchUpper) {
          exactMatches.push(p);
        }
        // Base SKU match (finds all variants)
        else if (pBaseSku === searchBase || pBaseParentSku === searchBase || pParentSkuUpper === searchUpper) {
          parentSkuMatches.push(p);
        }
        // Partial SKU match
        else if (pSkuUpper.includes(searchUpper)) {
          skuMatches.push(p);
        }
        // Search in supersessions (also known as)
        else if (p.supersessions && Array.isArray(p.supersessions) && p.supersessions.some(s =>
          s.toUpperCase().includes(searchUpper) || extractBaseSku(s) === searchBase
        )) {
          supersessionContentMatches.push(p);
        }
        // Description match
        else if (p.description?.toLowerCase().includes(searchLower)) {
          descriptionMatches.push(p);
        }
      });

      products = [...exactMatches, ...parentSkuMatches, ...skuMatches, ...supersessionContentMatches, ...descriptionMatches];

      // Remove duplicates
      const seen = new Set();
      products = products.filter(p => {
        if (seen.has(p.sku)) return false;
        seen.add(p.sku);
        return true;
      });

      if (parentSkuMatches.length > 0 && exactMatches.length === 0) {
        searchType = 'variant';
      }
    }
  }

  // ============================================
  // MAKE FILTER
  // ============================================
  if (make) {
    const skusForMake = new Set();
    Object.entries(fitmentLookup).forEach(([parentSku, fitments]) => {
      if (Array.isArray(fitments) && fitments.some(f => f.make === make)) {
        skusForMake.add(parentSku);
      }
    });
    products = products.filter(p => skusForMake.has(p.parentSku));
  }

  // ============================================
  // MODEL FILTER
  // ============================================
  if (model) {
    const skusForModel = new Set();
    Object.entries(fitmentLookup).forEach(([parentSku, fitments]) => {
      if (Array.isArray(fitments) && fitments.some(f => f.model === model)) {
        skusForModel.add(parentSku);
      }
    });
    products = products.filter(p => skusForModel.has(p.parentSku));
  }

  // ============================================
  // CATEGORY FILTER (supports main category and subcategory)
  // ============================================
  if (category) {
    const catLower = category.toLowerCase();
    if (subcategory) {
      // Filter by exact category/subcategory path
      const fullPath = `${category}/${subcategory}`.toLowerCase();
      products = products.filter(p => p.categories?.toLowerCase().includes(fullPath));
    } else {
      // Filter by main category
      products = products.filter(p => {
        if (!p.categories) return false;
        const cats = p.categories.toLowerCase();
        // Match start of category or after separator
        return cats.startsWith(catLower) || cats.includes(`|${catLower}`) || cats.includes(`/${catLower}`);
      });
    }
  }

  // ============================================
  // STOCK TYPE FILTER
  // ============================================
  if (stockType) {
    products = products.filter(p => p.stockType?.toLowerCase() === stockType.toLowerCase());
  }

  // ============================================
  // NLA FILTER
  // ============================================
  if (nlaOnly) {
    products = products.filter(p => p.nlaDate && p.nlaDate !== '');
  }

  // ============================================
  // IN STOCK FILTER
  // ============================================
  if (inStockOnly) {
    products = products.filter(p =>
      (p.availableNow && p.availableNow > 0) ||
      (p.available1to3Days && p.available1to3Days > 0) ||
      p.inStock === true
    );
  }

  // ============================================
  // SORTING
  // ============================================
  if (sort === 'relevance' || !sort) {
    // Smart relevance sorting:
    // 1. Popularity (top sellers first)
    // 2. Stock type priority (Prestige Parts first)
    // 3. In stock items
    // 4. Items with price before POA
    products.sort((a, b) => {
      // First: Popularity (higher score = more popular = comes first)
      const popA = getPopularityScore(a.sku, popularity);
      const popB = getPopularityScore(b.sku, popularity);
      if (popA !== popB) return popB - popA; // Descending

      // Second: Stock type priority
      const priorityA = getStockTypePriority(a.stockType);
      const priorityB = getStockTypePriority(b.stockType);
      if (priorityA !== priorityB) return priorityA - priorityB;

      // Third: In stock items first
      const inStockA = (a.availableNow > 0 || a.available1to3Days > 0) ? 0 : 1;
      const inStockB = (b.availableNow > 0 || b.available1to3Days > 0) ? 0 : 1;
      if (inStockA !== inStockB) return inStockA - inStockB;

      // Fourth: Items with price before POA
      const hasPriceA = a.price > 0 ? 0 : 1;
      const hasPriceB = b.price > 0 ? 0 : 1;
      if (hasPriceA !== hasPriceB) return hasPriceA - hasPriceB;

      // Fifth: By SKU for consistency
      return (a.sku || '').localeCompare(b.sku || '');
    });
  } else if (sort === 'price-asc') {
    products.sort((a, b) => (a.price || 999999) - (b.price || 999999));
  } else if (sort === 'price-desc') {
    products.sort((a, b) => (b.price || 0) - (a.price || 0));
  } else if (sort === 'name-asc') {
    products.sort((a, b) => (a.description || '').localeCompare(b.description || ''));
  } else if (sort === 'name-desc') {
    products.sort((a, b) => (b.description || '').localeCompare(a.description || ''));
  } else if (sort === 'sku') {
    products.sort((a, b) => (a.sku || '').localeCompare(b.sku || ''));
  } else if (sort === 'popularity') {
    products.sort((a, b) => {
      const popA = getPopularityScore(a.sku, popularity);
      const popB = getPopularityScore(b.sku, popularity);
      return popB - popA;
    });
  }

  // ============================================
  // PAGINATION
  // ============================================
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

/**
 * Get unique categories with subcategories
 */
export function getCategories() {
  const products = loadProducts();
  const categoryMap = new Map(); // mainCategory -> Set of subcategories

  products.forEach(p => {
    if (p.categories) {
      p.categories.split('|').forEach(catPath => {
        const parts = catPath.split('/').map(s => s.trim());
        const mainCat = parts[0];
        if (mainCat) {
          if (!categoryMap.has(mainCat)) {
            categoryMap.set(mainCat, new Set());
          }
          if (parts[1]) {
            categoryMap.get(mainCat).add(parts[1]);
          }
        }
      });
    }
  });

  // Convert to sorted array with subcategories
  const result = [];
  const sortedMains = Array.from(categoryMap.keys()).sort();
  for (const main of sortedMains) {
    result.push({
      name: main,
      subcategories: Array.from(categoryMap.get(main)).sort()
    });
  }

  return result;
}

/**
 * Get flat list of category names (for simple dropdown)
 */
export function getCategoryNames() {
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

/**
 * Get all unique stock types
 */
export function getStockTypes() {
  const products = loadProducts();
  const types = new Set();
  products.forEach(p => {
    if (p.stockType) types.add(p.stockType);
  });
  // Sort by priority
  return Array.from(types).sort((a, b) => {
    return getStockTypePriority(a) - getStockTypePriority(b);
  });
}

/**
 * Get vehicle data for selector
 */
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

/**
 * Get single product by SKU with fitment and catalogue URL
 */
export function getProductBySku(sku) {
  const products = loadProducts();
  const fitmentLookup = loadFitmentLookup();
  const popularity = loadPopularity();

  const product = products.find(p => p.sku?.toUpperCase() === sku.toUpperCase());
  if (!product) return null;

  const parentSku = product.parentSku || product.sku;
  const fitment = fitmentLookup[parentSku] || [];

  const catalogueUrl = product.cmsPageUrl
    ? `https://www.introcar.co.uk${product.cmsPageUrl.startsWith('/') ? '' : '/'}${product.cmsPageUrl}`
    : null;

  const popularityScore = getPopularityScore(product.sku, popularity);

  return { ...product, fitment, catalogueUrl, popularityScore };
}

/**
 * Get related products (same parent SKU or category)
 */
export function getRelatedProducts(sku, limit = 8) {
  const product = getProductBySku(sku);
  if (!product) return [];

  const products = loadProducts();
  const popularity = loadPopularity();
  const related = [];

  // First: Other variants of the same parent SKU
  if (product.parentSku) {
    const variants = products.filter(p =>
      p.sku !== sku &&
      p.parentSku === product.parentSku
    );
    related.push(...variants);
  }

  // Second: Same category, prioritized by popularity and stock type
  if (related.length < limit) {
    const mainCategory = product.categories?.split('/')[0]?.split('|')[0];
    if (mainCategory) {
      const sameCategoryProducts = products
        .filter(p =>
          p.sku !== sku &&
          !related.find(r => r.sku === p.sku) &&
          p.categories?.startsWith(mainCategory)
        )
        .sort((a, b) => {
          // By popularity first
          const popA = getPopularityScore(a.sku, popularity);
          const popB = getPopularityScore(b.sku, popularity);
          if (popA !== popB) return popB - popA;
          // Then by stock type
          const priorityA = getStockTypePriority(a.stockType);
          const priorityB = getStockTypePriority(b.stockType);
          return priorityA - priorityB;
        });

      related.push(...sameCategoryProducts);
    }
  }

  return related.slice(0, limit);
}
