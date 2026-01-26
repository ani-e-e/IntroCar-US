/**
 * IntroCar US - Import Stock Update from Khaos Control CSV
 *
 * This script imports stock levels from the daily Khaos Control export.
 * It updates the products table in Supabase with current stock levels.
 *
 * Usage:
 *   node scripts/import-stock-update.js <path-to-csv>
 *
 * Example:
 *   node scripts/import-stock-update.js "data/stock-update-2026-01-26.csv"
 *
 * CSV Format Expected:
 *   Stock_id, Stock_code, Net_qty_moved, Available_level, Buildable_qty, Total_available_qty
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

// Simple CSV parser
function parseCSV(content) {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());

  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const row = {};
    headers.forEach((header, i) => {
      row[header] = values[i];
    });
    return row;
  });
}

async function importStockUpdate(csvPath) {
  console.log('🚀 IntroCar US - Stock Update Import');
  console.log('=====================================\n');

  // Check file exists
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ File not found: ${csvPath}`);
    process.exit(1);
  }

  console.log(`📂 Reading: ${csvPath}`);

  // Read and parse CSV
  const content = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(content);

  console.log(`   Found ${rows.length} stock records\n`);

  // Transform to updates
  // CSV columns: Stock_code = SKU, Available_level = available_now
  const updates = rows.map(row => ({
    sku: row['Stock_code'],
    available_now: parseInt(row['Available_level']) || 0,
    in_stock: (parseInt(row['Available_level']) || 0) > 0
  })).filter(u => u.sku); // Filter out empty SKUs

  console.log(`📦 Updating ${updates.length} products in Supabase...\n`);

  // Update in batches
  const chunkSize = 100;
  let updated = 0;
  let notFound = 0;
  let errors = 0;

  for (let i = 0; i < updates.length; i += chunkSize) {
    const chunk = updates.slice(i, i + chunkSize);

    // Update each SKU
    for (const update of chunk) {
      const { data, error } = await supabase
        .from('products')
        .update({
          available_now: update.available_now,
          in_stock: update.in_stock
        })
        .eq('sku', update.sku);

      if (error) {
        errors++;
      } else {
        updated++;
      }
    }

    const pct = Math.round(((i + chunk.length) / updates.length) * 100);
    process.stdout.write(`\r   ✓ ${i + chunk.length} / ${updates.length} (${pct}%)`);
  }

  console.log(`\n\n=====================================`);
  console.log(`✅ Stock update complete!`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Errors: ${errors}`);

  console.log(`\nNext steps:`);
  console.log(`   1. Verify in Supabase Table Editor`);
  console.log(`   2. Export to JSON: node scripts/export-from-supabase.js stock`);
  console.log(`   3. Commit and push to deploy`);
}

// Get CSV path from command line
const csvPath = process.argv[2];
if (!csvPath) {
  console.log('Usage: node scripts/import-stock-update.js <path-to-csv>');
  console.log('');
  console.log('Example:');
  console.log('  node scripts/import-stock-update.js "data/stock-update.csv"');
  process.exit(1);
}

importStockUpdate(csvPath).catch(console.error);
