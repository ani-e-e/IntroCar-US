#!/usr/bin/env node

/**
 * Export All Data from Supabase to JSON
 *
 * This script exports all data from Supabase to JSON files for deployment.
 * The JSON files are used by the live site for fast reads.
 *
 * Usage:
 *   node scripts/export-all-to-json.js
 *   node scripts/export-all-to-json.js --products    # Only products
 *   node scripts/export-all-to-json.js --videos      # Only videos
 *   node scripts/export-all-to-json.js --catalogues  # Only catalogues
 *   node scripts/export-all-to-json.js --fitment     # Only fitment
 *   node scripts/export-all-to-json.js --vehicles    # Only vehicles
 *
 * Requires:
 *   - SUPABASE_URL env var
 *   - SUPABASE_SERVICE_KEY env var
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Check command line arguments
const args = process.argv.slice(2);
const exportAll = args.length === 0;
const exportProducts = exportAll || args.includes('--products');
const exportVideos = exportAll || args.includes('--videos');
const exportCatalogues = exportAll || args.includes('--catalogues');
const exportFitment = exportAll || args.includes('--fitment');
const exportVehicles = exportAll || args.includes('--vehicles');

// Helper to fetch all rows with pagination
async function fetchAll(tableName, orderBy = 'id') {
  let allRows = [];
  let offset = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order(orderBy, { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (error) {
      throw new Error(`Error fetching ${tableName}: ${error.message}`);
    }

    if (data.length === 0) {
      hasMore = false;
    } else {
      allRows = allRows.concat(data);
      offset += pageSize;
      hasMore = data.length === pageSize;
    }
  }

  return allRows;
}

// Transform functions
function transformProduct(row) {
  return {
    sku: row.sku,
    parentSku: row.parent_sku,
    description: row.description,
    price: row.price,
    weight: row.weight,
    stockType: row.stock_type,
    searchPartType: row.search_part_type,
    categories: row.categories,
    inStock: row.in_stock,
    availableNow: row.available_now,
    available1to3Days: row.available_1_to_3_days,
    nlaDate: row.nla_date,
    image: row.image,
    imageUrl: row.image_url,
    additionalInfo: row.additional_info,
    numberRequired: row.number_required,
    hotspot: row.hotspot,
    cmsPageUrl: row.cms_page_url,
  };
}

function transformVideo(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    youtubeId: row.youtube_id,
    category: row.category,
    verified: row.verified,
    makes: row.makes || [],
    models: row.models || [],
    productCategories: row.product_categories || [],
  };
}

function transformCatalogue(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    subcategory: row.subcategory,
    image: row.image,
    imageUrl: row.image_url,
    cmsUrl: row.cms_url,
    catalogueLink: row.catalogue_link,
    makes: row.makes || [],
    models: row.models || [],
    hotspots: row.hotspots || [],
  };
}

function transformFitment(row) {
  return {
    parentSku: row.parent_sku,
    make: row.make,
    model: row.model,
    chassisStart: row.chassis_start,
    chassisEnd: row.chassis_end,
    additionalInfo: row.additional_info,
  };
}

function transformVehicle(row) {
  return {
    make: row.make,
    model: row.model,
    yearStart: row.year_start,
    yearEnd: row.year_end,
  };
}

// Export functions
async function doExportProducts() {
  console.log('📦 Exporting products...');
  const rows = await fetchAll('products', 'sku');
  const transformed = rows.map(transformProduct);
  const outputPath = path.join(process.cwd(), 'data', 'json', 'products.json');
  await fs.writeFile(outputPath, JSON.stringify(transformed, null, 2));
  console.log(`   ✅ ${transformed.length} products → ${outputPath}`);
  return transformed.length;
}

async function doExportVideos() {
  console.log('🎬 Exporting technical videos...');
  const rows = await fetchAll('technical_videos', 'id');
  const transformed = rows.map(transformVideo);
  const outputPath = path.join(process.cwd(), 'data', 'json', 'technical-videos.json');
  await fs.writeFile(outputPath, JSON.stringify(transformed, null, 2));
  console.log(`   ✅ ${transformed.length} videos → ${outputPath}`);
  return transformed.length;
}

async function doExportCatalogues() {
  console.log('📚 Exporting catalogues...');
  const rows = await fetchAll('catalogues', 'id');
  const transformed = rows.map(transformCatalogue);
  const outputPath = path.join(process.cwd(), 'data', 'json', 'lookbooks.json');
  await fs.writeFile(outputPath, JSON.stringify(transformed, null, 2));
  console.log(`   ✅ ${transformed.length} catalogues → ${outputPath}`);
  return transformed.length;
}

async function doExportFitment() {
  console.log('🔧 Exporting product fitment...');
  const rows = await fetchAll('product_fitment', 'parent_sku');
  const transformed = rows.map(transformFitment);
  const outputPath = path.join(process.cwd(), 'data', 'json', 'product-fitment.json');
  await fs.writeFile(outputPath, JSON.stringify(transformed, null, 2));
  console.log(`   ✅ ${transformed.length} fitment records → ${outputPath}`);
  return transformed.length;
}

async function doExportVehicles() {
  console.log('🚗 Exporting vehicles...');
  const rows = await fetchAll('vehicles', 'make');
  const transformed = rows.map(transformVehicle);
  const outputPath = path.join(process.cwd(), 'data', 'json', 'vehicles.json');
  await fs.writeFile(outputPath, JSON.stringify(transformed, null, 2));
  console.log(`   ✅ ${transformed.length} vehicles → ${outputPath}`);
  return transformed.length;
}

// Main export function
async function exportAll() {
  console.log('🚀 Starting Supabase → JSON export\n');
  console.log(`   Database: ${SUPABASE_URL}\n`);

  const stats = {};

  try {
    if (exportProducts) {
      stats.products = await doExportProducts();
    }
    if (exportVideos) {
      stats.videos = await doExportVideos();
    }
    if (exportCatalogues) {
      stats.catalogues = await doExportCatalogues();
    }
    if (exportFitment) {
      stats.fitment = await doExportFitment();
    }
    if (exportVehicles) {
      stats.vehicles = await doExportVehicles();
    }

    console.log('\n✅ Export complete!\n');
    console.log('Stats:');
    for (const [key, count] of Object.entries(stats)) {
      console.log(`  ${key}: ${count.toLocaleString()}`);
    }

    console.log('\nNext steps:');
    console.log('  1. Review the exported JSON files');
    console.log('  2. Commit changes: git add data/json/ && git commit -m "Update data export"');
    console.log('  3. Push to deploy: git push');

  } catch (error) {
    console.error('\n❌ Export failed:', error.message);
    process.exit(1);
  }
}

exportAll();
