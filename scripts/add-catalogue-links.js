/**
 * Add Catalogue Links to Products (Fixed Version)
 * 
 * The T1 Sku Master has catalogue entries where:
 * - SKU column = Catalogue name (e.g., "Windscreen, Silver Seraph")
 * - Hotspot column = Pipe-separated parent SKUs in that catalogue
 * - cms-page-url = Link to the catalogue page
 * 
 * This script maps parent SKUs to their catalogue pages.
 * 
 * Run: node scripts/add-catalogue-links.js
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const JSON_DIR = path.join(DATA_DIR, 'json');

console.log('\n📚 Adding Catalogue Links to Products\n');
console.log('='.repeat(50) + '\n');

// Load T1 Sku Master
const skuMasterPath = path.join(DATA_DIR, 'Master Data - T1 Sku Master - All Skus.xlsx');
if (!fs.existsSync(skuMasterPath)) {
  console.error('❌ T1 Sku Master not found at:', skuMasterPath);
  process.exit(1);
}

console.log('📖 Reading T1 Sku Master...');
const workbook = XLSX.readFile(skuMasterPath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet);
console.log(`   Found ${rows.length} total rows\n`);

// Build lookup: Parent SKU -> Catalogue info
const parentSkuToCatalogue = {};
let catalogueCount = 0;
let totalHotspots = 0;

rows.forEach(row => {
  const hotspots = row['Hotspot'];
  const cmsPageUrl = row['cms-page-url'];
  const catalogueName = row['SKU']; // The SKU column contains the catalogue name for these rows
  
  // Only process rows that have hotspots AND a cms-page-url
  if (hotspots && cmsPageUrl && String(hotspots).trim() && String(cmsPageUrl).trim()) {
    catalogueCount++;
    
    // Parse the pipe-separated parent SKUs
    const parentSkus = String(hotspots).split('|').map(s => s.trim()).filter(Boolean);
    totalHotspots += parentSkus.length;
    
    // Build the full URL
    let fullUrl;
    const urlSlug = String(cmsPageUrl).trim();
    if (urlSlug.startsWith('cms-page-')) {
      fullUrl = `https://www.introcar.co.uk/${urlSlug.replace('cms-page-', 'catalogue/')}`;
    } else if (urlSlug.startsWith('cms-')) {
      fullUrl = `https://www.introcar.co.uk/${urlSlug.replace('cms-', '')}`;
    } else {
      fullUrl = `https://www.introcar.co.uk/${urlSlug}`;
    }
    
    // Map each parent SKU to this catalogue
    parentSkus.forEach(parentSku => {
      // If a parent SKU is in multiple catalogues, keep the first one (or could keep all)
      if (!parentSkuToCatalogue[parentSku]) {
        parentSkuToCatalogue[parentSku] = {
          catalogueName: catalogueName,
          slug: urlSlug,
          url: fullUrl
        };
      }
    });
  }
});

console.log(`   Found ${catalogueCount} catalogue pages`);
console.log(`   Total hotspot references: ${totalHotspots}`);
console.log(`   Unique parent SKUs mapped: ${Object.keys(parentSkuToCatalogue).length}\n`);

// Load existing products
const productsPath = path.join(JSON_DIR, 'products.json');
if (!fs.existsSync(productsPath)) {
  console.error('❌ products.json not found. Run the main conversion script first.');
  process.exit(1);
}

console.log('📦 Loading products.json...');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
console.log(`   Loaded ${products.length} products\n`);

// Add catalogue links to products based on their parent SKU
let matched = 0;
products.forEach(product => {
  // Get the parent SKU (remove suffix like -X, -A, etc.)
  const parentSku = product.parentSku || product.sku.replace(/-[A-Z0-9]+$/, '');
  
  const catalogueInfo = parentSkuToCatalogue[parentSku];
  if (catalogueInfo) {
    product.catalogueLink = catalogueInfo.url;
    product.catalogueSlug = catalogueInfo.slug;
    product.catalogueName = catalogueInfo.catalogueName;
    matched++;
  }
});

console.log(`✅ Matched catalogue links for ${matched} products\n`);

// Save updated products
fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
console.log('💾 Saved updated products.json');

// Also update products-index.json if it exists
const indexPath = path.join(JSON_DIR, 'products-index.json');
if (fs.existsSync(indexPath)) {
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  index.forEach(product => {
    const parentSku = product.parentSku || product.sku.replace(/-[A-Z0-9]+$/, '');
    const catalogueInfo = parentSkuToCatalogue[parentSku];
    if (catalogueInfo) {
      product.catalogueLink = catalogueInfo.url;
      product.catalogueSlug = catalogueInfo.slug;
      product.catalogueName = catalogueInfo.catalogueName;
    }
  });
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
  console.log('💾 Saved updated products-index.json');
}

// Show some examples
console.log('\n📋 Sample matches:');
const samples = products.filter(p => p.catalogueLink).slice(0, 5);
samples.forEach(p => {
  console.log(`   ${p.sku} → ${p.catalogueName}`);
});

console.log('\n' + '='.repeat(50));
console.log('\n✨ Done! Catalogue links added to products.\n');
console.log('Next: Restart your dev server to see the changes.\n');
