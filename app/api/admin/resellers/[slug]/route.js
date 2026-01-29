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
 * GET - Get a single reseller by slug
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

    const { data: reseller, error } = await supabase
      .from('reseller_configs')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !reseller) {
      return NextResponse.json({ error: 'Reseller not found' }, { status: 404 });
    }

    // Get product count if sku_filter is set
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

    return NextResponse.json({
      reseller: {
        ...reseller,
        productCount
      }
    });
  } catch (error) {
    console.error('Error fetching reseller:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PUT - Update a reseller configuration
 */
export async function PUT(request, { params }) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (!validateSession(sessionToken)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { slug } = await params;
    const body = await request.json();
    const supabase = getSupabase();

    // Check if reseller exists
    const { data: existing, error: fetchError } = await supabase
      .from('reseller_configs')
      .select('id')
      .eq('slug', slug)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Reseller not found' }, { status: 404 });
    }

    // Prepare update data (only include fields that are provided)
    const updateData = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.domain !== undefined) updateData.domain = body.domain || null;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.logo_url !== undefined) updateData.logo_url = body.logo_url || null;
    if (body.colors !== undefined) updateData.colors = body.colors;
    if (body.features !== undefined) updateData.features = body.features;
    if (body.show_prices !== undefined) updateData.show_prices = body.show_prices;
    if (body.show_cart !== undefined) updateData.show_cart = body.show_cart;
    if (body.checkout_enabled !== undefined) updateData.checkout_enabled = body.checkout_enabled;
    if (body.order_email !== undefined) updateData.order_email = body.order_email || null;
    if (body.sku_filter !== undefined) updateData.sku_filter = body.sku_filter || null;
    if (body.company_info !== undefined) updateData.company_info = body.company_info;

    // Handle slug change
    if (body.slug && body.slug !== slug) {
      const newSlug = body.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');

      // Check if new slug already exists
      const { data: slugExists } = await supabase
        .from('reseller_configs')
        .select('id')
        .eq('slug', newSlug)
        .neq('slug', slug)
        .single();

      if (slugExists) {
        return NextResponse.json({
          error: 'A reseller with this slug already exists'
        }, { status: 400 });
      }

      updateData.slug = newSlug;
    }

    const { data, error } = await supabase
      .from('reseller_configs')
      .update(updateData)
      .eq('slug', slug)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating reseller: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      reseller: data,
      message: `Reseller "${data.name}" updated successfully`
    });
  } catch (error) {
    console.error('Error updating reseller:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE - Delete a reseller configuration
 */
export async function DELETE(request, { params }) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (!validateSession(sessionToken)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { slug } = await params;
    const supabase = getSupabase();

    // Prevent deleting the main IntroCar reseller
    if (slug === 'introcar-us') {
      return NextResponse.json({
        error: 'Cannot delete the main IntroCar configuration'
      }, { status: 400 });
    }

    // Check if reseller exists
    const { data: existing, error: fetchError } = await supabase
      .from('reseller_configs')
      .select('id, name')
      .eq('slug', slug)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Reseller not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('reseller_configs')
      .delete()
      .eq('slug', slug);

    if (error) {
      throw new Error(`Error deleting reseller: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: `Reseller "${existing.name}" deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting reseller:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
