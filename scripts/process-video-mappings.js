/**
 * Process Video Mappings from Excel file
 * Cross-references with video index and product database
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data', 'json');

// Load mapping file
const workbook = XLSX.readFile('/sessions/happy-quirky-cray/mnt/uploads/Mapping Videos.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const mappings = XLSX.utils.sheet_to_json(sheet);

// Load existing video index
const videoIndex = JSON.parse(fs.readFileSync(path.join(dataDir, 'videos.json'), 'utf-8'));

// Load products
const products = JSON.parse(fs.readFileSync(path.join(dataDir, 'products.json'), 'utf-8'));

// Build parent SKU lookup from products
const parentSkus = new Set();
products.forEach(p => {
  if (p.parentSku) parentSkus.add(p.parentSku.toUpperCase());
});

console.log('='.repeat(60));
console.log('MAPPING FILE ANALYSIS');
console.log('='.repeat(60));
console.log('');
console.log('Mappings in file:', mappings.length);
console.log('Videos in existing index:', Object.keys(videoIndex).length);
console.log('Parent SKUs in products:', parentSkus.size);
console.log('');

// Analyze mappings
const results = {
  alreadyInIndex: [],
  newValidMappings: [],
  noMatchInProducts: [],
  noLink: [],
};

mappings.forEach(row => {
  const parentSku = (row.Parent_sku || '').toString().trim().toUpperCase();
  const sku = (row.SKU || '').toString().trim().toUpperCase();
  const link = (row.Link || '').toString().trim();

  if (!parentSku || parentSku === '') {
    results.noLink.push({ parentSku: row.Parent_sku, sku: row.SKU, reason: 'No parent SKU' });
    return;
  }

  if (!link || link === '') {
    results.noLink.push({ parentSku, sku, reason: 'No link' });
    return;
  }

  // Check if already in video index
  if (videoIndex[parentSku]) {
    results.alreadyInIndex.push({ parentSku, sku, link });
    return;
  }

  // Check if parent SKU exists in products
  if (parentSkus.has(parentSku)) {
    results.newValidMappings.push({ parentSku, sku, link });
  } else {
    results.noMatchInProducts.push({ parentSku, sku, link });
  }
});

console.log('RESULTS:');
console.log('-'.repeat(40));
console.log('Already in video index:', results.alreadyInIndex.length);
console.log('New valid mappings (can add):', results.newValidMappings.length);
console.log('No match in products:', results.noMatchInProducts.length);
console.log('Missing data (no link/SKU):', results.noLink.length);

// Save full analysis
fs.writeFileSync(path.join(dataDir, 'mapping-analysis.json'), JSON.stringify(results, null, 2));
console.log('');
console.log('Full analysis saved to: data/json/mapping-analysis.json');

// Show items that need investigation
if (results.noMatchInProducts.length > 0) {
  console.log('');
  console.log('NO MATCH IN PRODUCTS (need investigation):');
  console.log('-'.repeat(40));
  results.noMatchInProducts.forEach(item => {
    console.log(`  ${item.parentSku}`);
  });
}

if (results.noLink.length > 0) {
  console.log('');
  console.log('MISSING DATA:');
  console.log('-'.repeat(40));
  results.noLink.forEach(item => {
    console.log(`  ${item.parentSku || '(empty)'} - ${item.reason}`);
  });
}
