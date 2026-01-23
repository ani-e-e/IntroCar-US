/**
 * Rename catalogue images to URL-friendly names based on title
 *
 * Run from your Mac:
 *   cd "IntroCar - US Website Prototype"
 *   node scripts/rename-images.js
 */

const fs = require('fs');
const path = require('path');

const lookbooksPath = 'data/json/lookbooks.json';
const imagesDir = 'public/images/catalogues';

const lookbooks = JSON.parse(fs.readFileSync(lookbooksPath, 'utf8'));

function toSlug(title) {
  return title
    .toLowerCase()
    .replace(/[|]/g, '-')           // Replace | with -
    .replace(/[()]/g, '')           // Remove parentheses
    .replace(/[,&]/g, '-')          // Replace , and & with -
    .replace(/[^a-z0-9-]/g, '-')    // Replace non-alphanumeric with -
    .replace(/-+/g, '-')            // Collapse multiple dashes
    .replace(/^-|-$/g, '')          // Trim leading/trailing dashes
    .substring(0, 100);             // Limit length
}

console.log('='.repeat(60));
console.log('Rename Catalogue Images');
console.log('='.repeat(60));

const renameMap = [];
const usedNames = new Set();

// Build rename map
lookbooks.forEach(lb => {
  if (!lb.image || !lb.image.startsWith('/images/catalogues/')) return;

  const oldFilename = lb.image.replace('/images/catalogues/', '');
  const ext = path.extname(oldFilename);

  let newBase = toSlug(lb.title);
  let newFilename = newBase + ext;

  // Handle duplicates by adding number suffix
  let counter = 1;
  while (usedNames.has(newFilename)) {
    newFilename = newBase + '-' + counter + ext;
    counter++;
  }
  usedNames.add(newFilename);

  if (oldFilename !== newFilename) {
    renameMap.push({
      sku: lb.sku || lb.id,
      title: lb.title,
      oldFilename,
      newFilename,
      lookbook: lb
    });
  }
});

console.log(`\nFound ${renameMap.length} images to rename\n`);

// Show sample
console.log('Sample renames:');
renameMap.slice(0, 5).forEach(r => {
  console.log(`  ${r.oldFilename}`);
  console.log(`  -> ${r.newFilename}\n`);
});

// Perform renames
let renamed = 0;
let failed = 0;
const errors = [];

renameMap.forEach(r => {
  const oldPath = path.join(imagesDir, r.oldFilename);
  const newPath = path.join(imagesDir, r.newFilename);

  try {
    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
      r.lookbook.image = '/images/catalogues/' + r.newFilename;
      renamed++;
    } else {
      errors.push({ ...r, error: 'File not found' });
      failed++;
    }
  } catch (err) {
    errors.push({ ...r, error: err.message });
    failed++;
  }
});

console.log('='.repeat(60));
console.log('RESULTS');
console.log('='.repeat(60));
console.log(`Renamed: ${renamed}`);
console.log(`Failed: ${failed}`);

// Save updated lookbooks.json
fs.writeFileSync(lookbooksPath, JSON.stringify(lookbooks, null, 2));
console.log('\nUpdated lookbooks.json');

// Save rename mapping for reference
const mappingCsv = ['sku,title,old_filename,new_filename'];
renameMap.forEach(r => {
  mappingCsv.push(`"${r.sku}","${r.title}","${r.oldFilename}","${r.newFilename}"`);
});
fs.writeFileSync('image-rename-mapping.csv', mappingCsv.join('\n'));
console.log('Saved mapping to image-rename-mapping.csv');

if (errors.length > 0) {
  fs.writeFileSync('rename-errors.json', JSON.stringify(errors, null, 2));
  console.log(`Saved ${errors.length} errors to rename-errors.json`);
}

console.log('\nDone!');
