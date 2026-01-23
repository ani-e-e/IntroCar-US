/**
 * Scrape actual image URLs from IntroCar lookbook pages
 *
 * Run from your Mac:
 *   cd "IntroCar - US Website Prototype"
 *   node scripts/scrape-image-urls.js
 *
 * This will:
 * 1. Visit each lookbook page
 * 2. Extract the real image URL
 * 3. Build a mapping table (CSV filename -> real server filename)
 * 4. Download images with correct names
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const toCheck = require('../lookbooks-to-check.json');
const outputDir = path.join(__dirname, '../public/images/catalogues');
const baseUrl = 'https://www.introcar.com/';

console.log('='.repeat(60));
console.log('IntroCar Image URL Scraper');
console.log('='.repeat(60));
console.log(`\nFound ${toCheck.length} lookbooks to check\n`);

const mapping = [];
let processed = 0;
let found = 0;
let notFound = 0;

function fetchPage(url) {
  return new Promise((resolve) => {
    const request = https.get(url, {
      timeout: 20000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        fetchPage(response.headers.location).then(resolve);
        return;
      }

      if (response.statusCode !== 200) {
        resolve(null);
        return;
      }

      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => resolve(data));
    });

    request.on('error', () => resolve(null));
    request.on('timeout', () => { request.destroy(); resolve(null); });
  });
}

function extractImageUrl(html) {
  // Look for the lookbook slider image
  // Pattern: src="/media/lookbookslider/FILENAME" or similar
  const patterns = [
    /src="(\/media\/lookbookslider\/[^"]+)"/i,
    /src="(https:\/\/www\.introcar\.com\/media\/lookbookslider\/[^"]+)"/i,
    /data-src="(\/media\/lookbookslider\/[^"]+)"/i,
    /data-src="(https:\/\/www\.introcar\.com\/media\/lookbookslider\/[^"]+)"/i,
    /url\(['"](\/media\/lookbookslider\/[^'"]+)['"]\)/i
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      let url = match[1];
      if (url.startsWith('/')) {
        url = 'https://www.introcar.com' + url;
      }
      return url;
    }
  }

  return null;
}

function downloadImage(url, localPath) {
  return new Promise((resolve) => {
    const request = https.get(url, {
      timeout: 20000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        downloadImage(response.headers.location, localPath).then(resolve);
        return;
      }

      if (response.statusCode !== 200) {
        resolve(false);
        return;
      }

      const fileStream = fs.createWriteStream(localPath);
      response.pipe(fileStream);
      fileStream.on('finish', () => { fileStream.close(); resolve(true); });
      fileStream.on('error', () => resolve(false));
    });

    request.on('error', () => resolve(false));
    request.on('timeout', () => { request.destroy(); resolve(false); });
  });
}

async function processLookbook(item) {
  const pageUrl = baseUrl + item.cmsUrl;
  const html = await fetchPage(pageUrl);

  if (!html) {
    return { ...item, status: 'page_not_found', realUrl: null };
  }

  const imageUrl = extractImageUrl(html);

  if (!imageUrl) {
    return { ...item, status: 'image_not_found', realUrl: null };
  }

  // Extract the real filename from URL
  const realFilename = decodeURIComponent(imageUrl.split('/').pop());

  // Download with the CSV filename (so it matches our lookbooks.json)
  const localPath = path.join(outputDir, item.csvFilename);

  if (!fs.existsSync(localPath)) {
    const downloaded = await downloadImage(imageUrl, localPath);
    if (downloaded) {
      return { ...item, status: 'downloaded', realUrl: imageUrl, realFilename };
    } else {
      return { ...item, status: 'download_failed', realUrl: imageUrl, realFilename };
    }
  } else {
    return { ...item, status: 'already_exists', realUrl: imageUrl, realFilename };
  }
}

async function main() {
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (let i = 0; i < toCheck.length; i++) {
    const item = toCheck[i];
    const result = await processLookbook(item);
    mapping.push(result);

    processed++;
    if (result.status === 'downloaded' || result.status === 'already_exists') {
      found++;
      process.stdout.write('.');
    } else {
      notFound++;
      process.stdout.write('x');
    }

    if (processed % 50 === 0) {
      console.log(` ${processed}/${toCheck.length} (found: ${found})`);
    }

    // Small delay to be nice to the server
    await new Promise(r => setTimeout(r, 100));
  }

  console.log('\n');
  console.log('='.repeat(60));
  console.log('RESULTS');
  console.log('='.repeat(60));
  console.log(`Processed: ${processed}`);
  console.log(`Found & downloaded: ${found}`);
  console.log(`Not found: ${notFound}`);

  // Save mapping table
  const csvLines = ['sku,csv_filename,real_filename,real_url,status'];
  mapping.forEach(m => {
    csvLines.push(`"${m.sku}","${m.csvFilename}","${m.realFilename || ''}","${m.realUrl || ''}","${m.status}"`);
  });

  fs.writeFileSync('image-mapping.csv', csvLines.join('\n'));
  console.log('\nSaved mapping to image-mapping.csv');

  // Save failed ones
  const failed = mapping.filter(m => m.status !== 'downloaded' && m.status !== 'already_exists');
  if (failed.length > 0) {
    fs.writeFileSync('failed-scrape.json', JSON.stringify(failed, null, 2));
    console.log(`Saved ${failed.length} failed items to failed-scrape.json`);
  }

  console.log('\nDone!');
}

main().catch(console.error);
