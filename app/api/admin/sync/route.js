import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateSession } from '@/lib/admin-auth';
import { promises as fs } from 'fs';
import path from 'path';

const PRODUCTS_FILE = path.join(process.cwd(), 'data', 'json', 'products.json');

// GET - Get pending sync count
export async function GET() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (!validateSession(sessionToken)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await fs.readFile(PRODUCTS_FILE, 'utf-8');
    const products = JSON.parse(data);
    const pending = products.filter(p => p.pendingSync);

    return NextResponse.json({
      pendingCount: pending.length,
      pendingProducts: pending.slice(0, 100).map(p => ({
        sku: p.sku,
        description: p.description,
        lastModified: p.lastModified,
      })),
      magentoConfigured: !!(process.env.MAGENTO_BASE_URL && process.env.MAGENTO_ACCESS_TOKEN),
    });
  } catch (error) {
    console.error('Error getting sync status:', error);
    return NextResponse.json({ error: 'Failed to get sync status' }, { status: 500 });
  }
}

// POST - Sync to Magento
export async function POST(request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (!validateSession(sessionToken)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const magentoBaseUrl = process.env.MAGENTO_BASE_URL;
  const magentoToken = process.env.MAGENTO_ACCESS_TOKEN;

  if (!magentoBaseUrl || !magentoToken) {
    return NextResponse.json({
      error: 'Magento not configured. Add MAGENTO_BASE_URL and MAGENTO_ACCESS_TOKEN to environment variables.'
    }, { status: 400 });
  }

  try {
    const { skus } = await request.json();

    const data = await fs.readFile(PRODUCTS_FILE, 'utf-8');
    const products = JSON.parse(data);
    const productMap = new Map(products.map(p => [p.sku, p]));

    // Get products to sync
    let toSync;
    if (skus && skus.length > 0) {
      toSync = skus.map(sku => productMap.get(sku)).filter(Boolean);
    } else {
      toSync = products.filter(p => p.pendingSync);
    }

    if (toSync.length === 0) {
      return NextResponse.json({ message: 'No products to sync' });
    }

    const results = {
      success: [],
      failed: [],
    };

    // Sync each product to Magento
    for (const product of toSync) {
      try {
        // Magento product update payload
        const magentoProduct = {
          product: {
            sku: product.sku,
            name: product.description,
            price: product.price,
            weight: product.weight,
            status: product.inStock ? 1 : 0,
            extension_attributes: {
              stock_item: {
                qty: product.availableNow || 0,
                is_in_stock: product.inStock,
              },
            },
          },
        };

        const response = await fetch(
          `${magentoBaseUrl}/rest/V1/products/${encodeURIComponent(product.sku)}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${magentoToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(magentoProduct),
          }
        );

        if (response.ok) {
          results.success.push(product.sku);
          // Clear pending flag
          const p = productMap.get(product.sku);
          if (p) {
            p.pendingSync = false;
            p.lastSynced = new Date().toISOString();
          }
        } else {
          const errorText = await response.text();
          results.failed.push({ sku: product.sku, error: errorText });
        }
      } catch (err) {
        results.failed.push({ sku: product.sku, error: err.message });
      }
    }

    // Save updated products (with cleared pendingSync flags)
    await fs.writeFile(PRODUCTS_FILE, JSON.stringify(Array.from(productMap.values()), null, 2));

    return NextResponse.json({
      message: `Synced ${results.success.length} products to Magento`,
      results,
    });

  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: 'Failed to sync' }, { status: 500 });
  }
}
