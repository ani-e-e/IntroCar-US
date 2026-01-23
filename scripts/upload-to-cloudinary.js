/**
 * Upload catalogue images to Cloudinary
 *
 * Run from your Mac:
 *   cd "IntroCar - US Website Prototype"
 *   node scripts/upload-to-cloudinary.js
 */

// Skip dotenv - use environment variables directly

const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const imagesDir = 'public/images/catalogues';
const lookbooksPath = 'data/json/lookbooks.json';

async function main() {
  console.log('='.repeat(60));
  console.log('Upload Catalogue Images to Cloudinary');
  console.log('='.repeat(60));
  console.log('Cloud name:', process.env.CLOUDINARY_CLOUD_NAME);
  console.log('');

  const lookbooks = JSON.parse(fs.readFileSync(lookbooksPath, 'utf8'));
  const localImages = fs.readdirSync(imagesDir);

  console.log('Local images:', localImages.length);
  console.log('Catalogues:', lookbooks.length);
  console.log('');

  // Build map: local filename -> catalogues using it
  const fileToLookbooks = new Map();
  lookbooks.forEach(lb => {
    if (lb.image && lb.image.startsWith('/images/catalogues/')) {
      const filename = lb.image.replace('/images/catalogues/', '');
      if (!fileToLookbooks.has(filename)) {
        fileToLookbooks.set(filename, []);
      }
      fileToLookbooks.get(filename).push(lb);
    }
  });

  console.log('Unique images to upload:', fileToLookbooks.size);
  console.log('');

  let uploaded = 0;
  let failed = 0;
  let skipped = 0;
  const errors = [];

  const filesToUpload = [...fileToLookbooks.keys()];

  for (let i = 0; i < filesToUpload.length; i++) {
    const filename = filesToUpload[i];
    const localPath = path.join(imagesDir, filename);

    if (!fs.existsSync(localPath)) {
      skipped++;
      continue;
    }

    // Public ID without extension
    const publicId = 'catalogues/' + path.basename(filename, path.extname(filename));

    try {
      const result = await cloudinary.uploader.upload(localPath, {
        public_id: publicId,
        folder: '',
        overwrite: true,
        resource_type: 'image'
      });

      // Update all lookbooks using this file
      const cloudinaryUrl = result.secure_url;
      fileToLookbooks.get(filename).forEach(lb => {
        lb.image = cloudinaryUrl;
      });

      uploaded++;
      process.stdout.write('.');

    } catch (err) {
      failed++;
      errors.push({ filename, error: err.message });
      process.stdout.write('x');
    }

    if ((i + 1) % 100 === 0) {
      console.log(` ${i + 1}/${filesToUpload.length} (uploaded: ${uploaded})`);
    }

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 50));
  }

  console.log('\n');
  console.log('='.repeat(60));
  console.log('RESULTS');
  console.log('='.repeat(60));
  console.log('Uploaded:', uploaded);
  console.log('Failed:', failed);
  console.log('Skipped:', skipped);

  // Save updated lookbooks
  fs.writeFileSync(lookbooksPath, JSON.stringify(lookbooks, null, 2));
  console.log('\nUpdated lookbooks.json with Cloudinary URLs');

  if (errors.length > 0) {
    fs.writeFileSync('cloudinary-errors.json', JSON.stringify(errors, null, 2));
    console.log('Saved errors to cloudinary-errors.json');
  }

  // Save mapping
  const mapping = [];
  fileToLookbooks.forEach((lbs, filename) => {
    if (lbs[0].image.includes('cloudinary')) {
      mapping.push({ localFile: filename, cloudinaryUrl: lbs[0].image });
    }
  });
  fs.writeFileSync('cloudinary-mapping.json', JSON.stringify(mapping, null, 2));
  console.log('Saved mapping to cloudinary-mapping.json');

  console.log('\nDone!');
}

main().catch(console.error);
