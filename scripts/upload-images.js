/**
 * Cloudinary Image Upload Script for IntroCar US
 * 
 * This script uploads product images to Cloudinary and creates a URL mapping.
 * 
 * SETUP:
 * 1. Create a .env file with your Cloudinary credentials (see below)
 * 2. Run: node scripts/upload-images.js
 * 
 * Create a file called .env in your introcar-us folder with:
 * CLOUDINARY_CLOUD_NAME=your_cloud_name
 * CLOUDINARY_API_KEY=your_api_key
 * CLOUDINARY_API_SECRET=your_api_secret
 */

const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// ============================================
// CONFIGURATION - UPDATE THESE!
// ============================================

// Your Cloudinary credentials (or use .env file)
const CLOUDINARY_CONFIG = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'YOUR_CLOUD_NAME',
  api_key: process.env.CLOUDINARY_API_KEY || 'YOUR_API_KEY',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'YOUR_API_SECRET',
};

// Path to your images folder (OneDrive)
const IMAGES_SOURCE_PATH = '/Users/annikaimpallomeni/Library/CloudStorage/OneDrive-IntroCarLtd/Parts Photos';

// How many images to upload at once (be gentle on the API)
const BATCH_SIZE = 10;

// Delay between batches (milliseconds)
const BATCH_DELAY = 1000;

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
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || CLOUDINARY_CONFIG.cloud_name,
  api_key: process.env.CLOUDINARY_API_KEY || CLOUDINARY_CONFIG.api_key,
  api_secret: process.env.CLOUDINARY_API_SECRET || CLOUDINARY_CONFIG.api_secret,
});

const dataDir = path.join(__dirname, '..', 'data', 'json');
const outputDir = path.join(__dirname, '..', 'data', 'json');

// ============================================
// HELPER FUNCTIONS
// ============================================

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function findImageFile(filename, searchPath) {
  // Try exact match first
  const exactPath = path.join(searchPath, filename);
  if (fs.existsSync(exactPath)) {
    return exactPath;
  }
  
  // Try with different extensions
  const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.JPG', '.JPEG', '.PNG'];
  const baseName = filename.replace(/\.[^.]+$/, '');
  
  for (const ext of extensions) {
    const tryPath = path.join(searchPath, baseName + ext);
    if (fs.existsSync(tryPath)) {
      return tryPath;
    }
  }
  
  // Try searching subdirectories (one level deep)
  try {
    const subdirs = fs.readdirSync(searchPath, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);
    
    for (const subdir of subdirs) {
      const subPath = path.join(searchPath, subdir, filename);
      if (fs.existsSync(subPath)) {
        return subPath;
      }
    }
  } catch (e) {
    // Ignore errors reading subdirectories
  }
  
  return null;
}

async function uploadImage(localPath, publicId) {
  try {
    const result = await cloudinary.uploader.upload(localPath, {
      public_id: publicId,
      folder: 'introcar-us/products',
      overwrite: false, // Don't re-upload if already exists
      resource_type: 'image',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    });
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    // Check if image already exists
    if (error.message && error.message.includes('already exists')) {
      // Get the existing URL
      const url = cloudinary.url(`introcar-us/products/${publicId}`, { secure: true });
      return {
        success: true,
        url: url,
        publicId: `introcar-us/products/${publicId}`,
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
  console.log('\n🚀 IntroCar Image Uploader\n');
  console.log('='.repeat(50));
  
  // Verify Cloudinary config
  if (!process.env.CLOUDINARY_CLOUD_NAME && CLOUDINARY_CONFIG.cloud_name === 'YOUR_CLOUD_NAME') {
    console.error('❌ Please configure your Cloudinary credentials!');
    console.error('   Create a .env file or update CLOUDINARY_CONFIG in this script.');
    process.exit(1);
  }
  
  console.log(`☁️  Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME || CLOUDINARY_CONFIG.cloud_name}`);
  console.log(`📁 Images source: ${IMAGES_SOURCE_PATH}`);
  
  // Check if source folder exists
  if (!fs.existsSync(IMAGES_SOURCE_PATH)) {
    console.error(`❌ Images folder not found: ${IMAGES_SOURCE_PATH}`);
    console.error('   Please update IMAGES_SOURCE_PATH in this script.');
    process.exit(1);
  }
  
  // Load images needed
  const imagesNeededPath = path.join(dataDir, 'images-needed.json');
  if (!fs.existsSync(imagesNeededPath)) {
    console.error('❌ images-needed.json not found. Run convert-excel.js first.');
    process.exit(1);
  }
  
  const imagesNeeded = JSON.parse(fs.readFileSync(imagesNeededPath, 'utf-8'));
  console.log(`📸 Images to upload: ${imagesNeeded.length}`);
  
  // Load existing URL mapping if it exists (for resuming)
  const urlMapPath = path.join(outputDir, 'image-urls.json');
  let urlMap = {};
  if (fs.existsSync(urlMapPath)) {
    urlMap = JSON.parse(fs.readFileSync(urlMapPath, 'utf-8'));
    console.log(`📋 Existing URL mappings: ${Object.keys(urlMap).length}`);
  }
  
  // Filter out already uploaded images
  const toUpload = imagesNeeded.filter(img => !urlMap[img]);
  console.log(`⬆️  Images to upload (new): ${toUpload.length}`);
  
  if (toUpload.length === 0) {
    console.log('\n✅ All images already uploaded!');
    return;
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('Starting upload...\n');
  
  let uploaded = 0;
  let failed = 0;
  let notFound = 0;
  const errors = [];
  
  // Process in batches
  for (let i = 0; i < toUpload.length; i += BATCH_SIZE) {
    const batch = toUpload.slice(i, i + BATCH_SIZE);
    
    const promises = batch.map(async (filename) => {
      // Find the image file
      const localPath = findImageFile(filename, IMAGES_SOURCE_PATH);
      
      if (!localPath) {
        notFound++;
        return { filename, notFound: true };
      }
      
      // Create a clean public ID from filename
      const publicId = filename
        .replace(/\.[^.]+$/, '')  // Remove extension
        .replace(/[^a-zA-Z0-9_-]/g, '_');  // Replace special chars
      
      const result = await uploadImage(localPath, publicId);
      
      if (result.success) {
        urlMap[filename] = result.url;
        uploaded++;
        return { filename, url: result.url, existing: result.existing };
      } else {
        failed++;
        errors.push({ filename, error: result.error });
        return { filename, error: result.error };
      }
    });
    
    const results = await Promise.all(promises);
    
    // Log progress
    const progress = Math.min(i + BATCH_SIZE, toUpload.length);
    const percent = Math.round((progress / toUpload.length) * 100);
    console.log(`[${percent}%] Processed ${progress}/${toUpload.length} | ✅ ${uploaded} uploaded | ⚠️ ${notFound} not found | ❌ ${failed} failed`);
    
    // Save progress after each batch
    fs.writeFileSync(urlMapPath, JSON.stringify(urlMap, null, 2));
    
    // Delay between batches
    if (i + BATCH_SIZE < toUpload.length) {
      await sleep(BATCH_DELAY);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('✨ Upload complete!\n');
  console.log(`✅ Uploaded: ${uploaded}`);
  console.log(`⚠️  Not found: ${notFound}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📋 Total URL mappings: ${Object.keys(urlMap).length}`);
  console.log(`\n📁 URL mapping saved to: ${urlMapPath}`);
  
  if (errors.length > 0) {
    console.log('\n⚠️ Errors:');
    errors.slice(0, 10).forEach(e => {
      console.log(`   ${e.filename}: ${e.error}`);
    });
    if (errors.length > 10) {
      console.log(`   ... and ${errors.length - 10} more`);
    }
  }
  
  console.log('\nNext step: Run `node scripts/apply-image-urls.js` to update products');
}

main().catch(console.error);
