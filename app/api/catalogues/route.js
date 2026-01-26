import { NextResponse } from 'next/server';
import { getCatalogues } from '@/lib/data-server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '24');
    const search = searchParams.get('search') || '';
    const make = searchParams.get('make') || '';
    const model = searchParams.get('model') || '';
    const category = searchParams.get('category') || '';
    const subcategory = searchParams.get('subcategory') || '';
    const chassis = searchParams.get('chassis') || '';

    const result = getCatalogues({ page, limit, search, make, model, category, subcategory, chassis });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Catalogues API error:', error);
    return NextResponse.json({ error: 'Failed to load catalogues' }, { status: 500 });
  }
}
