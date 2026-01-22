/**
 * Cloudinary Video Upload Script for IntroCar US
 * Uploads PROCESSED videos (edited & shortened) to Cloudinary
 *
 * SETUP:
 * 1. Make sure your .env file has Cloudinary credentials
 * 2. Run: node scripts/upload-processed-videos.js
 */

const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// ============================================
// CONFIGURATION
// ============================================

// Path to the CSV mapping file (in project root)
const CSV_PATH = path.join(__dirname, '..', 'Video File Links.csv');

// Cloudinary folder for videos
const CLOUDINARY_FOLDER = 'introcar-us/videos';

// How many videos to upload at once
const BATCH_SIZE = 3;

// Delay between batches (milliseconds)
const BATCH_DELAY = 2000;

// ============================================
// SETUP
// ============================================

// Load .env file
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
  console.log('✅ Loaded .env file');
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const dataDir = path.join(__dirname, '..', 'data', 'json');

// ============================================
// HELPER FUNCTIONS
// ============================================

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function parseCSV(content) {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row = {};
    headers.forEach((header, index) => {
      row[header.trim()] = (values[index] || '').trim();
    });
    rows.push(row);
  }

  return rows;
}

async function uploadVideo(localPath, parentSku) {
  try {
    const publicId = `${CLOUDINARY_FOLDER}/${parentSku}`;

    const result = await cloudinary.uploader.upload(localPath, {
      public_id: publicId,
      resource_type: 'video',
      overwrite: false,
      chunk_size: 6000000,
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      size: result.bytes,
    };
  } catch (error) {
    if (error.http_code === 409 || (error.message && error.message.includes('already exists'))) {
      const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload/${CLOUDINARY_FOLDER}/${parentSku}.mp4`;
      return {
        success: true,
        url: url,
        publicId: `${CLOUDINARY_FOLDER}/${parentSku}`,
        existing: true,
      };
    }
    return {
      success: false,
      error: error.message,
    };
  }
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('\n🎬 IntroCar Processed Video Uploader\n');
  console.log('='.repeat(50));

  // Debug: show paths
  console.log('DEBUG: Script directory:', __dirname);
  console.log('DEBUG: CSV path:', CSV_PATH);
  console.log('DEBUG: CSV exists:', fs.existsSync(CSV_PATH));

  // Verify Cloudinary config
  console.log('DEBUG: Checking .env...');
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.error('❌ Please configure Cloudinary credentials in .env');
    console.error('   CLOUDINARY_CLOUD_NAME is:', process.env.CLOUDINARY_CLOUD_NAME || '(not set)');
    process.exit(1);
  }

  console.log(`☁️  Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME}`);
  console.log(`📂 Cloudinary folder: ${CLOUDINARY_FOLDER}`);

  // Load CSV
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`❌ CSV not found: ${CSV_PATH}`);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
  const videos = parseCSV(csvContent);
  console.log(`📋 Videos in CSV: ${videos.length}`);

  // Load progress file (for resuming)
  const progressPath = path.join(dataDir, 'processed-video-upload-progress.json');
  let uploadedVideos = {};
  if (fs.existsSync(progressPath)) {
    uploadedVideos = JSON.parse(fs.readFileSync(progressPath, 'utf-8'));
    console.log(`📋 Already uploaded: ${Object.keys(uploadedVideos).length}`);
  }

  // Build list of videos to upload
  const toUpload = [];
  const notFound = [];
  let totalSize = 0;

  // Group by parent SKU (avoid duplicate uploads)
  const seenParentSkus = new Set();

  for (const row of videos) {
    const parentSku = row['Parent SKU'];
    const filePath = row['File'];

    if (!parentSku || !filePath) continue;
    if (seenParentSkus.has(parentSku)) continue; // Skip duplicates
    if (uploadedVideos[parentSku]) continue; // Already uploaded

    seenParentSkus.add(parentSku);

    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      toUpload.push({
        parentSku,
        filePath,
        size: stats.size,
      });
      totalSize += stats.size;
    } else {
      notFound.push({ parentSku, filePath });
    }
  }

  console.log(`⬆️  Videos to upload: ${toUpload.length}`);
  console.log(`📊 Total size: ${formatBytes(totalSize)}`);
  if (notFound.length > 0) {
    console.log(`⚠️  Files not found: ${notFound.length}`);
  }

  if (toUpload.length === 0) {
    console.log('\n✅ All videos already uploaded!');
    return;
  }

  console.log('\n' + '='.repeat(50));
  console.log('Starting upload... (Ctrl+C to pause, progress is saved)\n');

  let uploaded = 0;
  let failed = 0;
  let skipped = 0;
  const errors = [];
  const startTime = Date.now();

  // Process in batches
  for (let i = 0; i < toUpload.length; i += BATCH_SIZE) {
    const batch = toUpload.slice(i, i + BATCH_SIZE);

    const promises = batch.map(async (video) => {
      const result = await uploadVideo(video.filePath, video.parentSku);

      if (result.success) {
        uploadedVideos[video.parentSku] = {
          url: result.url,
          publicId: result.publicId,
          uploadedAt: new Date().toISOString(),
        };

        if (result.existing) {
          skipped++;
        } else {
          uploaded++;
        }

        return { ...video, url: result.url, existing: result.existing };
      } else {
        failed++;
        errors.push({ ...video, error: result.error });
        return { ...video, error: result.error };
      }
    });

    await Promise.all(promises);

    // Log progress
    const progress = Math.min(i + BATCH_SIZE, toUpload.length);
    const percent = Math.round((progress / toUpload.length) * 100);
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const rate = uploaded > 0 ? Math.round(elapsed / uploaded) : 0;
    const remaining = rate > 0 ? Math.round(((toUpload.length - progress) * rate) / 60) : '?';

    console.log(`[${percent}%] ${progress}/${toUpload.length} | ✅ ${uploaded} new | ⏭️ ${skipped} existing | ❌ ${failed} failed | ~${remaining}min left`);

    // Save progress
    fs.writeFileSync(progressPath, JSON.stringify(uploadedVideos, null, 2));

    if (i + BATCH_SIZE < toUpload.length) {
      await sleep(BATCH_DELAY);
    }
  }

  const totalTime = Math.round((Date.now() - startTime) / 1000 / 60);

  console.log('\n' + '='.repeat(50));
  console.log('✨ Upload complete!\n');
  console.log(`✅ Uploaded: ${uploaded}`);
  console.log(`⏭️  Already existed: ${skipped}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏱️  Total time: ${totalTime} minutes`);

  if (notFound.length > 0) {
    console.log(`\n⚠️  Files not found (${notFound.length}):`);
    notFound.slice(0, 10).forEach(v => console.log(`   ${v.parentSku}: ${v.filePath}`));
    if (notFound.length > 10) console.log(`   ... and ${notFound.length - 10} more`);
  }

  if (errors.length > 0) {
    console.log(`\n❌ Upload errors (${errors.length}):`);
    errors.slice(0, 10).forEach(e => console.log(`   ${e.parentSku}: ${e.error}`));
  }

  // Update the video index to use Cloudinary URLs
  console.log('\n📝 Updating video index with Cloudinary URLs...');

  const videoIndex = fs.existsSync(path.join(dataDir, 'videos.json'))
    ? JSON.parse(fs.readFileSync(path.join(dataDir, 'videos.json'), 'utf-8'))
    : {};

  // Add/update entries for uploaded videos
  Object.entries(uploadedVideos).forEach(([parentSku, data]) => {
    videoIndex[parentSku] = {
      folder: parentSku,
      file: `${parentSku}_processed.mp4`,
      cloudinaryUrl: data.url,
      source: 'processed',
    };
  });

  fs.writeFileSync(path.join(dataDir, 'videos.json'), JSON.stringify(videoIndex, null, 2));
  console.log('✅ Video index updated');

  console.log('\n🎉 Done! Videos are now available on the website.');
}

main().catch(console.error);
