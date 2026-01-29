-- Create reseller_pages table for CMS functionality
-- Run this in Supabase SQL Editor

-- Create the table for reseller CMS pages
CREATE TABLE IF NOT EXISTS reseller_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reseller_slug VARCHAR(50) NOT NULL,
  page_slug VARCHAR(100) NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT, -- Rich HTML content
  meta_description VARCHAR(300),
  is_published BOOLEAN DEFAULT true,
  show_in_nav BOOLEAN DEFAULT true,
  nav_order INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Each reseller can only have one page with a given slug
  UNIQUE(reseller_slug, page_slug),

  -- Foreign key to reseller_configs
  CONSTRAINT fk_reseller
    FOREIGN KEY (reseller_slug)
    REFERENCES reseller_configs(slug)
    ON DELETE CASCADE
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_reseller_pages_reseller ON reseller_pages(reseller_slug);
CREATE INDEX IF NOT EXISTS idx_reseller_pages_slug ON reseller_pages(reseller_slug, page_slug);
CREATE INDEX IF NOT EXISTS idx_reseller_pages_nav ON reseller_pages(reseller_slug, is_published, show_in_nav, nav_order);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_reseller_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_reseller_pages_updated_at ON reseller_pages;
CREATE TRIGGER trigger_reseller_pages_updated_at
  BEFORE UPDATE ON reseller_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_reseller_pages_updated_at();

-- Enable RLS
ALTER TABLE reseller_pages ENABLE ROW LEVEL SECURITY;

-- Policy for read access (anyone can read published pages)
DROP POLICY IF EXISTS "Public can read published pages" ON reseller_pages;
CREATE POLICY "Public can read published pages"
  ON reseller_pages
  FOR SELECT
  USING (is_published = true);

-- Policy for admin access (authenticated users can manage)
DROP POLICY IF EXISTS "Admin can manage pages" ON reseller_pages;
CREATE POLICY "Admin can manage pages"
  ON reseller_pages
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Sample pages for Beroparts
INSERT INTO reseller_pages (reseller_slug, page_slug, title, content, is_published, show_in_nav, nav_order)
VALUES
  ('beroparts', 'services', 'Our Services', '<h2>Parts Supply</h2><p>We stock the full Prestige Parts® range for all Bentley and Rolls-Royce vehicles from 1946 to present day. Fast European delivery with no import duties.</p><h2>Technical Support</h2><p>Our experienced team can help identify the correct parts for your vehicle. Contact us with your VIN or chassis number for accurate part matching.</p><h2>Worldwide Shipping</h2><p>We ship parts worldwide with full insurance and tracking. European deliveries typically arrive within 1-3 business days.</p>', true, true, 10),
  ('beroparts', 'faq', 'Frequently Asked Questions', '<h2>How do I find the right parts?</h2><p>Use our vehicle finder to search by make, model, and year. You can also search by part number or contact us with your VIN for accurate matching.</p><h2>What is Prestige Parts®?</h2><p>Prestige Parts® is a high-quality aftermarket brand created specifically for Rolls-Royce and Bentley vehicles. All parts come with a 3-year worldwide warranty.</p><h2>Do you ship internationally?</h2><p>Yes, we ship worldwide. European customers benefit from fast delivery with no post-Brexit delays or additional import duties.</p>', true, true, 20)
ON CONFLICT (reseller_slug, page_slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  updated_at = NOW();

-- Verify the setup
SELECT id, reseller_slug, page_slug, title, is_published, show_in_nav, nav_order
FROM reseller_pages
ORDER BY reseller_slug, nav_order;
