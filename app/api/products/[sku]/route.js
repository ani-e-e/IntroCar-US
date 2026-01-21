import { NextResponse } from 'next/server';
import { getProductBySku } from '@/lib/data-server';

export async function GET(request, { params }) {
  try {
    const { sku } = params;
    const product = getProductBySku(sku);
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('Product API error:', error);
    return NextResponse.json({ error: 'Failed to fetch product', details: error.message }, { status: 500 });
  }
}
