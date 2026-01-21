import { NextResponse } from 'next/server';
import { getLookbooks } from '@/lib/data-server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '24');
    const search = searchParams.get('search') || '';

    const result = getLookbooks({ page, limit, search });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Lookbooks API error:', error);
    return NextResponse.json({ error: 'Failed to load lookbooks' }, { status: 500 });
  }
}
