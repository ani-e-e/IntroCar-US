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
    imageUrl: row.image_url,
    additionalInfo: row.additional_info,
    numberRequired: row.number_required,
    hotspot: row.hotspot,
    cmsPageUrl: row.cms_page_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// GET - List products with pagination and search
export async function GET(request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (!validateSession(sessionToken)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const stockFilter = searchParams.get('stock') || '';
    const stockType = searchParams.get('stockType') || '';

    const supabase = getSupabase();
    const offset = (page - 1) * limit;

    // Build query for products
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' });

    // Apply search filter
    if (search) {
      query = query.or(`sku.ilike.%${search}%,description.ilike.%${search}%,parent_sku.ilike.%${search}%`);
    }

    // Apply category filter
    if (category) {
      query = query.ilike('categories', `%${category}%`);
    }

    // Apply stock filter
    if (stockFilter === 'in') {
      query = query.eq('in_stock', true);
    } else if (stockFilter === 'out') {
      query = query.eq('in_stock', false);
    }

    // Apply stock type filter
    if (stockType) {
      query = query.eq('stock_type', stockType);
    }

    // Order by SKU and apply pagination
    query = query
      .order('sku', { ascending: true })
      .range(offset, offset + limit - 1);

    const { data: products, error, count } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
    }

    // Get unique categories for filter dropdown (cached query, limited)
    const { data: categoryData } = await supabase
      .from('products')
      .select('categories')
      .not('categories', 'is', null)
      .limit(5000);

    const categoriesSet = new Set();
    categoryData?.forEach(p => {
      if (p.categories) {
        // Split by pipe or slash to get individual categories
        p.categories.split(/[|\/]/).forEach(cat => {
          const trimmed = cat.trim();
          if (trimmed) categoriesSet.add(trimmed);
        });
      }
    });
    const categories = [...categoriesSet].sort();

    // Get unique stock types
    const { data: stockTypeData } = await supabase
      .from('products')
      .select('stock_type')
      .not('stock_type', 'is', null)
      .limit(1000);

    const stockTypes = [...new Set(stockTypeData?.map(p => p.stock_type).filter(Boolean))].sort();

    // Get stats
    const { count: totalCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    const { count: inStockCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('in_stock', true);

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      products: products?.map(transformProductFromDB) || [],
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      categories,
      stockTypes,
      stats: {
        total: totalCount || 0,
        inStock: inStockCount || 0,
        outOfStock: (totalCount || 0) - (inStockCount || 0),
      },
      dataSource: 'supabase'
    });
  } catch (error) {
    console.error('Error loading products:', error);
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
  }
}

// POST - Add new product
export async function POST(request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (!validateSession(sessionToken)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      sku,
      parentSku,
      description,
      price,
      weight,
      stockType,
      searchPartType,
      categories,
      inStock = false,
      availableNow = 0,
      available1to3Days = 0,
      additionalInfo,
      numberRequired,
      imageUrl,
    } = body;

    // Validate required fields
    if (!sku) {
      return NextResponse.json(
        { error: 'SKU is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Check for duplicate SKU
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('sku', sku)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'A product with this SKU already exists' },
        { status: 400 }
      );
    }

    // Insert new product
    const { data: newProduct, error } = await supabase
      .from('products')
      .insert({
        sku,
        parent_sku: parentSku || sku.split('-')[0], // Default parent SKU
        description,
        price: price ? parseFloat(price) : null,
        weight: weight ? parseFloat(weight) : null,
        stock_type: stockType,
        search_part_type: searchPartType,
        categories,
        in_stock: inStock,
        available_now: availableNow,
        available_1_to_3_days: available1to3Days,
        additional_info: additionalInfo,
        number_required: numberRequired,
        image_url: imageUrl,
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting product:', error);
      return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
    }

    return NextResponse.json({
      product: transformProductFromDB(newProduct),
      message: 'Product added successfully. Remember to export JSON for deployment.'
    });
  } catch (error) {
    console.error('Error adding product:', error);
    return NextResponse.json({
      error: error.message || 'Failed to add product'
    }, { status: 500 });
  }
}
