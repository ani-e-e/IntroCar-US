/**
 * Retry downloading failed catalogue images
 *
 * Based on patterns discovered:
 * - abs_unit_continental_gt_2004.jpg → ABS UNIT, Continental GT 2004.jpg
 * - accumulator_1001.jpg → Accumulator 1001.jpg
 *
 * Run: node scripts/download-catalogue-images-retry.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.introcar.com/media/lookbookslider/';
const OUTPUT_DIR = path.join(__dirname, '../public/images/catalogues');
const LOOKBOOKS_PATH = path.join(__dirname, '../data/json/lookbooks.json');
const REPORT_PATH = path.join(__dirname, 'catalogue-image-report-final.txt');

const lookbooks = require(LOOKBOOKS_PATH);

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Smart filename converter based on discovered patterns
 */
function convertFilename(filename) {
  const variations = [];
  const ext = path.extname(filename);
  const base = path.basename(filename, ext).toLowerCase();
  const parts = base.split('_');

  // Pattern 1: "TYPE TYPE, Model Model Year.jpg"
  // e.g., abs_unit_continental_gt_2004 → ABS UNIT, Continental GT 2004
  if (parts.length >= 3) {
    // Find where "type" ends - usually first 1-2 words
    const typeEndPatterns = [
      // 2-word types
      ['abs', 'unit'], ['abs', 'modulator'], ['brake', 'disc'], ['brake', 'pad'],
      ['oil', 'filter'], ['air', 'filter'], ['fuel', 'pump'], ['water', 'pump'],
      ['power', 'steering'], ['steering', 'wheel'], ['door', 'handle'],
      ['window', 'regulator'], ['seat', 'belt'], ['head', 'lamp'], ['tail', 'lamp'],
      ['side', 'mirror'], ['wiper', 'motor'], ['wiper', 'blade'],
      // 1-word types that should have comma after
      ['accumulator'], ['alternator'], ['starter'], ['compressor'], ['condenser'],
      ['radiator'], ['thermostat'], ['sensor'], ['switch'], ['relay'], ['fuse'],
      ['bearing'], ['bushing'], ['gasket'], ['seal'], ['hose'], ['belt'], ['chain'],
      ['spring'], ['shock'], ['strut'], ['caliper'], ['rotor'], ['cylinder'],
    ];

    let typeEndIndex = 1; // Default

    // Check for 2-word type matches
    for (const pattern of typeEndPatterns) {
      if (pattern.length === 2 && parts[0] === pattern[0] && parts[1] === pattern[1]) {
        typeEndIndex = 2;
        break;
      }
    }

    // Build variations
    const typePart = parts.slice(0, typeEndIndex).map(p => p.toUpperCase()).join(' ');
    const restPart = parts.slice(typeEndIndex).map(p =>
      p.charAt(0).toUpperCase() + p.slice(1)
    ).join(' ');

    // Variation 1: TYPE, Rest (with comma)
    const v1 = `${typePart}, ${restPart}${ext}`;
    variations.push(v1);

    // Variation 2: TYPE Rest (no comma)
    const v2 = `${typePart} ${restPart}${ext}`;
    variations.push(v2);

    // Variation 3: Title Case all (first word upper only)
    const v3 = parts[0].charAt(0).toUpperCase() + parts[0].slice(1) + ' ' +
               parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') + ext;
    variations.push(v3);

    // Variation 4: First word Title Case, rest as-is with spaces
    const v4 = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') + ext;
    variations.push(v4);
  }

  // Pattern 2: Simple "Word Word.jpg" (no comma)
  // e.g., accumulator_1001 → Accumulator 1001
  const simple = parts.map((p, i) => {
    if (i === 0) return p.charAt(0).toUpperCase() + p.slice(1);
    return p;
  }).join(' ') + ext;
  variations.push(simple);

  // Pattern 3: ALL CAPS with spaces
  const allCaps = parts.join(' ').toUpperCase() + ext;
  variations.push(allCaps);

  // Pattern 4: Original with spaces instead of underscores
  const withSpaces = base.replace(/_/g, ' ') + ext;
  variations.push(withSpaces);

  // URL encode all variations
  const encoded = variations.map(v => encodeURIComponent(v));

  return [...new Set([...variations, ...encoded])];
}

/**
 * Download image
 */
function downloadImage(url, localPath) {
  return new Promise((resolve) => {
    const options = {
      timeout: 20000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    };

    const request = https.get(url, options, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadImage(redirectUrl, localPath).then(resolve);
          return;
        }
      }

      if (response.statusCode !== 200) {
        resolve({ success: false, status: response.statusCode });
        return;
      }

      const contentType = response.headers['content-type'] || '';
      if (!contentType.includes('image')) {
        resolve({ success: false, status: 'not-image' });
        return;
      }

      const fileStream = fs.createWriteStream(localPath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        const stats = fs.statSync(localPath);
        if (stats.size > 500) {
          resolve({ success: true, size: stats.size });
        } else {
          fs.unlinkSync(localPath);
          resolve({ success: false, status: 'too-small' });
        }
      });

      fileStream.on('error', (err) => {
        fs.unlink(localPath, () => {});
        resolve({ success: false, status: err.message });
      });
    });

    request.on('error', (err) => {
      resolve({ success: false, status: err.message });
    });

    request.on('timeout', () => {
      request.destroy();
      resolve({ success: false, status: 'timeout' });
    });
  });
}

/**
 * Try downloading with smart variations
 */
async function tryDownload(originalUrl) {
  const urlObj = new URL(originalUrl);
  const originalFilename = decodeURIComponent(path.basename(urlObj.pathname));

  // Local filename (clean)
  const localFilename = originalFilename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .toLowerCase();
  const localPath = path.join(OUTPUT_DIR, localFilename);

  // Skip if already exists
  if (fs.existsSync(localPath)) {
    const stats = fs.statSync(localPath);
    if (stats.size > 500) {
      return { success: true, localFilename, skipped: true };
    }
  }

  // Get smart variations
  const variations = convertFilename(originalFilename);

  for (const variation of variations) {
    const tryUrl = BASE_URL + variation;
    const result = await downloadImage(tryUrl, localPath);

    if (result.success) {
      return { success: true, localFilename, foundUrl: tryUrl };
    }
  }

  return { success: false, originalUrl, tried: variations.length };
}

async function main() {
  console.log('='.repeat(60));
  console.log('IntroCar Catalogue Image Downloader - RETRY');
  console.log('='.repeat(60));
  console.log('');

  // Find items that still need downloading (imageUrl still starts with http)
  const needsDownload = lookbooks.filter(lb =>
    lb.imageUrl && lb.imageUrl.startsWith('http')
  );

  console.log(`Found ${needsDownload.length} images still needing download`);
  console.log('');

  if (needsDownload.length === 0) {
    console.log('All images already downloaded!');
    return;
  }

  const results = { downloaded: [], skipped: [], failed: [] };
  let processed = 0;
  const total = needsDownload.length;

  for (const lb of needsDownload) {
    processed++;

    if (processed % 50 === 0 || processed === total) {
      console.log(`\nProgress: ${processed}/${total} (${Math.round(processed/total*100)}%)`);
    }

    const result = await tryDownload(lb.imageUrl);

    if (result.success) {
      if (result.skipped) {
        results.skipped.push({ url: lb.imageUrl, localFilename: result.localFilename });
        process.stdout.write('s');
      } else {
        results.downloaded.push({ url: lb.imageUrl, localFilename: result.localFilename, foundUrl: result.foundUrl });
        process.stdout.write('.');
      }
    } else {
      results.failed.push({ url: lb.imageUrl, title: lb.title, id: lb.id });
      process.stdout.write('x');
    }

    await new Promise(r => setTimeout(r, 50));
  }

  console.log('\n');
  console.log('='.repeat(60));
  console.log('RESULTS');
  console.log('='.repeat(60));
  console.log(`Downloaded: ${results.downloaded.length}`);
  console.log(`Skipped: ${results.skipped.length}`);
  console.log(`Failed: ${results.failed.length}`);
  console.log('');

  // Update lookbooks.json
  if (results.downloaded.length > 0) {
    console.log('Updating lookbooks.json...');

    const successMap = new Map();
    results.downloaded.forEach(r => successMap.set(r.url, r.localFilename));

    const updated = lookbooks.map(lb => {
      if (lb.imageUrl && successMap.has(lb.imageUrl)) {
        return {
          ...lb,
          originalImageUrl: lb.imageUrl,
          imageUrl: `/images/catalogues/${successMap.get(lb.imageUrl)}`
        };
      }
      return lb;
    });

    fs.writeFileSync(LOOKBOOKS_PATH, JSON.stringify(updated, null, 2));
    console.log('Updated lookbooks.json');
  }

  // Final report
  if (results.failed.length > 0) {
    let report = `STILL FAILED (${results.failed.length})\n${'='.repeat(40)}\n\n`;
    report += 'These will need manual lookup:\n\n';

    results.failed.forEach(f => {
      report += `Title: ${f.title}\n`;
      report += `ID: ${f.id}\n`;
      report += `URL: ${f.url}\n\n`;
    });

    fs.writeFileSync(REPORT_PATH, report);
    console.log(`\nFinal report: ${REPORT_PATH}`);
  }

  console.log('\nDone!');
}

main().catch(console.error);
