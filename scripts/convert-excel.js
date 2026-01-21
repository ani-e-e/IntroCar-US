/**
 * Excel/CSV to JSON Converter for IntroCar US
 * 
 * This script combines:
 * - T1 Master Data (products)
 * - T2 Chassis Master (vehicles)
 * - T3 Applications (fitment)
 * - T4 Supercessions
 * - Pricing from sell_price.csv
 * - Stock levels from availability.csv
 * - Image mappings from images.csv
 * - Weights from weights.csv
 * 
 * Run: node scripts/convert-excel.js
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const outputDir = path.join(__dirname, '..', 'data', 'json');

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Helper to read Excel file
function readExcel(filename) {
  const filepath = path.join(dataDir, filename);
  if (!fs.existsSync(filepath)) {
    console.log(`⚠️  File not found: ${filename}`);
    return null;
  }
  console.log(`📖 Reading ${filename}...`);
  const workbook = XLSX.readFile(filepath);
  const sheetName = workbook.SheetNames[0];
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  console.log(`   Found ${data.length} rows`);
  return data;
}

// Helper to read CSV file
function readCSV(filename) {
  const filepath = path.join(dataDir, filename);
  if (!fs.existsSync(filepath)) {
    console.log(`⚠️  File not found: ${filename}`);
    return null;
  }
  console.log(`📖 Reading ${filename}...`);
  const workbook = XLSX.readFile(filepath);
  const sheetName = workbook.SheetNames[0];
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  console.log(`   Found ${data.length} rows`);
  return data;
}

// Helper to write JSON file
function writeJson(filename, data) {
  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  const count = Array.isArray(data) ? data.length : Object.keys(data).length;
  console.log(`✅ Written ${filename} (${count} records)`);
}

// ============================================
// Load supplementary data into lookup maps
// ============================================

function loadPricingMap() {
  const raw = readCSV('sell_price.csv');
  if (!raw) return {};
  
  const map = {};
  raw.forEach(row => {
    const sku = (row['Stock_code'] || '').toString().trim();
    if (sku) {
      map[sku] = parseFloat(row['Sell_price']) || 0;
    }
  });
  console.log(`   Created pricing lookup for ${Object.keys(map).length} SKUs`);
  return map;
}

function loadStockMap() {
  const raw = readCSV('availability.csv');
  if (!raw) return {};
  
  const map = {};
  raw.forEach(row => {
    const sku = (row['Stock_code'] || '').toString().trim();
    if (sku) {
      const immediate = parseFloat(row['Available Immediately']) || 0;
      const days1to3 = parseInt(row['1-3 Days']) || 0;
      map[sku] = {
        availableNow: immediate,
        available1to3Days: days1to3,
        inStock: immediate > 0 || days1to3 > 0,
      };
    }
  });
  console.log(`   Created stock lookup for ${Object.keys(map).length} SKUs`);
  return map;
}

function loadImageMap() {
  const raw = readCSV('images.csv');
  if (!raw) return {};
  
  const map = {};
  raw.forEach(row => {
    const sku = (row['sku'] || '').toString().trim();
    if (sku) {
      map[sku] = {
        baseImage: row['base_image'] || null,
        image2: row['add_image2'] || null,
        image3: row['add_image3'] || null,
        image4: row['add_image4'] || null,
      };
    }
  });
  console.log(`   Created image lookup for ${Object.keys(map).length} SKUs`);
  return map;
}

function loadWeightMap() {
  const raw = readCSV('weights.csv');
  if (!raw) return {};
  
  const map = {};
  raw.forEach(row => {
    const sku = (row['Stock_code'] || '').toString().trim();
    if (sku) {
      map[sku] = parseFloat(row['Item Weight']) || 0;
    }
  });
  console.log(`   Created weight lookup for ${Object.keys(map).length} SKUs`);
  return map;
}

// ============================================
// Convert T1 - SKU Master (All Products)
// ============================================
function convertProducts(pricingMap, stockMap, imageMap, weightMap) {
  const raw = readExcel('Master Data - T1 Sku Master - All Skus.xlsx');
  if (!raw) return null;

  let priceMatches = 0;
  let stockMatches = 0;
  let imageMatches = 0;
  let weightMatches = 0;

  const products = raw.map((row, index) => {
    const sku = row['SKU'] || '';
    
    // Get pricing
    let price = parseFloat(row['Price']) || 0;
    if (pricingMap[sku]) {
      price = pricingMap[sku];
      priceMatches++;
    }
    
    // Get stock
    let stockInfo = { availableNow: 0, available1to3Days: 0, inStock: true };
    if (stockMap[sku]) {
      stockInfo = stockMap[sku];
      stockMatches++;
    }
    
    // Get images
    let images = { baseImage: null, image2: null, image3: null, image4: null };
    if (imageMap[sku]) {
      images = imageMap[sku];
      imageMatches++;
    }
    
    // Get weight
    let weight = 0;
    if (weightMap[sku]) {
      weight = weightMap[sku];
      weightMatches++;
    }

    return {
      id: index + 1,
      sku: sku,
      description: row['Description'] || '',
      price: price,
      stockType: row['Stock type'] || 'Original Equipment',
      parentSku: row['Parent SKU'] || '',
      additionalInfo: row['Additional info'] || null,
      numberRequired: row['Number required'] || null,
      nlaDate: row['Date of NLA'] || null,
      categories: row['Categories'] || null,
      searchPartType: row['Search part type'] || null,
      hotspot: row['Hotspot'] || null,
      cmsPageUrl: row['cms-page-url'] || null,
      // Stock info
      inStock: stockInfo.inStock,
      availableNow: stockInfo.availableNow,
      available1to3Days: stockInfo.available1to3Days,
      // Images
      image: images.baseImage,
      images: [images.baseImage, images.image2, images.image3, images.image4].filter(Boolean),
      // Weight
      weight: weight,
      // Will be populated later
      supersessions: [],
      fitment: [],
    };
  });

  console.log(`   Matched pricing for ${priceMatches} products`);
  console.log(`   Matched stock for ${stockMatches} products`);
  console.log(`   Matched images for ${imageMatches} products`);
  console.log(`   Matched weights for ${weightMatches} products`);

  writeJson('products.json', products);
  
  // Create index for faster searching
  const index = products.map(p => ({
    id: p.id,
    sku: p.sku,
    parentSku: p.parentSku,
    description: (p.description || '').substring(0, 100),
    stockType: p.stockType,
    price: p.price,
    nlaDate: p.nlaDate,
    categories: p.categories,
    inStock: p.inStock,
    hasImage: !!p.image,
  }));
  writeJson('products-index.json', index);
  
  return products;
}

// ============================================
// Convert T2 - Chassis Master (Vehicles)
// ============================================
function convertChassis() {
  const raw = readExcel('Master Data - T2 Chassis Master.xlsx');
  if (!raw) return;

  const chassis = raw.map((row, index) => ({
    id: index + 1,
    make: row['Make'] || '',
    model: row['Model'] || '',
    chassis: row['Chassis'] || '',
    yearStart: row['Year start'] || null,
    yearEnd: row['Year end'] || null,
    key: row['make_model_chassis_key'] || '',
  }));

  writeJson('chassis.json', chassis);

  // Create unique make/model combinations
  const vehicleMap = new Map();
  chassis.forEach(c => {
    const key = `${c.make}|${c.model}`;
    if (!vehicleMap.has(key)) {
      vehicleMap.set(key, {
        make: c.make,
        model: c.model,
        yearStart: c.yearStart,
        yearEnd: c.yearEnd,
      });
    } else {
      const existing = vehicleMap.get(key);
      if (c.yearStart && (!existing.yearStart || c.yearStart < existing.yearStart)) {
        existing.yearStart = c.yearStart;
      }
      if (c.yearEnd && (!existing.yearEnd || c.yearEnd > existing.yearEnd)) {
        existing.yearEnd = c.yearEnd;
      }
    }
  });

  const vehicles = Array.from(vehicleMap.values());
  writeJson('vehicles.json', vehicles);
}

// ============================================
// Convert T3 - SKU Chassis Application (Fitment)
// Now includes chassis detail!
// ============================================
function convertApplications(products) {
  const raw = readExcel('Master Data - T3 Sku chassis application.xlsx');
  if (!raw) return;

  const applications = raw.map((row, index) => ({
    id: index + 1,
    parentSku: row['Parent SKU'] || '',
    make: row['Make'] || '',
    model: row['Model'] || '',
    chassisStart: row['Chassis start'] || null,
    chassisEnd: row['Chassis end'] || null,
    additionalInfo: row['Additional info'] || null,
  }));

  writeJson('applications.json', applications);

  // Create lookup by parent SKU
  const fitmentMap = {};
  applications.forEach(app => {
    if (!app.parentSku) return;
    if (!fitmentMap[app.parentSku]) {
      fitmentMap[app.parentSku] = [];
    }
    fitmentMap[app.parentSku].push({
      make: app.make,
      model: app.model,
      chassisStart: app.chassisStart,
      chassisEnd: app.chassisEnd,
      additionalInfo: app.additionalInfo,
    });
  });

  writeJson('fitment-lookup.json', fitmentMap);
  console.log(`   Created fitment lookup for ${Object.keys(fitmentMap).length} parent SKUs`);

  // Add fitment to products
  if (products) {
    let updated = 0;
    products.forEach(p => {
      if (fitmentMap[p.parentSku]) {
        p.fitment = fitmentMap[p.parentSku];
        updated++;
      }
    });
    console.log(`   Added fitment data to ${updated} products`);
  }

  return fitmentMap;
}

// ============================================
// Convert T4 - Supercessions
// ============================================
function convertSupercessions(products) {
  const raw = readExcel('Master Data - T4 Supercessions.xlsx');
  if (!raw) return;

  const supercessions = raw.map((row, index) => ({
    id: index + 1,
    currentSku: row['Parent SKU'] || '',
    oldSku: row['Supercession parent SKU'] || '',
  }));

  writeJson('supercessions.json', supercessions);

  // Reverse lookup: old SKU -> current SKU(s)
  const supersessionLookup = {};
  supercessions.forEach(s => {
    if (s.oldSku && s.currentSku) {
      const oldSkuUpper = s.oldSku.toString().toUpperCase().trim();
      const currentSkuUpper = s.currentSku.toString().toUpperCase().trim();
      
      if (!supersessionLookup[oldSkuUpper]) {
        supersessionLookup[oldSkuUpper] = [];
      }
      if (!supersessionLookup[oldSkuUpper].includes(currentSkuUpper)) {
        supersessionLookup[oldSkuUpper].push(currentSkuUpper);
      }
    }
  });
  
  writeJson('supersession-lookup.json', supersessionLookup);
  console.log(`   Created lookup for ${Object.keys(supersessionLookup).length} old part numbers`);

  // Forward lookup: current SKU -> old SKUs
  const forwardLookup = {};
  supercessions.forEach(s => {
    if (s.oldSku && s.currentSku) {
      const oldSkuUpper = s.oldSku.toString().toUpperCase().trim();
      const currentSkuUpper = s.currentSku.toString().toUpperCase().trim();
      
      if (!forwardLookup[currentSkuUpper]) {
        forwardLookup[currentSkuUpper] = [];
      }
      if (!forwardLookup[currentSkuUpper].includes(oldSkuUpper)) {
        forwardLookup[currentSkuUpper].push(oldSkuUpper);
      }
    }
  });
  
  writeJson('supersession-forward.json', forwardLookup);
  console.log(`   Created forward lookup for ${Object.keys(forwardLookup).length} current part numbers`);

  // Add to products
  if (products) {
    let updated = 0;
    products.forEach(p => {
      const parentSkuUpper = (p.parentSku || '').toUpperCase().trim();
      if (forwardLookup[parentSkuUpper]) {
        p.supersessions = forwardLookup[parentSkuUpper];
        updated++;
      }
    });
    console.log(`   Added supersession data to ${updated} products`);
  }

  return { supersessionLookup, forwardLookup };
}

// ============================================
// Save final products
// ============================================
function saveProducts(products) {
  writeJson('products.json', products);
  
  const index = products.map(p => ({
    id: p.id,
    sku: p.sku,
    parentSku: p.parentSku,
    description: (p.description || '').substring(0, 100),
    stockType: p.stockType,
    price: p.price,
    nlaDate: p.nlaDate,
    categories: p.categories,
    inStock: p.inStock,
    hasImage: !!p.image,
    hasSupersessions: (p.supersessions && p.supersessions.length > 0),
    hasFitment: (p.fitment && p.fitment.length > 0),
  }));
  writeJson('products-index.json', index);
}

// ============================================
// Create image list for upload
// ============================================
function createImageUploadList(products, imageMap) {
  // Get all unique image filenames that are actually used
  const neededImages = new Set();
  
  products.forEach(p => {
    if (p.images && p.images.length > 0) {
      p.images.forEach(img => {
        if (img) neededImages.add(img);
      });
    }
  });

  const imageList = Array.from(neededImages).sort();
  writeJson('images-needed.json', imageList);
  console.log(`\n📸 Images needed: ${imageList.length} unique images`);
  
  return imageList;
}

// ============================================
// Run all conversions
// ============================================
console.log('\n🚀 IntroCar Data Converter (Full)\n');
console.log('='.repeat(50));

// Load supplementary data first
console.log('\n📊 Loading supplementary data...\n');
const pricingMap = loadPricingMap();
const stockMap = loadStockMap();
const imageMap = loadImageMap();
const weightMap = loadWeightMap();

console.log('\n' + '='.repeat(50));
console.log('\n📦 Converting main data files...\n');

const products = convertProducts(pricingMap, stockMap, imageMap, weightMap);
console.log('');
convertChassis();
console.log('');
convertApplications(products);
console.log('');
convertSupercessions(products);
console.log('');

// Save final products with all enriched data
if (products) {
  console.log('📦 Saving enriched products...');
  saveProducts(products);
  
  // Create list of images to upload
  createImageUploadList(products, imageMap);
}

console.log('\n' + '='.repeat(50));
console.log('✨ Conversion complete!');
console.log(`📁 JSON files saved to: ${outputDir}`);
console.log('\nNext steps:');
console.log('1. Check images-needed.json for list of images to upload');
console.log('2. Restart your dev server with `npm run dev`');
console.log('');
