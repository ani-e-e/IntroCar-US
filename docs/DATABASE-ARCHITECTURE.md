# IntroCar US - Database Architecture Proposal

**Date:** January 26, 2026
**Status:** Proposal for Review
**Author:** Database Architecture Planning Session

---

## Executive Summary

This document proposes migrating from JSON file storage to a proper database to support:
- Persistent admin panel changes (prices, stock, descriptions)
- Real-time updates without redeployment
- Future Magento sync functionality
- Customer accounts and "Notify Me" alerts

**Recommended Solution:** Supabase (PostgreSQL)

---

## Current State Analysis

### Data Volumes

| Entity | Records | JSON Size | Est. DB Size |
|--------|---------|-----------|--------------|
| Products | 79,080 | 87 MB | ~40 MB |
| Fitment mappings | ~150,000 | 51 MB | ~15 MB |
| Supersessions | 53,918 | 2.2 MB | ~3 MB |
| Catalogues | 6,856 | 12 MB | ~5 MB |
| Hotspot mappings | ~50,000 | 9.9 MB | ~4 MB |
| Vehicles | 96 | 11 KB | <1 MB |
| Chassis years | ~500 | 94 KB | <1 MB |
| Technical videos | 48 | 20 KB | <1 MB |
| **Total** | **~340,000** | **~160 MB** | **~70 MB** |

### Current Relationships

```
Products (79,080)
  │
  ├─── Fitment ───► Vehicles (many-to-many)
  │                  └── 96 make/model combinations
  │
  ├─── Supersessions ───► Products (self-referential many-to-many)
  │                        └── Same part, different SKU
  │
  ├─── Catalogues ◄─── Hotspots (many-to-many)
  │                     └── 6,856 technical diagrams
  │
  └─── Categories (hierarchical)
       └── Main Category / Subcategory
```

---

## Database Recommendation: Supabase

### Why Supabase?

| Feature | Benefit for IntroCar |
|---------|---------------------|
| **PostgreSQL** | Handles complex queries (fitment, supersessions) |
| **Free tier: 500MB** | Your data fits comfortably (~70MB) |
| **Connection pooling** | Essential for Vercel serverless |
| **Real-time subscriptions** | "Notify Me" back-in-stock alerts |
| **Built-in auth** | Customer accounts ready to implement |
| **Row-level security** | Secure admin access |
| **Great admin UI** | Quick data exploration |

### Comparison with Alternatives

| Criteria | Supabase | Vercel Postgres | PlanetScale |
|----------|----------|-----------------|-------------|
| Free tier | 500 MB | None ($20/mo min) | 5 GB |
| Connection pooling | ✅ Built-in | ✅ Built-in | ✅ Built-in |
| Real-time | ✅ Yes | ❌ No | ❌ No |
| Built-in auth | ✅ Yes | ❌ No | ❌ No |
| Magento sync | Adapt SQL | Adapt SQL | Native MySQL |
| Admin UI | ✅ Excellent | ❌ Basic | ✅ Good |

**Note:** PlanetScale uses MySQL which matches Magento, but Supabase's features (real-time, auth) provide more value for your use case.

---

## Proposed Schema

### Core Tables

#### 1. `products` (Primary table)

```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  sku VARCHAR(50) UNIQUE NOT NULL,
  parent_sku VARCHAR(50),
  description TEXT,
  price DECIMAL(10,2),
  weight DECIMAL(8,4),
  stock_type VARCHAR(50),
  search_part_type VARCHAR(50),
  categories TEXT,  -- Keep pipe-separated for now, normalize later
  nla_date DATE,

  -- Stock levels
  in_stock BOOLEAN DEFAULT false,
  available_now INTEGER DEFAULT 0,
  available_1_to_3_days INTEGER DEFAULT 0,

  -- Images
  image VARCHAR(255),
  images JSONB DEFAULT '[]',

  -- Metadata
  additional_info TEXT,
  number_required INTEGER,
  cms_page_url VARCHAR(255),

  -- Admin tracking
  pending_sync BOOLEAN DEFAULT false,
  last_modified TIMESTAMPTZ DEFAULT NOW(),
  modified_by VARCHAR(100),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_products_parent_sku ON products(parent_sku);
CREATE INDEX idx_products_stock_type ON products(stock_type);
CREATE INDEX idx_products_categories ON products USING GIN (to_tsvector('english', categories));
CREATE INDEX idx_products_pending_sync ON products(pending_sync) WHERE pending_sync = true;
```

#### 2. `vehicles` (Makes/Models)

```sql
CREATE TABLE vehicles (
  id SERIAL PRIMARY KEY,
  make VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year_start INTEGER,
  year_end INTEGER,
  UNIQUE(make, model)
);

CREATE INDEX idx_vehicles_make ON vehicles(make);
```

#### 3. `product_fitment` (Products ↔ Vehicles)

```sql
CREATE TABLE product_fitment (
  id SERIAL PRIMARY KEY,
  parent_sku VARCHAR(50) NOT NULL,
  vehicle_id INTEGER REFERENCES vehicles(id),
  chassis_start INTEGER,
  chassis_end INTEGER,
  additional_info TEXT,

  UNIQUE(parent_sku, vehicle_id, chassis_start, chassis_end)
);

CREATE INDEX idx_fitment_parent_sku ON product_fitment(parent_sku);
CREATE INDEX idx_fitment_vehicle ON product_fitment(vehicle_id);
```

#### 4. `supersessions` (Part number cross-references)

```sql
CREATE TABLE supersessions (
  id SERIAL PRIMARY KEY,
  source_sku VARCHAR(50) NOT NULL,
  target_sku VARCHAR(50) NOT NULL,

  UNIQUE(source_sku, target_sku)
);

CREATE INDEX idx_supersession_source ON supersessions(source_sku);
CREATE INDEX idx_supersession_target ON supersessions(target_sku);
```

#### 5. `catalogues` (Technical diagrams)

```sql
CREATE TABLE catalogues (
  id VARCHAR(255) PRIMARY KEY,  -- Keep existing string IDs
  title TEXT,
  image_url VARCHAR(500),
  cloudinary_url VARCHAR(500),
  cms_url VARCHAR(255),
  catalogue_link VARCHAR(500),
  category VARCHAR(100),
  subcategory VARCHAR(100),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_catalogues_category ON catalogues(category);
```

#### 6. `catalogue_vehicles` (Catalogues ↔ Vehicles)

```sql
CREATE TABLE catalogue_vehicles (
  catalogue_id VARCHAR(255) REFERENCES catalogues(id),
  vehicle_id INTEGER REFERENCES vehicles(id),
  PRIMARY KEY (catalogue_id, vehicle_id)
);
```

#### 7. `catalogue_hotspots` (Catalogues ↔ Products)

```sql
CREATE TABLE catalogue_hotspots (
  catalogue_id VARCHAR(255) REFERENCES catalogues(id),
  parent_sku VARCHAR(50) NOT NULL,
  position INTEGER,  -- Order in the hotspot list
  PRIMARY KEY (catalogue_id, parent_sku)
);

CREATE INDEX idx_hotspot_sku ON catalogue_hotspots(parent_sku);
```

#### 8. `chassis_years` (Year → Chassis mapping)

```sql
CREATE TABLE chassis_years (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(id),
  year INTEGER NOT NULL,
  chassis_start INTEGER,
  chassis_end INTEGER,
  chassis_count INTEGER,

  UNIQUE(vehicle_id, year)
);

CREATE INDEX idx_chassis_vehicle ON chassis_years(vehicle_id);
```

#### 9. `technical_videos`

```sql
CREATE TABLE technical_videos (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  youtube_id VARCHAR(20) NOT NULL,
  category VARCHAR(50),
  verified BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_videos_category ON technical_videos(category);
```

#### 10. `product_popularity`

```sql
CREATE TABLE product_popularity (
  sku VARCHAR(50) PRIMARY KEY,
  score INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);
```

### Future Tables (Customer Features)

```sql
-- Customer accounts (use Supabase Auth)
CREATE TABLE customer_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR(255),
  name VARCHAR(255),
  phone VARCHAR(50),
  company VARCHAR(255),
  trade_account BOOLEAN DEFAULT false,
  discount_tier VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer's saved vehicles
CREATE TABLE customer_vehicles (
  id SERIAL PRIMARY KEY,
  customer_id UUID REFERENCES customer_profiles(id),
  vehicle_id INTEGER REFERENCES vehicles(id),
  chassis_number VARCHAR(50),
  nickname VARCHAR(100),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notify me alerts
CREATE TABLE stock_alerts (
  id SERIAL PRIMARY KEY,
  customer_id UUID REFERENCES customer_profiles(id),
  sku VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  notified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notified_at TIMESTAMPTZ
);

CREATE INDEX idx_alerts_sku ON stock_alerts(sku) WHERE notified = false;

-- Order history (synced from Magento/Stripe)
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_id UUID REFERENCES customer_profiles(id),
  order_number VARCHAR(50) UNIQUE,
  source VARCHAR(20),  -- 'stripe', 'magento'
  status VARCHAR(50),
  total_gbp DECIMAL(10,2),
  total_usd DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Migration Strategy

### Phase 1: Read-Only Database (Week 1)

**Goal:** Get data into Supabase, keep JSON as backup

1. **Create Supabase project**
   - Set up connection pooling for Vercel
   - Configure environment variables

2. **Migration scripts**
   ```javascript
   // scripts/migrate-to-supabase.js
   // Run locally, one-time migration
   ```

3. **Dual-read pattern**
   - New `lib/data-supabase.js` alongside `lib/data-server.js`
   - Feature flag to switch between JSON and database
   - Compare results to ensure accuracy

### Phase 2: Admin Writes to Database (Week 2)

**Goal:** Admin panel changes persist immediately

1. **Update admin API routes**
   - `/api/admin/products/[sku]` writes to Supabase
   - `/api/admin/videos` writes to Supabase

2. **Real-time cache invalidation**
   - Use Supabase real-time to invalidate caches
   - Or simple revalidation on write

3. **Remove GitHub storage dependency**
   - Keep as fallback for videos
   - All product data from database

### Phase 3: Magento Sync (Week 3)

**Goal:** Push product updates to Magento

1. **Sync queue table**
   ```sql
   CREATE TABLE sync_queue (
     id SERIAL PRIMARY KEY,
     entity_type VARCHAR(50),  -- 'product', 'stock', 'price'
     entity_id VARCHAR(50),
     action VARCHAR(20),  -- 'update', 'create'
     payload JSONB,
     status VARCHAR(20) DEFAULT 'pending',
     attempts INTEGER DEFAULT 0,
     last_error TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     processed_at TIMESTAMPTZ
   );
   ```

2. **Sync worker** (Vercel Cron or external)
   - Process queue every 5 minutes
   - Call Magento API with updates
   - Mark as synced or retry on failure

3. **Admin UI**
   - Show sync status on product pages
   - "Sync Now" button for immediate push

### Phase 4: Customer Features (Future)

1. Enable Supabase Auth
2. Build customer accounts
3. Implement "Notify Me" with real-time subscriptions
4. Order history sync from Stripe webhooks

---

## Implementation Details

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...  # Server-side only

# Connection pooling (for serverless)
DATABASE_URL=postgres://user:pass@pooler.supabase.co:6543/postgres?pgbouncer=true

# Feature flags
USE_DATABASE=true
```

### Data Access Layer

```javascript
// lib/data-supabase.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function getProductBySku(sku) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_fitment (
        vehicle_id,
        chassis_start,
        chassis_end,
        vehicles (make, model)
      )
    `)
    .eq('sku', sku.toUpperCase())
    .single();

  if (error) throw error;
  return data;
}

export async function filterProducts({
  search, category, stockType, make, model, year,
  page = 1, limit = 24
}) {
  let query = supabase
    .from('products')
    .select('*', { count: 'exact' });

  if (search) {
    query = query.or(`sku.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (category) {
    query = query.ilike('categories', `%${category}%`);
  }

  if (stockType) {
    const types = stockType.split(',');
    query = query.in('stock_type', types);
  }

  // Vehicle filtering requires join
  if (make || model) {
    // Use RPC function for complex fitment queries
    return await filterProductsByVehicle({ search, category, stockType, make, model, year, page, limit });
  }

  const { data, count, error } = await query
    .range((page - 1) * limit, page * limit - 1);

  return { products: data, total: count };
}
```

### Complex Fitment Query (PostgreSQL Function)

```sql
CREATE OR REPLACE FUNCTION filter_products_by_vehicle(
  p_make TEXT DEFAULT NULL,
  p_model TEXT DEFAULT NULL,
  p_year INTEGER DEFAULT NULL,
  p_category TEXT DEFAULT NULL,
  p_stock_type TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 24,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  sku VARCHAR,
  description TEXT,
  price DECIMAL,
  stock_type VARCHAR,
  image VARCHAR,
  in_stock BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    p.sku,
    p.description,
    p.price,
    p.stock_type,
    p.image,
    p.in_stock
  FROM products p
  JOIN product_fitment pf ON p.parent_sku = pf.parent_sku
  JOIN vehicles v ON pf.vehicle_id = v.id
  LEFT JOIN chassis_years cy ON v.id = cy.vehicle_id AND cy.year = p_year
  WHERE
    (p_make IS NULL OR v.make = p_make)
    AND (p_model IS NULL OR v.model = p_model)
    AND (p_category IS NULL OR p.categories ILIKE '%' || p_category || '%')
    AND (p_stock_type IS NULL OR p.stock_type = ANY(string_to_array(p_stock_type, ',')))
    AND (p_year IS NULL OR (
      (pf.chassis_start IS NULL AND pf.chassis_end IS NULL)
      OR (cy.chassis_start BETWEEN pf.chassis_start AND pf.chassis_end)
    ))
  ORDER BY
    CASE WHEN p.stock_type IN ('Prestige Parts', 'Prestige Parts (OE)', 'Uprated') THEN 0 ELSE 1 END,
    p.in_stock DESC,
    p.price DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;
```

---

## Migration Scripts

### 1. Products Migration

```javascript
// scripts/migrate-products.js
const { createClient } = require('@supabase/supabase-js');
const products = require('../data/json/products.json');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function migrateProducts() {
  console.log(`Migrating ${products.length} products...`);

  // Batch insert in chunks of 1000
  const chunkSize = 1000;
  for (let i = 0; i < products.length; i += chunkSize) {
    const chunk = products.slice(i, i + chunkSize).map(p => ({
      sku: p.sku,
      parent_sku: p.parentSku,
      description: p.description,
      price: p.price,
      weight: p.weight,
      stock_type: p.stockType,
      search_part_type: p.searchPartType,
      categories: p.categories,
      nla_date: p.nlaDate ? new Date(p.nlaDate) : null,
      in_stock: p.inStock,
      available_now: p.availableNow,
      available_1_to_3_days: p.available1to3Days,
      image: p.image,
      images: p.images || [],
      additional_info: p.additionalInfo,
      number_required: p.numberRequired,
      cms_page_url: p.cmsPageUrl
    }));

    const { error } = await supabase
      .from('products')
      .upsert(chunk, { onConflict: 'sku' });

    if (error) {
      console.error(`Error at batch ${i}:`, error);
    } else {
      console.log(`Migrated ${Math.min(i + chunkSize, products.length)} / ${products.length}`);
    }
  }
}

migrateProducts();
```

### 2. Fitment Migration

```javascript
// scripts/migrate-fitment.js
const fitmentLookup = require('../data/json/fitment-lookup.json');

async function migrateFitment() {
  // First, build vehicle lookup
  const vehicles = new Map();

  Object.values(fitmentLookup).forEach(fitments => {
    fitments.forEach(f => {
      const key = `${f.make}|${f.model}`;
      if (!vehicles.has(key)) {
        vehicles.set(key, { make: f.make, model: f.model });
      }
    });
  });

  // Insert vehicles
  const vehicleArray = Array.from(vehicles.values());
  const { data: insertedVehicles } = await supabase
    .from('vehicles')
    .upsert(vehicleArray, { onConflict: 'make,model' })
    .select();

  // Build vehicle ID lookup
  const vehicleIdMap = new Map();
  insertedVehicles.forEach(v => {
    vehicleIdMap.set(`${v.make}|${v.model}`, v.id);
  });

  // Insert fitment records
  const fitmentRecords = [];
  Object.entries(fitmentLookup).forEach(([parentSku, fitments]) => {
    fitments.forEach(f => {
      const vehicleId = vehicleIdMap.get(`${f.make}|${f.model}`);
      if (vehicleId) {
        fitmentRecords.push({
          parent_sku: parentSku,
          vehicle_id: vehicleId,
          chassis_start: f.chassisStart,
          chassis_end: f.chassisEnd,
          additional_info: f.additionalInfo
        });
      }
    });
  });

  // Batch insert
  // ... similar batching as products
}
```

---

## Rollback Plan

If issues arise, we can rollback quickly:

1. **Feature flag** `USE_DATABASE=false` reverts to JSON
2. **JSON files preserved** in repository as backup
3. **GitHub storage** still works for videos
4. **No data loss** - all changes tracked in database

---

## Timeline & Milestones

| Week | Phase | Deliverables |
|------|-------|--------------|
| 1 | Setup & Migration | Supabase project, migration scripts, dual-read |
| 2 | Admin Writes | Product/video edits persist, sync tracking |
| 3 | Magento Sync | Queue system, sync worker, admin status |
| 4 | Testing & Launch | Load testing, switch to database-only |

---

## Questions for Discussion

1. **Supabase vs alternatives** - Any preference based on existing tools/skills?

2. **Migration timing** - Run during low-traffic period? Any upcoming changes to pause?

3. **Magento sync priority** - Is this blocking? Can we defer to Phase 3?

4. **Customer accounts** - Ready to implement, or future backlog item?

5. **Categories normalization** - Keep pipe-separated string, or normalize to separate table?

---

## Next Steps

1. **Create Supabase project** and configure Vercel env vars
2. **Run migration scripts** locally to populate database
3. **Create `lib/data-supabase.js`** with feature flag
4. **Update one admin endpoint** as proof of concept
5. **Test with products admin page**

---

*This document should be updated as decisions are made and implementation progresses.*
