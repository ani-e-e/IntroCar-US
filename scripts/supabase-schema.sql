-- ============================================
-- IntroCar US - Supabase Database Schema
-- ============================================
-- This schema replaces Google Sheets for data management.
-- Data is exported to JSON files for the live site.
--
-- Run this in your Supabase SQL Editor to create all tables.
-- ============================================

-- ============================================
-- 1. PRODUCTS (main table - 79,080 records)
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  sku VARCHAR(50) UNIQUE NOT NULL,
  parent_sku VARCHAR(50),
  description TEXT,
  price DECIMAL(10,2),
  weight DECIMAL(8,4),

  -- Classification
  stock_type VARCHAR(100),
  search_part_type VARCHAR(50),
  categories TEXT,  -- Pipe-separated: "Brakes & Hydraulics/Discs|Service & Maintenance"

  -- Stock levels (updated daily)
  in_stock BOOLEAN DEFAULT false,
  available_now INTEGER DEFAULT 0,
  available_1_to_3_days INTEGER DEFAULT 0,

  -- NLA (No Longer Available)
  nla_date DATE,

  -- Images
  image VARCHAR(255),
  images JSONB DEFAULT '[]',
  image_url VARCHAR(500),  -- Cloudinary URL

  -- Additional info
  additional_info TEXT,
  number_required TEXT,  -- Contains text like "Four required per car"
  hotspot VARCHAR(255),
  cms_page_url VARCHAR(255),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_products_parent_sku ON products(parent_sku);
CREATE INDEX IF NOT EXISTS idx_products_stock_type ON products(stock_type);
CREATE INDEX IF NOT EXISTS idx_products_search_part_type ON products(search_part_type);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);

-- ============================================
-- 2. VEHICLES (96 records)
-- ============================================
CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  make VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year_start INTEGER,
  year_end INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(make, model)
);

CREATE INDEX IF NOT EXISTS idx_vehicles_make ON vehicles(make);

-- ============================================
-- 3. PRODUCT FITMENT (many-to-many: products <-> vehicles)
-- Links products to compatible vehicles with chassis ranges
-- ============================================
CREATE TABLE IF NOT EXISTS product_fitment (
  id SERIAL PRIMARY KEY,
  parent_sku VARCHAR(50) NOT NULL,
  make VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  chassis_start INTEGER,
  chassis_end INTEGER,
  additional_info TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fitment_parent_sku ON product_fitment(parent_sku);
CREATE INDEX IF NOT EXISTS idx_fitment_make_model ON product_fitment(make, model);

-- ============================================
-- 4. SUPERSESSIONS (part number cross-references)
-- Maps old part numbers to current SKUs
-- ============================================
CREATE TABLE IF NOT EXISTS supersessions (
  id SERIAL PRIMARY KEY,
  source_sku VARCHAR(50) NOT NULL,  -- The old/alternate part number
  target_sku VARCHAR(50) NOT NULL,  -- The current SKU it maps to

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(source_sku, target_sku)
);

CREATE INDEX IF NOT EXISTS idx_supersession_source ON supersessions(source_sku);
CREATE INDEX IF NOT EXISTS idx_supersession_target ON supersessions(target_sku);

-- ============================================
-- 5. CATALOGUES (technical diagrams - 6,856 records)
-- ============================================
CREATE TABLE IF NOT EXISTS catalogues (
  id VARCHAR(255) PRIMARY KEY,  -- Keep existing string IDs
  title TEXT,
  category VARCHAR(100),
  subcategory VARCHAR(100),

  -- Image URLs
  image VARCHAR(500),          -- Cloudinary URL
  image_url VARCHAR(500),      -- Legacy/backup URL

  -- Links
  cms_url VARCHAR(255),
  catalogue_link VARCHAR(500),

  -- Vehicle compatibility (stored as arrays for simplicity)
  makes JSONB DEFAULT '[]',    -- ["Bentley", "Rolls-Royce"]
  models JSONB DEFAULT '[]',   -- ["Continental GT", "Silver Seraph"]

  -- Hotspots (parent SKUs shown in this catalogue)
  hotspots JSONB DEFAULT '[]', -- ["PC25198PA", "PC23189PA", ...]

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_catalogues_category ON catalogues(category);
CREATE INDEX IF NOT EXISTS idx_catalogues_makes ON catalogues USING GIN (makes);
CREATE INDEX IF NOT EXISTS idx_catalogues_models ON catalogues USING GIN (models);

-- ============================================
-- 6. CHASSIS YEARS (year -> chassis number mapping)
-- ============================================
CREATE TABLE IF NOT EXISTS chassis_years (
  id SERIAL PRIMARY KEY,
  make VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  chassis_prefix VARCHAR(20),
  chassis_start INTEGER,
  chassis_end INTEGER,
  chassis_numeric_start INTEGER,
  chassis_numeric_end INTEGER,
  chassis_count INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(make, model, year)
);

CREATE INDEX IF NOT EXISTS idx_chassis_make_model ON chassis_years(make, model);

-- ============================================
-- 7. TECHNICAL VIDEOS (48 records)
-- ============================================
CREATE TABLE IF NOT EXISTS technical_videos (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  youtube_id VARCHAR(20) NOT NULL,
  category VARCHAR(50),
  verified BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_videos_category ON technical_videos(category);
CREATE INDEX IF NOT EXISTS idx_videos_verified ON technical_videos(verified);

-- ============================================
-- 8. PRODUCT POPULARITY (sales/view rankings)
-- ============================================
CREATE TABLE IF NOT EXISTS product_popularity (
  sku VARCHAR(50) PRIMARY KEY,
  score INTEGER DEFAULT 0,

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. HOTSPOT INDEX (which catalogues show which products)
-- Reverse lookup: SKU -> catalogue IDs
-- ============================================
CREATE TABLE IF NOT EXISTS hotspot_index (
  id SERIAL PRIMARY KEY,
  parent_sku VARCHAR(50) NOT NULL,
  catalogue_id VARCHAR(255) NOT NULL,

  UNIQUE(parent_sku, catalogue_id)
);

CREATE INDEX IF NOT EXISTS idx_hotspot_sku ON hotspot_index(parent_sku);
CREATE INDEX IF NOT EXISTS idx_hotspot_catalogue ON hotspot_index(catalogue_id);

-- ============================================
-- 10. VIDEO CATEGORIES (reference table)
-- ============================================
CREATE TABLE IF NOT EXISTS video_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  display_order INTEGER DEFAULT 0
);

-- Insert default categories
INSERT INTO video_categories (name, display_order) VALUES
  ('Continental GT', 1),
  ('Brakes', 2),
  ('Suspension', 3),
  ('Engine', 4),
  ('Service', 5),
  ('Hydraulics', 6),
  ('Diagnostics', 7)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_catalogues_updated_at
  BEFORE UPDATE ON catalogues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_technical_videos_updated_at
  BEFORE UPDATE ON technical_videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View: Products with stock summary
CREATE OR REPLACE VIEW products_with_stock AS
SELECT
  sku,
  parent_sku,
  description,
  price,
  stock_type,
  categories,
  in_stock,
  available_now,
  available_1_to_3_days,
  (available_now + available_1_to_3_days) as total_available,
  image_url,
  nla_date
FROM products
ORDER BY
  CASE WHEN stock_type IN ('Prestige Parts', 'Prestige Parts (OE)', 'Uprated') THEN 0 ELSE 1 END,
  in_stock DESC,
  price DESC;

-- View: Stock levels needing attention (low/out of stock)
CREATE OR REPLACE VIEW low_stock_products AS
SELECT
  sku,
  description,
  stock_type,
  available_now,
  available_1_to_3_days
FROM products
WHERE in_stock = true
  AND available_now <= 2
  AND stock_type NOT IN ('Used', 'Reconditioned Exchange')
ORDER BY available_now ASC;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON TABLE products IS 'Main product catalog - 79,080 SKUs. Export to products.json';
COMMENT ON TABLE vehicles IS 'Vehicle makes and models - 96 combinations';
COMMENT ON TABLE product_fitment IS 'Which products fit which vehicles (with chassis ranges)';
COMMENT ON TABLE supersessions IS 'Part number cross-references (old SKU -> current SKU)';
COMMENT ON TABLE catalogues IS 'Technical diagram catalogues - 6,856 diagrams. Export to lookbooks.json';
COMMENT ON TABLE chassis_years IS 'Chassis number ranges by year for each model';
COMMENT ON TABLE technical_videos IS 'YouTube technical videos - 48 videos';
COMMENT ON TABLE product_popularity IS 'Product popularity scores for sorting';
COMMENT ON TABLE hotspot_index IS 'Reverse lookup: which catalogues contain which products';

-- ============================================
-- DONE!
-- ============================================
-- Next steps:
-- 1. Run the migration scripts to import your JSON data
-- 2. Use Supabase Table Editor to manage data
-- 3. Run export scripts to generate JSON files for deployment
-- ============================================
