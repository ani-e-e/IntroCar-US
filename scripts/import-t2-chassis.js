/**
 * IntroCar US - Import T2 Chassis Master to Supabase
 *
 * This script imports the T2 Chassis Master Excel file into Supabase.
 * The sort_order column preserves the critical row ordering from the spreadsheet.
 *
 * Usage:
 *   1. Place "Master Data - T2 Chassis Master.xlsx" in the data/ folder
 *   2. Run: node scripts/import-t2-chassis.js
 */

const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Find the T2 file
function findT2File() {
  const possiblePaths = [
    path.join(__dirname, '..', 'data', 'Master Data - T2 Chassis Master.xlsx'),
    path.join(__dirname, '..', 'data', 'T2 Chassis Master.xlsx'),
    path.join(__dirname, '..', 'Master Data - T2 Chassis Master.xlsx'),
    // Check uploads folder too
    '/sessions/compassionate-bold-curie/mnt/uploads/Master Data - T2 Chassis Master.xlsx'
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return null;
}

async function importT2Chassis() {
  console.log('🚀 IntroCar US - Import T2 Chassis Master');
  console.log('==========================================\n');

  // Find file
  const filePath = findT2File();
  if (!filePath) {
    console.error('❌ T2 Chassis Master file not found!');
    console.log('Please place "Master Data - T2 Chassis Master.xlsx" in the data/ folder');
    process.exit(1);
  }

  console.log(`📂 Found file: ${filePath}`);

  // Read Excel file
  console.log('📖 Reading Excel file...');
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);

  console.log(`   Found ${data.length} rows\n`);

  // Transform data
  console.log('🔄 Transforming data...');
  const records = data.map((row, index) => ({
    make: row['Make'] || null,
    model: row['Model'] || null,
    chassis: row['Chassis'] ? String(row['Chassis']) : null,
    year_start: row['Year start'] || null,
    year_end: row['Year end'] || null,
    adjusted: row['Adjusted'] || null,
    make_model_chassis_key: row['make_model_chassis_key'] || `${row['Make']}${row['Model']}${row['Chassis']}`,
    sort_order: index + 1  // CRITICAL: Preserve row order
  }));

  // Filter out rows without make/model
  const validRecords = records.filter(r => r.make && r.model);
  console.log(`   ${validRecords.length} valid records\n`);

  // Clear existing data
  console.log('🗑️  Clearing existing T2 data...');
  const { error: deleteError } = await supabase
    .from('t2_chassis_master')
    .delete()
    .neq('id', 0); // Delete all

  if (deleteError) {
    console.log('   (Table may be empty or not exist yet)');
  }

  // Insert in batches
  console.log(`📦 Inserting ${validRecords.length} records...`);
  const chunkSize = 1000;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < validRecords.length; i += chunkSize) {
    const chunk = validRecords.slice(i, i + chunkSize);

    const { error } = await supabase
      .from('t2_chassis_master')
      .insert(chunk);

    if (error) {
      console.error(`   ❌ Error at batch ${i}: ${error.message}`);
      errors++;
    } else {
      inserted += chunk.length;
      const pct = Math.round((inserted / validRecords.length) * 100);
      process.stdout.write(`\r   ✓ ${inserted.toLocaleString()} / ${validRecords.length.toLocaleString()} (${pct}%)`);
    }
  }

  console.log(`\n\n==========================================`);
  console.log(`✅ Import complete!`);
  console.log(`   Inserted: ${inserted.toLocaleString()}`);
  console.log(`   Errors: ${errors}`);
  console.log(`\nYou can now use the T2 data for chassis lookups in Supabase.`);
}

importT2Chassis().catch(console.error);
