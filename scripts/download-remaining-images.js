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

function downloadFile(filename) {
  return new Promise((resolve) => {
    const outputPath = path.join(outputDir, filename);
    
    if (fs.existsSync(outputPath)) {
      skipped++;
      resolve();
      return;
    }
    
    if (filename.includes('/') || filename.includes('\\') || !filename.trim()) {
      failed++;
      failedFiles.push({ filename, reason: 'invalid filename' });
      resolve();
      return;
    }
    
    const url = baseUrl + filename;
    
    const request = https.get(url, { timeout: 15000 }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        https.get(response.headers.location, { timeout: 15000 }, (res2) => {
          if (res2.statusCode === 200) {
            const fileStream = fs.createWriteStream(outputPath);
            res2.pipe(fileStream);
            fileStream.on('finish', () => { fileStream.close(); downloaded++; resolve(); });
            fileStream.on('error', () => { failed++; failedFiles.push({ filename, reason: 'write error' }); resolve(); });
          } else {
            failed++;
            failedFiles.push({ filename, reason: 'status ' + res2.statusCode });
            resolve();
          }
        }).on('error', () => { failed++; failedFiles.push({ filename, reason: 'redirect error' }); resolve(); });
        return;
      }
      
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(outputPath);
        response.pipe(fileStream);
        fileStream.on('finish', () => { fileStream.close(); downloaded++; resolve(); });
        fileStream.on('error', () => { failed++; failedFiles.push({ filename, reason: 'write error' }); resolve(); });
      } else {
        failed++;
        failedFiles.push({ filename, reason: 'status ' + response.statusCode });
        resolve();
      }
    });
    
    request.on('error', () => { failed++; failedFiles.push({ filename, reason: 'network error' }); resolve(); });
    request.on('timeout', () => { request.destroy(); failed++; failedFiles.push({ filename, reason: 'timeout' }); resolve(); });
  });
}

async function main() {
  const batchSize = 20;
  for (let i = 0; i < filenames.length; i += batchSize) {
    const batch = filenames.slice(i, i + batchSize);
    await Promise.all(batch.map(f => downloadFile(f)));
    
    if ((i + batchSize) % 200 === 0 || i + batchSize >= filenames.length) {
      console.log(\`Progress: \${Math.min(i + batchSize, filenames.length)}/\${filenames.length} - Downloaded: \${downloaded}, Failed: \${failed}\`);
    }
  }
  
  console.log('\\n=== COMPLETE ===');
  console.log('Downloaded:', downloaded);
  console.log('Failed:', failed);
  console.log('Skipped:', skipped);
  
  if (failedFiles.length > 0) {
    fs.writeFileSync('failed-downloads.json', JSON.stringify(failedFiles, null, 2));
  }
}

main();
