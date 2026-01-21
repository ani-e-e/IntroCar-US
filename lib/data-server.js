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
let lookbooksCache = null;
let hotspotIndexCache = null;
let chassisYearsCache = null;

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

export function loadLookbooks() {
  if (!lookbooksCache) {
    lookbooksCache = loadJsonFile('lookbooks.json');
  }
  return lookbooksCache || [];
}

export function loadHotspotIndex() {
  if (!hotspotIndexCache) {
    hotspotIndexCache = loadJsonFile('hotspot-index.json');
  }
  return hotspotIndexCache || {};
}

export function loadChassisYears() {
  if (!chassisYearsCache) {
    chassisYearsCache = loadJsonFile('chassis-years.json');
  }
  return chassisYearsCache || {};
}

/**
 * Get chassis range for a specific Make/Model/Year
 */
export function getChassisRange(make, model, year) {
  const chassisYears = loadChassisYears();
  if (!chassisYears[make] || !chassisYears[make][model]) {
    return null;
  }
  const modelData = chassisYears[make][model];
  if (!year) {
    // Return overall range
    return {
      yearStart: modelData.yearStart,
      yearEnd: modelData.yearEnd,
      years: Object.keys(modelData.years).map(Number).sort((a, b) => a - b)
    };
  }
  const yearData = modelData.years[String(year)];
  if (!yearData) return null;
  return yearData;
}

/**
 * Get all available years for a Make/Model with their chassis ranges
 */
export function getChassisYearsForModel(make, model) {
  const chassisYears = loadChassisYears();
  if (!chassisYears[make] || !chassisYears[make][model]) {
    return null;
  }
  return chassisYears[make][model];
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
  chassis = '',
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
  // YEAR/CHASSIS FILTER
  // ============================================
  if (year || chassis) {
    const yearNum = year ? parseInt(year) : null;
    const chassisNum = chassis ? parseInt(chassis) : null;

    // Get chassis range data for the selected make/model/year
    let chassisRange = null;
    if (make && model && yearNum) {
      chassisRange = getChassisRange(make, model, yearNum);
    }

    const skusForYearChassis = new Set();
    Object.entries(fitmentLookup).forEach(([parentSku, fitments]) => {
      if (Array.isArray(fitments)) {
        // Check if any fitment covers this year/chassis
        const matchesFitment = fitments.some(f => {
          // If model filter is also active, only check that model
          if (model && f.model !== model) return false;
          if (make && f.make !== make) return false;

          // If we have a specific chassis number, check it's in range
          if (chassisNum && f.chassisStart !== null && f.chassisEnd !== null) {
            // Convert chassis bounds to numbers for comparison
            const fitmentStart = typeof f.chassisStart === 'number' ? f.chassisStart : parseInt(String(f.chassisStart).replace(/\D/g, '')) || 0;
            const fitmentEnd = typeof f.chassisEnd === 'number' ? f.chassisEnd : parseInt(String(f.chassisEnd).replace(/\D/g, '')) || 999999;

            // Check if the entered chassis falls within this fitment's range
            if (chassisNum < fitmentStart || chassisNum > fitmentEnd) {
              return false;
            }
          }

          // If we have year and chassis range data, check fitment overlaps
          if (chassisRange && f.chassisStart !== null && f.chassisEnd !== null) {
            const fitmentStart = typeof f.chassisStart === 'number' ? f.chassisStart : parseInt(String(f.chassisStart).replace(/\D/g, '')) || 0;
            const fitmentEnd = typeof f.chassisEnd === 'number' ? f.chassisEnd : parseInt(String(f.chassisEnd).replace(/\D/g, '')) || 999999;

            // Check if ranges overlap
            if (fitmentEnd < chassisRange.chassisNumericStart || fitmentStart > chassisRange.chassisNumericEnd) {
              return false;
            }
          }

          return true;
        });
        if (matchesFitment) {
          skusForYearChassis.add(parentSku);
        }
      }
    });
    // Only filter if we have valid data, otherwise keep products
    if (skusForYearChassis.size > 0) {
      products = products.filter(p => skusForYearChassis.has(p.parentSku));
    }
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
  // SORTING - Hierarchical priority system
  // ============================================
  // Priority Tier 1 (Primary): Prestige Parts (OE), Uprated, Prestige Parts
  // Priority Tier 2 (Secondary): Everything else (OE, Aftermarket, etc.)
  // Priority Tier 3 (Lastly): Everything else without stock/image
  // Within tiers: In stock → With image → Bestsellers

  const isPrimaryStockType = (type) => {
    return ['Prestige Parts', 'Prestige Parts (OE)', 'Uprated'].includes(type);
  };

  const getTierScore = (product) => {
    const isPrimary = isPrimaryStockType(product.stockType);
    const isInStock = (product.availableNow > 0 || product.available1to3Days > 0 || product.inStock);
    const hasImage = !!(product.imageUrl || product.image);

    // Tier 1: Primary stock types
    if (isPrimary) return 1;
    // Tier 2: Secondary (OE, Aftermarket) with stock or image
    if (isInStock || hasImage) return 2;
    // Tier 3: Everything else
    return 3;
  };

  if (sort === 'relevance' || !sort) {
    products.sort((a, b) => {
      // First: Tier (Primary → Secondary → Lastly)
      const tierA = getTierScore(a);
      const tierB = getTierScore(b);
      if (tierA !== tierB) return tierA - tierB;

      // Within tier: Stock type priority
      const priorityA = getStockTypePriority(a.stockType);
      const priorityB = getStockTypePriority(b.stockType);
      if (priorityA !== priorityB) return priorityA - priorityB;

      // Then: In stock items first
      const inStockA = (a.availableNow > 0 || a.available1to3Days > 0) ? 0 : 1;
      const inStockB = (b.availableNow > 0 || b.available1to3Days > 0) ? 0 : 1;
      if (inStockA !== inStockB) return inStockA - inStockB;

      // Then: Items with images
      const hasImageA = (a.imageUrl || a.image) ? 0 : 1;
      const hasImageB = (b.imageUrl || b.image) ? 0 : 1;
      if (hasImageA !== hasImageB) return hasImageA - hasImageB;

      // Then: Bestsellers (popularity)
      const popA = getPopularityScore(a.sku, popularity);
      const popB = getPopularityScore(b.sku, popularity);
      if (popA !== popB) return popB - popA;

      // Finally: By SKU for consistency
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
 * Get related products (same subcategory/category AND model)
 * Priority: Same tier sorting (Prestige first, in-stock, with image, bestsellers)
 */
export function getRelatedProducts(sku, limit = 8) {
  const product = getProductBySku(sku);
  if (!product) return [];

  const products = loadProducts();
  const popularity = loadPopularity();
  const fitmentLookup = loadFitmentLookup();
  const related = [];
  const addedSkus = new Set([sku]);

  // Get product's fitment (makes/models)
  const productFitment = fitmentLookup[product.parentSku] || product.fitment || [];
  const productModels = new Set(productFitment.map(f => f.model).filter(Boolean));

  // Get product's categories
  const productCategory = product.categories?.split('/')[0]?.split('|')[0];
  const productSubcategory = product.categories?.includes('/')
    ? product.categories.split('/')[1]?.split('|')[0]
    : null;

  // Helper: Check if product fits same model
  const fitsSameModel = (p) => {
    if (productModels.size === 0) return true; // No model restriction
    const pFitment = fitmentLookup[p.parentSku] || p.fitment || [];
    return pFitment.some(f => productModels.has(f.model));
  };

  // Helper: Score for sorting (lower = better)
  const isPrimaryStockType = (type) => {
    return ['Prestige Parts', 'Prestige Parts (OE)', 'Uprated'].includes(type);
  };

  const getScore = (p) => {
    const isPrimary = isPrimaryStockType(p.stockType) ? 0 : 100;
    const inStock = (p.availableNow > 0 || p.available1to3Days > 0) ? 0 : 50;
    const hasImage = (p.imageUrl || p.image) ? 0 : 25;
    const popularity = 1000 - getPopularityScore(p.sku, popularity);
    return isPrimary + inStock + hasImage + getStockTypePriority(p.stockType) + Math.min(popularity / 100, 10);
  };

  // First: Other variants of the same parent SKU
  if (product.parentSku) {
    const variants = products.filter(p =>
      !addedSkus.has(p.sku) &&
      p.parentSku === product.parentSku
    );
    variants.forEach(v => {
      addedSkus.add(v.sku);
      related.push(v);
    });
  }

  // Second: Same subcategory + same model
  if (related.length < limit && productSubcategory) {
    const sameSubcatModel = products
      .filter(p =>
        !addedSkus.has(p.sku) &&
        p.categories?.includes(`${productCategory}/${productSubcategory}`) &&
        fitsSameModel(p)
      )
      .sort((a, b) => getScore(a) - getScore(b));

    for (const p of sameSubcatModel) {
      if (related.length >= limit) break;
      addedSkus.add(p.sku);
      related.push(p);
    }
  }

  // Third: Same main category + same model
  if (related.length < limit && productCategory) {
    const sameCatModel = products
      .filter(p =>
        !addedSkus.has(p.sku) &&
        p.categories?.startsWith(productCategory) &&
        fitsSameModel(p)
      )
      .sort((a, b) => getScore(a) - getScore(b));

    for (const p of sameCatModel) {
      if (related.length >= limit) break;
      addedSkus.add(p.sku);
      related.push(p);
    }
  }

  // Fourth: Same category (any model)
  if (related.length < limit && productCategory) {
    const sameCat = products
      .filter(p =>
        !addedSkus.has(p.sku) &&
        p.categories?.startsWith(productCategory)
      )
      .sort((a, b) => getScore(a) - getScore(b));

    for (const p of sameCat) {
      if (related.length >= limit) break;
      addedSkus.add(p.sku);
      related.push(p);
    }
  }

  return related.slice(0, limit);
}

/**
 * Get lookbooks/catalogues that feature a product (by parent SKU)
 */
export function getLookbooksForProduct(sku) {
  const product = getProductBySku(sku);
  if (!product) return [];

  const parentSku = (product.parentSku || sku).toUpperCase();
  const hotspotIndex = loadHotspotIndex();
  const lookbooks = loadLookbooks();

  // Get lookbook IDs that reference this parent SKU
  const lookbookIds = hotspotIndex[parentSku] || [];
  if (lookbookIds.length === 0) return [];

  // Get full lookbook objects
  const lookbookMap = new Map(lookbooks.map(lb => [lb.id, lb]));
  return lookbookIds
    .map(id => lookbookMap.get(id))
    .filter(Boolean)
    .slice(0, 10); // Limit to 10 catalogues
}

/**
 * Get single lookbook by ID with its products
 */
export function getLookbookById(lookbookId) {
  const lookbooks = loadLookbooks();
  const lookbook = lookbooks.find(lb => lb.id === lookbookId);
  if (!lookbook) return null;

  // Get products for this lookbook's hotspots
  const products = loadProducts();
  const popularity = loadPopularity();

  const hotspotProducts = [];
  const addedSkus = new Set();

  lookbook.hotspots.forEach(parentSku => {
    // Find all products with this parent SKU
    const matching = products.filter(p =>
      p.parentSku?.toUpperCase() === parentSku.toUpperCase() ||
      extractBaseSku(p.sku) === parentSku.toUpperCase()
    );
    matching.forEach(p => {
      if (!addedSkus.has(p.sku)) {
        addedSkus.add(p.sku);
        hotspotProducts.push(p);
      }
    });
  });

  // Sort products by tier/priority
  const isPrimaryStockType = (type) => {
    return ['Prestige Parts', 'Prestige Parts (OE)', 'Uprated'].includes(type);
  };

  hotspotProducts.sort((a, b) => {
    const isPrimaryA = isPrimaryStockType(a.stockType) ? 0 : 100;
    const isPrimaryB = isPrimaryStockType(b.stockType) ? 0 : 100;
    if (isPrimaryA !== isPrimaryB) return isPrimaryA - isPrimaryB;

    const priorityA = getStockTypePriority(a.stockType);
    const priorityB = getStockTypePriority(b.stockType);
    if (priorityA !== priorityB) return priorityA - priorityB;

    const inStockA = (a.availableNow > 0 || a.available1to3Days > 0) ? 0 : 1;
    const inStockB = (b.availableNow > 0 || b.available1to3Days > 0) ? 0 : 1;
    if (inStockA !== inStockB) return inStockA - inStockB;

    const popA = getPopularityScore(a.sku, popularity);
    const popB = getPopularityScore(b.sku, popularity);
    return popB - popA;
  });

  return {
    ...lookbook,
    products: hotspotProducts
  };
}

/**
 * Get all lookbooks with pagination and filtering
 */
export function getLookbooks({ page = 1, limit = 24, search = '', make = '', model = '', category = '' }) {
  let lookbooks = loadLookbooks();

  // Collect all unique filter options (before filtering)
  const allMakes = new Set();
  const allModels = new Set();
  const allCategories = new Set();

  lookbooks.forEach(lb => {
    if (lb.makes) lb.makes.forEach(m => allMakes.add(m));
    if (lb.models) lb.models.forEach(m => allModels.add(m));
    if (lb.category) allCategories.add(lb.category);
  });

  // Search filter
  if (search) {
    const searchLower = search.toLowerCase();
    lookbooks = lookbooks.filter(lb =>
      lb.title?.toLowerCase().includes(searchLower) ||
      lb.id?.toLowerCase().includes(searchLower) ||
      lb.hotspots?.some(h => h.toLowerCase().includes(searchLower))
    );
  }

  // Make filter
  if (make) {
    lookbooks = lookbooks.filter(lb =>
      lb.makes?.includes(make)
    );
  }

  // Model filter (only if make is selected)
  if (model) {
    lookbooks = lookbooks.filter(lb =>
      lb.models?.includes(model)
    );
  }

  // Category filter
  if (category) {
    lookbooks = lookbooks.filter(lb =>
      lb.category === category
    );
  }

  // Get models for selected make (for dynamic dropdown)
  let modelsForMake = [];
  if (make) {
    const modelsSet = new Set();
    lookbooks.forEach(lb => {
      if (lb.models) lb.models.forEach(m => modelsSet.add(m));
    });
    modelsForMake = Array.from(modelsSet).sort();
  }

  const total = lookbooks.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const paginatedLookbooks = lookbooks.slice(startIndex, startIndex + limit);

  return {
    lookbooks: paginatedLookbooks,
    pagination: { page, limit, total, totalPages, hasMore: page < totalPages },
    filters: {
      makes: Array.from(allMakes).sort(),
      models: modelsForMake,
      categories: Array.from(allCategories).sort()
    }
  };
}
