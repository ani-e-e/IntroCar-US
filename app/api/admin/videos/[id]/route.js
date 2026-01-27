import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateSession } from '@/lib/admin-auth';
import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import path from 'path';

const VEHICLES_FILE = path.join(process.cwd(), 'data', 'json', 'vehicles.json');
const PRODUCTS_FILE = path.join(process.cwd(), 'data', 'json', 'products.json');

// Initialize Supabase client lazily
function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
}

// Helper to extract YouTube video ID from URL
function extractYouTubeId(url) {
  if (!url) return null;

  // Already just an ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  // Various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

// Helper to get vehicle and category data for dropdowns
async function getDropdownData() {
  try {
    const [vehiclesRaw, productsRaw] = await Promise.all([
      fs.readFile(VEHICLES_FILE, 'utf-8'),
      fs.readFile(PRODUCTS_FILE, 'utf-8')
    ]);

    const vehicles = JSON.parse(vehiclesRaw);
    const products = JSON.parse(productsRaw);

    // Extract unique makes
    const makes = [...new Set(vehicles.map(v => v.make))].sort();

    // Extract models grouped by make
    const modelsByMake = {};
    vehicles.forEach(v => {
      if (!modelsByMake[v.make]) modelsByMake[v.make] = new Set();
      modelsByMake[v.make].add(v.model);
    });
    Object.keys(modelsByMake).forEach(make => {
      modelsByMake[make] = [...modelsByMake[make]].sort();
    });

    // Extract main product categories
    const productCategories = [...new Set(products.map(p => {
      if (p.categories) return p.categories.split('/')[0].split('|')[0];
      return null;
    }).filter(Boolean))].sort();

    return { makes, modelsByMake, productCategories };
  } catch (error) {
    console.error('Error loading dropdown data:', error);
    return { makes: [], modelsByMake: {}, productCategories: [] };
  }
}

// Transform Supabase row to frontend format
function transformVideoFromDB(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    youtubeId: row.youtube_id,
    category: row.category,
    verified: row.verified,
    makes: row.makes || [],
    models: row.models || [],
    productCategories: row.product_categories || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Get video categories from Supabase
async function getVideoCategories(supabase) {
  const { data, error } = await supabase
    .from('video_categories')
    .select('name')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching video categories:', error);
    return ['Continental GT', 'Brakes', 'Suspension', 'Engine', 'Service', 'Hydraulics', 'Diagnostics'];
  }

  return data.map(c => c.name);
}

// GET - Get single video by ID
export async function GET(request, { params }) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (!validateSession(sessionToken)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const supabase = getSupabase();

    const { data: video, error } = await supabase
      .from('technical_videos')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Get dropdown data for the edit form
    const [categories, dropdownData] = await Promise.all([
      getVideoCategories(supabase),
      getDropdownData()
    ]);

    return NextResponse.json({
      video: transformVideoFromDB(video),
      topicCategories: categories,
      makes: dropdownData.makes,
      modelsByMake: dropdownData.modelsByMake,
      productCategories: dropdownData.productCategories
    });
  } catch (error) {
    console.error('Error loading video:', error);
    return NextResponse.json({ error: 'Failed to load video' }, { status: 500 });
  }
}

// PUT - Update video
export async function PUT(request, { params }) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (!validateSession(sessionToken)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      description,
      youtubeUrl,
      topicCategory,  // Single topic (Brakes, Engine, etc.)
      verified,
      makes,          // Array of makes (Bentley, Rolls-Royce)
      models,         // Array of models
      productCategories  // Array of product categories
    } = body;

    const supabase = getSupabase();

    // First check if video exists
    const { data: existing, error: fetchError } = await supabase
      .from('technical_videos')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Build update object
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (verified !== undefined) updateData.verified = verified;
    if (topicCategory !== undefined) updateData.category = topicCategory;
    if (makes !== undefined) updateData.makes = makes;
    if (models !== undefined) updateData.models = models;
    if (productCategories !== undefined) updateData.product_categories = productCategories;

    // Handle YouTube URL update
    if (youtubeUrl !== undefined) {
      const youtubeId = extractYouTubeId(youtubeUrl);
      if (!youtubeId) {
        return NextResponse.json(
          { error: 'Invalid YouTube URL or video ID' },
          { status: 400 }
        );
      }

      // Check for duplicate (excluding current video)
      const { data: duplicate } = await supabase
        .from('technical_videos')
        .select('id')
        .eq('youtube_id', youtubeId)
        .neq('id', id)
        .single();

      if (duplicate) {
        return NextResponse.json(
          { error: 'Another video with this YouTube ID already exists' },
          { status: 400 }
        );
      }

      updateData.youtube_id = youtubeId;
    }

    // Update the video
    const { data: updatedVideo, error: updateError } = await supabase
      .from('technical_videos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating video:', updateError);
      return NextResponse.json({ error: 'Failed to update video' }, { status: 500 });
    }

    return NextResponse.json({
      video: transformVideoFromDB(updatedVideo),
      message: 'Video updated successfully'
    });
  } catch (error) {
    console.error('Error updating video:', error);
    return NextResponse.json({
      error: error.message || 'Failed to update video'
    }, { status: 500 });
  }
}

// DELETE - Remove video
export async function DELETE(request, { params }) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (!validateSession(sessionToken)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const supabase = getSupabase();

    // First get the video to return in response
    const { data: video, error: fetchError } = await supabase
      .from('technical_videos')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Delete the video
    const { error: deleteError } = await supabase
      .from('technical_videos')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting video:', deleteError);
      return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Video deleted successfully',
      deletedVideo: transformVideoFromDB(video)
    });
  } catch (error) {
    console.error('Error deleting video:', error);
    return NextResponse.json({
      error: error.message || 'Failed to delete video'
    }, { status: 500 });
  }
}
