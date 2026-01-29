-- Update Beroparts configuration with company info and branding
-- Run this in Supabase SQL Editor

UPDATE reseller_configs
SET
  -- Company Info - based on research from their website and IntroCar announcement
  company_info = jsonb_build_object(
    'name', 'Beroparts',
    'tagline', 'All spareparts for Bentley & Rolls-Royce',
    'description', 'Beroparts is your European source for quality Rolls-Royce and Bentley parts. With over 30 years of experience in the classic car parts industry, we provide genuine, OEM, alternative, and refurbished parts for all Bentley and Rolls-Royce cars produced since 1946.

Located in the heart of Europe, we offer fast shipping across the continent with no post-Brexit delays or additional import taxes. Our dedicated team, led by Philippe Lampo and his son Clément, shares a lifelong passion for helping owners and specialist workshops preserve the history and heritage of these iconic marques.',
    'yearsInBusiness', 30,
    'phone', '+32 479 89 15 67',
    'email', 'info@beroparts.be',
    'address', 'Oostkamp, Belgium',
    'website', 'https://beroparts.be'
  ),

  -- Branding colors - Orange and grey scheme matching beroparts.be
  colors = jsonb_build_object(
    'primary', '#E65100',        -- Orange (main brand color)
    'primaryDark', '#BF360C',    -- Darker orange
    'accent', '#FF6D00',         -- Bright orange accent
    'accentLight', '#FF9E40',    -- Light orange
    'secondary', '#4A4A4A',      -- Dark grey
    'background', '#F5F5F5',     -- Light grey background
    'text', '#333333',           -- Dark grey text
    'textLight', '#757575'       -- Medium grey
  ),

  -- Enable features for Beroparts
  show_prices = true,
  show_cart = true,
  checkout_enabled = true,
  features = ARRAY['light'],
  sku_filter = 'prestige_parts',
  order_email = 'info@beroparts.be',
  updated_at = NOW()

WHERE slug = 'beroparts';

-- Verify the update
SELECT slug, name, company_info, colors FROM reseller_configs WHERE slug = 'beroparts';
