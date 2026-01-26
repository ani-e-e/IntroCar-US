/**
 * IntroCar US - Export Script: Supabase → JSON
 *
 * Exports data from Supabase back to JSON files for the live site.
 * Run this after making changes in Supabase to update the site.
 *
 * Usage:
 *   node scripts/export-from-supabase.js [table]
 *
 * Examples:
 *   node scripts/export-from-supabase.js          # Export all tables
 *   node scripts/export-from-supabase.js products # Export only products
 *   node scripts/export-from-supabase.js stock    # Export only stock levels (quick update)
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const JSON_DIR = path.join(__dirname, '..', 'data', 'json');

// Helper: Write JSON file with formatting
function writeJson(filename, data) {
  const filepath = path.join(JSON_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  const size = (fs.statSync(filepath).size / 1024 / 1024).toFixed(2);
  console.log(`  ✓ ${filename} (${size} MB)`);
}

// Helper: Fetch all records with pagination (Supabase limits to 1000 per request)
async function fetchAll(tableName, select = '*', orderBy = null) {
  const pageSize = 1000;
  let allRecords = [];
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    let query = supabase
      .from(tableName)
      .select(select)
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (orderBy) {
      query = query.order(orderBy);
    }

    const { data, error } = await query;

    if (error) {
      console.error(`❌ Error fetching ${tableName}: ${error.message}`);
      return allRecords;
    }

    allRecords = allRecords.concat(data);
    hasMore = data.length === pageSize;
    page++;

    if (page % 10 === 0) {
      process.stdout.write(`\r  Fetching ${tableName}: ${allRecords.length} records...`);
    }
  }

  return allRecords;
}

// ============================================
// EXPORT FUNCTIONS
// ============================================

async function exportProducts() {
  console.log('\n📦 Exporting products...');

  const products = await fetchAll('products', '*', 'id');

  // Transform back to original JSON format
  const jsonProducts = products.map(p => ({
    id: p.id,
    sku: p.sku,
    description: p.description,
    price: parseFloat(p.price),
    stockType: p.stock_type,
    parentSku: p.parent_sku,
    additionalInfo: p.additional_info,
    numberRequired: p.number_required,
    nlaDate: p.nla_date,
    categories: p.categories,
    searchPartType: p.search_part_type,
    hotspot: p.hotspot,
    cmsPageUrl: p.cms_page_url,
    inStock: p.in_stock,
    availableNow: p.available_now,
    available1to3Days: p.available_1_to_3_days,
    image: p.image,
    images: p.images || [],
    weight: parseFloat(p.weight),
    supersessions: [],  // We'll add these separately if needed
    fitment: [],        // Fitment is in separate table
    imageUrl: p.image_url
  }));

  writeJson('products.json', jsonProducts);

  // Also create products-index.json (lightweight version for search)
  const index = jsonProducts.map(p => ({
    id: p.id,
    sku: p.sku,
    parentSku: p.parentSku,
    description: p.description,
    price: p.price,
    stockType: p.stockType,
    categories: p.categories,
    inStock: p.inStock
  }));
  writeJson('products-index.json', index);

  return products.length;
}

async function exportFitment() {
  console.log('\n📦 Exporting fitment lookup...');

  const fitments = await fetchAll('product_fitment');

  // Group by parent_sku
  const lookup = {};
  fitments.forEach(f => {
    if (!lookup[f.parent_sku]) {
      lookup[f.parent_sku] = [];
    }
    lookup[f.parent_sku].push({
      make: f.make,
      model: f.model,
      chassisStart: f.chassis_start,
      chassisEnd: f.chassis_end,
      additionalInfo: f.additional_info
    });
  });

  writeJson('fitment-lookup.json', lookup);
  return fitments.length;
}

async function exportSupersessions() {
  console.log('\n📦 Exporting supersessions...');

  const supersessions = await fetchAll('supersessions');

  // Group by source_sku
  const lookup = {};
  supersessions.forEach(s => {
    if (!lookup[s.source_sku]) {
      lookup[s.source_sku] = [];
    }
    lookup[s.source_sku].push(s.target_sku);
  });

  // Flatten single-item arrays to strings (original format)
  Object.keys(lookup).forEach(key => {
    if (lookup[key].length === 1) {
      lookup[key] = lookup[key][0];
    }
  });

  writeJson('supersession-lookup.json', lookup);
  return supersessions.length;
}

async function exportCatalogues() {
  console.log('\n📦 Exporting catalogues...');

  const catalogues = await fetchAll('catalogues');

  // Transform to original format
  const jsonCatalogues = catalogues.map(c => ({
    id: c.id,
    title: c.title,
    category: c.category,
    subcategory: c.subcategory,
    image: c.image,
    imageUrl: c.image_url,
    cmsUrl: c.cms_url,
    catalogueLink: c.catalogue_link,
    makes: c.makes || [],
    models: c.models || [],
    hotspots: c.hotspots || []
  }));

  writeJson('lookbooks.json', jsonCatalogues);
  return catalogues.length;
}

async function exportHotspotIndex() {
  console.log('\n📦 Exporting hotspot index...');

  const hotspots = await fetchAll('hotspot_index');

  // Group by parent_sku
  const lookup = {};
  hotspots.forEach(h => {
    if (!lookup[h.parent_sku]) {
      lookup[h.parent_sku] = [];
    }
    lookup[h.parent_sku].push(h.catalogue_id);
  });

  writeJson('hotspot-index.json', lookup);
  return hotspots.length;
}

async function exportVehicles() {
  console.log('\n📦 Exporting vehicles...');

  const vehicles = await fetchAll('vehicles');

  const jsonVehicles = vehicles.map(v => ({
    make: v.make,
    model: v.model,
    yearStart: v.year_start,
    yearEnd: v.year_end
  }));

  writeJson('vehicles.json', jsonVehicles);
  return vehicles.length;
}

async function exportChassisYears() {
  console.log('\n📦 Exporting chassis years...');

  const chassisYears = await fetchAll('chassis_years');

  // Rebuild nested structure
  const lookup = {};
  chassisYears.forEach(c => {
    if (!lookup[c.make]) {
      lookup[c.make] = {};
    }
    if (!lookup[c.make][c.model]) {
      lookup[c.make][c.model] = {
        yearStart: null,
        yearEnd: null,
        years: {}
      };
    }

    const model = lookup[c.make][c.model];
    model.years[c.year] = {
      chassisPrefix: c.chassis_prefix,
      chassisStart: c.chassis_start,
      chassisEnd: c.chassis_end,
      chassisNumericStart: c.chassis_numeric_start,
      chassisNumericEnd: c.chassis_numeric_end,
      chassisCount: c.chassis_count
    };

    // Update year range
    if (!model.yearStart || c.year < model.yearStart) model.yearStart = c.year;
    if (!model.yearEnd || c.year > model.yearEnd) model.yearEnd = c.year;
  });

  writeJson('chassis-years.json', lookup);
  return chassisYears.length;
}

async function exportTechnicalVideos() {
  console.log('\n📦 Exporting technical videos...');

  const videos = await fetchAll('technical_videos');
  const categories = await fetchAll('video_categories', '*', 'display_order');

  const data = {
    categories: categories.map(c => c.name),
    videos: videos.map(v => ({
      id: v.id,
      title: v.title,
      description: v.description,
      youtubeId: v.youtube_id,
      category: v.category,
      verified: v.verified,
      createdAt: v.created_at,
      updatedAt: v.updated_at
    }))
  };

  writeJson('technical-videos.json', data);
  return videos.length;
}

async function exportPopularity() {
  console.log('\n📦 Exporting popularity...');

  const popularity = await fetchAll('product_popularity');

  // Convert to simple object
  const lookup = {};
  popularity.forEach(p => {
    lookup[p.sku] = p.score;
  });

  writeJson('popularity.json', lookup);
  return popularity.length;
}

// Quick stock-only update (for daily updates)
async function exportStockOnly() {
  console.log('\n📦 Exporting stock levels only (quick update)...');

  // Fetch only stock-related fields
  const { data: products, error } = await supabase
    .from('products')
    .select('sku, in_stock, available_now, available_1_to_3_days');

  if (error) {
    console.error('❌ Error:', error.message);
    return 0;
  }

  // Read existing products.json
  const existingPath = path.join(JSON_DIR, 'products.json');
  const existing = JSON.parse(fs.readFileSync(existingPath, 'utf-8'));

  // Create lookup of new stock levels
  const stockLookup = {};
  products.forEach(p => {
    stockLookup[p.sku] = {
      inStock: p.in_stock,
      availableNow: p.available_now,
      available1to3Days: p.available_1_to_3_days
    };
  });

  // Update existing products
  const updated = existing.map(p => {
    const stock = stockLookup[p.sku];
    if (stock) {
      return { ...p, ...stock };
    }
    return p;
  });

  writeJson('products.json', updated);
  console.log(`  Updated stock levels for ${products.length} products`);
  return products.length;
}

// ============================================
// MAIN
// ============================================

async function main() {
  const args = process.argv.slice(2);
  const table = args[0];

  console.log('🚀 IntroCar US - Export from Supabase');
  console.log('=====================================');

  const startTime = Date.now();

  if (table === 'stock') {
    // Quick stock-only update
    await exportStockOnly();
  } else if (table === 'products') {
    await exportProducts();
  } else if (table === 'fitment') {
    await exportFitment();
  } else if (table === 'catalogues') {
    await exportCatalogues();
  } else if (table === 'videos') {
    await exportTechnicalVideos();
  } else {
    // Export all tables
    await exportProducts();
    await exportFitment();
    await exportSupersessions();
    await exportCatalogues();
    await exportHotspotIndex();
    await exportVehicles();
    await exportChassisYears();
    await exportTechnicalVideos();
    await exportPopularity();
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n=====================================`);
  console.log(`✅ Export complete in ${elapsed}s`);
  console.log(`\nNext steps:`);
  console.log(`  1. Review changes: git diff data/json/`);
  console.log(`  2. Commit: git add data/json && git commit -m "Update data from Supabase"`);
  console.log(`  3. Push to deploy: git push`);
}

main().catch(console.error);
