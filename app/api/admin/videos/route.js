import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateSession } from '@/lib/admin-auth';
import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import path from 'path';

// File paths for reading dropdown data and fallback
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

// GET - List all videos with optional filtering
export async function GET(request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (!validateSession(sessionToken)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';
    const verified = searchParams.get('verified');
    const search = searchParams.get('search') || '';

    const supabase = getSupabase();

    // Build query
    let query = supabase
      .from('technical_videos')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }

    if (verified === 'true') {
      query = query.eq('verified', true);
    } else if (verified === 'false') {
      query = query.eq('verified', false);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: videos, error } = await query;

    if (error) {
      console.error('Error fetching videos:', error);
      return NextResponse.json({ error: 'Failed to load videos' }, { status: 500 });
    }

    // Get stats
    const { data: allVideos, error: statsError } = await supabase
      .from('technical_videos')
      .select('verified');

    const stats = {
      total: allVideos?.length || 0,
      verified: allVideos?.filter(v => v.verified).length || 0,
      unverified: allVideos?.filter(v => !v.verified).length || 0,
    };

    // Get categories and dropdown data
    const [categories, dropdownData] = await Promise.all([
      getVideoCategories(supabase),
      getDropdownData()
    ]);

    return NextResponse.json({
      videos: videos.map(transformVideoFromDB),
      categories,
      stats,
      makes: dropdownData.makes,
      modelsByMake: dropdownData.modelsByMake,
      productCategories: dropdownData.productCategories,
      dataSource: 'supabase'
    });
  } catch (error) {
    console.error('Error loading videos:', error);
    return NextResponse.json({ error: 'Failed to load videos' }, { status: 500 });
  }
}

// POST - Add new video
export async function POST(request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (!validateSession(sessionToken)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      description,
      youtubeUrl,
      topicCategory,
      verified = false,
      makes = [],
      models = [],
      productCategories = []
    } = body;

    // Validate required fields
    if (!title || !youtubeUrl || !topicCategory) {
      return NextResponse.json(
        { error: 'Title, YouTube URL, and Topic Category are required' },
        { status: 400 }
      );
    }

    // Extract YouTube ID
    const youtubeId = extractYouTubeId(youtubeUrl);
    if (!youtubeId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL or video ID' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Check for duplicate YouTube ID
    const { data: existing } = await supabase
      .from('technical_videos')
      .select('id')
      .eq('youtube_id', youtubeId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'A video with this YouTube ID already exists' },
        { status: 400 }
      );
    }

    // Generate new ID (v001, v002, etc.)
    const { data: lastVideo } = await supabase
      .from('technical_videos')
      .select('id')
      .order('id', { ascending: false })
      .limit(1)
      .single();

    let newIdNum = 1;
    if (lastVideo?.id) {
      const num = parseInt(lastVideo.id.replace('v', ''));
      if (!isNaN(num)) newIdNum = num + 1;
    }
    const newId = `v${String(newIdNum).padStart(3, '0')}`;

    // Insert new video
    const { data: newVideo, error } = await supabase
      .from('technical_videos')
      .insert({
        id: newId,
        title,
        description: description || '',
        youtube_id: youtubeId,
        category: topicCategory,
        verified,
        makes,
        models,
        product_categories: productCategories,
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting video:', error);
      return NextResponse.json({ error: 'Failed to add video' }, { status: 500 });
    }

    return NextResponse.json({
      video: transformVideoFromDB(newVideo),
      message: 'Video added successfully'
    });
  } catch (error) {
    console.error('Error adding video:', error);
    return NextResponse.json({
      error: error.message || 'Failed to add video'
    }, { status: 500 });
  }
}
