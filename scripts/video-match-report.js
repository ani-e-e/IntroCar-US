/**
 * Video SKU Matching Report
 * Analyzes which video folders match product parent SKUs
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data', 'json');

// Load data
const videos = JSON.parse(fs.readFileSync(path.join(dataDir, 'videos.json'), 'utf-8'));
const products = JSON.parse(fs.readFileSync(path.join(dataDir, 'products.json'), 'utf-8'));

// Build lookup maps
const parentSkus = new Set();
const skuToParent = {};
const parentToProducts = {};

products.forEach(p => {
  if (p.parentSku) {
    const parent = p.parentSku.toUpperCase();
    parentSkus.add(parent);

    if (!parentToProducts[parent]) {
      parentToProducts[parent] = [];
    }
    parentToProducts[parent].push({
      sku: p.sku,
      name: p.name,
      stockType: p.stockType,
    });
  }
  if (p.sku) {
    skuToParent[p.sku.toUpperCase()] = p.parentSku;
  }
});

console.log('='.repeat(60));
console.log('VIDEO SKU MATCHING REPORT');
console.log('='.repeat(60));
console.log('');
console.log('Total videos in index:', Object.keys(videos).length);
console.log('Total products:', products.length);
console.log('Unique parent SKUs in products:', parentSkus.size);
console.log('');

// Categorize each video
const matched = [];
const kits = [];
const edits = [];
const versionSuffix = [];
const otherUnmatched = [];

Object.keys(videos).forEach(videoSku => {
  const upper = videoSku.toUpperCase();
  const videoData = videos[videoSku];

  // Check if it matches a parent SKU
  if (parentSkus.has(upper)) {
    const variants = parentToProducts[upper] || [];
    matched.push({
      videoSku,
      folder: videoData.folder,
      variantCount: variants.length,
      variants: variants.slice(0, 5), // First 5 for brevity
    });
    return;
  }

  // Categorize unmatched
  if (upper.includes('&') || upper.includes('KIT') || upper.includes('-')) {
    // Check if it's actually a kit pattern
    if (upper.includes('&') || (upper.includes('KIT') && !parentSkus.has(upper))) {
      kits.push({ videoSku, folder: videoData.folder });
      return;
    }
  }

  if (upper.includes('EDIT') || upper.includes('SEARCH')) {
    edits.push({ videoSku, folder: videoData.folder });
    return;
  }

  if (upper.match(/[\.-]\d+$/) || upper.match(/\.01$/)) {
    // Try matching without suffix
    const baseSku = upper.replace(/[\.-]\d+$/, '').replace(/\.01$/, '');
    const hasMatch = parentSkus.has(baseSku);
    versionSuffix.push({
      videoSku,
      folder: videoData.folder,
      baseSku,
      wouldMatch: hasMatch,
    });
    return;
  }

  otherUnmatched.push({ videoSku, folder: videoData.folder });
});

console.log('MATCHING RESULTS:');
console.log('-'.repeat(40));
console.log('✅ Matched to parent SKU:', matched.length);
console.log('');
console.log('UNMATCHED CATEGORIES:');
console.log('  📦 Kit combinations (multiple SKUs):', kits.length);
console.log('  ✏️  Edit/placeholder folders:', edits.length);
console.log('  🔢 Version suffixes (.01, -01, etc):', versionSuffix.length);
console.log('  ❓ Other unmatched:', otherUnmatched.length);
console.log('');

// Show details
if (kits.length > 0) {
  console.log('\n📦 KIT COMBINATIONS:');
  console.log('-'.repeat(40));
  kits.forEach(k => console.log('  ', k.videoSku));
}

if (edits.length > 0) {
  console.log('\n✏️  EDIT/PLACEHOLDER FOLDERS:');
  console.log('-'.repeat(40));
  edits.forEach(e => console.log('  ', e.videoSku));
}

if (versionSuffix.length > 0) {
  console.log('\n🔢 VERSION SUFFIXES:');
  console.log('-'.repeat(40));
  versionSuffix.forEach(v => {
    const match = v.wouldMatch ? '✅ base matches' : '❌ no match';
    console.log('  ', v.videoSku, '→', v.baseSku, `(${match})`);
  });
}

if (otherUnmatched.length > 0) {
  console.log('\n❓ OTHER UNMATCHED:');
  console.log('-'.repeat(40));
  otherUnmatched.forEach(u => console.log('  ', u.videoSku));
}

// Generate JSON report
const report = {
  generatedAt: new Date().toISOString(),
  summary: {
    totalVideos: Object.keys(videos).length,
    matchedToParentSku: matched.length,
    unmatchedTotal: kits.length + edits.length + versionSuffix.length + otherUnmatched.length,
  },
  matched: {
    count: matched.length,
    note: 'These videos will display on all variant products sharing the parent SKU',
  },
  unmatched: {
    kitCombinations: {
      count: kits.length,
      items: kits,
      recommendation: 'These show multiple parts together. Consider linking to all component SKUs or picking one primary SKU.',
    },
    editPlaceholders: {
      count: edits.length,
      items: edits,
      recommendation: 'These folders should be renamed to valid SKUs or removed from Turntable.',
    },
    versionSuffixes: {
      count: versionSuffix.length,
      items: versionSuffix,
      recommendation: 'Update video lookup to strip suffixes, or rename folders to match exactly.',
    },
    other: {
      count: otherUnmatched.length,
      items: otherUnmatched,
      recommendation: 'Manually verify these SKUs exist in the product database.',
    },
  },
};

const reportPath = path.join(dataDir, 'video-matching-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log('\n' + '='.repeat(60));
console.log('📁 Full report saved to:', reportPath);
