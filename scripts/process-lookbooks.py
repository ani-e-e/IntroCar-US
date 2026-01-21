#!/usr/bin/env python3
"""
Process lookbooks/catalogues CSV data and generate JSON for the website.
Creates lookbooks.json with image URLs and hotspot mappings.
"""

import csv
import json
import os
from collections import defaultdict

# Paths
INPUT_CSV = '/sessions/practical-relaxed-newton/mnt/uploads/lookbooks_catalogues.csv'
OUTPUT_JSON = '/sessions/practical-relaxed-newton/mnt/IntroCar - US Website Prototype/data/json/lookbooks.json'
HOTSPOT_INDEX = '/sessions/practical-relaxed-newton/mnt/IntroCar - US Website Prototype/data/json/hotspot-index.json'

# Image URL prefix
IMAGE_BASE_URL = 'https://www.introcar.com/media/lookbookslider/'

def process_lookbooks():
    lookbooks = []
    hotspot_to_lookbooks = defaultdict(list)  # Maps parent SKU to lookbook IDs

    with open(INPUT_CSV, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)

        for row in reader:
            sku = row.get('sku', '').strip()
            title = row.get('slider title', '').strip()
            hotspots_raw = row.get('hotspot', '').strip()
            cms_url = row.get('cms page url', '').strip()
            image = row.get('image', '').strip()

            if not sku or not title:
                continue

            # Parse hotspots (pipe-separated parent SKUs)
            hotspots = []
            if hotspots_raw:
                hotspots = [h.strip() for h in hotspots_raw.split('|') if h.strip()]

            # Build image URL
            image_url = f"{IMAGE_BASE_URL}{image}" if image else None

            lookbook = {
                'id': sku,
                'title': title,
                'imageUrl': image_url,
                'cmsUrl': cms_url,
                'hotspots': hotspots,
                'hotspotCount': len(hotspots)
            }

            lookbooks.append(lookbook)

            # Build reverse index: parent SKU -> lookbook IDs (just IDs for space)
            for hotspot in hotspots:
                hotspot_upper = hotspot.upper()
                if sku not in hotspot_to_lookbooks[hotspot_upper]:
                    hotspot_to_lookbooks[hotspot_upper].append(sku)

    # Sort lookbooks by title
    lookbooks.sort(key=lambda x: x['title'])

    # Write main lookbooks file
    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(lookbooks, f, indent=2)

    # Write hotspot index (for quick lookups by parent SKU)
    with open(HOTSPOT_INDEX, 'w', encoding='utf-8') as f:
        json.dump(dict(hotspot_to_lookbooks), f)

    print(f"✅ Processed {len(lookbooks)} lookbooks/catalogues")
    print(f"✅ Created hotspot index with {len(hotspot_to_lookbooks)} unique parent SKUs")

    # Show some stats
    with_images = sum(1 for lb in lookbooks if lb['imageUrl'])
    print(f"📸 {with_images} lookbooks have images")

    # Show top 10 most referenced parent SKUs
    sorted_hotspots = sorted(hotspot_to_lookbooks.items(), key=lambda x: len(x[1]), reverse=True)[:10]
    print(f"\n🔗 Top 10 most referenced parent SKUs:")
    for sku, refs in sorted_hotspots:
        print(f"   {sku}: appears in {len(refs)} catalogues")

    # Sample lookbook
    print(f"\n📖 Sample lookbook:")
    sample = lookbooks[0]
    print(f"   ID: {sample['id']}")
    print(f"   Title: {sample['title']}")
    print(f"   Image: {sample['imageUrl']}")
    print(f"   Hotspots: {sample['hotspotCount']} parts")

if __name__ == '__main__':
    process_lookbooks()
