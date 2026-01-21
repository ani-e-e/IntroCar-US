const fs = require('fs');
const path = require('path');

function splitJsonFile(inputFile, outputPrefix, maxSizeMB = 90) {
  console.log(`Reading ${inputFile}...`);
  const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
  
  if (Array.isArray(data)) {
    // Split array into chunks
    const maxBytes = maxSizeMB * 1024 * 1024;
    let chunks = [];
    let currentChunk = [];
    let currentSize = 0;
    
    for (const item of data) {
      const itemStr = JSON.stringify(item);
      const itemSize = Buffer.byteLength(itemStr, 'utf8');
      
      if (currentSize + itemSize > maxBytes && currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = [];
        currentSize = 0;
      }
      
      currentChunk.push(item);
      currentSize += itemSize;
    }
    
    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }
    
    // Write chunks
    for (let i = 0; i < chunks.length; i++) {
      const outputFile = `${outputPrefix}-${i + 1}.json`;
      fs.writeFileSync(outputFile, JSON.stringify(chunks[i]));
      const size = (fs.statSync(outputFile).size / 1024 / 1024).toFixed(1);
      console.log(`  Written ${outputFile} (${size} MB, ${chunks[i].length} items)`);
    }
    
    // Write manifest
    const manifest = { chunks: chunks.length, type: 'array' };
    fs.writeFileSync(`${outputPrefix}-manifest.json`, JSON.stringify(manifest));
    console.log(`  Total: ${chunks.length} chunks`);
    
    return chunks.length;
  } else if (typeof data === 'object') {
    // Split object by keys
    const keys = Object.keys(data);
    const maxBytes = maxSizeMB * 1024 * 1024;
    let chunks = [];
    let currentChunk = {};
    let currentSize = 0;
    
    for (const key of keys) {
      const itemStr = JSON.stringify({ [key]: data[key] });
      const itemSize = Buffer.byteLength(itemStr, 'utf8');
      
      if (currentSize + itemSize > maxBytes && Object.keys(currentChunk).length > 0) {
        chunks.push(currentChunk);
        currentChunk = {};
        currentSize = 0;
      }
      
      currentChunk[key] = data[key];
      currentSize += itemSize;
    }
    
    if (Object.keys(currentChunk).length > 0) {
      chunks.push(currentChunk);
    }
    
    // Write chunks
    for (let i = 0; i < chunks.length; i++) {
      const outputFile = `${outputPrefix}-${i + 1}.json`;
      fs.writeFileSync(outputFile, JSON.stringify(chunks[i]));
      const size = (fs.statSync(outputFile).size / 1024 / 1024).toFixed(1);
      console.log(`  Written ${outputFile} (${size} MB, ${Object.keys(chunks[i]).length} keys)`);
    }
    
    // Write manifest
    const manifest = { chunks: chunks.length, type: 'object' };
    fs.writeFileSync(`${outputPrefix}-manifest.json`, JSON.stringify(manifest));
    console.log(`  Total: ${chunks.length} chunks`);
    
    return chunks.length;
  }
}

// Split products.json
console.log('\n=== Splitting products.json ===');
splitJsonFile('data/json/products.json', 'data/json/products');

// Split chassis.json  
console.log('\n=== Splitting chassis.json ===');
splitJsonFile('data/json/chassis.json', 'data/json/chassis');

console.log('\nDone!');
