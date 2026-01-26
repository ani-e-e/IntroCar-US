import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { validateSession } from '@/lib/admin-auth';

// Initialize Supabase client lazily (not at build time)
function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
}

// Simple CSV parser
function parseCSV(content) {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

  return lines.slice(1).map(line => {
    // Handle quoted values with commas
    const values = [];
    let current = '';
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const row = {};
    headers.forEach((header, i) => {
      row[header] = values[i]?.replace(/"/g, '') || '';
    });
    return row;
  });
}

export async function POST(request) {
  // Check auth using signed session token
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin_session');
  if (!sessionCookie || !validateSession(sessionCookie.value)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const source = formData.get('source') || 'warehouse'; // 'warehouse' or 'supplier'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const isSupplierStock = source === 'supplier';
    const supabase = getSupabase();

    // Read file content
    const content = await file.text();
    const rows = parseCSV(content);

    console.log(`Processing ${rows.length} stock rows...`);

    // Track results
    let processed = 0;
    let updated = 0;
    let notFound = 0;
    let errors = 0;
    const notFoundSkus = [];

    // Process each row
    for (const row of rows) {
      // Support different column name formats
      const sku = row['Stock_code'] || row['SKU'] || row['sku'] || row['stock_code'];
      const availableLevel = parseInt(row['Available_level'] || row['available_now'] || row['qty'] || '0') || 0;

      if (!sku) continue;
      processed++;

      // Update in Supabase - different fields based on source
      const updateData = isSupplierStock
        ? { available_1_3_days: availableLevel }
        : { available_now: availableLevel, in_stock: availableLevel > 0 };

      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('sku', sku)
        .select('sku');

      if (error) {
        console.error(`Error updating ${sku}:`, error.message);
        errors++;
      } else if (!data || data.length === 0) {
        // SKU not found - exact match only
        notFound++;
        if (notFoundSkus.length < 100) {
          notFoundSkus.push(sku);
        }
      } else {
        updated++;
      }
    }

    console.log(`Stock update (${source}) complete: ${updated} updated, ${notFound} not found, ${errors} errors`);

    return NextResponse.json({
      success: true,
      source,
      processed,
      updated,
      notFound,
      errors,
      notFoundSkus
    });

  } catch (error) {
    console.error('Stock upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
