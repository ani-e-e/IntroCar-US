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
│   └── images/              # Product images go here
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
- Filter by category, stock type, vehicle
- **NLA filter** - show parts no longer available from Bentley
- Search within results
- Sort by price, name, SKU
- Grid and list view modes
- Mobile-friendly filter drawer
- Active filter tags

### Product Detail Page (`/products/[sku]`)
- Large product image with badges
- **NLA warning banner** when applicable
- Prestige Parts® badge
- Quantity selector
- Add to cart
- Tabs: Description, Fitment, Shipping
- Related products

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

The site supports all your stock types with color-coded badges:

| Type | Color |
|------|-------|
| Original Equipment | Blue |
| Prestige Parts® | Gold/Amber |
| Reconditioned Exchange | Purple |
| Used | Gray |
| Aftermarket | Green |
| Uprated | Rose |
| Rebuilt | Orange |
| Bundle | Teal |

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

## 📝 Next Steps

1. ✅ Homepage - Complete
2. ✅ Product Listing - Complete
3. ✅ Product Detail - Complete
4. ⬜ Connect real product data
5. ⬜ Shopping cart functionality
6. ⬜ Checkout with Stripe
7. ⬜ Khaos Control integration
8. ⬜ Customer accounts

---

## 🆘 Support

If you encounter any issues:
1. Make sure you ran `npm install`
2. Check that Node.js 18+ is installed: `node --version`
3. Clear npm cache if needed: `npm cache clean --force`
4. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

---

Built with ❤️ for IntroCar
