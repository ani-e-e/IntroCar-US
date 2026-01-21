#!/usr/bin/env python3
"""
Extract lookbook/catalogue data from products.json which contains full metadata
including categories, fitment (make/model/chassis), and hotspots.
"""

import json
from collections import defaultdict

# Paths
PRODUCTS_JSON = '/sessions/practical-relaxed-newton/mnt/IntroCar - US Website Prototype/data/json/products.json'
OUTPUT_JSON = '/sessions/practical-relaxed-newton/mnt/IntroCar - US Website Prototype/data/json/lookbooks.json'
HOTSPOT_INDEX = '/sessions/practical-relaxed-newton/mnt/IntroCar - US Website Prototype/data/json/hotspot-index.json'

# Image URL prefix for lookbook images
IMAGE_BASE_URL = 'https://www.introcar.com/media/lookbookslider/'

def extract_makes_models(fitment):
    """Extract unique makes and models from fitment data."""
    makes = set()
    models = set()

    if not fitment:
        return list(makes), list(models)

    for f in fitment:
        if f.get('make'):
            makes.add(f['make'])
        if f.get('model'):
            models.add(f['model'])

    return sorted(list(makes)), sorted(list(models))

def extract_categories(categories_str):
    """Extract main category and subcategory from categories string."""
    if not categories_str:
        return None, None

    # Categories format: "Main/Sub|Main" or "Main/Sub"
    parts = categories_str.split('|')[0]  # Take first category path
    if '/' in parts:
        main, sub = parts.split('/', 1)
        return main.strip(), sub.strip()
    return parts.strip(), None

def get_year_range_from_fitment(fitment):
    """Estimate year range from chassis numbers (rough approximation)."""
    # This is simplified - would need proper chassis-to-year mapping
    # For now, just return None to indicate we don't have explicit years
    return None, None

def process_lookbooks():
    # Load products
    with open(PRODUCTS_JSON, 'r', encoding='utf-8') as f:
        products = json.load(f)

    print(f"Loaded {len(products)} products")

    # Filter for lookbooks
    lookbook_products = [p for p in products if p.get('stockType') == 'Lookbook']
    print(f"Found {len(lookbook_products)} lookbook products")

    lookbooks = []
    hotspot_to_lookbooks = defaultdict(list)

    # Also load the CSV image mapping if available
    image_map = {}
    try:
        import csv
        csv_path = '/sessions/practical-relaxed-newton/mnt/IntroCar - US Website Prototype/lookbooks_catalogues.csv'
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                sku = row.get('sku', '').strip()
                image = row.get('image', '').strip()
                if sku and image:
                    image_map[sku] = f"{IMAGE_BASE_URL}{image}"
        print(f"Loaded {len(image_map)} image mappings from CSV")
    except Exception as e:
        print(f"Could not load CSV image mapping: {e}")

    for p in lookbook_products:
        sku = p.get('sku', '')

        # Parse hotspots from pipe-separated string
        hotspots_raw = p.get('hotspot', '')
        hotspots = []
        if hotspots_raw:
            hotspots = [h.strip() for h in hotspots_raw.split('|') if h.strip()]

        # Extract metadata
        makes, models = extract_makes_models(p.get('fitment', []))
        main_category, subcategory = extract_categories(p.get('categories', ''))

        # Get image URL - try CSV mapping first, then catalogueLink
        image_url = image_map.get(sku)
        if not image_url and p.get('image'):
            image_url = p['image']

        lookbook = {
            'id': sku,
            'title': p.get('description', sku),
            'imageUrl': image_url,
            'cmsUrl': p.get('cmsPageUrl', ''),
            'catalogueLink': p.get('catalogueLink', ''),
            'hotspots': hotspots,
            'hotspotCount': len(hotspots),
            # Filtering metadata
            'makes': makes,
            'models': models,
            'category': main_category,
            'subcategory': subcategory,
            'fitment': p.get('fitment', []),
        }

        lookbooks.append(lookbook)

        # Build reverse index: parent SKU -> lookbook IDs
        for hotspot in hotspots:
            hotspot_upper = hotspot.upper()
            if sku not in hotspot_to_lookbooks[hotspot_upper]:
                hotspot_to_lookbooks[hotspot_upper].append(sku)

    # Sort lookbooks by title
    lookbooks.sort(key=lambda x: x['title'])

    # Write main lookbooks file
    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(lookbooks, f, indent=2)

    # Write hotspot index
    with open(HOTSPOT_INDEX, 'w', encoding='utf-8') as f:
        json.dump(dict(hotspot_to_lookbooks), f)

    print(f"\n✅ Processed {len(lookbooks)} lookbooks/catalogues")
    print(f"✅ Created hotspot index with {len(hotspot_to_lookbooks)} unique parent SKUs")

    # Stats
    with_images = sum(1 for lb in lookbooks if lb['imageUrl'])
    with_fitment = sum(1 for lb in lookbooks if lb['fitment'])
    with_category = sum(1 for lb in lookbooks if lb['category'])

    print(f"\n📊 Coverage stats:")
    print(f"   📸 {with_images} lookbooks have images ({100*with_images/len(lookbooks):.1f}%)")
    print(f"   🚗 {with_fitment} lookbooks have fitment data ({100*with_fitment/len(lookbooks):.1f}%)")
    print(f"   📂 {with_category} lookbooks have categories ({100*with_category/len(lookbooks):.1f}%)")

    # Unique makes and categories
    all_makes = set()
    all_categories = set()
    for lb in lookbooks:
        all_makes.update(lb['makes'])
        if lb['category']:
            all_categories.add(lb['category'])

    print(f"\n🏷️ Unique makes: {sorted(all_makes)}")
    print(f"📂 Unique categories: {sorted(all_categories)}")

    # Sample lookbook with metadata
    sample = next((lb for lb in lookbooks if lb['fitment'] and lb['category']), lookbooks[0])
    print(f"\n📖 Sample lookbook with metadata:")
    print(f"   ID: {sample['id']}")
    print(f"   Title: {sample['title']}")
    print(f"   Makes: {sample['makes']}")
    print(f"   Models: {sample['models'][:3]}{'...' if len(sample['models']) > 3 else ''}")
    print(f"   Category: {sample['category']}/{sample['subcategory']}")
    print(f"   Fitment entries: {len(sample['fitment'])}")
    print(f"   Hotspots: {sample['hotspotCount']} parts")

if __name__ == '__main__':
    process_lookbooks()
