/**
 * Apply Cloudinary Image URLs to Products
 * 
 * This script updates products.json with Cloudinary URLs from image-urls.json
 * 
 * Run: node scripts/apply-image-urls.js
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data', 'json');

console.log('\n🖼️  Applying Image URLs to Products\n');
console.log('='.repeat(50));

// Load URL mapping
const urlMapPath = path.join(dataDir, 'image-urls.json');
if (!fs.existsSync(urlMapPath)) {
  console.error('❌ image-urls.json not found. Run upload-images.js first.');
  process.exit(1);
}

const urlMap = JSON.parse(fs.readFileSync(urlMapPath, 'utf-8'));
console.log(`📋 Loaded ${Object.keys(urlMap).length} image URLs`);

// Load products
const productsPath = path.join(dataDir, 'products.json');
if (!fs.existsSync(productsPath)) {
  console.error('❌ products.json not found. Run convert-excel.js first.');
  process.exit(1);
}

const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
console.log(`📦 Loaded ${products.length} products`);

// Apply URLs
let updated = 0;
let withMultiple = 0;

products.forEach(product => {
  // Check if product has image filenames
  if (product.image && urlMap[product.image]) {
    product.imageUrl = urlMap[product.image];
    updated++;
  }
  
  // Handle multiple images
  if (product.images && product.images.length > 0) {
    product.imageUrls = product.images
      .map(img => urlMap[img])
      .filter(Boolean);
    
    if (product.imageUrls.length > 1) {
      withMultiple++;
    }
    
    // Set main image URL from first image
    if (product.imageUrls.length > 0 && !product.imageUrl) {
      product.imageUrl = product.imageUrls[0];
      updated++;
    }
  }
});

console.log(`\n✅ Updated ${updated} products with image URLs`);
console.log(`📸 ${withMultiple} products have multiple images`);

// Save updated products
fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
console.log(`\n💾 Saved updated products.json`);

// Also update the index
const indexPath = path.join(dataDir, 'products-index.json');
if (fs.existsSync(indexPath)) {
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  
  // Create a lookup for quick matching
  const productUrlMap = {};
  products.forEach(p => {
    productUrlMap[p.sku] = p.imageUrl;
  });
  
  index.forEach(item => {
    if (productUrlMap[item.sku]) {
      item.imageUrl = productUrlMap[item.sku];
      item.hasImage = true;
    }
  });
  
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
  console.log(`💾 Saved updated products-index.json`);
}

console.log('\n' + '='.repeat(50));
console.log('✨ Done! Restart your dev server to see images.');
console.log('');
