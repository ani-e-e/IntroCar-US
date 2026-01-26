# IntroCar US - Session Summary
## Date: January 26, 2026

---

## What We Achieved Today

### 1. Supabase Database Setup ✅
- **Database URL:** `https://bmarqxcyyiyatkhlwkgm.supabase.co`
- Created all tables and migrated data from JSON files
- Fixed schema issues (text fields, decimal values, column sizes)

### 2. Data Migration Complete ✅

| Table | Records | Status |
|-------|---------|--------|
| products | 79,080 | ✅ 100% |
| vehicles | 96 | ✅ |
| product_fitment | 325,218 | ✅ |
| supersessions | 56,488 | ✅ |
| catalogues | 6,856 | ✅ |
| chassis_years | 436 | ✅ |
| technical_videos | 48 | ✅ |
| product_popularity | 9,859 | ✅ |
| hotspot_index | 165,428 | ✅ |
| t2_chassis_master | 581,354 | ✅ |

### 3. Admin Stock Upload Feature ✅
- New page at `/admin/stock`
- Two modes:
  - **Warehouse Stock** (blue) → updates `available_now` + `in_stock` (from Khaos Control)
  - **Supplier Stock** (green) → updates `available_1_3_days` (from supplier updates)
- Exact SKU matching
- Deployed and tested on Vercel

### 4. Environment Configuration ✅
- Supabase URL and Service Key added to Vercel environment variables
- `@supabase/supabase-js` package installed

### 5. Migration Script Fixes ✅
- Fixed decimal stock values (now rounds down with `Math.floor`)
- Fixed schema issues during migration

---

## Current Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Admin Panel   │────▶│    Supabase     │────▶│   JSON Files    │
│  (Stock Upload) │     │   (Database)    │     │  (via export)   │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │  Vercel Site    │
                                                │ (reads JSON)    │
                                                └─────────────────┘
```

| Component | Status | Notes |
|-----------|--------|-------|
| **Supabase Database** | ✅ Connected | Source of truth for data |
| **Admin Stock Upload** | ✅ Working | Updates Supabase directly |
| **Admin Videos/Products** | ⚠️ Updates JSON | Needs updating to use Supabase |
| **Live Vercel Site** | ✅ Working | Reads from JSON files |
| **Cloudinary** | ✅ Working | Image storage (may need upgrade) |

---

## Key Files Reference

### Scripts (run from terminal)
| File | Purpose | Usage |
|------|---------|-------|
| `scripts/migrate-to-supabase.js` | Import JSON → Supabase | `node scripts/migrate-to-supabase.js` |
| `scripts/export-from-supabase.js` | Export Supabase → JSON | `node scripts/export-from-supabase.js` or `node scripts/export-from-supabase.js stock` |
| `scripts/import-t2-chassis.js` | Import T2 Chassis Master | `node scripts/import-t2-chassis.js` |
| `scripts/supabase-schema.sql` | Database schema | Run in Supabase SQL Editor |
| `scripts/supabase-t2-schema.sql` | T2 table schema | Run in Supabase SQL Editor |

### Admin Pages
| URL | Purpose |
|-----|---------|
| `/admin` | Dashboard |
| `/admin/products` | Product management |
| `/admin/videos` | Video management |
| `/admin/stock` | Stock upload (NEW) |
| `/admin/upload` | CSV upload |
| `/admin/sync` | Sync to Magento |

### Config Files
| File | Purpose |
|------|---------|
| `.env.local` | Local environment variables (Supabase credentials) |
| Vercel Dashboard | Production environment variables |

---

## Daily Workflow: Stock Updates

### 1. Upload Stock CSV (Admin)
1. Go to `https://intro-car-us.vercel.app/admin/stock`
2. Select source: **Warehouse Stock** or **Supplier Stock**
3. Upload CSV (format: `SKU, Available_level`)
4. Click Upload → Supabase is updated

### 2. Deploy to Live Site (Terminal)
```bash
cd "IntroCar - US Website Prototype"
node scripts/export-from-supabase.js stock
git add data/json
git commit -m "Stock update"
git push
```

---

## Action Plan / To-Do

### Immediate (High Priority)
- [x] **Add `available_1_3_days` column to Supabase** ✅ DONE

### Short Term
- [ ] **Update Videos admin** to write to Supabase instead of JSON
- [ ] **Update Products admin** to write to Supabase instead of JSON
- [ ] **Consider automating export/deploy** - add "Export & Deploy" button to admin?

### Optional Improvements
- [ ] **Cloudinary** - check usage, consider upgrade if hitting limits
- [ ] **Commit outstanding changes** to git (scripts, docs, etc.)

---

## Environment Variables

### Required in `.env.local` (local development)
```
SUPABASE_URL=https://bmarqxcyyiyatkhlwkgm.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Required in Vercel Dashboard (production)
Same variables must be set in:
**Vercel Dashboard → IntroCar-US → Settings → Environment Variables**

---

## Troubleshooting

### "Unauthorized" error on stock upload
- Log out and log back into admin
- Check that `admin_session` cookie exists

### Migration errors
- `invalid input syntax for type integer` → Check for decimal values in integer fields
- `value too long for type character varying` → Expand column size in Supabase

### SKUs not found during stock upload
- Verify SKU exists in Supabase (use Table Editor filter)
- Check for exact match (case-sensitive, includes suffix like -X, -A)

---

## Contact / Support

**Supabase Project:** ani-e-e's Project (PRODUCTION)
**GitHub Repo:** https://github.com/ani-e-e/IntroCar-US
**Vercel URL:** https://intro-car-us.vercel.app
