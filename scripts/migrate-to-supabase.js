/**
 * IntroCar US - Migration Script: JSON → Supabase
 *
 * This script imports all existing JSON data into Supabase tables.
 * Run once to populate the database, then use Supabase for management.
 *
 * Usage:
 *   1. Create a Supabase project at https://supabase.com
 *   2. Run the schema SQL (scripts/supabase-schema.sql) in Supabase SQL Editor
 *   3. Get your Supabase URL and Service Role Key from Settings > API
 *   4. Create a .env.local file with:
 *      SUPABASE_URL=https://xxxxx.supabase.co
 *      SUPABASE_SERVICE_KEY=eyJhbG...
 *   5. Run: node scripts/migrate-to-supabase.js
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
  console.log('\nCreate a .env.local file with:');
  console.log('SUPABASE_URL=https://xxxxx.supabase.co');
  console.log('SUPABASE_SERVICE_KEY=eyJhbG...');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Helper: Load JSON file
function loadJson(filename) {
  const filepath = path.join(__dirname, '..', 'data', 'json', filename);
  if (!fs.existsSync(filepath)) {
    console.warn(`⚠️  File not found: ${filename}`);
    return null;
  }
  return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
}

// Helper: Batch insert with progress
async function batchInsert(tableName, records, chunkSize = 500) {
  console.log(`\n📦 Inserting ${records.length} records into ${tableName}...`);

  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < records.length; i += chunkSize) {
    const chunk = records.slice(i, i + chunkSize);

    const { error } = await supabase
      .from(tableName)
      .upsert(chunk, { onConflict: getConflictKey(tableName) });

    if (error) {
      console.error(`  ❌ Error at batch ${i}: ${error.message}`);
      errors++;
    } else {
      inserted += chunk.length;
      const pct = Math.round((inserted / records.length) * 100);
      process.stdout.write(`\r  ✓ ${inserted} / ${records.length} (${pct}%)`);
    }
  }

  console.log(`\n  ✅ Done: ${inserted} inserted, ${errors} errors`);
  return { inserted, errors };
}

// Get the conflict key for upsert
function getConflictKey(tableName) {
  const keys = {
    products: 'sku',
    vehicles: 'make,model',
    supersessions: 'source_sku,target_sku',
    catalogues: 'id',
    chassis_years: 'make,model,year',
    technical_videos: 'id',
    product_popularity: 'sku',
    hotspot_index: 'parent_sku,catalogue_id'
  };
  return keys[tableName] || 'id';
}

// ============================================
// MIGRATION FUNCTIONS
// ============================================

async function migrateProducts() {
  const products = loadJson('products.json');
  if (!products) return;

  const records = products.map(p => ({
    sku: p.sku,
    parent_sku: p.parentSku,
    description: p.description,
    price: p.price,
    weight: p.weight,
    stock_type: p.stockType,
    search_part_type: p.searchPartType,
    categories: p.categories,
    in_stock: p.inStock || false,
    available_now: Math.floor(p.availableNow || 0),
    available_1_to_3_days: Math.floor(p.available1to3Days || 0),
    nla_date: p.nlaDate ? parseDate(p.nlaDate) : null,
    image: p.image,
    images: p.images || [],
    image_url: p.imageUrl,
    additional_info: p.additionalInfo,
    number_required: p.numberRequired,
    hotspot: p.hotspot,
    cms_page_url: p.cmsPageUrl
  }));

  await batchInsert('products', records);
}

async function migrateVehicles() {
  const vehicles = loadJson('vehicles.json');
  if (!vehicles) return;

  // vehicles.json is an array of {make, model, yearStart, yearEnd}
  const records = vehicles.map(v => ({
    make: v.make,
    model: v.model,
    year_start: v.yearStart,
    year_end: v.yearEnd
  }));

  await batchInsert('vehicles', records);
}

async function migrateFitment() {
  const fitmentLookup = loadJson('fitment-lookup.json');
  if (!fitmentLookup) return;

  const records = [];

  Object.entries(fitmentLookup).forEach(([parentSku, fitments]) => {
    if (Array.isArray(fitments)) {
      fitments.forEach(f => {
        records.push({
          parent_sku: parentSku,
          make: f.make,
          model: f.model,
          chassis_start: f.chassisStart,
          chassis_end: f.chassisEnd,
          additional_info: f.additionalInfo
        });
      });
    }
  });

  await batchInsert('product_fitment', records, 1000);
}

async function migrateSupersessions() {
  const supersessionLookup = loadJson('supersession-lookup.json');
  if (!supersessionLookup) return;

  const records = [];

  Object.entries(supersessionLookup).forEach(([sourceSku, targets]) => {
    const targetArray = Array.isArray(targets) ? targets : [targets];
    targetArray.forEach(target => {
      if (target) {
        records.push({
          source_sku: sourceSku,
          target_sku: target
        });
      }
    });
  });

  await batchInsert('supersessions', records, 1000);
}

async function migrateCatalogues() {
  const lookbooks = loadJson('lookbooks.json');
  if (!lookbooks) return;

  const records = lookbooks.map(lb => ({
    id: lb.id,
    title: lb.title,
    category: lb.category,
    subcategory: lb.subcategory,
    image: lb.image,
    image_url: lb.imageUrl,
    cms_url: lb.cmsUrl,
    catalogue_link: lb.catalogueLink,
    makes: lb.makes || [],
    models: lb.models || [],
    hotspots: lb.hotspots || []
  }));

  await batchInsert('catalogues', records);
}

async function migrateChassisYears() {
  const chassisYears = loadJson('chassis-years.json');
  if (!chassisYears) return;

  const records = [];

  // chassisYears is nested: { make: { model: { yearStart, yearEnd, years: { year: {...} } } } }
  Object.entries(chassisYears).forEach(([make, models]) => {
    Object.entries(models).forEach(([model, data]) => {
      if (data.years) {
        Object.entries(data.years).forEach(([year, yearData]) => {
          records.push({
            make,
            model,
            year: parseInt(year),
            chassis_prefix: yearData.chassisPrefix,
            chassis_start: yearData.chassisStart,
            chassis_end: yearData.chassisEnd,
            chassis_numeric_start: yearData.chassisNumericStart,
            chassis_numeric_end: yearData.chassisNumericEnd,
            chassis_count: yearData.chassisCount
          });
        });
      }
    });
  });

  await batchInsert('chassis_years', records);
}

async function migrateTechnicalVideos() {
  const data = loadJson('technical-videos.json');
  if (!data || !data.videos) return;

  const records = data.videos.map(v => ({
    id: v.id,
    title: v.title,
    description: v.description,
    youtube_id: v.youtubeId,
    category: v.category,
    verified: v.verified || false
  }));

  await batchInsert('technical_videos', records);
}

async function migratePopularity() {
  const popularity = loadJson('popularity.json');
  if (!popularity) return;

  const records = Object.entries(popularity).map(([sku, score]) => ({
    sku,
    score
  }));

  await batchInsert('product_popularity', records);
}

async function migrateHotspotIndex() {
  const hotspotIndex = loadJson('hotspot-index.json');
  if (!hotspotIndex) return;

  const records = [];

  Object.entries(hotspotIndex).forEach(([parentSku, catalogueIds]) => {
    const ids = Array.isArray(catalogueIds) ? catalogueIds : [catalogueIds];
    ids.forEach(catalogueId => {
      records.push({
        parent_sku: parentSku,
        catalogue_id: catalogueId
      });
    });
  });

  await batchInsert('hotspot_index', records, 1000);
}

// Helper: Parse various date formats
function parseDate(dateStr) {
  if (!dateStr) return null;

  // Handle "1st September 2014" format
  const textMatch = dateStr.match(/(\d+)(?:st|nd|rd|th)?\s+(\w+)\s+(\d{4})/i);
  if (textMatch) {
    const [, day, month, year] = textMatch;
    const months = {
      january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
      july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
    };
    const monthNum = months[month.toLowerCase()];
    if (monthNum !== undefined) {
      return new Date(year, monthNum, day).toISOString().split('T')[0];
    }
  }

  // Try ISO format
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }

  return null;
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('🚀 IntroCar US - Migration to Supabase');
  console.log('=====================================\n');

  const startTime = Date.now();

  // Run migrations in order
  await migrateProducts();
  await migrateVehicles();
  await migrateFitment();
  await migrateSupersessions();
  await migrateCatalogues();
  await migrateChassisYears();
  await migrateTechnicalVideos();
  await migratePopularity();
  await migrateHotspotIndex();

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n=====================================`);
  console.log(`✅ Migration complete in ${elapsed}s`);
  console.log(`\nNext steps:`);
  console.log(`  1. Check your Supabase dashboard to verify the data`);
  console.log(`  2. Use the Table Editor to manage products, stock, prices`);
  console.log(`  3. Run 'node scripts/export-from-supabase.js' to generate JSON files`);
}

main().catch(console.error);
