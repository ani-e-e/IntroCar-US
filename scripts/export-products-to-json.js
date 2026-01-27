#!/usr/bin/env node

/**
 * Export Products from Supabase to JSON
 *
 * This script exports all products from the Supabase database to a JSON file
 * for deployment. The JSON file is used by the live site for fast reads.
 *
 * Usage:
 *   node scripts/export-products-to-json.js
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

// Transform database row to JSON format (frontend-friendly camelCase)
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

async function exportProducts() {
  console.log('Starting products export from Supabase...\n');

  try {
    // Fetch all products with pagination (Supabase has 1000 row limit per query)
    let allProducts = [];
    let offset = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      console.log(`Fetching products ${offset} to ${offset + pageSize}...`);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('sku', { ascending: true })
        .range(offset, offset + pageSize - 1);

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      if (data.length === 0) {
        hasMore = false;
      } else {
        allProducts = allProducts.concat(data);
        offset += pageSize;
        hasMore = data.length === pageSize;
      }
    }

    console.log(`\nFetched ${allProducts.length} products total.`);

    // Transform to frontend format
    const transformedProducts = allProducts.map(transformProduct);

    // Write to JSON file
    const outputPath = path.join(process.cwd(), 'data', 'json', 'products.json');
    await fs.writeFile(outputPath, JSON.stringify(transformedProducts, null, 2));

    console.log(`\n✅ Exported ${transformedProducts.length} products to ${outputPath}`);

    // Get some stats
    const inStock = transformedProducts.filter(p => p.inStock).length;
    const prestige = transformedProducts.filter(p => p.stockType?.includes('Prestige')).length;

    console.log('\nStats:');
    console.log(`  Total products: ${transformedProducts.length}`);
    console.log(`  In stock: ${inStock}`);
    console.log(`  Prestige Parts: ${prestige}`);

  } catch (error) {
    console.error('Export failed:', error.message);
    process.exit(1);
  }
}

exportProducts();
