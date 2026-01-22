/**
 * Cloudinary Video Upload Script for IntroCar US
 *
 * This script uploads product turntable videos to Cloudinary.
 *
 * SETUP:
 * 1. Make sure your .env file has Cloudinary credentials
 * 2. Run: node scripts/upload-videos.js
 *
 * The .env file should contain:
 * CLOUDINARY_CLOUD_NAME=durzkoyfb
 * CLOUDINARY_API_KEY=your_api_key
 * CLOUDINARY_API_SECRET=your_api_secret
 */

const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// ============================================
// CONFIGURATION - UPDATE THESE IF NEEDED!
// ============================================

// Path to your Turntable videos folder (OneDrive)
const VIDEOS_SOURCE_PATH = '/Users/annikaimpallomeni/Library/CloudStorage/OneDrive-SharedLibraries-IntroCarLtd/Christian Domini - Turntable';

// Cloudinary folder for videos
const CLOUDINARY_FOLDER = 'Turntable';

// How many videos to upload at once (videos are larger, so smaller batches)
const BATCH_SIZE = 3;

// Delay between batches (milliseconds) - longer for videos
const BATCH_DELAY = 2000;

// ============================================
// SETUP
// ============================================

// Load .env file if it exists
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

async function uploadVideo(localPath, folder, filename) {
  try {
    const publicId = `${CLOUDINARY_FOLDER}/${folder}/${filename.replace('.mp4', '')}`;

    const result = await cloudinary.uploader.upload(localPath, {
      public_id: publicId,
      resource_type: 'video',
      overwrite: false, // Don't re-upload if already exists
      chunk_size: 6000000, // 6MB chunks for large files
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      size: result.bytes,
    };
  } catch (error) {
    // Check if video already exists
    if (error.http_code === 409 || (error.message && error.message.includes('already exists'))) {
      const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload/${CLOUDINARY_FOLDER}/${folder}/${filename.replace('.mp4', '')}.mp4`;
      return {
        success: true,
        url: url,
        publicId: `${CLOUDINARY_FOLDER}/${folder}/${filename.replace('.mp4', '')}`,
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
// MAIN UPLOAD PROCESS
// ============================================

async function main() {
  console.log('\n🎬 IntroCar Video Uploader\n');
  console.log('='.repeat(50));

  // Verify Cloudinary config
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.error('❌ Please configure your Cloudinary credentials!');
    console.error('   Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to .env');
    process.exit(1);
  }

  console.log(`☁️  Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME}`);
  console.log(`📁 Videos source: ${VIDEOS_SOURCE_PATH}`);
  console.log(`📂 Cloudinary folder: ${CLOUDINARY_FOLDER}`);

  // Check if source folder exists
  if (!fs.existsSync(VIDEOS_SOURCE_PATH)) {
    console.error(`❌ Videos folder not found: ${VIDEOS_SOURCE_PATH}`);
    console.error('   Please update VIDEOS_SOURCE_PATH in this script.');
    process.exit(1);
  }

  // Load video index to know which videos we need
  const videoIndexPath = path.join(dataDir, 'videos.json');
  if (!fs.existsSync(videoIndexPath)) {
    console.error('❌ videos.json not found. Run build-video-index.py first.');
    process.exit(1);
  }

  const videoIndex = JSON.parse(fs.readFileSync(videoIndexPath, 'utf-8'));
  const skus = Object.keys(videoIndex);
  console.log(`🎥 Videos in index: ${skus.length}`);

  // Load existing upload progress if it exists (for resuming)
  const progressPath = path.join(dataDir, 'video-upload-progress.json');
  let uploadedVideos = {};
  if (fs.existsSync(progressPath)) {
    uploadedVideos = JSON.parse(fs.readFileSync(progressPath, 'utf-8'));
    console.log(`📋 Already uploaded: ${Object.keys(uploadedVideos).length}`);
  }

  // Build list of videos to upload
  const toUpload = [];
  let totalSize = 0;

  for (const sku of skus) {
    const videoData = videoIndex[sku];
    const folder = videoData.folder;
    const filename = videoData.file;
    const key = `${folder}/${filename}`;

    // Skip if already uploaded
    if (uploadedVideos[key]) {
      continue;
    }

    const localPath = path.join(VIDEOS_SOURCE_PATH, folder, filename);

    if (fs.existsSync(localPath)) {
      const stats = fs.statSync(localPath);
      toUpload.push({
        sku,
        folder,
        filename,
        localPath,
        size: stats.size,
        key,
      });
      totalSize += stats.size;
    }
  }

  console.log(`⬆️  Videos to upload: ${toUpload.length}`);
  console.log(`📊 Total size: ${formatBytes(totalSize)}`);

  if (toUpload.length === 0) {
    console.log('\n✅ All videos already uploaded!');
    return;
  }

  // Estimate time
  const estimatedMinutes = Math.ceil((toUpload.length * 10) / 60); // ~10 seconds per video average
  console.log(`⏱️  Estimated time: ~${estimatedMinutes} minutes`);

  console.log('\n' + '='.repeat(50));
  console.log('Starting upload... (press Ctrl+C to pause, progress is saved)\n');

  let uploaded = 0;
  let failed = 0;
  let skipped = 0;
  const errors = [];
  const startTime = Date.now();

  // Process in batches
  for (let i = 0; i < toUpload.length; i += BATCH_SIZE) {
    const batch = toUpload.slice(i, i + BATCH_SIZE);

    const promises = batch.map(async (video) => {
      const result = await uploadVideo(video.localPath, video.folder, video.filename);

      if (result.success) {
        uploadedVideos[video.key] = {
          url: result.url,
          publicId: result.publicId,
          sku: video.sku,
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

    const results = await Promise.all(promises);

    // Log progress
    const progress = Math.min(i + BATCH_SIZE, toUpload.length);
    const percent = Math.round((progress / toUpload.length) * 100);
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const rate = uploaded > 0 ? Math.round(elapsed / uploaded) : 0;
    const remaining = rate > 0 ? Math.round(((toUpload.length - progress) * rate) / 60) : '?';

    console.log(`[${percent}%] ${progress}/${toUpload.length} | ✅ ${uploaded} new | ⏭️ ${skipped} existing | ❌ ${failed} failed | ~${remaining}min left`);

    // Save progress after each batch
    fs.writeFileSync(progressPath, JSON.stringify(uploadedVideos, null, 2));

    // Delay between batches
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
  console.log(`\n📁 Progress saved to: ${progressPath}`);

  if (errors.length > 0) {
    console.log('\n⚠️ Errors:');
    errors.slice(0, 10).forEach(e => {
      console.log(`   ${e.folder}/${e.filename}: ${e.error}`);
    });
    if (errors.length > 10) {
      console.log(`   ... and ${errors.length - 10} more`);
    }

    // Save errors to file
    const errorsPath = path.join(dataDir, 'video-upload-errors.json');
    fs.writeFileSync(errorsPath, JSON.stringify(errors, null, 2));
    console.log(`\n📁 Errors saved to: ${errorsPath}`);
  }

  console.log('\n✅ Videos are now available on Cloudinary!');
  console.log('   The website will automatically use them via the /api/videos/[sku] endpoint.');
}

main().catch(console.error);
