import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

// Load video index
let videoIndex = null;

function loadVideoIndex() {
  if (videoIndex) return videoIndex;

  const jsonPath = path.join(process.cwd(), 'data', 'json', 'videos.json');
  if (fs.existsSync(jsonPath)) {
    videoIndex = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  } else {
    videoIndex = {};
  }
  return videoIndex;
}

function normalizeSku(sku) {
  if (!sku) return '';
  let normalized = sku.toUpperCase().trim();
  // Remove common suffixes for matching
  for (const suffix of ['-X', '-A', '-U', '.01', '.02']) {
    if (normalized.endsWith(suffix)) {
      normalized = normalized.slice(0, -suffix.length);
    }
  }
  return normalized;
}

export async function GET(request, { params }) {
  const { sku } = params;
  const index = loadVideoIndex();

  // Try exact match first
  let videoData = index[sku.toUpperCase()];

  // Try normalized match
  if (!videoData) {
    const normalizedSku = normalizeSku(sku);
    videoData = index[normalizedSku];
  }

  // Try without common prefixes
  if (!videoData) {
    const baseSku = sku.toUpperCase().replace(/^(PP|IC|UR|RH|UE|UT|CD|PD|PU)-?/, '');
    videoData = index[baseSku];
  }

  if (videoData) {
    return NextResponse.json({
      hasVideo: true,
      folder: videoData.folder,
      file: videoData.file,
      allFiles: videoData.allFiles,
      // Video URL will be served from the Turntable mount
      videoUrl: `/api/videos/stream/${encodeURIComponent(videoData.folder)}/${encodeURIComponent(videoData.file)}`
    });
  }

  return NextResponse.json({ hasVideo: false });
}
