#!/usr/bin/env python3
"""
Build an index of available product videos from the Turntable folder.
Maps SKU -> video file path for display on product pages.
"""

import os
import json
from pathlib import Path

# Source folder (mounted via Cowork)
VIDEO_SOURCE = '/sessions/practical-relaxed-newton/mnt/Christian Domini - Turntable'
OUTPUT_JSON = '/sessions/practical-relaxed-newton/mnt/IntroCar - US Website Prototype/data/json/videos.json'

def normalize_sku(sku):
    """Normalize SKU for matching - uppercase, remove common suffixes."""
    sku = sku.upper().strip()
    # Remove common suffixes for matching
    for suffix in ['-X', '-A', '-U', '.01', '.02']:
        if sku.endswith(suffix):
            sku = sku[:-len(suffix)]
    return sku

def build_video_index():
    video_index = {}

    if not os.path.exists(VIDEO_SOURCE):
        print(f"Video source folder not found: {VIDEO_SOURCE}")
        return

    # Walk through all SKU folders
    for sku_folder in os.listdir(VIDEO_SOURCE):
        folder_path = os.path.join(VIDEO_SOURCE, sku_folder)
        if not os.path.isdir(folder_path):
            continue

        # Find MP4 files in this folder
        mp4_files = []
        for f in os.listdir(folder_path):
            if f.lower().endswith('.mp4'):
                mp4_files.append(f)

        if not mp4_files:
            continue

        # Prefer the file that matches the SKU name
        primary_video = None
        for mp4 in mp4_files:
            # Check if filename matches SKU
            name_without_ext = os.path.splitext(mp4)[0]
            if name_without_ext.upper().startswith(sku_folder.upper()):
                primary_video = mp4
                break

        # If no exact match, take the first one
        if not primary_video:
            primary_video = mp4_files[0]

        # Store mapping (normalize SKU for matching)
        normalized_sku = normalize_sku(sku_folder)
        video_index[normalized_sku] = {
            'folder': sku_folder,
            'file': primary_video,
            'allFiles': mp4_files
        }

        # Also store with original folder name
        video_index[sku_folder.upper()] = {
            'folder': sku_folder,
            'file': primary_video,
            'allFiles': mp4_files
        }

    # Write index
    with open(OUTPUT_JSON, 'w') as f:
        json.dump(video_index, f, indent=2)

    print(f"✅ Built video index with {len(set(v['folder'] for v in video_index.values()))} unique SKU folders")
    print(f"✅ Total index entries (with variants): {len(video_index)}")

    # Sample
    sample = list(video_index.items())[:5]
    print("\n📹 Sample entries:")
    for sku, data in sample:
        print(f"   {sku}: {data['file']}")

if __name__ == '__main__':
    build_video_index()
