-- Reseller Configs Table Migration
-- Run this SQL in Supabase SQL Editor to create the reseller_configs table

-- Create the reseller_configs table
CREATE TABLE IF NOT EXISTS reseller_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  domain VARCHAR(255),
  is_active BOOLEAN DEFAULT true,

  -- Branding
  logo_url VARCHAR(500),
  colors JSONB DEFAULT '{
    "primary": "#1e3a5f",
    "primaryDark": "#142840",
    "accent": "#c9a227",
    "accentLight": "#d4b84a",
    "secondary": "#2d4a6f",
    "background": "#f8f9fa",
    "text": "#1a1a1a",
    "textLight": "#666666"
  }'::jsonb,

  -- Features
  features TEXT[] DEFAULT ARRAY['light'],
  show_prices BOOLEAN DEFAULT false,
  show_cart BOOLEAN DEFAULT false,
  checkout_enabled BOOLEAN DEFAULT false,
  order_email VARCHAR(255),
  sku_filter VARCHAR(50),

  -- Company Info (JSONB for flexibility)
  company_info JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for quick lookups
CREATE INDEX IF NOT EXISTS idx_reseller_configs_slug ON reseller_configs(slug);
CREATE INDEX IF NOT EXISTS idx_reseller_configs_domain ON reseller_configs(domain);
CREATE INDEX IF NOT EXISTS idx_reseller_configs_active ON reseller_configs(is_active);

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_reseller_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_reseller_configs_updated_at ON reseller_configs;
CREATE TRIGGER trigger_reseller_configs_updated_at
  BEFORE UPDATE ON reseller_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_reseller_configs_updated_at();

-- Insert default resellers (from existing tenants.js)
INSERT INTO reseller_configs (slug, name, domain, is_active, logo_url, colors, features, show_prices, show_cart, checkout_enabled, order_email, sku_filter, company_info)
VALUES
  (
    'introcar-us',
    'IntroCar US',
    'intro-car-us.vercel.app',
    true,
    '/images/logos/introcar-logo.png',
    '{
      "primary": "#1e3a5f",
      "primaryDark": "#142840",
      "accent": "#c9a227",
      "accentLight": "#d4b84a",
      "secondary": "#2d4a6f",
      "background": "#f8f9fa",
      "text": "#1a1a1a",
      "textLight": "#666666"
    }'::jsonb,
    ARRAY['full'],
    true,
    true,
    true,
    NULL,
    NULL,
    '{
      "name": "IntroCar International Ltd",
      "phone": "+44 (0)20 8546 2027",
      "email": "sales@introcar.co.uk",
      "address": "Kingston upon Thames, UK"
    }'::jsonb
  ),
  (
    'albers-rb',
    'Albers Motorcars',
    'albers.introcar.com',
    true,
    '/images/resellers/albersRB-logo.png',
    '{
      "primary": "#2D5A27",
      "primaryDark": "#1F4019",
      "accent": "#4CAF50",
      "accentLight": "#81C784",
      "secondary": "#388E3C",
      "background": "#f8faf8",
      "text": "#1a1a1a",
      "textLight": "#666666"
    }'::jsonb,
    ARRAY['light'],
    true,
    true,
    true,
    'parts@albersrb.com',
    'prestige_parts',
    '{
      "name": "Albers Motorcars",
      "tagline": "Specializing in Rolls-Royce & Bentley since 1963",
      "phone": "(317) 873-2360",
      "email": "parts@albersrb.com",
      "salesEmail": "sales@albersrb.com",
      "address": "360 S. First St., Zionsville, IN 46077",
      "partsAddress": "190 W. Sycamore St., Zionsville, IN 46077",
      "hours": "Mon-Fri 8:00 AM - 4:30 PM",
      "website": "https://albersrb.com"
    }'::jsonb
  )
ON CONFLICT (slug) DO NOTHING;

-- Grant permissions (if using RLS)
-- ALTER TABLE reseller_configs ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow authenticated access" ON reseller_configs FOR ALL USING (true);

-- Verify the table was created
SELECT * FROM reseller_configs;
