import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateSession } from '@/lib/admin-auth';
import { promises as fs } from 'fs';
import path from 'path';

const VIDEOS_FILE = path.join(process.cwd(), 'data', 'json', 'technical-videos.json');

// Helper to read videos data
async function getVideosData() {
  const data = await fs.readFile(VIDEOS_FILE, 'utf-8');
  return JSON.parse(data);
}

// Helper to write videos data
async function saveVideosData(data) {
  await fs.writeFile(VIDEOS_FILE, JSON.stringify(data, null, 2));
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

// GET - Get single video by ID
export async function GET(request, { params }) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (!validateSession(sessionToken)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const data = await getVideosData();
    const video = data.videos.find(v => v.id === id);

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json({ video, categories: data.categories });
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
    const { title, description, youtubeUrl, category, verified } = body;

    const data = await getVideosData();
    const videoIndex = data.videos.findIndex(v => v.id === id);

    if (videoIndex === -1) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const video = data.videos[videoIndex];

    // Update fields if provided
    if (title !== undefined) video.title = title;
    if (description !== undefined) video.description = description;
    if (verified !== undefined) video.verified = verified;

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
      if (data.videos.some(v => v.id !== id && v.youtubeId === youtubeId)) {
        return NextResponse.json(
          { error: 'Another video with this YouTube ID already exists' },
          { status: 400 }
        );
      }

      video.youtubeId = youtubeId;
    }

    // Handle category update
    if (category !== undefined) {
      if (!data.categories.includes(category)) {
        return NextResponse.json(
          { error: `Invalid category. Must be one of: ${data.categories.join(', ')}` },
          { status: 400 }
        );
      }
      video.category = category;
    }

    video.updatedAt = new Date().toISOString();
    data.videos[videoIndex] = video;

    await saveVideosData(data);

    return NextResponse.json({ video, message: 'Video updated successfully' });
  } catch (error) {
    console.error('Error updating video:', error);
    return NextResponse.json({ error: 'Failed to update video' }, { status: 500 });
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
    const data = await getVideosData();
    const videoIndex = data.videos.findIndex(v => v.id === id);

    if (videoIndex === -1) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const deletedVideo = data.videos[videoIndex];
    data.videos.splice(videoIndex, 1);

    await saveVideosData(data);

    return NextResponse.json({
      message: 'Video deleted successfully',
      deletedVideo
    });
  } catch (error) {
    console.error('Error deleting video:', error);
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 });
  }
}
