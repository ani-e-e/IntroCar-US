/**
 * Generate Video Error Report CSV
 * Lists all videos that need investigation
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data', 'json');
const analysis = JSON.parse(fs.readFileSync(path.join(dataDir, 'mapping-analysis.json'), 'utf-8'));

// Load products for extra checking
const products = JSON.parse(fs.readFileSync(path.join(dataDir, 'products.json'), 'utf-8'));
const parentSkus = new Set();
const allSkus = new Set();
products.forEach(p => {
  if (p.parentSku) parentSkus.add(p.parentSku.toUpperCase());
  if (p.sku) allSkus.add(p.sku.toUpperCase());
});

// Load video index
const videoIndex = JSON.parse(fs.readFileSync(path.join(dataDir, 'videos.json'), 'utf-8'));

// Track what's been mapped
const mappedSkus = new Set([
  ...analysis.alreadyInIndex.map(i => i.parentSku),
  ...analysis.newValidMappings.map(i => i.parentSku),
  ...analysis.noMatchInProducts.map(i => i.parentSku),
]);

// Create CSV content
let csv = 'Category,Parent_SKU,SKU,Folder,Link,Issue,Suggestion\n';

// 1. No match in products from mapping file
analysis.noMatchInProducts.forEach(item => {
  const baseSku = item.parentSku.replace(/-X$/, '').replace(/\.\d+.*$/, '').replace(/-\d+$/, '');
  const hasSimilar = parentSkus.has(baseSku) || allSkus.has(baseSku);
  const suggestion = hasSimilar ? 'Try base SKU: ' + baseSku : 'SKU not found in database';

  csv += `FROM_MAPPING_FILE,${item.parentSku},${item.sku},,${item.link},Parent SKU not in product database,${suggestion}\n`;
});

// 2. Check videos that aren't matched and aren't in mapping file
Object.keys(videoIndex).forEach(videoSku => {
  const upper = videoSku.toUpperCase();
  const isMatched = parentSkus.has(upper);
  const isInMapping = mappedSkus.has(upper);

  if (isMatched || isInMapping) {
    return; // Skip - this one is fine
  }

  const folder = videoIndex[videoSku].folder;

  // Categorize the issue
  if (upper.includes('&')) {
    csv += `KIT_COMBINATION,${videoSku},,${folder},,Shows multiple parts together,Rename folder to primary SKU or split into separate entries\n`;
  } else if (upper.includes('KIT') && upper.match(/-\d+KIT$/)) {
    csv += `KIT_COMBINATION,${videoSku},,${folder},,Kit product,Verify kit SKU exists or rename\n`;
  } else if (upper === 'SEARCH PART NUMBER' || upper === 'TO EDIT') {
    csv += `PLACEHOLDER,${videoSku},,${folder},,Placeholder folder,Remove or rename to valid SKU\n`;
  } else if (upper.match(/[\.-]\d+$/)) {
    // Version suffix
    const baseSku = upper.replace(/[\.-]\d+$/, '');
    const baseMatches = parentSkus.has(baseSku);
    if (baseMatches) {
      csv += `VERSION_SUFFIX,${videoSku},,${folder},,Has version suffix but base matches,Will auto-match - no action needed\n`;
    } else {
      csv += `VERSION_SUFFIX,${videoSku},,${folder},,Has version suffix and base doesn't match,Verify correct SKU: ${baseSku}\n`;
    }
  } else {
    csv += `UNMATCHED,${videoSku},,${folder},,No matching product in database,Verify SKU spelling or add product\n`;
  }
});

// Save CSV
const outputPath = path.join(__dirname, '..', 'video-errors-report.csv');
fs.writeFileSync(outputPath, csv);

console.log('='.repeat(60));
console.log('VIDEO ERROR REPORT GENERATED');
console.log('='.repeat(60));
console.log('');
console.log('Saved to:', outputPath);
console.log('');

// Count by category
const lines = csv.split('\n').slice(1).filter(l => l.trim());
const categories = {};
lines.forEach(line => {
  const cat = line.split(',')[0];
  categories[cat] = (categories[cat] || 0) + 1;
});

console.log('Summary:');
Object.entries(categories).forEach(([cat, count]) => {
  console.log(`  ${cat}: ${count}`);
});
