# Reseller Template Configuration Tool - Handover Document

## Project Context

**IntroCar US Website** - A Next.js 14 e-commerce platform for Rolls-Royce & Bentley parts with multi-tenant reseller support.

**Live URL:** https://intro-car-us.vercel.app
**Admin Panel:** /admin (password protected)
**Database:** Supabase (PostgreSQL)

---

## Current State: Multi-Tenant Reseller System

### What Exists

1. **Tenant Configuration File** (`/lib/tenants.js`)
   - Hardcoded tenant definitions with:
     - `name`, `slug`, `domain`
     - `colors` (primary, accent, secondary, background, text)
     - `logo` path
     - `skuFilter` (e.g., 'prestige_parts')
     - `orderEmail`
     - `features` ('full' or 'light')
     - `showPrices`, `showCart`, `checkoutEnabled` flags
     - `companyInfo` (name, phone, email, address, hours, etc.)
   - Currently has: `introcar-us`, `albers-rb`, and 3 placeholder resellers

2. **Reseller Site Routes** (`/app/reseller/[tenant]/`)
   - Dynamic tenant-based routing
   - Pages: homepage, products, product detail, cart, checkout, contact, about, parts-request
   - Shared components: `ResellerHeader`, `ResellerFooter`
   - Uses `TenantContext` for theming

3. **Product Filtering via Reseller Flags**
   - `reseller_flags` column in `products` table (TEXT[] array)
   - GIN index for efficient filtering
   - SQL migration script: `/scripts/add-reseller-flags.sql`
   - API endpoint exists: `/api/admin/reseller-setup/route.js`
     - GET: Returns stats on flagged products
     - POST actions: `tag-prestige`, `clear-flags`

4. **Working Reseller Example: Albers Motorcars**
   - Slug: `albers-rb`
   - Filters to `prestige_parts` SKUs only
   - Custom green color scheme
   - Full checkout enabled

---

## What Needs to Be Built: Admin Reseller Configuration Tool

### Goal
Create an admin UI at `/admin/resellers` to manage reseller configurations **without editing code**.

### Proposed Features

#### 1. **Reseller List View**
- Table showing all configured resellers
- Columns: Name, Slug, Domain, SKU Filter, Status (active/inactive)
- Actions: Edit, Preview, Delete

#### 2. **Reseller Editor**
Create/edit form with sections:

**A. Basic Info**
- Name (display name)
- Slug (URL-friendly, auto-generated from name)
- Domain (for production routing)
- Active/Inactive toggle

**B. Branding**
- Logo upload (store in `/public/images/resellers/`)
- Color picker for: primary, primaryDark, accent, accentLight, secondary, background
- Live preview panel showing how site will look

**C. Product Filtering**
- SKU filter tag (e.g., 'prestige_parts', 'reseller_2')
- Tool to bulk-tag products with this reseller's flag
- Count of products currently tagged

**D. Features & Checkout**
- Feature mode: Full / Light
- Show prices: Yes/No
- Show cart: Yes/No
- Enable checkout: Yes/No
- Order email (where orders are sent)

**E. Company Info**
- Company name
- Tagline
- Phone
- Email(s) - sales, parts
- Address(es)
- Business hours
- Website URL

#### 3. **Product Tagging Interface**
- Search/filter products
- Bulk select products to tag with reseller flag
- View products currently tagged for each reseller
- Remove tags from products

---

## Technical Implementation Notes

### Database Changes Needed

```sql
-- New table for reseller configurations
CREATE TABLE reseller_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  domain VARCHAR(255),
  is_active BOOLEAN DEFAULT true,

  -- Branding
  logo_url VARCHAR(500),
  colors JSONB DEFAULT '{}',

  -- Features
  features TEXT[] DEFAULT '{"light"}',
  show_prices BOOLEAN DEFAULT false,
  show_cart BOOLEAN DEFAULT false,
  checkout_enabled BOOLEAN DEFAULT false,
  order_email VARCHAR(255),
  sku_filter VARCHAR(50),

  -- Company Info
  company_info JSONB DEFAULT '{}',

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX idx_reseller_configs_slug ON reseller_configs(slug);
CREATE INDEX idx_reseller_configs_domain ON reseller_configs(domain);
```

### API Endpoints to Create

```
GET    /api/admin/resellers          - List all resellers
POST   /api/admin/resellers          - Create new reseller
GET    /api/admin/resellers/[slug]   - Get reseller details
PUT    /api/admin/resellers/[slug]   - Update reseller
DELETE /api/admin/resellers/[slug]   - Delete reseller

POST   /api/admin/resellers/[slug]/tag-products    - Bulk tag products
DELETE /api/admin/resellers/[slug]/tag-products    - Remove tags
GET    /api/admin/resellers/[slug]/products        - Get tagged products
```

### Changes to `/lib/tenants.js`

Modify to fetch from Supabase instead of hardcoded values:

```javascript
// Option 1: Server-side fetch (for SSR)
export async function getTenant(slug) {
  const supabase = createClient(...);
  const { data } = await supabase
    .from('reseller_configs')
    .select('*')
    .eq('slug', slug)
    .single();
  return data || getDefaultTenant();
}

// Option 2: Keep hardcoded defaults + DB overrides
export async function getTenant(slug) {
  const hardcoded = tenants[slug];
  const dbConfig = await fetchFromDB(slug);
  return { ...hardcoded, ...dbConfig };
}
```

---

## Files Reference

### Core Reseller Files
| File | Purpose |
|------|---------|
| `/lib/tenants.js` | Tenant configuration (currently hardcoded) |
| `/app/reseller/[tenant]/page.js` | Reseller homepage wrapper |
| `/app/reseller/[tenant]/ResellerHomepage.js` | Homepage component |
| `/app/reseller/[tenant]/products/` | Product listing & detail pages |
| `/app/reseller/[tenant]/components/` | Header, Footer components |
| `/context/TenantContext.js` | React context for tenant data |
| `/middleware.js` | Domain-based routing |

### Admin Files
| File | Purpose |
|------|---------|
| `/app/admin/page.js` | Admin dashboard |
| `/app/admin/layout.js` | Admin layout with nav |
| `/app/api/admin/reseller-setup/route.js` | Existing reseller flag API |
| `/lib/admin-auth.js` | Admin authentication |

### Database
| Table | Purpose |
|-------|---------|
| `products` | Has `reseller_flags` TEXT[] column |
| `product_fitment` | MYC data (Model/Year/Chassis) |
| `reseller_configs` | **TO BE CREATED** |

---

## Implementation Status (COMPLETED)

### What Was Built

1. **Database Setup** ✅
   - SQL migration script: `/scripts/create-reseller-configs.sql`
   - Run this in Supabase SQL Editor to create the `reseller_configs` table
   - Includes indexes and auto-update trigger for `updated_at`

2. **API Layer** ✅
   - `GET /api/admin/resellers` - List all resellers with product counts
   - `POST /api/admin/resellers` - Create new reseller
   - `GET /api/admin/resellers/[slug]` - Get single reseller
   - `PUT /api/admin/resellers/[slug]` - Update reseller
   - `DELETE /api/admin/resellers/[slug]` - Delete reseller
   - `GET /api/admin/resellers/[slug]/products` - List tagged products
   - `POST /api/admin/resellers/[slug]/products` - Bulk tag/untag products

3. **Admin UI** ✅
   - `/admin/resellers` - List view with stats and quick actions
   - `/admin/resellers/[slug]` - Full edit form with:
     - Basic info (name, slug, domain, logo)
     - Branding (color picker with live preview)
     - Features (prices, cart, checkout toggles)
     - Company info (all contact details)
     - Product tagging interface

4. **Integration** ✅
   - `/lib/tenants.js` updated with:
     - `getTenantAsync(slug)` - Fetch from database
     - `getTenantByDomainAsync(domain)` - Domain-based lookup
     - `getAllTenantsAsync()` - Get all active tenants
     - `clearTenantCache()` - Cache management
     - 5-minute cache TTL for performance
     - Graceful fallback to hardcoded values

5. **Navigation** ✅
   - Added "Resellers" link to AdminNav with 🏪 icon

### Setup Instructions

1. **Run the database migration:**
   ```sql
   -- Copy contents of /scripts/create-reseller-configs.sql
   -- Paste into Supabase SQL Editor and run
   ```

2. **Test the admin UI:**
   - Go to `/admin/resellers`
   - Create a new reseller
   - Configure branding and features
   - Tag products for the reseller

3. **Update existing code to use async functions:**
   ```javascript
   // Before (sync, uses fallback)
   import { getTenant } from '@/lib/tenants';
   const tenant = getTenant(slug);

   // After (async, fetches from DB)
   import { getTenantAsync } from '@/lib/tenants';
   const tenant = await getTenantAsync(slug);
   ```

### Future Enhancements
- Logo upload to Supabase storage (currently accepts URL path)
- Bulk product tagging from search results
- Reseller site preview in admin (iframe)
- Cache invalidation webhook on config changes

---

## Related Context

### MYC Admin (Just Completed)
The MYC Admin tool (`/admin/myc`) manages Model/Year/Chassis → SKU relationships. It stores data in Supabase `product_fitment` table. Similar patterns can be used for the reseller tool:
- Excel paste support for bulk operations
- Supabase for storage
- Real-time validation

### Prestige Parts Flag
The `prestige_parts` flag is already set up and used by `albers-rb`. Products with `stock_type` of 'Prestige Parts', 'Prestige Parts (OE)', or 'Uprated' are tagged.

---

## Quick Start for New Session

1. Read this handover document
2. Check current state:
   ```bash
   # See existing reseller routes
   ls -la app/reseller/

   # Check tenant config
   cat lib/tenants.js

   # Check existing reseller API
   cat app/api/admin/reseller-setup/route.js
   ```
3. Start with database table creation in Supabase
4. Build API endpoints
5. Build admin UI

---

*Generated: January 28, 2026*
