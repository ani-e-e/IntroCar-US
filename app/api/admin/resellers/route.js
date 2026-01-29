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
 * GET - List all reseller configurations
 */
export async function GET(request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (!validateSession(sessionToken)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    let query = supabase
      .from('reseller_configs')
      .select('*')
      .order('name');

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data: resellers, error } = await query;

    if (error) {
      throw new Error(`Error fetching resellers: ${error.message}`);
    }

    // Get product counts for each reseller with a sku_filter
    const resellersWithCounts = await Promise.all(
      resellers.map(async (reseller) => {
        let productCount = 0;
        if (reseller.sku_filter) {
          const { count, error: countError } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .contains('reseller_flags', [reseller.sku_filter]);

          if (!countError) {
            productCount = count || 0;
          }
        }
        return {
          ...reseller,
          productCount
        };
      })
    );

    return NextResponse.json({
      resellers: resellersWithCounts,
      total: resellers.length
    });
  } catch (error) {
    console.error('Error loading resellers:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST - Create a new reseller configuration
 */
export async function POST(request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (!validateSession(sessionToken)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const supabase = getSupabase();

    // Validate required fields
    if (!body.name || !body.slug) {
      return NextResponse.json({
        error: 'Name and slug are required'
      }, { status: 400 });
    }

    // Sanitize slug
    const slug = body.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    // Check if slug already exists
    const { data: existing } = await supabase
      .from('reseller_configs')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      return NextResponse.json({
        error: 'A reseller with this slug already exists'
      }, { status: 400 });
    }

    // Prepare data for insert
    const insertData = {
      slug,
      name: body.name,
      domain: body.domain || null,
      is_active: body.is_active !== false,
      logo_url: body.logo_url || null,
      colors: body.colors || {
        primary: '#1e3a5f',
        primaryDark: '#142840',
        accent: '#c9a227',
        accentLight: '#d4b84a',
        secondary: '#2d4a6f',
        background: '#f8f9fa',
        text: '#1a1a1a',
        textLight: '#666666'
      },
      features: body.features || ['light'],
      show_prices: body.show_prices || false,
      show_cart: body.show_cart || false,
      checkout_enabled: body.checkout_enabled || false,
      order_email: body.order_email || null,
      sku_filter: body.sku_filter || null,
      company_info: body.company_info || {}
    };

    const { data, error } = await supabase
      .from('reseller_configs')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating reseller: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      reseller: data,
      message: `Reseller "${data.name}" created successfully`
    });
  } catch (error) {
    console.error('Error creating reseller:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
