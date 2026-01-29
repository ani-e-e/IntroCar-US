import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabase } from '@/lib/supabase';

// Check admin authentication
function isAdmin(cookieStore) {
  const adminCookie = cookieStore.get('admin_authenticated');
  return adminCookie?.value === 'true';
}

// GET /api/admin/resellers/[slug]/pages - List all pages for a reseller
export async function GET(request, { params }) {
  try {
    const cookieStore = await cookies();
    if (!isAdmin(cookieStore)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    const supabase = getSupabase();

    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { data: pages, error } = await supabase
      .from('reseller_pages')
      .select('*')
      .eq('reseller_slug', slug)
      .order('nav_order', { ascending: true });

    if (error) {
      console.error('Error fetching pages:', error);
      return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
    }

    return NextResponse.json({ pages: pages || [] });
  } catch (error) {
    console.error('Pages API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/resellers/[slug]/pages - Create a new page
export async function POST(request, { params }) {
  try {
    const cookieStore = await cookies();
    if (!isAdmin(cookieStore)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    const body = await request.json();
    const supabase = getSupabase();

    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Validate required fields
    if (!body.page_slug || !body.title) {
      return NextResponse.json({ error: 'Page slug and title are required' }, { status: 400 });
    }

    // Sanitize page slug
    const pageSlug = body.page_slug.toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // Check for reserved slugs
    const reservedSlugs = ['products', 'about', 'contact', 'parts-request', 'cart', 'checkout'];
    if (reservedSlugs.includes(pageSlug)) {
      return NextResponse.json({ error: `"${pageSlug}" is a reserved page slug` }, { status: 400 });
    }

    const { data: page, error } = await supabase
      .from('reseller_pages')
      .insert({
        reseller_slug: slug,
        page_slug: pageSlug,
        title: body.title,
        content: body.content || '',
        meta_description: body.meta_description || '',
        is_published: body.is_published !== false,
        show_in_nav: body.show_in_nav !== false,
        nav_order: body.nav_order || 100,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A page with this slug already exists' }, { status: 409 });
      }
      console.error('Error creating page:', error);
      return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
    }

    return NextResponse.json({ page, message: 'Page created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Create page error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
