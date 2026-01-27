const fs = require('fs');
const path = require('path');
const https = require('https');

const PROJECT_ROOT = path.join(__dirname, '..');
const LOOKBOOKS_PATH = path.join(PROJECT_ROOT, 'data/json/lookbooks.json');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'public/images/catalogues');
const CSV2_PATH = '/Users/annikaimpallomeni/Documents/1. IntroCar/IntroCar - US Website Prototype/scripts/../data/csv2-images.txt';

// Base URL for images
const BASE_URL = 'https://www.introcar.com/media/lookbookslider/';

// Load CSV2 data
const csv2Path = path.join(__dirname, '..', 'data', 'csv2-images.json');

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
        // Follow redirect
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
  // Load CSV2
  const csvPath = path.join(__dirname, '..', 'data', 'lookbooks_imagelinks.csv');

  // Check if CSV exists, if not copy from uploads
  if (!fs.existsSync(csvPath)) {
    console.log('CSV not found in data folder. Please copy lookbooks_imagelinks.csv to data/ folder');
    return;
  }

  let csvContent = fs.readFileSync(csvPath, 'utf8');
  // Remove BOM if present
  if (csvContent.charCodeAt(0) === 0xFEFF) {
    csvContent = csvContent.slice(1);
  }
  // Handle different line endings
  const csvLines = csvContent.split(/\r?\n/).slice(1).filter(l => l.trim());

  // Get unique filenames from CSV2
  const csv2Filenames = new Set();
  csvLines.forEach(line => {
    const parts = line.split(',');
    if (parts.length >= 2) {
      let filename = parts[1].trim().replace(/\r/g, '');
      // Skip invalid filenames (contain path separators, not image files, etc.)
      if (filename &&
          filename !== 'base_image' &&
          filename.length > 0 &&
          !filename.includes('/') &&
          !filename.includes('\\') &&
          (filename.endsWith('.jpg') || filename.endsWith('.jpeg') || filename.endsWith('.png') || filename.endsWith('.gif'))) {
        csv2Filenames.add(filename);
      }
    }
  });

  console.log('CSV2 unique images:', csv2Filenames.size);

  // Get already downloaded files
  const downloadedFiles = new Set(fs.readdirSync(OUTPUT_DIR));
  console.log('Already downloaded:', downloadedFiles.size);

  // Find files to download
  const toDownload = [];
  csv2Filenames.forEach(filename => {
    if (!downloadedFiles.has(filename)) {
      toDownload.push(filename);
    }
  });

  console.log('To download:', toDownload.length);
  console.log('');

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
    const outputPath = path.join(OUTPUT_DIR, filename);

    process.stdout.write(`\r[${i + 1}/${toDownload.length}] Downloading... (${downloaded} ok, ${failed} failed)`);

    try {
      await downloadImage(url, outputPath);
      downloaded++;
    } catch (err) {
      failed++;
      failures.push({ filename, error: err.message });
    }

    // Small delay to be nice to server
    await new Promise(r => setTimeout(r, 50));
  }

  console.log('\n');
  console.log('============================================================');
  console.log('RESULTS');
  console.log('============================================================');
  console.log('Downloaded:', downloaded);
  console.log('Failed:', failed);

  // Now update lookbooks.json
  if (downloaded > 0) {
    console.log('\nUpdating lookbooks.json...');

    const lookbooks = JSON.parse(fs.readFileSync(LOOKBOOKS_PATH, 'utf8'));
    const newDownloaded = new Set(fs.readdirSync(OUTPUT_DIR));

    let updated = 0;
    lookbooks.forEach(lb => {
      if (lb.imageUrl && lb.imageUrl.startsWith('http')) {
        const filename = lb.imageUrl.split('/').pop();
        if (newDownloaded.has(filename)) {
          lb.imageUrl = '/images/catalogues/' + filename;
          updated++;
        }
      }
    });

    fs.writeFileSync(LOOKBOOKS_PATH, JSON.stringify(lookbooks, null, 2));
    console.log('Updated', updated, 'lookbook entries');
  }

  // Save failure report
  if (failures.length > 0) {
    const reportPath = path.join(__dirname, 'csv2-download-failures.txt');
    const report = failures.map(f => `${f.filename}: ${f.error}`).join('\n');
    fs.writeFileSync(reportPath, report);
    console.log('\nFailure report saved to:', reportPath);
  }

  console.log('\nDone!');
}

main().catch(console.error);
