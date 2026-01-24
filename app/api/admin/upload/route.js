import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateSession } from '@/lib/admin-auth';
import { promises as fs } from 'fs';
import path from 'path';

const PRODUCTS_FILE = path.join(process.cwd(), 'data', 'json', 'products.json');

// Parse CSV content
function parseCSV(csvContent) {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) return { headers: [], rows: [] };

  // Handle quoted fields and commas within quotes
  const parseLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]).map(h => h.toLowerCase().trim());
  const rows = lines.slice(1).map(line => {
    const values = parseLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    return row;
  });

  return { headers, rows };
}

// Map CSV headers to product fields
const FIELD_MAPPINGS = {
  'sku': 'sku',
  'part_number': 'sku',
  'partnumber': 'sku',
  'description': 'description',
  'title': 'description',
  'name': 'description',
  'price': 'price',
  'price_usd': 'price',
  'usd_price': 'price',
  'weight': 'weight',
  'weight_kg': 'weight',
  'categories': 'categories',
  'category': 'categories',
  'stock_type': 'stockType',
  'stocktype': 'stockType',
  'type': 'stockType',
  'in_stock': 'inStock',
  'instock': 'inStock',
  'available': 'inStock',
  'available_now': 'availableNow',
  'availablenow': 'availableNow',
  'qty': 'availableNow',
  'quantity': 'availableNow',
  'stock': 'availableNow',
  'available_1_3': 'available1to3Days',
  'available1to3days': 'available1to3Days',
};

export async function POST(request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (!validateSession(sessionToken)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const previewOnly = formData.get('preview') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const csvContent = await file.text();
    const { headers, rows } = parseCSV(csvContent);

    if (!headers.includes('sku') && !headers.includes('part_number') && !headers.includes('partnumber')) {
      return NextResponse.json({
        error: 'CSV must have a SKU column (sku, part_number, or partnumber)'
      }, { status: 400 });
    }

    // Load current products
    const data = await fs.readFile(PRODUCTS_FILE, 'utf-8');
    const products = JSON.parse(data);
    const productMap = new Map(products.map(p => [p.sku, p]));

    // Map headers to fields
    const fieldMap = {};
    headers.forEach(header => {
      const mapped = FIELD_MAPPINGS[header];
      if (mapped) {
        fieldMap[header] = mapped;
      }
    });

    // Process updates
    const updates = [];
    const notFound = [];
    const errors = [];

    rows.forEach((row, index) => {
      const sku = row.sku || row.part_number || row.partnumber;
      if (!sku) {
        errors.push({ row: index + 2, error: 'Missing SKU' });
        return;
      }

      const existingProduct = productMap.get(sku);
      if (!existingProduct) {
        notFound.push(sku);
        return;
      }

      const changes = {};
      Object.entries(fieldMap).forEach(([csvHeader, productField]) => {
        if (csvHeader === 'sku' || csvHeader === 'part_number' || csvHeader === 'partnumber') return;

        const value = row[csvHeader];
        if (value === '' || value === undefined) return;

        // Parse values based on field type
        let parsedValue;
        if (productField === 'price' || productField === 'weight') {
          parsedValue = parseFloat(value);
          if (isNaN(parsedValue)) return;
        } else if (productField === 'availableNow' || productField === 'available1to3Days') {
          parsedValue = parseInt(value);
          if (isNaN(parsedValue)) return;
        } else if (productField === 'inStock') {
          parsedValue = value.toLowerCase() === 'true' || value === '1' || value.toLowerCase() === 'yes';
        } else {
          parsedValue = value;
        }

        // Only track if different from existing
        if (existingProduct[productField] !== parsedValue) {
          changes[productField] = {
            old: existingProduct[productField],
            new: parsedValue,
          };
        }
      });

      if (Object.keys(changes).length > 0) {
        updates.push({ sku, changes });
      }
    });

    // If preview only, return what would change
    if (previewOnly) {
      return NextResponse.json({
        success: true,
        preview: true,
        summary: {
          totalRows: rows.length,
          productsToUpdate: updates.length,
          productsNotFound: notFound.length,
          errors: errors.length,
        },
        mappedFields: Object.entries(fieldMap).map(([csv, product]) => `${csv} → ${product}`),
        updates: updates.slice(0, 100), // Limit preview
        notFound: notFound.slice(0, 50),
        errors,
      });
    }

    // Apply updates
    let updatedCount = 0;
    updates.forEach(({ sku, changes }) => {
      const product = productMap.get(sku);
      if (product) {
        Object.entries(changes).forEach(([field, { new: newValue }]) => {
          product[field] = newValue;
        });
        product.lastModified = new Date().toISOString();
        product.pendingSync = true;
        updatedCount++;
      }
    });

    // Save updated products
    const updatedProducts = Array.from(productMap.values());
    await fs.writeFile(PRODUCTS_FILE, JSON.stringify(updatedProducts, null, 2));

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedCount} products. Remember to sync to Magento.`,
      summary: {
        totalRows: rows.length,
        productsUpdated: updatedCount,
        productsNotFound: notFound.length,
        errors: errors.length,
      },
      notFound: notFound.slice(0, 50),
      errors,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to process CSV' }, { status: 500 });
  }
}
