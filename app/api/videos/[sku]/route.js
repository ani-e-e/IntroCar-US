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
  const { searchParams } = new URL(request.url);
  const parentSku = searchParams.get('parentSku');
  const index = loadVideoIndex();

  let videoData = null;

  // Videos are typically keyed by PARENT SKU, so try that first
  if (parentSku) {
    videoData = index[parentSku.toUpperCase()];

    // Try normalized parent SKU
    if (!videoData) {
      const normalizedParent = normalizeSku(parentSku);
      videoData = index[normalizedParent];
    }
  }

  // Fall back to trying the product SKU directly
  if (!videoData) {
    videoData = index[sku.toUpperCase()];
  }

  // Try normalized match
  if (!videoData) {
    const normalizedSku = normalizeSku(sku);
    videoData = index[normalizedSku];
  }

  // Try stripping version suffixes like .01, -01, -03
  if (!videoData) {
    const baseSku = sku.toUpperCase().replace(/[\.-]\d+$/, '');
    videoData = index[baseSku];
  }

  // Try without common prefixes
  if (!videoData) {
    const baseSku = sku.toUpperCase().replace(/^(PP|IC|UR|RH|UE|UT|CD|PD|PU)-?/, '');
    videoData = index[baseSku];
  }

  if (videoData) {
    // Cloudinary video URL format
    // Videos are stored as: Turntable/{folder}/{file}
    const cloudinaryBase = 'https://res.cloudinary.com/durzkoyfb/video/upload';
    const videoPath = `Turntable/${videoData.folder}/${videoData.file.replace('.mp4', '')}`;

    return NextResponse.json({
      hasVideo: true,
      folder: videoData.folder,
      file: videoData.file,
      allFiles: videoData.allFiles,
      // Cloudinary video URL with auto quality and format
      videoUrl: `${cloudinaryBase}/q_auto/${videoPath}.mp4`
    });
  }

  return NextResponse.json({ hasVideo: false });
}
