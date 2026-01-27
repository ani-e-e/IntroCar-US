const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const LOOKBOOKS_PATH = path.join(PROJECT_ROOT, 'data/json/lookbooks.json');
const CSV_PATH = path.join(PROJECT_ROOT, 'data/lookbooks_imagelinks.csv');
const CSV2_PATH = path.join(PROJECT_ROOT, 'data/lookbooks_imagelinks_2.csv');
const CATALOGUE_DIR = path.join(PROJECT_ROOT, 'public/images/catalogues');

function parseCsvLine(line) {
  // Handle both quoted and unquoted SKUs
  let sku, filename;

  if (line.startsWith('"')) {
    // Quoted SKU: "SKU with, commas",filename
    const match = line.match(/^"([^"]+)",(.*)$/);
    if (match) {
      sku = match[1].trim();
      filename = match[2].trim();
    }
  } else {
    // Unquoted: sku,filename
    const parts = line.split(',');
    if (parts.length >= 2) {
      sku = parts[0].trim();
      filename = parts[1].trim();
    }
  }

  return { sku, filename };
}

function loadCsvWithQuotes(csvPath) {
  let content = fs.readFileSync(csvPath, 'utf8');
  if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
  const lines = content.split(/\r?\n/).slice(1).filter(l => l.trim());

  const map = new Map();
  lines.forEach(line => {
    const { sku, filename } = parseCsvLine(line);
    if (sku && filename &&
        filename.indexOf('/') === -1 &&
        (filename.endsWith('.jpg') || filename.endsWith('.jpeg') || filename.endsWith('.png') || filename.endsWith('.gif'))) {
      map.set(sku, filename);
    }
  });
  return map;
}

async function main() {
  console.log('Loading CSVs with proper quote handling...\n');

  // Load both CSVs
  const csv1Map = loadCsvWithQuotes(CSV_PATH);
  const csv2Map = loadCsvWithQuotes(CSV2_PATH);

  // Merge (CSV1 takes priority)
  const combined = new Map([...csv2Map, ...csv1Map]);

  console.log('CSV1 SKU mappings:', csv1Map.size);
  console.log('CSV2 SKU mappings:', csv2Map.size);
  console.log('Combined unique:', combined.size);

  // Get downloaded files
  const downloadedFiles = new Set(fs.readdirSync(CATALOGUE_DIR));
  console.log('Downloaded images:', downloadedFiles.size);

  // Load lookbooks
  const lookbooks = JSON.parse(fs.readFileSync(LOOKBOOKS_PATH, 'utf8'));
  const stillRemote = lookbooks.filter(lb => lb.imageUrl && lb.imageUrl.startsWith('http'));
  console.log('Lookbooks still remote:', stillRemote.length);

  // Try to match and update
  let updated = 0;
  let matchButNoFile = 0;
  let noMatch = 0;

  lookbooks.forEach(lb => {
    if (lb.imageUrl && lb.imageUrl.startsWith('http')) {
      const filename = combined.get(lb.id);
      if (filename && downloadedFiles.has(filename)) {
        if (!lb.originalImageUrl) {
          lb.originalImageUrl = lb.imageUrl;
        }
        lb.imageUrl = '/images/catalogues/' + filename;
        updated++;
      } else if (filename) {
        matchButNoFile++;
      } else {
        noMatch++;
      }
    }
  });

  console.log('\n=== RESULTS ===');
  console.log('Updated:', updated);
  console.log('SKU match but file not downloaded:', matchButNoFile);
  console.log('No SKU match:', noMatch);

  // Save
  fs.writeFileSync(LOOKBOOKS_PATH, JSON.stringify(lookbooks, null, 2));
  console.log('\nSaved lookbooks.json');

  // Final stats
  const finalLocal = lookbooks.filter(lb => lb.imageUrl && lb.imageUrl.startsWith('/images')).length;
  const finalRemote = lookbooks.filter(lb => lb.imageUrl && lb.imageUrl.startsWith('http')).length;

  console.log('\n=== FINAL STATUS ===');
  console.log('With local images:', finalLocal);
  console.log('Still remote:', finalRemote);
  console.log('Coverage:', ((finalLocal / lookbooks.length) * 100).toFixed(1) + '%');
}

main().catch(console.error);
