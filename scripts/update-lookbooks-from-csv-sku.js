const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const LOOKBOOKS_PATH = path.join(PROJECT_ROOT, 'data/json/lookbooks.json');
const CSV_PATH = path.join(PROJECT_ROOT, 'data/lookbooks_imagelinks.csv');
const CATALOGUE_DIR = path.join(PROJECT_ROOT, 'public/images/catalogues');

async function main() {
  // Load CSV and build SKU -> filename map
  let csvContent = fs.readFileSync(CSV_PATH, 'utf8');
  if (csvContent.charCodeAt(0) === 0xFEFF) csvContent = csvContent.slice(1);
  const csvLines = csvContent.split(/\r?\n/).slice(1).filter(l => l.trim());

  const skuToFile = new Map();
  csvLines.forEach(line => {
    const parts = line.split(',');
    if (parts.length >= 2) {
      const sku = parts[0].trim().replace(/\r/g, '');
      const filename = parts[1].trim().replace(/\r/g, '');
      if (sku && filename &&
          filename.indexOf('/') === -1 &&
          (filename.endsWith('.jpg') || filename.endsWith('.jpeg') || filename.endsWith('.png') || filename.endsWith('.gif'))) {
        skuToFile.set(sku, filename);
      }
    }
  });

  console.log('CSV SKU -> filename mappings:', skuToFile.size);

  // Get list of downloaded files
  const downloadedFiles = new Set(fs.readdirSync(CATALOGUE_DIR));
  console.log('Downloaded images:', downloadedFiles.size);

  // Load lookbooks
  const lookbooks = JSON.parse(fs.readFileSync(LOOKBOOKS_PATH, 'utf8'));
  console.log('Total lookbooks:', lookbooks.length);

  // Find lookbooks that are still remote and have a matching SKU
  let updated = 0;
  let noMatch = 0;
  let alreadyLocal = 0;
  let matchButNotDownloaded = 0;

  lookbooks.forEach(lb => {
    if (lb.imageUrl && lb.imageUrl.startsWith('/images')) {
      alreadyLocal++;
      return;
    }

    // Try to find matching filename via SKU (using id field)
    const mappedFilename = skuToFile.get(lb.id);

    if (mappedFilename && downloadedFiles.has(mappedFilename)) {
      // Store original URL for reference
      if (!lb.originalImageUrl) {
        lb.originalImageUrl = lb.imageUrl;
      }
      lb.imageUrl = '/images/catalogues/' + mappedFilename;
      updated++;
    } else if (mappedFilename) {
      matchButNotDownloaded++;
    } else {
      noMatch++;
    }
  });

  console.log('\n=== RESULTS ===');
  console.log('Already local:', alreadyLocal);
  console.log('Updated via SKU mapping:', updated);
  console.log('SKU match but file not downloaded:', matchButNotDownloaded);
  console.log('No SKU match:', noMatch);

  // Save updated lookbooks
  fs.writeFileSync(LOOKBOOKS_PATH, JSON.stringify(lookbooks, null, 2));
  console.log('\nSaved updated lookbooks.json');

  // Final stats
  const finalLocal = lookbooks.filter(lb => lb.imageUrl && lb.imageUrl.startsWith('/images')).length;
  const finalRemote = lookbooks.filter(lb => lb.imageUrl && lb.imageUrl.startsWith('http')).length;

  console.log('\n=== FINAL STATUS ===');
  console.log('With local images:', finalLocal);
  console.log('Still remote:', finalRemote);
  console.log('Coverage:', ((finalLocal / lookbooks.length) * 100).toFixed(1) + '%');
}

main().catch(console.error);
