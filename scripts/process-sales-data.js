/**
 * Process 12-month Sales Data for Popularity Ranking
 * 
 * Creates popularity.json with:
 * - Sales rankings by SKU (quantity sold)
 * - Revenue rankings
 * - Category-based popularity lists
 * 
 * Run: node scripts/process-sales-data.js
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const JSON_DIR = path.join(DATA_DIR, 'json');

// Ensure JSON directory exists
if (!fs.existsSync(JSON_DIR)) {
  fs.mkdirSync(JSON_DIR, { recursive: true });
}

console.log('\n🔥 Processing Sales Data for Popularity Rankings\n');
console.log('='.repeat(50) + '\n');

// Read sales CSV
const salesPath = path.join(DATA_DIR, '12_months_sales.csv');
if (!fs.existsSync(salesPath)) {
  console.error('❌ Sales file not found at:', salesPath);
  console.log('   Please copy 12_months_sales.csv to your data folder');
  process.exit(1);
}

const salesContent = fs.readFileSync(salesPath, 'latin1');
const salesLines = salesContent.split('\n').filter(line => line.trim());

console.log(`📖 Reading sales data: ${salesLines.length - 1} records\n`);

// Parse sales data
const salesData = [];
const skuSales = {};        // SKU -> { qty, revenue, rank }
const parentSkuSales = {};  // Parent SKU -> aggregated sales

for (let i = 1; i < salesLines.length; i++) {
  const line = salesLines[i];
  
  // Parse CSV (handle quoted fields with commas)
  const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
  if (!matches || matches.length < 3) continue;
  
  const stockCode = matches[0].replace(/"/g, '').trim();
  const description = matches[1].replace(/"/g, '').trim();
  const qtySold = parseInt(matches[2].replace(/"/g, '').trim()) || 0;
  
  // Parse revenue (remove £ symbol and commas)
  let revenue = 0;
  if (matches[3]) {
    const revenueStr = matches[3].replace(/"/g, '').replace(/[£,\xa3]/g, '').trim();
    revenue = parseFloat(revenueStr) || 0;
  }
  
  if (stockCode && qtySold > 0) {
    salesData.push({
      sku: stockCode,
      description,
      qtySold,
      revenue
    });
    
    skuSales[stockCode] = {
      qty: qtySold,
      revenue: revenue
    };
    
    // Extract parent SKU (remove suffix like -X, -A, etc.)
    const parentSku = stockCode.replace(/-[A-Z0-9]+$/, '');
    if (!parentSkuSales[parentSku]) {
      parentSkuSales[parentSku] = { qty: 0, revenue: 0, variants: [] };
    }
    parentSkuSales[parentSku].qty += qtySold;
    parentSkuSales[parentSku].revenue += revenue;
    parentSkuSales[parentSku].variants.push(stockCode);
  }
}

// Sort by quantity sold (descending)
salesData.sort((a, b) => b.qtySold - a.qtySold);

// Assign ranks
salesData.forEach((item, index) => {
  skuSales[item.sku].rank = index + 1;
});

// Create parent SKU rankings
const parentRankings = Object.entries(parentSkuSales)
  .sort((a, b) => b[1].qty - a[1].qty)
  .map(([sku, data], index) => ({
    parentSku: sku,
    rank: index + 1,
    totalQty: data.qty,
    totalRevenue: data.revenue,
    variantCount: data.variants.length
  }));

// Create lookup by parent SKU
const parentSkuRankLookup = {};
parentRankings.forEach(item => {
  parentSkuRankLookup[item.parentSku] = item.rank;
});

// Load products to create category-based popularity
let products = [];
const productsPath = path.join(JSON_DIR, 'products.json');
if (fs.existsSync(productsPath)) {
  products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
  console.log(`📦 Loaded ${products.length} products for category mapping\n`);
}

// Create category -> popular SKUs mapping
const categoryPopularity = {};

products.forEach(product => {
  const parentSku = product.parentSku || product.sku.replace(/-[A-Z0-9]+$/, '');
  const rank = parentSkuRankLookup[parentSku];
  
  if (rank && product.mainCategory) {
    if (!categoryPopularity[product.mainCategory]) {
      categoryPopularity[product.mainCategory] = [];
    }
    
    // Only add if not already present (avoid duplicates from variants)
    const existing = categoryPopularity[product.mainCategory].find(p => p.sku === product.sku);
    if (!existing) {
      categoryPopularity[product.mainCategory].push({
        sku: product.sku,
        parentSku: parentSku,
        rank: rank,
        description: product.description,
        stockType: product.stockType
      });
    }
  }
});

// Sort each category by rank and limit to top 100
Object.keys(categoryPopularity).forEach(category => {
  categoryPopularity[category].sort((a, b) => a.rank - b.rank);
  categoryPopularity[category] = categoryPopularity[category].slice(0, 100);
});

// Create model -> popular SKUs mapping (using fitment data)
const modelPopularity = {};

products.forEach(product => {
  const parentSku = product.parentSku || product.sku.replace(/-[A-Z0-9]+$/, '');
  const rank = parentSkuRankLookup[parentSku];
  
  if (rank && product.fitment && product.fitment.length > 0) {
    product.fitment.forEach(fit => {
      const modelKey = fit.model || fit.modelKey;
      if (modelKey) {
        if (!modelPopularity[modelKey]) {
          modelPopularity[modelKey] = [];
        }
        
        // Only add if not already present
        const existing = modelPopularity[modelKey].find(p => p.sku === product.sku);
        if (!existing) {
          modelPopularity[modelKey].push({
            sku: product.sku,
            parentSku: parentSku,
            rank: rank,
            description: product.description,
            mainCategory: product.mainCategory,
            stockType: product.stockType
          });
        }
      }
    });
  }
});

// Sort each model list by rank and limit to top 50
Object.keys(modelPopularity).forEach(model => {
  modelPopularity[model].sort((a, b) => a.rank - b.rank);
  modelPopularity[model] = modelPopularity[model].slice(0, 50);
});

// Create the final popularity data structure
const popularityData = {
  generated: new Date().toISOString(),
  totalSalesRecords: salesData.length,
  
  // Quick lookup: SKU -> rank
  skuRanks: Object.fromEntries(
    salesData.map(item => [item.sku, { rank: skuSales[item.sku].rank, qty: item.qtySold }])
  ),
  
  // Quick lookup: Parent SKU -> rank
  parentSkuRanks: parentSkuRankLookup,
  
  // Top 500 overall (for homepage, general recommendations)
  topProducts: salesData.slice(0, 500).map(item => ({
    sku: item.sku,
    description: item.description,
    qtySold: item.qtySold,
    rank: skuSales[item.sku].rank
  })),
  
  // Popular by category
  byCategory: categoryPopularity,
  
  // Popular by model
  byModel: modelPopularity
};

// Save popularity data
const outputPath = path.join(JSON_DIR, 'popularity.json');
fs.writeFileSync(outputPath, JSON.stringify(popularityData, null, 2));

console.log('📊 Sales Data Summary:');
console.log(`   Total SKUs with sales: ${salesData.length}`);
console.log(`   Unique parent SKUs: ${Object.keys(parentSkuSales).length}`);
console.log(`   Categories mapped: ${Object.keys(categoryPopularity).length}`);
console.log(`   Models mapped: ${Object.keys(modelPopularity).length}`);
console.log('');
console.log('🏆 Top 10 Best Sellers:');
salesData.slice(0, 10).forEach((item, i) => {
  console.log(`   ${i + 1}. ${item.sku} - ${item.qtySold} sold`);
});

console.log('\n' + '='.repeat(50));
console.log(`\n✅ Saved popularity.json (${salesData.length} SKUs ranked)`);
console.log(`📁 Location: ${outputPath}\n`);
