const fs = require('fs');
const path = require('path');
const https = require('https');

const PROJECT_ROOT = path.join(__dirname, '..');
const LOOKBOOKS_PATH = path.join(PROJECT_ROOT, 'data/json/lookbooks.json');
const CSV_PATH = path.join(PROJECT_ROOT, 'data/lookbooks_imagelinks.csv');
const CSV2_PATH = path.join(PROJECT_ROOT, 'data/lookbooks_imagelinks_2.csv');
const CATALOGUE_DIR = path.join(PROJECT_ROOT, 'public/images/catalogues');
const BASE_URL = 'https://www.introcar.com/media/lookbookslider/';

function parseCsvLine(line) {
  let sku, filename;

  if (line.startsWith('"')) {
    const match = line.match(/^"([^"]+)",(.*)$/);
    if (match) {
      sku = match[1].trim();
      filename = match[2].trim();
    }
  } else {
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

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);

    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(true);
        });
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        fs.unlinkSync(filepath);
        downloadImage(response.headers.location, filepath)
          .then(resolve)
          .catch(reject);
      } else {
        file.close();
        fs.unlinkSync(filepath);
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      reject(err);
    });
  });
}

async function main() {
  console.log('Loading CSVs with proper quote handling...\n');

  // Load both CSVs
  const csv1Map = loadCsvWithQuotes(CSV_PATH);
  const csv2Map = loadCsvWithQuotes(CSV2_PATH);
  const combined = new Map([...csv2Map, ...csv1Map]);

  console.log('Combined SKU mappings:', combined.size);

  // Get downloaded files
  const downloadedFiles = new Set(fs.readdirSync(CATALOGUE_DIR));
  console.log('Already downloaded:', downloadedFiles.size);

  // Load lookbooks and find files to download
  const lookbooks = JSON.parse(fs.readFileSync(LOOKBOOKS_PATH, 'utf8'));
  const stillRemote = lookbooks.filter(lb => lb.imageUrl && lb.imageUrl.startsWith('http'));

  // Find unique filenames we need
  const filesToDownload = new Set();
  stillRemote.forEach(lb => {
    const filename = combined.get(lb.id);
    if (filename && !downloadedFiles.has(filename)) {
      filesToDownload.add(filename);
    }
  });

  const toDownload = [...filesToDownload];
  console.log('Unique files to download:', toDownload.length);

  if (toDownload.length === 0) {
    console.log('Nothing to download!');
    return;
  }

  let downloaded = 0;
  let failed = 0;
  const failures = [];

  for (let i = 0; i < toDownload.length; i++) {
    const filename = toDownload[i];
    const url = BASE_URL + filename;
    const outputPath = path.join(CATALOGUE_DIR, filename);

    process.stdout.write(`\r[${i + 1}/${toDownload.length}] Downloading... (${downloaded} ok, ${failed} failed)`);

    try {
      await downloadImage(url, outputPath);
      downloaded++;
    } catch (err) {
      failed++;
      failures.push({ filename, error: err.message });
    }

    await new Promise(r => setTimeout(r, 50));
  }

  console.log('\n');
  console.log('============================================================');
  console.log('DOWNLOAD RESULTS');
  console.log('============================================================');
  console.log('Downloaded:', downloaded);
  console.log('Failed:', failed);

  // Update lookbooks.json
  if (downloaded > 0) {
    console.log('\nUpdating lookbooks.json...');
    const newDownloaded = new Set(fs.readdirSync(CATALOGUE_DIR));
    let updated = 0;

    lookbooks.forEach(lb => {
      if (lb.imageUrl && lb.imageUrl.startsWith('http')) {
        const filename = combined.get(lb.id);
        if (filename && newDownloaded.has(filename)) {
          if (!lb.originalImageUrl) {
            lb.originalImageUrl = lb.imageUrl;
          }
          lb.imageUrl = '/images/catalogues/' + filename;
          updated++;
        }
      }
    });

    fs.writeFileSync(LOOKBOOKS_PATH, JSON.stringify(lookbooks, null, 2));
    console.log('Updated', updated, 'lookbook entries');
  }

  // Final stats
  const finalLocal = lookbooks.filter(lb => lb.imageUrl && lb.imageUrl.startsWith('/images')).length;
  const finalRemote = lookbooks.filter(lb => lb.imageUrl && lb.imageUrl.startsWith('http')).length;

  console.log('\n=== FINAL STATUS ===');
  console.log('With local images:', finalLocal);
  console.log('Still remote:', finalRemote);
  console.log('Coverage:', ((finalLocal / lookbooks.length) * 100).toFixed(1) + '%');

  if (failures.length > 0) {
    const reportPath = path.join(__dirname, 'remaining-download-failures.txt');
    const report = failures.map(f => `${f.filename}: ${f.error}`).join('\n');
    fs.writeFileSync(reportPath, report);
    console.log('\nFailure report:', reportPath);
  }

  console.log('\nDone!');
}

main().catch(console.error);
