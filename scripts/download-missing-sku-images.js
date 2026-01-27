const fs = require('fs');
const path = require('path');
const https = require('https');

const PROJECT_ROOT = path.join(__dirname, '..');
const LOOKBOOKS_PATH = path.join(PROJECT_ROOT, 'data/json/lookbooks.json');
const CSV_PATH = path.join(PROJECT_ROOT, 'data/lookbooks_imagelinks.csv');
const CATALOGUE_DIR = path.join(PROJECT_ROOT, 'public/images/catalogues');
const BASE_URL = 'https://www.introcar.com/media/lookbookslider/';

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

  console.log('CSV SKU mappings:', skuToFile.size);

  // Get list of already downloaded files
  const downloadedFiles = new Set(fs.readdirSync(CATALOGUE_DIR));
  console.log('Already downloaded:', downloadedFiles.size);

  // Load lookbooks and find ones with SKU match but no downloaded file
  const lookbooks = JSON.parse(fs.readFileSync(LOOKBOOKS_PATH, 'utf8'));

  const toDownload = [];
  lookbooks.forEach(lb => {
    if (lb.imageUrl && lb.imageUrl.startsWith('http')) {
      const mappedFilename = skuToFile.get(lb.id);
      if (mappedFilename && !downloadedFiles.has(mappedFilename)) {
        toDownload.push({ id: lb.id, filename: mappedFilename });
      }
    }
  });

  // Get unique filenames to download
  const uniqueFilenames = [...new Set(toDownload.map(t => t.filename))];
  console.log('Unique files to download:', uniqueFilenames.length);

  if (uniqueFilenames.length === 0) {
    console.log('Nothing to download!');
    return;
  }

  let downloaded = 0;
  let failed = 0;
  const failures = [];

  for (let i = 0; i < uniqueFilenames.length; i++) {
    const filename = uniqueFilenames[i];
    const url = BASE_URL + filename;
    const outputPath = path.join(CATALOGUE_DIR, filename);

    process.stdout.write(`\r[${i + 1}/${uniqueFilenames.length}] Downloading... (${downloaded} ok, ${failed} failed)`);

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
  console.log('RESULTS');
  console.log('============================================================');
  console.log('Downloaded:', downloaded);
  console.log('Failed:', failed);

  // Now update lookbooks.json with newly downloaded files
  if (downloaded > 0) {
    console.log('\nUpdating lookbooks.json...');

    const newDownloaded = new Set(fs.readdirSync(CATALOGUE_DIR));
    let updated = 0;

    lookbooks.forEach(lb => {
      if (lb.imageUrl && lb.imageUrl.startsWith('http')) {
        const mappedFilename = skuToFile.get(lb.id);
        if (mappedFilename && newDownloaded.has(mappedFilename)) {
          if (!lb.originalImageUrl) {
            lb.originalImageUrl = lb.imageUrl;
          }
          lb.imageUrl = '/images/catalogues/' + mappedFilename;
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
    const reportPath = path.join(__dirname, 'missing-sku-download-failures.txt');
    const report = failures.map(f => `${f.filename}: ${f.error}`).join('\n');
    fs.writeFileSync(reportPath, report);
    console.log('\nFailure report saved to:', reportPath);
  }

  console.log('\nDone!');
}

main().catch(console.error);
