-- Migration: Add array columns to technical_videos table
-- Run this in Supabase SQL Editor

-- Add makes array column
ALTER TABLE technical_videos
ADD COLUMN IF NOT EXISTS makes TEXT[] DEFAULT '{}';

-- Add models array column
ALTER TABLE technical_videos
ADD COLUMN IF NOT EXISTS models TEXT[] DEFAULT '{}';

-- Add product_categories array column
ALTER TABLE technical_videos
ADD COLUMN IF NOT EXISTS product_categories TEXT[] DEFAULT '{}';

-- Create GIN indexes for array columns (for efficient @> queries)
CREATE INDEX IF NOT EXISTS idx_videos_makes ON technical_videos USING GIN (makes);
CREATE INDEX IF NOT EXISTS idx_videos_models ON technical_videos USING GIN (models);
CREATE INDEX IF NOT EXISTS idx_videos_product_categories ON technical_videos USING GIN (product_categories);

-- Verify the columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'technical_videos'
ORDER BY ordinal_position;
