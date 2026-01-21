import { NextResponse } from 'next/server';
import { getLookbookById } from '@/lib/data-server';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const lookbookId = params.id;

    if (!lookbookId) {
      return NextResponse.json({ error: 'Lookbook ID required' }, { status: 400 });
    }

    const lookbook = getLookbookById(lookbookId);

    if (!lookbook) {
      return NextResponse.json({ error: 'Lookbook not found' }, { status: 404 });
    }

    return NextResponse.json(lookbook);
  } catch (error) {
    console.error('Lookbook detail API error:', error);
    return NextResponse.json({ error: 'Failed to load lookbook' }, { status: 500 });
  }
}
