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
  searchPartType = '',
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

  // IMPORTANT: Exclude "Lookbook" stock type from product results
  // Lookbooks are catalogues (technical diagrams), not actual products for sale
  products = products.filter(p => p.stockType?.toLowerCase() !== 'lookbook');

  let supersessionMatch = null;
  let searchType = null;

  // ============================================
  // SEARCH
  // ============================================
  if (search) {
    const searchLower = search.toLowerCase().trim();
    const searchUpper = search.toUpperCase().trim();
    const searchBase = extractBaseSku(search);

    // Build a set of ALL related SKUs (the searched term + any supersession references)
    // This ensures we find the same part regardless of which SKU it's stocked under
    const relatedSkus = new Set([searchUpper, searchBase]);

    // Add supersession-related SKUs (these are all the same part, just different references)
    const supersessionRefs = supersessionLookup[searchUpper];
    if (supersessionRefs) {
      const refs = Array.isArray(supersessionRefs) ? supersessionRefs : [supersessionRefs];
      refs.forEach(ref => {
        relatedSkus.add(ref.toUpperCase());
        relatedSkus.add(extractBaseSku(ref));
      });
      supersessionMatch = { searchedSku: searchUpper, relatedSkus: refs };
    }

    // Normal search - find matches by priority
    const exactMatches = [];
    const parentSkuMatches = [];
    const startsWithMatches = [];
    const skuMatches = [];
    const supersessionContentMatches = [];
    const relatedSupersessionMatches = []; // Products matching via supersession lookup
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
      // SKU starts with search term (partial SKU from beginning)
      else if (pSkuUpper.startsWith(searchUpper) || pParentSkuUpper.startsWith(searchUpper) ||
               pBaseSku.startsWith(searchUpper) || pBaseParentSku.startsWith(searchUpper)) {
        startsWithMatches.push(p);
      }
      // Partial SKU match (anywhere in SKU)
      else if (pSkuUpper.includes(searchUpper)) {
        skuMatches.push(p);
      }
      // Match via supersession lookup (same part, different reference number)
      else if (relatedSkus.has(pParentSkuUpper) || relatedSkus.has(pBaseSku) || relatedSkus.has(pBaseParentSku) ||
               [...relatedSkus].some(sku => pSkuUpper.startsWith(sku) || pParentSkuUpper.startsWith(sku))) {
        relatedSupersessionMatches.push(p);
      }
      // Search in product's supersessions array (also known as)
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

    products = [...exactMatches, ...parentSkuMatches, ...startsWithMatches, ...skuMatches, ...relatedSupersessionMatches, ...supersessionContentMatches, ...descriptionMatches];

    // Remove duplicates
    const seen = new Set();
    products = products.filter(p => {
      if (seen.has(p.sku)) return false;
      seen.add(p.sku);
      return true;
    });

    // Set search type for UI messaging
    if (relatedSupersessionMatches.length > 0) {
      searchType = 'related'; // Found products under related part numbers
    } else if (parentSkuMatches.length > 0 && exactMatches.length === 0) {
      searchType = 'variant';
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

          // Parse chassis bounds once for this fitment
          const fitmentStart = (f.chassisStart !== null && f.chassisStart !== undefined)
            ? (typeof f.chassisStart === 'number' ? f.chassisStart : parseInt(String(f.chassisStart).replace(/\D/g, '')) || 0)
            : null;
          const fitmentEnd = (f.chassisEnd !== null && f.chassisEnd !== undefined)
            ? (typeof f.chassisEnd === 'number' ? f.chassisEnd : parseInt(String(f.chassisEnd).replace(/\D/g, '')) || 999999)
            : null;

          // PRIORITY 1: If user entered specific chassis number, do precise matching
          if (chassisNum && fitmentStart !== null && fitmentEnd !== null) {
            // Check if the entered chassis falls within this fitment's range
            if (chassisNum < fitmentStart || chassisNum > fitmentEnd) {
              return false;
            }
            // Chassis number matches this fitment - this is a valid part
            return true;
          }

          // PRIORITY 2: If we have year-based chassis range data, check fitment overlaps
          if (chassisRange && fitmentStart !== null && fitmentEnd !== null) {
            // Check if ranges overlap
            if (fitmentEnd < chassisRange.chassisNumericStart || fitmentStart > chassisRange.chassisNumericEnd) {
              return false;
            }
          }

          // If no chassis data to filter on, or fitment has no chassis bounds, include the part
          // (Make/Model filter already passed above)
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
  // COMPUTE AVAILABLE FILTERS (before category/stockType filters)
  // This ensures we only show categories, subcategories, and models that have products
  // ============================================
  const availableCategories = new Map(); // mainCategory -> Set of subcategories
  const availableStockTypes = new Set();
  const availableSearchPartTypes = new Map(); // searchPartType -> count
  const availableModels = new Set(); // Models that have products for current make
  const availableYears = new Set(); // Years that have products for current make/model

  // Get parent SKUs for current products to check fitment
  const currentParentSkus = new Set(products.map(p => p.parentSku).filter(Boolean));

  products.forEach(p => {
    // Collect categories from products matching vehicle filters
    if (p.categories) {
      p.categories.split('|').forEach(catPath => {
        const parts = catPath.split('/').map(s => s.trim());
        const mainCat = parts[0];
        if (mainCat) {
          if (!availableCategories.has(mainCat)) {
            availableCategories.set(mainCat, new Set());
          }
          if (parts[1]) {
            availableCategories.get(mainCat).add(parts[1]);
          }
        }
      });
    }
    // Collect stock types
    if (p.stockType && p.stockType.toLowerCase() !== 'lookbook') {
      availableStockTypes.add(p.stockType);
    }
    // Collect search part types (include Lookbooks/Catalogues)
    if (p.searchPartType) {
      const count = availableSearchPartTypes.get(p.searchPartType) || 0;
      availableSearchPartTypes.set(p.searchPartType, count + 1);
    }
  });

  // Compute available models based on current filtered products' fitment
  // Only show models that belong to the selected make AND have products
  if (make) {
    Object.entries(fitmentLookup).forEach(([parentSku, fitments]) => {
      // Only consider fitments for products that are in our current result set
      if (currentParentSkus.has(parentSku) && Array.isArray(fitments)) {
        fitments.forEach(f => {
          // IMPORTANT: Only include models that match the selected make
          if (f.make === make && f.model) {
            availableModels.add(f.model);
          }
        });
      }
    });
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
  // Supports multiple stock types separated by comma (e.g., "Prestige Parts,Prestige Parts (OE),Uprated")
  // ============================================
  if (stockType) {
    const stockTypes = stockType.split(',').map(s => s.trim().toLowerCase());
    products = products.filter(p => stockTypes.includes(p.stockType?.toLowerCase()));
  }

  // ============================================
  // SEARCH PART TYPE FILTER
  // Filters by searchPartType field (Core Part, Ancillaries, Bundles, etc.)
  // ============================================
  if (searchPartType) {
    const searchPartTypes = searchPartType.split(',').map(s => s.trim());
    products = products.filter(p => searchPartTypes.includes(p.searchPartType));
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
      // FIRST: Bundles always at top
      const isBundleA = a.searchPartType === 'Bundles' ? 0 : 1;
      const isBundleB = b.searchPartType === 'Bundles' ? 0 : 1;
      if (isBundleA !== isBundleB) return isBundleA - isBundleB;

      // Second: Tier (Primary → Secondary → Lastly)
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

      // Then: Price descending (higher priced items first to avoid nuts/bolts at top)
      const priceA = a.price || 0;
      const priceB = b.price || 0;
      if (priceA !== priceB) return priceB - priceA;

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
      if (popA !== popB) return popB - popA;
      // Tiebreaker: price descending (higher priced items first)
      return (b.price || 0) - (a.price || 0);
    });
  }

  // ============================================
  // PAGINATION
  // ============================================
  const total = products.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const paginatedProducts = products.slice(startIndex, startIndex + limit);

  // Convert available categories to array format
  const availableCategoriesArray = [];
  const sortedMains = Array.from(availableCategories.keys()).sort();
  for (const main of sortedMains) {
    availableCategoriesArray.push({
      name: main,
      subcategories: Array.from(availableCategories.get(main)).sort()
    });
  }

  // Convert search part types to array with display names
  const searchPartTypeDisplayNames = {
    'Core Part': 'Parts',
    'Lookbooks': 'Catalogues',
    'Ancillaries': 'Nuts, Bolts & Washers',
    'Bundles': 'Bundles & Kits',
    'Literature': 'Literature',
  };
  const availableSearchPartTypesArray = Array.from(availableSearchPartTypes.entries())
    .sort((a, b) => b[1] - a[1]) // Sort by count descending
    .map(([value, count]) => ({
      value,
      label: searchPartTypeDisplayNames[value] || value,
      count
    }));

  // Get available years for the selected make/model
  let availableYearsArray = [];
  if (make && model) {
    const chassisYears = loadChassisYears();
    if (chassisYears[make] && chassisYears[make][model] && chassisYears[make][model].years) {
      availableYearsArray = Object.keys(chassisYears[make][model].years)
        .map(Number)
        .sort((a, b) => b - a); // Newest first
    }
  }

  return {
    products: paginatedProducts,
    pagination: { page, limit, total, totalPages, hasMore: page < totalPages },
    supersessionMatch,
    searchType,
    availableFilters: {
      categories: availableCategoriesArray,
      stockTypes: Array.from(availableStockTypes).sort((a, b) => getStockTypePriority(a) - getStockTypePriority(b)),
      searchPartTypes: availableSearchPartTypesArray,
      models: Array.from(availableModels).sort(),
      years: availableYearsArray
    }
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
 * Excludes "Lookbook" as those are catalogues, not products
 */
export function getStockTypes() {
  const products = loadProducts();
  const types = new Set();
  products.forEach(p => {
    // Exclude Lookbook from stock types - they're catalogues, not products
    if (p.stockType && p.stockType.toLowerCase() !== 'lookbook') {
      types.add(p.stockType);
    }
  });
  // Sort by priority
  return Array.from(types).sort((a, b) => {
    return getStockTypePriority(a) - getStockTypePriority(b);
  });
}

/**
 * Search Part Type mapping
 * Maps internal values to display names for the filter UI
 */
const SEARCH_PART_TYPE_DISPLAY = {
  'Core Part': 'Parts',
  'Lookbooks': 'Catalogues',
  'Ancillaries': 'Nuts, Bolts & Washers',
  'Bundles': 'Bundles & Kits',
  'Literature': 'Literature', // Keep as-is or exclude if not needed
};

/**
 * Get all unique search part types with their display names
 * Returns array of { value, label } objects for filter UI
 */
export function getSearchPartTypes() {
  const products = loadProducts();
  const types = new Map(); // value -> count

  products.forEach(p => {
    if (p.searchPartType) {
      const count = types.get(p.searchPartType) || 0;
      types.set(p.searchPartType, count + 1);
    }
  });

  // Convert to array with display names, sorted by count (most common first)
  const result = [];
  const sortedTypes = Array.from(types.entries())
    .sort((a, b) => b[1] - a[1]); // Sort by count descending

  for (const [value, count] of sortedTypes) {
    // Skip Lookbooks in product context (they're shown separately in catalogues)
    if (value === 'Lookbooks') continue;

    const label = SEARCH_PART_TYPE_DISPLAY[value] || value;
    result.push({ value, label, count });
  }

  return result;
}

/**
 * Get available years for a Make/Model combination
 */
export function getYearsForModel(make, model) {
  const chassisYears = loadChassisYears();
  if (!make || !model) return [];
  if (!chassisYears[make] || !chassisYears[make][model]) return [];

  const modelData = chassisYears[make][model];
  if (!modelData.years) return [];

  return Object.keys(modelData.years)
    .map(Number)
    .sort((a, b) => b - a); // Descending (newest first)
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
 * Parse chassis ranges from lookbook title
 * Returns array of {start, end} chassis number ranges
 */
function parseChassisRangesFromTitle(title) {
  if (!title) return [];
  const ranges = [];
  const regex = /chassis\s*(\d+)[-–](\d+)/gi;
  let match;
  while ((match = regex.exec(title)) !== null) {
    ranges.push({ start: parseInt(match[1]), end: parseInt(match[2]) });
  }
  return ranges;
}

/**
 * Check if a chassis number falls within any of the ranges
 */
function chassisMatchesRanges(chassisNum, ranges) {
  if (!ranges || ranges.length === 0) return true; // No ranges = matches everything
  return ranges.some(r => chassisNum >= r.start && chassisNum <= r.end);
}

/**
 * Get all lookbooks with pagination and filtering
 * @deprecated Use getCatalogues instead
 */
export function getLookbooks({ page = 1, limit = 24, search = '', make = '', model = '', category = '', chassis = '' }) {
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

  // Chassis number filter - parse chassis ranges from titles and filter
  if (chassis) {
    const chassisNum = parseInt(chassis);
    if (!isNaN(chassisNum)) {
      lookbooks = lookbooks.filter(lb => {
        const ranges = parseChassisRangesFromTitle(lb.title);
        // If no chassis ranges in title, include the catalogue (can't filter)
        // If has ranges, check if our chassis falls within any of them
        if (ranges.length === 0) return true;
        return chassisMatchesRanges(chassisNum, ranges);
      });
    }
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
    },
    chassisFilter: chassis || null
  };
}

/**
 * Get all catalogues with pagination and filtering
 * Renamed from getLookbooks - returns 'catalogues' key instead of 'lookbooks'
 */
export function getCatalogues({ page = 1, limit = 24, search = '', make = '', model = '', category = '', subcategory = '', chassis = '' }) {
  let catalogues = loadLookbooks();

  // IMPORTANT: Filter out catalogues without images - the image IS the catalogue
  // Without an image, there's no point showing the catalogue
  // Check both 'image' (Cloudinary) and 'imageUrl' (legacy) fields
  catalogues = catalogues.filter(cat =>
    (cat.image && cat.image.trim() !== '') ||
    (cat.imageUrl && cat.imageUrl.trim() !== '')
  );

  // Collect all unique filter options (after filtering out imageless catalogues)
  const allMakes = new Set();
  const categorySubcategories = new Map(); // category -> Set of subcategories

  catalogues.forEach(cat => {
    if (cat.makes) cat.makes.forEach(m => allMakes.add(m));
    if (cat.category) {
      if (!categorySubcategories.has(cat.category)) {
        categorySubcategories.set(cat.category, new Set());
      }
      if (cat.subcategory && cat.subcategory.trim()) {
        categorySubcategories.get(cat.category).add(cat.subcategory);
      }
    }
  });

  // Search filter
  if (search) {
    const searchLower = search.toLowerCase();
    catalogues = catalogues.filter(cat =>
      cat.title?.toLowerCase().includes(searchLower) ||
      cat.id?.toLowerCase().includes(searchLower) ||
      cat.hotspots?.some(h => h.toLowerCase().includes(searchLower))
    );
  }

  // Make filter
  if (make) {
    catalogues = catalogues.filter(cat =>
      cat.makes?.includes(make)
    );
  }

  // Model filter (only if make is selected)
  if (model) {
    catalogues = catalogues.filter(cat =>
      cat.models?.includes(model)
    );
  }

  // Category filter
  if (category) {
    catalogues = catalogues.filter(cat =>
      cat.category === category
    );
  }

  // Subcategory filter (only applies if category is also selected)
  if (subcategory) {
    catalogues = catalogues.filter(cat =>
      cat.subcategory === subcategory
    );
  }

  // Chassis number filter - parse chassis ranges from titles and filter
  if (chassis) {
    const chassisNum = parseInt(chassis);
    if (!isNaN(chassisNum)) {
      catalogues = catalogues.filter(cat => {
        const ranges = parseChassisRangesFromTitle(cat.title);
        // If no chassis ranges in title, include the catalogue (can't filter)
        // If has ranges, check if our chassis falls within any of them
        if (ranges.length === 0) return true;
        return chassisMatchesRanges(chassisNum, ranges);
      });
    }
  }

  // Get models for selected make (for dynamic dropdown)
  // IMPORTANT: Only show models that actually belong to the selected make
  // AND that exist in the filtered catalogues
  let modelsForMake = [];
  if (make) {
    const modelsSet = new Set();
    // Build a lookup of which models belong to which makes from fitment data
    const fitmentLookup = loadFitmentLookup();
    const validModelsForMake = new Set();

    // Get models from fitment lookup that belong to this make
    Object.values(fitmentLookup).forEach(fitments => {
      if (Array.isArray(fitments)) {
        fitments.forEach(f => {
          if (f.make === make && f.model) {
            validModelsForMake.add(f.model);
          }
        });
      }
    });

    // Now only include models from catalogues that are valid for this make
    catalogues.forEach(cat => {
      if (cat.models) {
        cat.models.forEach(m => {
          // Only add if this model belongs to the selected make
          if (validModelsForMake.has(m)) {
            modelsSet.add(m);
          }
        });
      }
    });
    modelsForMake = Array.from(modelsSet).sort();
  }

  // Compute available categories and subcategories from the FILTERED catalogues (after all filters applied)
  const availableCategoriesMap = new Map(); // category -> Set of subcategories
  catalogues.forEach(cat => {
    if (cat.category) {
      if (!availableCategoriesMap.has(cat.category)) {
        availableCategoriesMap.set(cat.category, new Set());
      }
      if (cat.subcategory && cat.subcategory.trim()) {
        availableCategoriesMap.get(cat.category).add(cat.subcategory);
      }
    }
  });

  // Convert to array format with subcategories
  const availableCategoriesArray = Array.from(availableCategoriesMap.keys()).sort().map(catName => ({
    name: catName,
    subcategories: Array.from(availableCategoriesMap.get(catName)).sort()
  }));

  // Get subcategories for the currently selected category
  let subcategoriesForCategory = [];
  if (category && categorySubcategories.has(category)) {
    // Get subcategories that exist in the filtered results
    const validSubcats = availableCategoriesMap.get(category);
    if (validSubcats) {
      subcategoriesForCategory = Array.from(validSubcats).sort();
    }
  }

  const total = catalogues.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const paginatedCatalogues = catalogues.slice(startIndex, startIndex + limit);

  return {
    catalogues: paginatedCatalogues,
    pagination: { page, limit, total, totalPages, hasMore: page < totalPages },
    filters: {
      makes: Array.from(allMakes).sort(),
      models: modelsForMake,
      categories: availableCategoriesArray,
      subcategories: subcategoriesForCategory
    },
    chassisFilter: chassis || null
  };
}

/**
 * Get single catalogue by ID with its products
 * Renamed from getLookbookById
 */
export function getCatalogueById(catalogueId) {
  return getLookbookById(catalogueId);
}

/**
 * Get catalogues for Shop by Model - used alongside products
 * Returns a simplified list of catalogues matching the filters
 */
export function getCataloguesForModel({ make = '', model = '', category = '', subcategory = '', search = '', limit = 50 }) {
  let catalogues = loadLookbooks();

  // Filter out catalogues without images
  catalogues = catalogues.filter(cat =>
    (cat.image && cat.image.trim() !== '') ||
    (cat.imageUrl && cat.imageUrl.trim() !== '')
  );

  // Make filter
  if (make) {
    catalogues = catalogues.filter(cat => cat.makes?.includes(make));
  }

  // Model filter
  if (model) {
    catalogues = catalogues.filter(cat => cat.models?.includes(model));
  }

  // Category filter
  if (category) {
    catalogues = catalogues.filter(cat => cat.category === category);
  }

  // Subcategory filter
  if (subcategory) {
    catalogues = catalogues.filter(cat => cat.subcategory === subcategory);
  }

  // Search filter
  if (search) {
    const searchLower = search.toLowerCase();
    catalogues = catalogues.filter(cat =>
      cat.title?.toLowerCase().includes(searchLower) ||
      cat.id?.toLowerCase().includes(searchLower) ||
      cat.hotspots?.some(h => h.toLowerCase().includes(searchLower))
    );
  }

  return {
    catalogues: catalogues.slice(0, limit),
    total: catalogues.length
  };
}

// Technical Videos Cache
let technicalVideosCache = null;

function loadTechnicalVideos() {
  if (technicalVideosCache) return technicalVideosCache;
  technicalVideosCache = loadJsonFile('technical-videos.json');
  return technicalVideosCache || { categories: [], videos: [] };
}

/**
 * Get technical videos with optional category filter
 * Returns videos grouped by category with stats
 */
export function getTechnicalVideos(category = null) {
  const data = loadTechnicalVideos();
  let videos = data.videos || [];

  if (category) {
    videos = videos.filter(v => v.category === category);
  }

  return {
    videos,
    categories: data.categories || [],
    total: videos.length
  };
}
