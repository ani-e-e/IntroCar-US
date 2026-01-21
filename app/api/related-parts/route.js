import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function loadJsonFile(filename) {
  try {
    const filepath = path.join(process.cwd(), 'data', 'json', filename);
    if (fs.existsSync(filepath)) {
      return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    }
  } catch (error) {
    console.warn(`Could not load ${filename}:`, error.message);
  }
  return null;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sku = searchParams.get('sku');
    const limit = parseInt(searchParams.get('limit') || '4');

    if (!sku) {
      return NextResponse.json({ error: 'SKU required' }, { status: 400 });
    }

    const products = loadJsonFile('products.json') || [];
    const fitmentLookup = loadJsonFile('fitment-lookup.json') || {};

    const currentProduct = products.find(p => p.sku?.toUpperCase() === sku.toUpperCase());
    if (!currentProduct) {
      return NextResponse.json({ relatedParts: [] });
    }

    const relatedParts = [];
    const addedSkus = new Set([sku.toUpperCase()]);
    const parentSku = currentProduct.parentSku || currentProduct.sku;

    // Find products from same category that are in stock
    if (currentProduct.categories) {
      const mainCategory = currentProduct.categories.split('/')[0];
      const sameCategory = products
        .filter(p => {
          const pSku = p.sku?.toUpperCase();
          return !addedSkus.has(pSku) &&
            p.categories?.startsWith(mainCategory) &&
            (p.availableNow > 0 || p.available1to3Days > 0 || p.inStock);
        })
        .slice(0, limit * 2);

      sameCategory.forEach(p => {
        if (relatedParts.length < limit && !addedSkus.has(p.sku?.toUpperCase())) {
          relatedParts.push({ ...p, reason: 'category' });
          addedSkus.add(p.sku?.toUpperCase());
        }
      });
    }

    // Find from same model fitment
    if (relatedParts.length < limit) {
      const currentFitment = fitmentLookup[parentSku];
      if (currentFitment && currentFitment.length > 0) {
        const currentModels = new Set(currentFitment.map(f => f.model));
        
        Object.entries(fitmentLookup).forEach(([pSku, fitments]) => {
          if (pSku !== parentSku && Array.isArray(fitments) && fitments.some(f => currentModels.has(f.model))) {
            products.forEach(p => {
              const pSkuUpper = p.sku?.toUpperCase();
              if (!addedSkus.has(pSkuUpper) && 
                  p.parentSku === pSku &&
                  (p.availableNow > 0 || p.available1to3Days > 0 || p.inStock) &&
                  relatedParts.length < limit) {
                relatedParts.push({ ...p, reason: 'same-model' });
                addedSkus.add(pSkuUpper);
              }
            });
          }
        });
      }
    }

    return NextResponse.json({ relatedParts: relatedParts.slice(0, limit) });
  } catch (error) {
    console.error('Related parts API error:', error);
    return NextResponse.json({ error: 'Failed to fetch related parts', details: error.message }, { status: 500 });
  }
}
