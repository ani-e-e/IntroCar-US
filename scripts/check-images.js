/**
 * Check Image Availability
 * 
 * This script checks how many of the needed images exist in your local folder.
 * Run this BEFORE upload-images.js to see what will be uploaded.
 * 
 * Run: node scripts/check-images.js
 */

const fs = require('fs');
const path = require('path');

// UPDATE THIS PATH to your images folder
const IMAGES_SOURCE_PATH = '/Users/annikaimpallomeni/Library/CloudStorage/OneDrive-IntroCarLtd/Parts Photos';

const dataDir = path.join(__dirname, '..', 'data', 'json');

console.log('\n🔍 Checking Image Availability\n');
console.log('='.repeat(50));
console.log(`📁 Looking in: ${IMAGES_SOURCE_PATH}\n`);

// Check if source folder exists
if (!fs.existsSync(IMAGES_SOURCE_PATH)) {
  console.error('❌ Images folder not found!');
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
console.log(`📸 Images needed: ${imagesNeeded.length}\n`);

// Get list of files in source folder
let availableFiles = new Set();
try {
  // Read main folder
  const files = fs.readdirSync(IMAGES_SOURCE_PATH);
  files.forEach(f => availableFiles.add(f.toLowerCase()));
  
  // Read subdirectories (one level)
  const subdirs = files.filter(f => {
    const fullPath = path.join(IMAGES_SOURCE_PATH, f);
    return fs.statSync(fullPath).isDirectory();
  });
  
  subdirs.forEach(subdir => {
    try {
      const subFiles = fs.readdirSync(path.join(IMAGES_SOURCE_PATH, subdir));
      subFiles.forEach(f => availableFiles.add(f.toLowerCase()));
    } catch (e) {
      // Ignore errors reading subdirectories
    }
  });
  
  console.log(`📂 Files found in source: ${availableFiles.size}`);
  console.log(`📂 Subdirectories checked: ${subdirs.length}`);
} catch (e) {
  console.error(`❌ Error reading source folder: ${e.message}`);
  process.exit(1);
}

// Check which images we have
let found = 0;
let notFound = 0;
const missingImages = [];

imagesNeeded.forEach(filename => {
  const filenameLower = filename.toLowerCase();
  
  if (availableFiles.has(filenameLower)) {
    found++;
  } else {
    // Try without extension variations
    const baseName = filename.replace(/\.[^.]+$/, '').toLowerCase();
    const variations = [
      baseName + '.jpg',
      baseName + '.jpeg',
      baseName + '.png',
      baseName + '.webp',
    ];
    
    const hasVariation = variations.some(v => availableFiles.has(v));
    
    if (hasVariation) {
      found++;
    } else {
      notFound++;
      if (missingImages.length < 20) {
        missingImages.push(filename);
      }
    }
  }
});

console.log('\n' + '='.repeat(50));
console.log('\n📊 Results:\n');
console.log(`✅ Found:     ${found} (${Math.round(found/imagesNeeded.length*100)}%)`);
console.log(`❌ Not found: ${notFound} (${Math.round(notFound/imagesNeeded.length*100)}%)`);

if (missingImages.length > 0) {
  console.log('\n⚠️ Sample missing images:');
  missingImages.forEach(img => console.log(`   - ${img}`));
  if (notFound > 20) {
    console.log(`   ... and ${notFound - 20} more`);
  }
}

console.log('\n' + '='.repeat(50));
if (found > 0) {
  console.log(`\n✨ Ready to upload ${found} images!`);
  console.log('   Run: node scripts/upload-images.js');
}
console.log('');
