import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateSession } from '@/lib/admin-auth';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
}

/**
 * GET - Get reseller flag statistics
 */
export async function GET(request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (!validateSession(sessionToken)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabase();

    // Get counts by stock type
    const { data: stockTypeCounts, error: stockError } = await supabase
      .from('products')
      .select('stock_type')
      .in('stock_type', ['Prestige Parts', 'Prestige Parts (OE)', 'Uprated']);

    if (stockError) {
      throw new Error(`Error fetching stock types: ${stockError.message}`);
    }

    // Count by stock type
    const counts = {};
    stockTypeCounts?.forEach(p => {
      counts[p.stock_type] = (counts[p.stock_type] || 0) + 1;
    });

    // Check if reseller_flags column exists and count tagged products
    // We'll try to query it and handle the error if it doesn't exist
    let taggedCount = 0;
    let columnExists = false;

    try {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .contains('reseller_flags', ['prestige_parts']);

      if (!error) {
        columnExists = true;
        taggedCount = count || 0;
      }
    } catch {
      columnExists = false;
    }

    return NextResponse.json({
      stockTypeCounts: counts,
      totalPrestigeParts: stockTypeCounts?.length || 0,
      columnExists,
      taggedCount,
      flagName: 'prestige_parts',
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST - Tag products with reseller flags
 * Body: { action: 'add-column' | 'tag-prestige' | 'clear-flags' }
 */
export async function POST(request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (!validateSession(sessionToken)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { action } = await request.json();
    const supabase = getSupabase();

    if (action === 'add-column') {
      // Add the reseller_flags column using raw SQL
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          ALTER TABLE products
          ADD COLUMN IF NOT EXISTS reseller_flags TEXT[] DEFAULT '{}';

          CREATE INDEX IF NOT EXISTS idx_products_reseller_flags
          ON products USING GIN (reseller_flags);
        `
      });

      // If RPC doesn't exist, provide instructions
      if (error) {
        return NextResponse.json({
          success: false,
          message: 'Could not run migration automatically. Please run the SQL manually in Supabase.',
          sql: `
ALTER TABLE products
ADD COLUMN IF NOT EXISTS reseller_flags TEXT[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_products_reseller_flags
ON products USING GIN (reseller_flags);
          `.trim(),
          error: error.message,
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Column added successfully',
      });
    }

    if (action === 'tag-prestige') {
      // Tag all Prestige Parts products
      // First, get all prestige parts SKUs
      const { data: prestigeProducts, error: fetchError } = await supabase
        .from('products')
        .select('sku')
        .in('stock_type', ['Prestige Parts', 'Prestige Parts (OE)', 'Uprated']);

      if (fetchError) {
        throw new Error(`Error fetching products: ${fetchError.message}`);
      }

      // Update in batches
      const batchSize = 500;
      let updated = 0;

      for (let i = 0; i < prestigeProducts.length; i += batchSize) {
        const batch = prestigeProducts.slice(i, i + batchSize);
        const skus = batch.map(p => p.sku);

        const { error: updateError } = await supabase
          .from('products')
          .update({ reseller_flags: ['prestige_parts'] })
          .in('sku', skus);

        if (updateError) {
          throw new Error(`Error updating batch: ${updateError.message}`);
        }

        updated += batch.length;
      }

      return NextResponse.json({
        success: true,
        message: `Tagged ${updated} products with 'prestige_parts' flag`,
        count: updated,
      });
    }

    if (action === 'clear-flags') {
      // Clear all reseller flags (for testing)
      const { error } = await supabase
        .from('products')
        .update({ reseller_flags: [] })
        .not('reseller_flags', 'is', null);

      if (error) {
        throw new Error(`Error clearing flags: ${error.message}`);
      }

      return NextResponse.json({
        success: true,
        message: 'Cleared all reseller flags',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
