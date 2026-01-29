# IntroCar US Website - Project Status

**Last Updated:** January 28, 2026

---

## Completed Features

### ✅ MYC Admin Tool (January 2026)
Model/Year/Chassis → SKU relationship management

**Features:**
- Excel paste support with auto-delimiter detection (tab, comma, pipe)
- Duplicate detection (exact + near-duplicate by Make/Model)
- T7 validation against vehicles.json
- Replace workflow: view existing entries, mark for deletion, add new
- Remove duplicates cleanup function
- Supabase integration (`product_fitment` table)

**Files:**
- `/app/admin/myc/page.js` - Admin UI
- `/app/api/admin/myc/route.js` - API (GET, POST, DELETE)
- `/scripts/reimport-t3.js` - Data import script

**Database:**
- Table: `product_fitment`
- Columns: id, parent_sku, make, model, chassis_start, chassis_end, additional_info
- Records: ~325,000 (T3 master data)

**Key Fix:** Chassis values must be kept as strings (not `Math.floor()`) to support alphanumeric values like "5AS1", "B1AA"

---

### ✅ Multi-Tenant Reseller System (Base Infrastructure)
- Dynamic routing at `/reseller/[tenant]/`
- Tenant context with theming (colors, logos, company info)
- Product filtering via `reseller_flags` column
- Working example: Albers Motorcars (`albers-rb`)

---

## In Progress

### 🔄 Reseller Template Configuration Tool
**Status:** Not started - handover document created

**Goal:** Admin UI to manage reseller configurations without code changes

**Handover Document:** `/HANDOVER-RESELLER-TEMPLATES.md`

**Next Steps:**
1. Create `reseller_configs` table in Supabase
2. Build CRUD API endpoints
3. Build admin UI at `/admin/resellers`
4. Update `/lib/tenants.js` to fetch from DB

---

## Pending Features

- [ ] Reseller configuration admin tool
- [ ] Image/media management improvements
- [ ] Order management dashboard
- [ ] Analytics integration

---

## Technical Notes

**Stack:** Next.js 14 App Router, Supabase, Tailwind CSS, Vercel
**Live URL:** https://intro-car-us.vercel.app
**Admin:** /admin (password protected)

**Important:** Vercel serverless = read-only filesystem. All data must go through Supabase, not JSON files.

---

## Session Log

| Date | Work Completed |
|------|----------------|
| Jan 28, 2026 | MYC Admin: Fixed NaN chassis values, reimported T3 data (325K records), created reseller template handover |
| Earlier | MYC Admin: Built UI, Excel paste, Supabase migration, duplicate cleanup |
| Earlier | Base reseller system, Albers Motorcars setup |
