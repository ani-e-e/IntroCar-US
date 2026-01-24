import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateSession } from '@/lib/admin-auth';
import { promises as fs } from 'fs';
import path from 'path';

const PRODUCTS_FILE = path.join(process.cwd(), 'data', 'json', 'products.json');

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

    const data = await fs.readFile(PRODUCTS_FILE, 'utf-8');
    let products = JSON.parse(data);

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(p =>
        p.sku?.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
      );
    }

    if (category) {
      products = products.filter(p => p.categories?.includes(category));
    }

    if (stockFilter === 'in') {
      products = products.filter(p => p.inStock);
    } else if (stockFilter === 'out') {
      products = products.filter(p => !p.inStock);
    }

    const total = products.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedProducts = products.slice(offset, offset + limit);

    // Get unique categories for filter dropdown
    const allData = JSON.parse(await fs.readFile(PRODUCTS_FILE, 'utf-8'));
    const categories = [...new Set(allData.map(p => p.categories).filter(Boolean))].sort();

    return NextResponse.json({
      products: paginatedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      categories,
    });
  } catch (error) {
    console.error('Error loading products:', error);
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
  }
}
