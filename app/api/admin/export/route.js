import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateSession } from '@/lib/admin-auth';
import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import path from 'path';

// Initialize Supabase client
function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
}

// Fetch all rows with pagination
async function fetchAll(supabase, tableName, orderBy = 'id') {
  let allRows = [];
  let offset = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order(orderBy, { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (error) throw new Error(`Error fetching ${tableName}: ${error.message}`);
    if (data.length === 0) {
      hasMore = false;
    } else {
      allRows = allRows.concat(data);
      offset += pageSize;
      hasMore = data.length === pageSize;
    }
  }
  return allRows;
}

// Transform functions
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

function transformVideo(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    youtubeId: row.youtube_id,
    category: row.category,
    verified: row.verified,
    makes: row.makes || [],
    models: row.models || [],
    productCategories: row.product_categories || [],
  };
}

function transformCatalogue(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    subcategory: row.subcategory,
    image: row.image,
    imageUrl: row.image_url,
    cmsUrl: row.cms_url,
    catalogueLink: row.catalogue_link,
    makes: row.makes || [],
    models: row.models || [],
    hotspots: row.hotspots || [],
  };
}

function transformVehicle(row) {
  return {
    make: row.make,
    model: row.model,
    yearStart: row.year_start,
    yearEnd: row.year_end,
  };
}

/**
 * GET - Get export status and available exports
 */
export async function GET(request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (!validateSession(sessionToken)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dataDir = path.join(process.cwd(), 'data', 'json');

  try {
    // Get last modified times for each JSON file
    const files = ['products.json', 'technical-videos.json', 'lookbooks.json', 'vehicles.json'];
    const fileStats = {};

    for (const file of files) {
      try {
        const stat = await fs.stat(path.join(dataDir, file));
        fileStats[file] = {
          exists: true,
          lastModified: stat.mtime.toISOString(),
          size: stat.size,
        };
      } catch {
        fileStats[file] = { exists: false };
      }
    }

    return NextResponse.json({
      exports: fileStats,
      dataDirectory: dataDir,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST - Run an export
 * Body: { type: 'products' | 'videos' | 'catalogues' | 'vehicles' | 'all' }
 */
export async function POST(request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (!validateSession(sessionToken)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { type = 'all' } = await request.json();
    const supabase = getSupabase();
    const dataDir = path.join(process.cwd(), 'data', 'json');
    const results = {};

    // Export products
    if (type === 'all' || type === 'products') {
      const rows = await fetchAll(supabase, 'products', 'sku');
      const transformed = rows.map(transformProduct);
      await fs.writeFile(
        path.join(dataDir, 'products.json'),
        JSON.stringify(transformed, null, 2)
      );
      results.products = { count: transformed.length, success: true };
    }

    // Export videos
    if (type === 'all' || type === 'videos') {
      const rows = await fetchAll(supabase, 'technical_videos', 'id');
      const transformed = rows.map(transformVideo);
      await fs.writeFile(
        path.join(dataDir, 'technical-videos.json'),
        JSON.stringify(transformed, null, 2)
      );
      results.videos = { count: transformed.length, success: true };
    }

    // Export catalogues
    if (type === 'all' || type === 'catalogues') {
      const rows = await fetchAll(supabase, 'catalogues', 'id');
      const transformed = rows.map(transformCatalogue);
      await fs.writeFile(
        path.join(dataDir, 'lookbooks.json'),
        JSON.stringify(transformed, null, 2)
      );
      results.catalogues = { count: transformed.length, success: true };
    }

    // Export vehicles
    if (type === 'all' || type === 'vehicles') {
      const rows = await fetchAll(supabase, 'vehicles', 'make');
      const transformed = rows.map(transformVehicle);
      await fs.writeFile(
        path.join(dataDir, 'vehicles.json'),
        JSON.stringify(transformed, null, 2)
      );
      results.vehicles = { count: transformed.length, success: true };
    }

    return NextResponse.json({
      success: true,
      results,
      message: 'Export complete. Remember to commit and push the JSON files to deploy.',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
