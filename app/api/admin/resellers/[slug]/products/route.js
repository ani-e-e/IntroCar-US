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
 * GET - List products tagged for a reseller
 */
export async function GET(request, { params }) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (!validateSession(sessionToken)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { slug } = await params;
    const supabase = getSupabase();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';

    // Get reseller config
    const { data: reseller, error: resellerError } = await supabase
      .from('reseller_configs')
      .select('sku_filter')
      .eq('slug', slug)
      .single();

    if (resellerError || !reseller) {
      return NextResponse.json({ error: 'Reseller not found' }, { status: 404 });
    }

    if (!reseller.sku_filter) {
      return NextResponse.json({
        products: [],
        total: 0,
        message: 'No SKU filter configured for this reseller'
      });
    }

    // Build query
    let query = supabase
      .from('products')
      .select('sku, description, stock_type, uk_price, us_price, reseller_flags', { count: 'exact' })
      .contains('reseller_flags', [reseller.sku_filter]);

    if (search) {
      query = query.or(`sku.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Get total count
    const { count: total } = await query;

    // Reset query for paginated results
    query = supabase
      .from('products')
      .select('sku, description, stock_type, uk_price, us_price, reseller_flags')
      .contains('reseller_flags', [reseller.sku_filter]);

    if (search) {
      query = query.or(`sku.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const offset = (page - 1) * limit;
    const { data: products, error } = await query
      .order('sku')
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }

    return NextResponse.json({
      products: products || [],
      pagination: {
        page,
        limit,
        total: total || 0,
        totalPages: Math.ceil((total || 0) / limit)
      },
      skuFilter: reseller.sku_filter
    });
  } catch (error) {
    console.error('Error fetching reseller products:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST - Tag products for a reseller
 * Body: { action: 'tag' | 'untag', skus: string[] }
 * Or: { action: 'tag-by-stock-type', stockTypes: string[] }
 */
export async function POST(request, { params }) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (!validateSession(sessionToken)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { slug } = await params;
    const body = await request.json();
    const { action, skus, stockTypes } = body;
    const supabase = getSupabase();

    // Get reseller config
    const { data: reseller, error: resellerError } = await supabase
      .from('reseller_configs')
      .select('sku_filter, name')
      .eq('slug', slug)
      .single();

    if (resellerError || !reseller) {
      return NextResponse.json({ error: 'Reseller not found' }, { status: 404 });
    }

    if (!reseller.sku_filter) {
      return NextResponse.json({
        error: 'No SKU filter configured for this reseller. Please set a SKU filter first.'
      }, { status: 400 });
    }

    const flag = reseller.sku_filter;

    if (action === 'tag' && skus && Array.isArray(skus)) {
      // Tag specific products by SKU
      let updated = 0;

      for (const sku of skus) {
        // Get current flags
        const { data: product } = await supabase
          .from('products')
          .select('reseller_flags')
          .eq('sku', sku)
          .single();

        if (product) {
          const currentFlags = product.reseller_flags || [];
          if (!currentFlags.includes(flag)) {
            const { error: updateError } = await supabase
              .from('products')
              .update({ reseller_flags: [...currentFlags, flag] })
              .eq('sku', sku);

            if (!updateError) updated++;
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: `Tagged ${updated} products with '${flag}' flag`,
        count: updated
      });
    }

    if (action === 'untag' && skus && Array.isArray(skus)) {
      // Remove tag from specific products
      let updated = 0;

      for (const sku of skus) {
        // Get current flags
        const { data: product } = await supabase
          .from('products')
          .select('reseller_flags')
          .eq('sku', sku)
          .single();

        if (product) {
          const currentFlags = product.reseller_flags || [];
          if (currentFlags.includes(flag)) {
            const { error: updateError } = await supabase
              .from('products')
              .update({ reseller_flags: currentFlags.filter(f => f !== flag) })
              .eq('sku', sku);

            if (!updateError) updated++;
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: `Removed '${flag}' flag from ${updated} products`,
        count: updated
      });
    }

    if (action === 'tag-by-stock-type' && stockTypes && Array.isArray(stockTypes)) {
      // Tag all products with specific stock types
      const { data: products, error: fetchError } = await supabase
        .from('products')
        .select('sku, reseller_flags')
        .in('stock_type', stockTypes);

      if (fetchError) {
        throw new Error(`Error fetching products: ${fetchError.message}`);
      }

      let updated = 0;
      const batchSize = 500;

      for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);

        for (const product of batch) {
          const currentFlags = product.reseller_flags || [];
          if (!currentFlags.includes(flag)) {
            const { error: updateError } = await supabase
              .from('products')
              .update({ reseller_flags: [...currentFlags, flag] })
              .eq('sku', product.sku);

            if (!updateError) updated++;
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: `Tagged ${updated} products with '${flag}' flag (from stock types: ${stockTypes.join(', ')})`,
        count: updated,
        totalProducts: products.length
      });
    }

    if (action === 'clear-all') {
      // Remove this reseller's flag from all products
      const { data: products, error: fetchError } = await supabase
        .from('products')
        .select('sku, reseller_flags')
        .contains('reseller_flags', [flag]);

      if (fetchError) {
        throw new Error(`Error fetching products: ${fetchError.message}`);
      }

      let updated = 0;

      for (const product of products) {
        const currentFlags = product.reseller_flags || [];
        const { error: updateError } = await supabase
          .from('products')
          .update({ reseller_flags: currentFlags.filter(f => f !== flag) })
          .eq('sku', product.sku);

        if (!updateError) updated++;
      }

      return NextResponse.json({
        success: true,
        message: `Removed '${flag}' flag from ${updated} products`,
        count: updated
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error managing product tags:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
