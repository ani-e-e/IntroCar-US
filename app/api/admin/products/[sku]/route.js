import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateSession } from '@/lib/admin-auth';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client lazily
function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
}

// Transform Supabase row to frontend format
function transformProductFromDB(row) {
  return {
    id: row.id,
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
    images: row.images,
    imageUrl: row.image_url,
    additionalInfo: row.additional_info,
    numberRequired: row.number_required,
    hotspot: row.hotspot,
    cmsPageUrl: row.cms_page_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// GET - Get single product by SKU
export async function GET(request, { params }) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (!validateSession(sessionToken)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { sku } = await params;
    const supabase = getSupabase();

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('sku', sku)
      .single();

    if (error || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Also get fitment data
    const { data: fitment } = await supabase
      .from('product_fitment')
      .select('*')
      .eq('parent_sku', product.parent_sku);

    return NextResponse.json({
      product: transformProductFromDB(product),
      fitment: fitment || [],
      dataSource: 'supabase'
    });
  } catch (error) {
    console.error('Error loading product:', error);
    return NextResponse.json({ error: 'Failed to load product' }, { status: 500 });
  }
}

// PUT - Update single product
export async function PUT(request, { params }) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (!validateSession(sessionToken)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { sku } = await params;
    const updates = await request.json();
    const supabase = getSupabase();

    // Check product exists
    const { data: existing, error: checkError } = await supabase
      .from('products')
      .select('id')
      .eq('sku', sku)
      .single();

    if (checkError || !existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Map frontend field names to database column names
    const fieldMapping = {
      description: 'description',
      price: 'price',
      weight: 'weight',
      categories: 'categories',
      stockType: 'stock_type',
      searchPartType: 'search_part_type',
      inStock: 'in_stock',
      availableNow: 'available_now',
      available1to3Days: 'available_1_to_3_days',
      additionalInfo: 'additional_info',
      numberRequired: 'number_required',
      imageUrl: 'image_url',
      image: 'image',
      nlaDate: 'nla_date',
      hotspot: 'hotspot',
      cmsPageUrl: 'cms_page_url',
    };

    // Build update object with only allowed fields
    const dbUpdates = {};
    for (const [frontendField, dbField] of Object.entries(fieldMapping)) {
      if (updates[frontendField] !== undefined) {
        // Handle type conversions
        if (frontendField === 'price' || frontendField === 'weight') {
          dbUpdates[dbField] = updates[frontendField] ? parseFloat(updates[frontendField]) : null;
        } else if (frontendField === 'availableNow' || frontendField === 'available1to3Days') {
          dbUpdates[dbField] = parseInt(updates[frontendField]) || 0;
        } else {
          dbUpdates[dbField] = updates[frontendField];
        }
      }
    }

    // Perform the update
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update(dbUpdates)
      .eq('sku', sku)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating product:', updateError);
      return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      product: transformProductFromDB(updatedProduct),
      message: 'Product updated. Remember to export JSON for deployment.',
      dataSource: 'supabase'
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE - Delete single product
export async function DELETE(request, { params }) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (!validateSession(sessionToken)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { sku } = await params;
    const supabase = getSupabase();

    // Check product exists
    const { data: existing, error: checkError } = await supabase
      .from('products')
      .select('id, parent_sku')
      .eq('sku', sku)
      .single();

    if (checkError || !existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Delete the product
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('sku', sku);

    if (deleteError) {
      console.error('Error deleting product:', deleteError);
      return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted. Remember to export JSON for deployment.',
      dataSource: 'supabase'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
