import { NextResponse } from 'next/server';
import { getCatalogueById } from '@/lib/data-server';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    // Decode the URL-encoded catalogue ID
    const catalogueId = decodeURIComponent(params.id);

    if (!catalogueId) {
      return NextResponse.json({ error: 'Catalogue ID required' }, { status: 400 });
    }

    const catalogue = getCatalogueById(catalogueId);

    if (!catalogue) {
      return NextResponse.json({ error: 'Catalogue not found' }, { status: 404 });
    }

    return NextResponse.json(catalogue);
  } catch (error) {
    console.error('Catalogue detail API error:', error);
    return NextResponse.json({ error: 'Failed to load catalogue' }, { status: 500 });
  }
}
