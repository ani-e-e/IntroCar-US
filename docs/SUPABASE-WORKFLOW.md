# IntroCar US - Supabase Data Management Workflow

This document explains how to manage product data using Supabase instead of Google Sheets.

---

## Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Supabase     │     │   JSON Files    │     │   Live Site     │
│  (your admin)   │ --> │  (data/json/)   │ --> │   (Vercel)      │
│                 │     │                 │     │                 │
│  Edit products  │     │  git commit     │     │  Auto-deploy    │
│  Update stock   │     │  git push       │     │                 │
│  Change prices  │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**Key Points:**
- Supabase replaces Google Sheets for data management
- JSON files are exported from Supabase when you're ready to deploy
- Live site continues to read from JSON files (no changes to site code)
- Deploy happens when you push updated JSON to GitHub

---

## Initial Setup (One Time)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose a name: `introcar-us`
4. Set a database password (save this!)
5. Select region: Choose closest to you (London for UK)
6. Click "Create new project" (takes ~2 minutes)

### 2. Create Database Tables

1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Open `scripts/supabase-schema.sql` and copy the entire contents
4. Paste into the SQL Editor
5. Click **Run** (green button)
6. You should see "Success" for each table created

### 3. Get Your API Keys

1. Go to **Settings** > **API** (left sidebar)
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **service_role key**: `eyJhbG...` (the secret one, not anon)

### 4. Configure Local Environment

Create a `.env.local` file in your project root:

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. Run Initial Migration

This imports all your existing JSON data into Supabase:

```bash
cd introcar-us
npm install @supabase/supabase-js dotenv  # Install dependencies
node scripts/migrate-to-supabase.js        # Run migration
```

Wait for completion (~5-10 minutes for 79,000 products).

### 6. Verify Data

1. Go to Supabase dashboard > **Table Editor**
2. Click on `products` table
3. You should see all 79,080 products
4. Browse other tables to confirm data imported correctly

---

## Daily Workflow: Stock Updates

### Option A: Update via Supabase UI

1. Go to Supabase > **Table Editor** > `products`
2. Use filters to find products (e.g., filter by SKU)
3. Click on a row to edit
4. Update `available_now`, `available_1_to_3_days`, or `in_stock`
5. Click Save

### Option B: Bulk Update via CSV

1. Prepare a CSV with columns: `sku`, `available_now`, `available_1_to_3_days`
2. In Supabase, go to **SQL Editor**
3. Use this query to update from your data:

```sql
UPDATE products SET
  available_now = 10,
  available_1_to_3_days = 5,
  in_stock = true
WHERE sku = 'YOUR-SKU-HERE';
```

### Option C: Import from Khaos Control

If you have a stock export from Khaos Control:

```sql
-- Example: Update stock from a temporary import
-- First, upload your stock CSV to a temp table, then:

UPDATE products p
SET
  available_now = s.qty_available,
  in_stock = (s.qty_available > 0)
FROM stock_import s
WHERE p.sku = s.sku;
```

### Export Stock Changes to Live Site

After making stock updates:

```bash
# Quick export (stock only - fastest)
node scripts/export-from-supabase.js stock

# Commit and deploy
git add data/json/products.json
git commit -m "Daily stock update"
git push
```

The site will auto-deploy in ~30 seconds.

---

## Monthly Workflow: Price Updates

### Update Prices in Supabase

1. Go to **Table Editor** > `products`
2. Filter by category or stock type as needed
3. Edit prices directly, or use SQL for bulk updates:

```sql
-- Example: Increase all Prestige Parts prices by 5%
UPDATE products
SET price = ROUND(price * 1.05, 2)
WHERE stock_type = 'Prestige Parts';

-- Example: Set specific price
UPDATE products
SET price = 129.99
WHERE sku = 'UE40893-X';
```

### Export All Product Data

```bash
# Full export (includes prices, descriptions, everything)
node scripts/export-from-supabase.js products

# Commit and deploy
git add data/json/products.json data/json/products-index.json
git commit -m "Monthly price update"
git push
```

---

## Housekeeping Tasks

### Add New Products

1. In Supabase **Table Editor** > `products`
2. Click **Insert** > **Insert Row**
3. Fill in required fields: `sku`, `description`, `price`, `stock_type`
4. Add to `product_fitment` table for vehicle compatibility
5. Export and deploy

### Update Product Descriptions

1. Find product in **Table Editor**
2. Edit the `description` field
3. Export and deploy

### Mark Products as NLA (No Longer Available)

```sql
UPDATE products
SET nla_date = '2026-01-26'
WHERE sku = 'OLD-PART-SKU';
```

### Add New Catalogues

1. Go to **Table Editor** > `catalogues`
2. Insert new row with: `id`, `title`, `category`, `image` (Cloudinary URL)
3. Add hotspots to link to products
4. Export catalogues: `node scripts/export-from-supabase.js catalogues`

### Manage Technical Videos

1. **Table Editor** > `technical_videos`
2. Add/edit/delete videos
3. Export: `node scripts/export-from-supabase.js videos`

---

## Useful SQL Queries

### Find Products by SKU Pattern

```sql
SELECT sku, description, price, available_now
FROM products
WHERE sku LIKE 'UE%'
ORDER BY sku;
```

### View Low Stock Items

```sql
SELECT sku, description, available_now, available_1_to_3_days
FROM products
WHERE in_stock = true AND available_now <= 2
ORDER BY available_now;
```

### Products Missing Images

```sql
SELECT sku, description
FROM products
WHERE image IS NULL AND in_stock = true
LIMIT 100;
```

### Count Products by Stock Type

```sql
SELECT stock_type, COUNT(*) as count
FROM products
GROUP BY stock_type
ORDER BY count DESC;
```

### Recent Price Changes

```sql
SELECT sku, description, price, updated_at
FROM products
WHERE updated_at > NOW() - INTERVAL '7 days'
ORDER BY updated_at DESC;
```

---

## Backup & Recovery

### Export Full Backup

Supabase automatically backs up your database daily. You can also:

1. Go to **Settings** > **Database**
2. Scroll to "Database Backups"
3. Download a backup anytime

### Restore from JSON

If you need to restore from your JSON files:

```bash
# Re-run migration (this upserts, won't create duplicates)
node scripts/migrate-to-supabase.js
```

---

## Schedule Summary

| Task | Frequency | Time | Command |
|------|-----------|------|---------|
| Stock levels | Daily | ~5 min | `export stock` → push |
| Price updates | Monthly | ~10 min | `export products` → push |
| New products | As needed | ~5 min each | Add in UI → export → push |
| Catalogues | Rarely | ~5 min | `export catalogues` → push |
| Videos | As needed | ~2 min | `export videos` → push |

---

## Troubleshooting

### "Permission denied" when running scripts

Make sure your `.env.local` has the **service_role** key, not the anon key.

### Products not showing on site after export

1. Check git status: `git status`
2. Make sure JSON files were updated: `git diff data/json/products.json`
3. Commit and push: `git add . && git commit -m "Update" && git push`
4. Check Vercel dashboard for deploy status

### Can't connect to Supabase

1. Check your internet connection
2. Verify SUPABASE_URL is correct (no trailing slash)
3. Check the service key hasn't expired

---

## Need Help?

- **Supabase Docs**: https://supabase.com/docs
- **Table Editor Guide**: https://supabase.com/docs/guides/database/tables
- **SQL Reference**: https://www.postgresql.org/docs/

---

*Last updated: January 26, 2026*
