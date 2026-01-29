/**
 * Re-import T3 data to Supabase
 *
 * Run with: node scripts/reimport-t3.js
 *
 * Make sure the T3 Excel file is at: data/MASTER_DATA_INTROCAR - T3.xlsx
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  const t3FilePath = process.argv[2] || path.join(__dirname, '..', 'data', 'MASTER_DATA_INTROCAR - T3.xlsx');

  console.log('Step 1: Loading T3 Excel file...');
  console.log(`  File: ${t3FilePath}`);

  const workbook = XLSX.readFile(t3FilePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet);

  console.log(`  Loaded ${data.length.toLocaleString()} rows`);

  console.log('\nStep 2: Clearing product_fitment table...');
  const { error: deleteError } = await supabase
    .from('product_fitment')
    .delete()
    .gt('id', 0);

  if (deleteError) {
    console.error('  Delete error:', deleteError);
    process.exit(1);
  }
  console.log('  Table cleared');

  console.log('\nStep 3: Preparing records...');
  const records = data
    .filter(row => row['Parent SKU'] && row['Make'] && row['Model'])
    .map(row => ({
      parent_sku: String(row['Parent SKU']).trim(),
      make: String(row['Make']).trim(),
      model: String(row['Model']).trim(),
      chassis_start: row['Chassis start'] != null ? String(Math.floor(row['Chassis start'])) : null,
      chassis_end: row['Chassis end'] != null ? String(Math.floor(row['Chassis end'])) : null,
      additional_info: row['Additional info'] ? String(row['Additional info']).trim() : null
    }));

  console.log(`  Prepared ${records.length.toLocaleString()} valid records`);

  console.log('\nStep 4: Inserting data in batches...');
  const batchSize = 1000;
  let totalInserted = 0;
  let errors = 0;

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);

    const { error: insertError } = await supabase
      .from('product_fitment')
      .insert(batch);

    if (insertError) {
      console.error(`  Error at batch ${i}:`, insertError.message);
      errors++;
    } else {
      totalInserted += batch.length;
    }

    if (totalInserted % 10000 === 0 || i + batchSize >= records.length) {
      console.log(`  Inserted ${totalInserted.toLocaleString()} of ${records.length.toLocaleString()} records...`);
    }
  }

  console.log(`\n✓ Import complete!`);
  console.log(`  Inserted: ${totalInserted.toLocaleString()} records`);
  console.log(`  Errors: ${errors}`);

  // Verify
  const { count } = await supabase
    .from('product_fitment')
    .select('*', { count: 'exact', head: true });

  console.log(`\n✓ Verification: ${count?.toLocaleString()} records in product_fitment table`);
}

main().catch(console.error);
