import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabase } from '@/lib/supabase';

// Check admin authentication
function isAdmin(cookieStore) {
  const adminCookie = cookieStore.get('admin_authenticated');
  return adminCookie?.value === 'true';
}

// GET /api/admin/resellers/[slug]/pages/[pageSlug] - Get a specific page
export async function GET(request, { params }) {
  try {
    const cookieStore = await cookies();
    if (!isAdmin(cookieStore)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug, pageSlug } = await params;
    const supabase = getSupabase();

    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { data: page, error } = await supabase
      .from('reseller_pages')
      .select('*')
      .eq('reseller_slug', slug)
      .eq('page_slug', pageSlug)
      .single();

    if (error || !page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json({ page });
  } catch (error) {
    console.error('Get page error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/resellers/[slug]/pages/[pageSlug] - Update a page
export async function PUT(request, { params }) {
  try {
    const cookieStore = await cookies();
    if (!isAdmin(cookieStore)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug, pageSlug } = await params;
    const body = await request.json();
    const supabase = getSupabase();

    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Build update object with only provided fields
    const updates = {};
    if (body.title !== undefined) updates.title = body.title;
    if (body.content !== undefined) updates.content = body.content;
    if (body.meta_description !== undefined) updates.meta_description = body.meta_description;
    if (body.is_published !== undefined) updates.is_published = body.is_published;
    if (body.show_in_nav !== undefined) updates.show_in_nav = body.show_in_nav;
    if (body.nav_order !== undefined) updates.nav_order = body.nav_order;

    // Handle page slug change
    if (body.page_slug && body.page_slug !== pageSlug) {
      const newSlug = body.page_slug.toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      const reservedSlugs = ['products', 'about', 'contact', 'parts-request', 'cart', 'checkout'];
      if (reservedSlugs.includes(newSlug)) {
        return NextResponse.json({ error: `"${newSlug}" is a reserved page slug` }, { status: 400 });
      }
      updates.page_slug = newSlug;
    }

    const { data: page, error } = await supabase
      .from('reseller_pages')
      .update(updates)
      .eq('reseller_slug', slug)
      .eq('page_slug', pageSlug)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A page with this slug already exists' }, { status: 409 });
      }
      console.error('Error updating page:', error);
      return NextResponse.json({ error: 'Failed to update page' }, { status: 500 });
    }

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json({ page, message: 'Page updated successfully' });
  } catch (error) {
    console.error('Update page error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/resellers/[slug]/pages/[pageSlug] - Delete a page
export async function DELETE(request, { params }) {
  try {
    const cookieStore = await cookies();
    if (!isAdmin(cookieStore)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug, pageSlug } = await params;
    const supabase = getSupabase();

    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { error } = await supabase
      .from('reseller_pages')
      .delete()
      .eq('reseller_slug', slug)
      .eq('page_slug', pageSlug);

    if (error) {
      console.error('Error deleting page:', error);
      return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Delete page error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
