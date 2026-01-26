import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateSession } from '@/lib/admin-auth';
import { promises as fs } from 'fs';
import path from 'path';

const VIDEOS_FILE = path.join(process.cwd(), 'data', 'json', 'technical-videos.json');
const VEHICLES_FILE = path.join(process.cwd(), 'data', 'json', 'vehicles.json');
const PRODUCTS_FILE = path.join(process.cwd(), 'data', 'json', 'products.json');

// Helper to read videos data
async function getVideosData() {
  const data = await fs.readFile(VIDEOS_FILE, 'utf-8');
  return JSON.parse(data);
}

// Helper to write videos data
async function saveVideosData(data) {
  try {
    await fs.writeFile(VIDEOS_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing videos file:', error);
    throw new Error('Cannot save changes. The filesystem may be read-only.');
  }
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

    const data = await getVideosData();
    let videos = data.videos || [];

    // Apply filters
    if (category) {
      videos = videos.filter(v => v.category === category);
    }

    if (verified === 'true') {
      videos = videos.filter(v => v.verified === true);
    } else if (verified === 'false') {
      videos = videos.filter(v => v.verified === false);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      videos = videos.filter(v =>
        v.title?.toLowerCase().includes(searchLower) ||
        v.description?.toLowerCase().includes(searchLower)
      );
    }

    // Get stats
    const allVideos = data.videos || [];
    const stats = {
      total: allVideos.length,
      verified: allVideos.filter(v => v.verified).length,
      unverified: allVideos.filter(v => !v.verified).length,
    };

    // Get dropdown data for add/edit forms
    const { makes, modelsByMake, productCategories } = await getDropdownData();

    return NextResponse.json({
      videos,
      categories: data.categories || [],
      stats,
      makes,
      modelsByMake,
      productCategories
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

    const data = await getVideosData();

    // Check for duplicate YouTube ID
    if (data.videos.some(v => v.youtubeId === youtubeId)) {
      return NextResponse.json(
        { error: 'A video with this YouTube ID already exists' },
        { status: 400 }
      );
    }

    // Generate new ID
    const existingIds = data.videos.map(v => parseInt(v.id.replace('v', '')));
    const newIdNum = Math.max(...existingIds, 0) + 1;
    const newId = `v${String(newIdNum).padStart(3, '0')}`;

    const now = new Date().toISOString();
    const newVideo = {
      id: newId,
      title,
      description: description || '',
      youtubeId,
      category: topicCategory,
      verified,
      makes,
      models,
      productCategories,
      createdAt: now,
      updatedAt: now,
    };

    data.videos.push(newVideo);
    await saveVideosData(data);

    return NextResponse.json({ video: newVideo, message: 'Video added successfully' });
  } catch (error) {
    console.error('Error adding video:', error);
    return NextResponse.json({
      error: error.message || 'Failed to add video'
    }, { status: 500 });
  }
}
