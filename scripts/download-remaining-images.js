const fs = require('fs');
const https = require('https');
const path = require('path');

const filenames = fs.readFileSync('images-to-download.txt', 'utf8').trim().split('\n');
const outputDir = 'public/images/catalogues';
const baseUrl = 'https://www.introcar.com/media/lookbookslider/';

console.log('Starting download of', filenames.length, 'images...');

let downloaded = 0;
let failed = 0;
let skipped = 0;
const failedFiles = [];

function getVariations(filename) {
  const variations = [];

  // Pattern 1: Strip Magento suffix (e.g., 1472547778-93351200_vnegbbckontqdse1.jpg -> 1472547778-93351200.jpg)
  const magentoMatch = filename.match(/^(\d+-\d+)_[^.]+(\.[^.]+)$/);
  if (magentoMatch) {
    variations.push(magentoMatch[1] + magentoMatch[2]);
    return variations;
  }

  // Pattern 2: Descriptive names - try multiple variations
  if (filename.includes('_') && !filename.match(/^\d/)) {
    const ext = path.extname(filename);
    const base = path.basename(filename, ext);
    const parts = base.split('_');

    const typeWords = ['unit', 'disc', 'pad', 'pump', 'valve', 'sensor', 'switch', 'motor', 'cylinder', 'hose', 'line', 'cable', 'lever', 'arm', 'bar', 'link', 'bush', 'mount', 'bracket', 'cover', 'housing', 'body', 'assembly', 'kit', 'set', 'actuator', 'modulator', 'accumulator', 'compressor', 'supply', 'flap'];

    let typeEndIndex = 1;
    for (let i = 0; i < parts.length && i < 4; i++) {
      if (typeWords.includes(parts[i].toLowerCase())) {
        typeEndIndex = i + 1;
        break;
      }
    }

    // Title Case version (Air Supply Unit, Mulsanne 2011.jpg)
    const titleType = parts.slice(0, typeEndIndex).map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
    const titleModel = parts.slice(typeEndIndex).map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');

    // Uppercase type version (ABS UNIT, Continental GT 2004.jpg)
    const upperType = parts.slice(0, typeEndIndex).map(p => p.toUpperCase()).join(' ');

    if (titleModel) {
      variations.push(titleType + ', ' + titleModel + ext);
      variations.push(upperType + ', ' + titleModel + ext);
    } else {
      variations.push(titleType + ext);
      variations.push(upperType + ext);
    }
  }

  // Fallback: original filename
  if (variations.length === 0) {
    variations.push(filename);
  }

  return variations;
}

function tryUrl(url, outputPath) {
  return new Promise((resolve) => {
    const request = https.get(url, { timeout: 15000 }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        tryUrl(response.headers.location, outputPath).then(resolve);
        return;
      }

      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(outputPath);
        response.pipe(fileStream);
        fileStream.on('finish', () => { fileStream.close(); resolve(true); });
        fileStream.on('error', () => resolve(false));
      } else {
        resolve(false);
      }
    });

    request.on('error', () => resolve(false));
    request.on('timeout', () => { request.destroy(); resolve(false); });
  });
}

async function downloadFile(filename) {
  const outputPath = path.join(outputDir, filename);

  if (fs.existsSync(outputPath)) {
    skipped++;
    return;
  }

  if (filename.includes('/') || filename.includes('\\') || !filename.trim()) {
    failed++;
    failedFiles.push({ filename, reason: 'invalid filename' });
    return;
  }

  const variations = getVariations(filename);

  for (const variation of variations) {
    const url = baseUrl + encodeURIComponent(variation).replace(/%2C/g, ',');
    const success = await tryUrl(url, outputPath);
    if (success) {
      downloaded++;
      return;
    }
  }

  failed++;
  failedFiles.push({ filename, reason: '404', tried: variations });
}

async function main() {
  const batchSize = 20;
  for (let i = 0; i < filenames.length; i += batchSize) {
    const batch = filenames.slice(i, i + batchSize);
    await Promise.all(batch.map(f => downloadFile(f)));

    if ((i + batchSize) % 200 === 0 || i + batchSize >= filenames.length) {
      console.log(`Progress: ${Math.min(i + batchSize, filenames.length)}/${filenames.length} - Downloaded: ${downloaded}, Failed: ${failed}`);
    }
  }

  console.log('\n=== COMPLETE ===');
  console.log('Downloaded:', downloaded);
  console.log('Failed:', failed);
  console.log('Skipped:', skipped);

  if (failedFiles.length > 0) {
    fs.writeFileSync('failed-downloads.json', JSON.stringify(failedFiles, null, 2));
  }
}

main();
