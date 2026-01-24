import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateSession } from '@/lib/admin-auth';
import { promises as fs } from 'fs';
import path from 'path';

const PRODUCTS_FILE = path.join(process.cwd(), 'data', 'json', 'products.json');

// GET - Get single product by SKU
export async function GET(request, { params }) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (!validateSession(sessionToken)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { sku } = await params;
    const data = await fs.readFile(PRODUCTS_FILE, 'utf-8');
    const products = JSON.parse(data);
    const product = products.find(p => p.sku === sku);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
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

    const data = await fs.readFile(PRODUCTS_FILE, 'utf-8');
    const products = JSON.parse(data);
    const index = products.findIndex(p => p.sku === sku);

    if (index === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Only allow updating specific fields
    const allowedFields = [
      'description',
      'price',
      'weight',
      'categories',
      'stockType',
      'inStock',
      'availableNow',
      'available1to3Days',
      'additionalInfo',
    ];

    const updatedProduct = { ...products[index] };
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updatedProduct[field] = updates[field];
      }
    }

    // Add modification timestamp
    updatedProduct.lastModified = new Date().toISOString();
    updatedProduct.pendingSync = true;

    products[index] = updatedProduct;

    await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2));

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: 'Product updated. Remember to sync to Magento.'
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
