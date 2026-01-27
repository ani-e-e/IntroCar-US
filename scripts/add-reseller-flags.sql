-- ============================================
-- Add Reseller Flags Column to Products
-- ============================================
-- This migration adds a reseller_flags column to the products table
-- to support filtering products for specific reseller sites.
--
-- Run this in your Supabase SQL Editor.
-- ============================================

-- 1. Add the reseller_flags column if it doesn't exist
ALTER TABLE products
ADD COLUMN IF NOT EXISTS reseller_flags TEXT[] DEFAULT '{}';

-- 2. Create an index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_products_reseller_flags
ON products USING GIN (reseller_flags);

-- 3. Tag all Prestige Parts products with 'prestige_parts' flag
-- This includes: 'Prestige Parts', 'Prestige Parts (OE)', and 'Uprated'
UPDATE products
SET reseller_flags = array_append(
  COALESCE(reseller_flags, '{}'),
  'prestige_parts'
)
WHERE stock_type IN ('Prestige Parts', 'Prestige Parts (OE)', 'Uprated')
  AND NOT ('prestige_parts' = ANY(COALESCE(reseller_flags, '{}')));

-- 4. Verify the update
SELECT
  stock_type,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE 'prestige_parts' = ANY(reseller_flags)) as tagged_count
FROM products
WHERE stock_type IN ('Prestige Parts', 'Prestige Parts (OE)', 'Uprated')
GROUP BY stock_type
ORDER BY stock_type;

-- 5. Show total tagged products
SELECT
  COUNT(*) as total_prestige_parts_tagged
FROM products
WHERE 'prestige_parts' = ANY(reseller_flags);

-- ============================================
-- Notes:
-- - Reseller sites filter by checking if their flag is in reseller_flags
-- - Multiple flags can be added to a product (e.g., ['prestige_parts', 'reseller_2'])
-- - The 'prestige_parts' flag is used by Albers Motorcars light site
-- ============================================
