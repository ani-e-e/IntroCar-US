# Database Cleanup Notes - January 26, 2026

## Current Schema Status

The Supabase database is well-structured with the following tables:

| Table | Records | Status |
|-------|---------|--------|
| products | ~79,080 | ✅ OK |
| t2_chassis_master | ~581,354 | ✅ OK |
| vehicles | ~96 | ✅ OK |
| product_fitment | varies | ✅ OK |
| catalogues | ~6,856 | ✅ OK |
| technical_videos | ~48 | ✅ Needs migration |
| supersessions | varies | ✅ OK |
| chassis_years | varies | ✅ OK |
| hotspot_index | varies | ✅ OK |
| video_categories | 7 | ✅ OK |
| product_popularity | varies | ✅ OK |

## Required Migrations

### 1. Technical Videos - Add Array Columns
The `technical_videos` table needs new columns for `makes`, `models`, and `product_categories` arrays.

**Run this migration:**
```sql
-- File: scripts/migrate-videos-schema.sql

ALTER TABLE technical_videos
ADD COLUMN IF NOT EXISTS makes TEXT[] DEFAULT '{}';

ALTER TABLE technical_videos
ADD COLUMN IF NOT EXISTS models TEXT[] DEFAULT '{}';

ALTER TABLE technical_videos
ADD COLUMN IF NOT EXISTS product_categories TEXT[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_videos_makes ON technical_videos USING GIN (makes);
CREATE INDEX IF NOT EXISTS idx_videos_models ON technical_videos USING GIN (models);
CREATE INDEX IF NOT EXISTS idx_videos_product_categories ON technical_videos USING GIN (product_categories);
```

### 2. Import Existing Videos to Supabase
After running the migration, import existing videos from `data/json/technical-videos.json`:

```bash
node scripts/import-videos-to-supabase.js
```

## New API Endpoints Created

### Chassis Lookup (`/api/chassis-lookup`)
- **GET** `?chassis=ALB36` - Find model/year for a chassis code
- **GET** `?make=Bentley&model=Continental GT` - Get chassis list for a model
- **GET** `?make=Bentley&model=Continental GT&chassis=ALB36` - Validate chassis

### Fitment Validation (`/api/fitment-validate`)
- **POST** - Validate T3 fitment data against T2 master
- **GET** `?make=Bentley&model=Continental GT` - Get valid chassis list

## Architecture Notes

### Data Flow
```
Admin UI → Supabase (source of truth)
                ↓
        Export Script
                ↓
        JSON Files (data/json/)
                ↓
        Git Push → Vercel Deploy
                ↓
        Live Site reads JSON
```

### Caching
- Chassis lookup API uses 24-hour in-memory cache
- Fitment validation API uses 24-hour in-memory cache
- Both caches reduce Supabase queries for static T2 data

## Recommended Cleanup Tasks

### Low Priority
1. **Archive old scripts** - Some scripts in `/scripts/` are one-time migration scripts that could be moved to an `/archive/` folder

2. **Remove GitHub storage code** - The `lib/github-storage.js` and related imports in admin routes are no longer needed now that we use Supabase

3. **Consolidate JSON exports** - The export scripts could be combined into a single `export-all.js` script

### Future Improvements
1. **Add product edit to Supabase** - Currently products admin only updates Supabase, but the edit page reads from JSON. Could migrate to read from Supabase too.

2. **Add audit logging** - Track changes made through admin with user/timestamp

3. **Add data validation triggers** - Add PostgreSQL triggers to validate data on insert/update
