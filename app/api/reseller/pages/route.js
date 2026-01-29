import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

/**
 * Public API for fetching reseller CMS pages
 * GET /api/reseller/pages?tenant=beroparts
 * GET /api/reseller/pages?tenant=beroparts&page=services
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenant = searchParams.get('tenant');
    const page = searchParams.get('page');

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant parameter required' }, { status: 400 });
    }

    const supabase = getSupabase();

    if (!supabase) {
      // Return empty if no database
      return NextResponse.json({ pages: [], page: null });
    }

    // If specific page requested
    if (page) {
      const { data: pageData, error } = await supabase
        .from('reseller_pages')
        .select('*')
        .eq('reseller_slug', tenant)
        .eq('page_slug', page)
        .eq('is_published', true)
        .single();

      if (error || !pageData) {
        return NextResponse.json({ page: null }, { status: 404 });
      }

      return NextResponse.json({ page: pageData });
    }

    // List all published pages for navigation
    const { data: pages, error } = await supabase
      .from('reseller_pages')
      .select('page_slug, title, show_in_nav, nav_order')
      .eq('reseller_slug', tenant)
      .eq('is_published', true)
      .order('nav_order', { ascending: true });

    if (error) {
      console.error('Error fetching pages:', error);
      return NextResponse.json({ pages: [] });
    }

    return NextResponse.json({ pages: pages || [] });
  } catch (error) {
    console.error('Reseller pages API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
