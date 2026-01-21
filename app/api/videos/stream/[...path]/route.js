import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

// Path to the Turntable video folder - configurable via environment variable
const VIDEO_BASE_PATH = process.env.VIDEO_SOURCE_PATH || '/sessions/practical-relaxed-newton/mnt/Christian Domini - Turntable';

export async function GET(request, { params }) {
  const pathParts = params.path;

  if (!pathParts || pathParts.length < 2) {
    return new NextResponse('Invalid path', { status: 400 });
  }

  const folder = decodeURIComponent(pathParts[0]);
  const file = decodeURIComponent(pathParts[1]);

  // Sanitize path components to prevent directory traversal
  if (folder.includes('..') || file.includes('..')) {
    return new NextResponse('Invalid path', { status: 400 });
  }

  const videoPath = path.join(VIDEO_BASE_PATH, folder, file);

  // Check if file exists
  if (!fs.existsSync(videoPath)) {
    return new NextResponse('Video not found', { status: 404 });
  }

  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;

  // Handle range requests for video seeking
  const range = request.headers.get('range');

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    const fileStream = fs.createReadStream(videoPath, { start, end });

    return new NextResponse(fileStream, {
      status: 206,
      headers: {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize.toString(),
        'Content-Type': 'video/mp4',
      },
    });
  }

  // Full file request
  const fileStream = fs.createReadStream(videoPath);

  return new NextResponse(fileStream, {
    headers: {
      'Content-Length': fileSize.toString(),
      'Content-Type': 'video/mp4',
    },
  });
}
