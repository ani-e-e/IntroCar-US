# IntroCar US - E-commerce Website

Premium Rolls-Royce and Bentley parts e-commerce site for the US market.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation

1. **Open Terminal and navigate to this folder:**
   ```bash
   cd introcar-us
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Visit [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
introcar-us/
├── app/
│   ├── globals.css          # Global styles + Tailwind
│   ├── layout.js            # Root layout
│   ├── page.js              # Homepage
│   └── products/
│       ├── page.js          # Product listing page
│       └── [sku]/
│           └── page.js      # Product detail page
├── components/
│   ├── Header.js            # Site header with nav
│   ├── Footer.js            # Site footer
│   ├── ProductCard.js       # Product card component
│   └── VehicleSelector.js   # Make/Model/Year selector
├── lib/
│   └── data.js              # Sample product data
├── public/
│   └── images/
│       └── catalogues/      # 6,849 catalogue images (URL-friendly names)
├── package.json
├── tailwind.config.js
└── next.config.js
```

---

## ✨ Features

### Homepage
- Hero section with vehicle selector
- Trust badges (shipping, quality, support)
- Category grid navigation
- NLA (No Longer Available) parts section
- Featured products
- Prestige Parts® showcase
- Newsletter signup

### Product Listing Page (`/products`)
- Filter by category, stock type, vehicle (Make/Model/Year)
- **NLA filter** - show parts no longer available from manufacturer
- Smart SKU search with supersession matching
- "Showing all related parts" for variant searches
- Sort by relevance, price, name, SKU
- Grid and list view modes
- Mobile-friendly filter drawer
- Active filter tags with easy removal

### Product Detail Page (`/products/[sku]`)
- Large product image with badges
- **NLA warning banner** when applicable (format: "Sep 2014")
- Prestige Parts® badge
- Stock status and availability
- Quantity selector
- Add to cart
- Tabs: Description, Fitment, Shipping
- Related products carousel
- Link to technical catalogues

### Catalogue Browser (`/catalogues`)
- Browse technical diagrams/exploded views
- Filter by Make, Model, Category
- Only shows catalogues WITH images (image IS the catalogue)
- Toggle filters (click again to deselect)
- Links to related products from diagrams
- **6,856 catalogues with 100% image coverage**
- Images hosted on Cloudinary CDN for fast delivery
- URL-friendly filenames based on catalogue titles

### Shopping Cart (`/cart`)
- Add/remove products
- Quantity adjustment
- Shipping calculator (USA DHL rates)
- Free shipping over $500
- Proceed to checkout

---

## 🏷️ NLA (No Longer Available) Parts

Parts that Bentley Motors has discontinued are flagged with:
- Red "NLA" badge on product cards
- Detailed warning box on product pages
- NLA date showing when Bentley discontinued the part
- Special NLA section on homepage
- Filter to show only NLA parts

This helps customers find rare parts that are no longer available from the manufacturer.

---

## 🎨 Stock Types

The site supports all product stock types with color-coded badges:

| Type | Color | Notes |
|------|-------|-------|
| Prestige Parts® | Gold/Amber | IntroCar's premium brand |
| Prestige Parts (OE) | Gold | OE-spec Prestige parts |
| Uprated | Rose | Performance upgrades |
| Original Equipment | Blue | Genuine manufacturer parts |
| Aftermarket | Green | Third-party alternatives |
| Reconditioned Exchange | Purple | Refurbished units |
| Used | Gray | Pre-owned parts |
| Rebuilt | Orange | Rebuilt assemblies |
| Bundle | Teal | Part kits |

**Note:** "Lookbook" stock type items are catalogues (technical diagrams), not products, and are shown separately in the Catalogue browser.

---

## 📦 Connecting Real Data

The current build uses sample data in `lib/data.js`. To connect your 79,000+ products:

### Option 1: Static JSON
1. Export your Excel files to JSON
2. Replace the sample data in `lib/data.js`
3. Rebuild the site

### Option 2: API Route (Recommended)
1. Create `app/api/products/route.js`
2. Connect to your data source (database, Google Sheets, etc.)
3. Update components to fetch from API

### Option 3: Database
For best performance with 79,000 products:
- Supabase (free tier available)
- PlanetScale
- Vercel Postgres

---

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

---

## 🚢 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import repository at [vercel.com](https://vercel.com)
3. Click Deploy

### Manual
```bash
npm run build
npm start
```

---

## 📝 Current Status & Next Steps

### ✅ Completed
1. ✅ Homepage with hero slider, trust badges, categories
2. ✅ Product listing with advanced filtering
3. ✅ Product detail pages with NLA warnings
4. ✅ Real product data connected (79,000+ products)
5. ✅ Shopping cart with shipping calculator
6. ✅ Catalogue browser (technical diagrams)
7. ✅ CMS pages (About, Contact, Blog, Terms, Privacy, etc.)
8. ✅ Shipping matrix (USA DHL rates)
9. ✅ Catalogue images - 100% local coverage (6,856 catalogues)
10. ✅ Image rename - URL-friendly slugs based on titles
11. ✅ Cloudinary upload - All catalogue images hosted on CDN

### 🔄 In Progress
12. ⬜ Stripe payments checkout
13. ⬜ Customer accounts/authentication
14. ⬜ Address lookup integration

### 📋 Backlog
15. ⬜ Khaos Control integration
16. ⬜ Customer vehicle matching (save my car)
17. ⬜ Discount pricing tiers

---

## 🆘 Support

If you encounter any issues:
1. Make sure you ran `npm install`
2. Check that Node.js 18+ is installed: `node --version`
3. Clear npm cache if needed: `npm cache clean --force`
4. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

---

Built with ❤️ for IntroCar
