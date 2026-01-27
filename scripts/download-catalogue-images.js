/**
 * Download Catalogue Images from IntroCar.com
 *
 * The images on the server use spaces and proper case:
 * - JSON has: abs_unit_continental_gt_2004.jpg
 * - Server has: ABS%20UNIT,%20Continental%20GT%202004.jpg
 *
 * Run from your Mac:
 *   cd "IntroCar - US Website Prototype"
 *   node scripts/download-catalogue-images.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'https://www.introcar.com/media/lookbookslider/';
const OUTPUT_DIR = path.join(__dirname, '../public/images/catalogues');
const LOOKBOOKS_PATH = path.join(__dirname, '../data/json/lookbooks.json');
const REPORT_PATH = path.join(__dirname, 'catalogue-image-report.txt');

// Load lookbooks
const lookbooks = require(LOOKBOOKS_PATH);

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Convert underscore filename to the actual server filename format
 * abs_unit_continental_gt_2004.jpg -> ABS UNIT, Continental GT 2004.jpg
 */
function convertToServerFilename(filename) {
  // Remove extension
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);

  // Split by underscore
  const parts = base.split('_');

  // Common patterns observed:
  // 1. First 1-2 words are uppercase (ABS UNIT, BRAKE DISC, etc.)
  // 2. Followed by comma
  // 3. Rest is Title Case

  // Try to detect where the "type" ends and "model" begins
  // Usually after words like: unit, disc, pad, pump, valve, etc.
  const typeWords = ['unit', 'disc', 'pad', 'pump', 'valve', 'sensor', 'switch', 'motor', 'cylinder', 'hose', 'line', 'cable', 'lever', 'arm', 'bar', 'link', 'bush', 'mount', 'bracket', 'cover', 'housing', 'body', 'assembly', 'kit', 'set'];

  let typeEndIndex = 1; // Default: first word is type
  for (let i = 0; i < parts.length && i < 4; i++) {
    if (typeWords.includes(parts[i].toLowerCase())) {
      typeEndIndex = i + 1;
      break;
    }
  }

  // Build the filename
  const typePart = parts.slice(0, typeEndIndex).map(p => p.toUpperCase()).join(' ');
  const modelPart = parts.slice(typeEndIndex).map(p => {
    // Capitalize first letter
    return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
  }).join(' ');

  if (modelPart) {
    return `${typePart}, ${modelPart}${ext}`;
  }
  return `${typePart}${ext}`;
}

/**
 * Generate multiple filename variations to try
 */
function getFilenameVariations(originalFilename) {
  const variations = [];
  const decoded = decodeURIComponent(originalFilename);

  // 1. Original as-is
  variations.push(originalFilename);

  // 2. Converted format (underscore to spaces with comma)
  const converted = convertToServerFilename(decoded);
  variations.push(converted);
  variations.push(encodeURIComponent(converted));

  // 3. Simple underscore to space
  const withSpaces = decoded.replace(/_/g, ' ');
  variations.push(withSpaces);
  variations.push(encodeURIComponent(withSpaces));

  // 4. Uppercase with spaces
  const upperSpaces = withSpaces.toUpperCase();
  variations.push(upperSpaces);
  variations.push(encodeURIComponent(upperSpaces));

  // 5. Title case with spaces
  const titleCase = withSpaces.replace(/\b\w/g, c => c.toUpperCase());
  variations.push(titleCase);
  variations.push(encodeURIComponent(titleCase));

  // 6. First part uppercase, rest title case, with comma
  const parts = decoded.replace(/\.[^.]+$/, '').split('_');
  if (parts.length > 2) {
    const ext = path.extname(decoded);
    // Try: "FIRST SECOND, Rest Of Name.jpg"
    const format1 = parts.slice(0, 2).map(p => p.toUpperCase()).join(' ') + ', ' +
                    parts.slice(2).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') + ext;
    variations.push(format1);
    variations.push(encodeURIComponent(format1));

    // Try: "FIRST, Rest Of Name.jpg"
    const format2 = parts[0].toUpperCase() + ', ' +
                    parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') + ext;
    variations.push(format2);
    variations.push(encodeURIComponent(format2));
  }

  // Remove duplicates
  return [...new Set(variations)];
}

/**
 * Download a single image
 */
function downloadImage(url, localPath) {
  return new Promise((resolve) => {
    const options = {
      timeout: 20000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    };

    const request = https.get(url, options, (response) => {
      // Handle redirects
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
 * Try downloading with multiple filename variations
 */
async function tryDownload(originalUrl, catalogueId) {
  const urlObj = new URL(originalUrl);
  const originalFilename = path.basename(urlObj.pathname);

  // Clean filename for local storage
  const localFilename = decodeURIComponent(originalFilename)
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

  // Get variations to try
  const variations = getFilenameVariations(originalFilename);

  for (const variation of variations) {
    const tryUrl = BASE_URL + variation;
    const result = await downloadImage(tryUrl, localPath);

    if (result.success) {
      return { success: true, localFilename, foundUrl: tryUrl, size: result.size };
    }
  }

  return { success: false, originalUrl, triedVariations: variations.length };
}

/**
 * Main download function
 */
async function main() {
  console.log('='.repeat(60));
  console.log('IntroCar Catalogue Image Downloader');
  console.log('='.repeat(60));
  console.log('');
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log('');

  // Get unique URLs
  const urlMap = new Map();
  lookbooks.forEach(lb => {
    if (lb.imageUrl && lb.imageUrl.startsWith('http')) {
      if (!urlMap.has(lb.imageUrl)) {
        urlMap.set(lb.imageUrl, lb.id);
      }
    }
  });

  const total = urlMap.size;
  console.log(`Found ${total} unique images to download`);
  console.log('');

  const results = { downloaded: [], skipped: [], failed: [] };
  let processed = 0;

  for (const [url, catalogueId] of urlMap) {
    processed++;

    if (processed % 100 === 0 || processed === total) {
      console.log(`\nProgress: ${processed}/${total} (${Math.round(processed/total*100)}%)`);
    }

    const result = await tryDownload(url, catalogueId);

    if (result.success) {
      if (result.skipped) {
        results.skipped.push({ url, localFilename: result.localFilename });
        process.stdout.write('s');
      } else {
        results.downloaded.push({ url, localFilename: result.localFilename, foundUrl: result.foundUrl });
        process.stdout.write('.');
      }
    } else {
      results.failed.push({ url, catalogueId });
      process.stdout.write('x');
    }

    // Small delay to be nice to the server
    await new Promise(r => setTimeout(r, 50));
  }

  console.log('\n');
  console.log('='.repeat(60));
  console.log('RESULTS');
  console.log('='.repeat(60));
  console.log(`Downloaded: ${results.downloaded.length}`);
  console.log(`Already existed: ${results.skipped.length}`);
  console.log(`Failed: ${results.failed.length}`);
  console.log('');

  // Update lookbooks.json
  const successUrls = new Map();
  [...results.downloaded, ...results.skipped].forEach(r => {
    successUrls.set(r.url, r.localFilename);
  });

  if (successUrls.size > 0) {
    console.log('Updating lookbooks.json...');

    const updated = lookbooks.map(lb => {
      if (lb.imageUrl && successUrls.has(lb.imageUrl)) {
        return {
          ...lb,
          originalImageUrl: lb.imageUrl,
          imageUrl: `/images/catalogues/${successUrls.get(lb.imageUrl)}`
        };
      }
      return lb;
    });

    // Backup
    const backupPath = LOOKBOOKS_PATH.replace('.json', `-backup-${Date.now()}.json`);
    fs.copyFileSync(LOOKBOOKS_PATH, backupPath);
    console.log(`Backup: ${backupPath}`);

    fs.writeFileSync(LOOKBOOKS_PATH, JSON.stringify(updated, null, 2));
    console.log('Updated lookbooks.json with local paths');
  }

  // Report failed
  if (results.failed.length > 0) {
    let report = `FAILED DOWNLOADS (${results.failed.length})\n${'='.repeat(40)}\n\n`;

    results.failed.forEach(f => {
      const lb = lookbooks.find(l => l.id === f.catalogueId);
      report += `Title: ${lb?.title || 'Unknown'}\n`;
      report += `URL: ${f.url}\n\n`;
    });

    fs.writeFileSync(REPORT_PATH, report);
    console.log(`\nFailed downloads report: ${REPORT_PATH}`);
  }

  console.log('\nDone!');
}

main().catch(console.error);
