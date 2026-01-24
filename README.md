# IntroCar US - E-commerce Website

Premium Rolls-Royce and Bentley parts e-commerce site for the US market.

**Live Site:** [https://intro-car-us.vercel.app](https://intro-car-us.vercel.app)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation

1. **Open Terminal and navigate to this folder:**
   ```bash
   cd "IntroCar - US Website Prototype"
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
IntroCar - US Website Prototype/
├── app/
│   ├── globals.css              # Global styles + Tailwind
│   ├── layout.js                # Root layout
│   ├── page.js                  # Homepage
│   ├── products/
│   │   ├── page.js              # Product listing page
│   │   ├── ProductsContent.js   # Products client component
│   │   └── [sku]/
│   │       └── page.js          # Product detail page
│   ├── catalogues/              # Catalogue browser
│   ├── prestige-parts/          # Prestige Parts landing page
│   ├── technical/               # Technical videos page
│   ├── specialists/             # Specialist links page
│   └── api/                     # API routes
├── components/
│   ├── Header.js                # Site header with nav
│   ├── Footer.js                # Site footer
│   ├── ProductCard.js           # Product card component
│   ├── VehicleFinder.js         # Make/Model/Year selector
│   └── HeroSlider.js            # Homepage hero slider
├── lib/
│   └── data-server.js           # Server-side data layer
├── data/
│   └── json/                    # Product & catalogue JSON data
├── public/
│   └── images/
│       ├── catalogues/          # 6,856 catalogue images
│       ├── categories/          # Category images
│       ├── logos/               # Brand logos
│       └── prestige-parts/      # Prestige Parts assets
├── package.json
├── tailwind.config.js
└── next.config.js
```

---

## ✨ Features

### Homepage (`/`)
- Hero section with animated slider
- Trust badges (Est. 1988, Worldwide Shipping, Price Match, Trustpilot)
- Vehicle Part Finder (Make/Model/Year selector)
- Popular Categories grid with direct category filtering
- Part Options showcase (OE, Prestige Parts, Reconditioned)
- Why Choose Us section with embedded YouTube video

### Product Listing Page (`/products`)
- **Multi-select Part Type filter** - select multiple stock types with checkboxes
- Filter by category, subcategory, vehicle (Make/Model/Year)
- **Dynamic filters** - only shows options that have products for current selection
- **Filter badges** - individual badges for each selected filter
- Smart SKU search with supersession matching
- "Showing all related parts" for variant searches
- Sort by relevance, popularity, price, name, SKU
- Grid and list view modes
- Mobile-friendly filter drawer
- Active filter tags with easy removal

### Product Detail Page (`/products/[sku]`)
- Large product image with Cloudinary CDN delivery
- Stock type badges (color-coded)
- **NLA warning banner** when applicable (format: "Sep 2014")
- Stock status and availability
- Quantity selector
- Add to cart
- Tabs: Description, Fitment, Shipping
- Related products carousel
- Link to technical catalogues

### Catalogue Browser (`/catalogues`)
- Browse 6,856 technical diagrams/exploded views
- Filter by Make, Model, Category
- Only shows catalogues WITH images
- Toggle filters (click again to deselect)
- Links to related products from diagrams
- Images hosted on Cloudinary CDN for fast delivery

### Technical Page (`/technical`)
- 60+ embedded YouTube technical videos
- Organized by category (Continental GT, Brakes, Suspension, Engine, etc.)
- Videos play directly in frame
- Category navigation buttons for quick jumping
- Request a Technical Video contact link

### Prestige Parts Page (`/prestige-parts`)
- Dedicated landing page for Prestige Parts range
- Shop All button loads all 3 stock types (Prestige Parts, Prestige Parts (OE), Uprated)
- Individual links to each stock type
- Benefits grid (3-Year Warranty, OEM Quality, etc.)
- The Prestige Parts Difference section with enlarged logo
- **International Stockists section** with 6 global partners:
  - Albers Motorcars (Indianapolis, USA)
  - Spur Parts (Sydney, Australia)
  - Bruce McIlroy Ltd (New Zealand)
  - Rohdins Classic Car AB (Sweden)
  - IntroCar (London, UK)
  - Beroparts (Belgium)
- Reseller map image
- View Full Range button

### Specialist Links Page (`/specialists`)
- Rolls-Royce and Bentley owners clubs
- Service & restoration specialists
- Technical resources
- Prestige Parts International Stockists link (goes to /prestige-parts)

### Shopping Cart (`/cart`)
- Add/remove products
- Quantity adjustment
- Shipping calculator (USA DHL rates)
- Free shipping over $500
- Proceed to checkout

---

## 🏷️ Stock Types & Filtering

### Multi-Select Part Type Filter
Users can select multiple stock types simultaneously using checkboxes. Each selected type shows its own filter badge that can be individually removed.

**Prestige Parts Links:**
- Header "Prestige Parts" link → loads all 3 types with badges
- Homepage "Prestige Parts Branded" → loads all 3 types
- Footer "Prestige Parts Range" → goes to dedicated landing page

### Stock Type Colors

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

## 🏷️ NLA (No Longer Available) Parts

Parts that Bentley Motors has discontinued are flagged with:
- Red "NLA" badge on product cards
- Detailed warning box on product pages
- NLA date showing when Bentley discontinued the part (format: "Sep 2014")
- Filter to show only NLA parts

This helps customers find rare parts that are no longer available from the manufacturer.

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

### Vercel (Current Setup)
The site is deployed to Vercel and auto-deploys on push to main branch.

**Repository:** `github.com/ani-e-e/IntroCar-US`

To deploy:
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

Vercel will automatically build and deploy within 1-2 minutes.

### Manual Build
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
6. ✅ Catalogue browser (6,856 technical diagrams)
7. ✅ CMS pages (About, Contact, Blog, Terms, Privacy, etc.)
8. ✅ Shipping matrix (USA DHL rates)
9. ✅ Catalogue images - 100% coverage on Cloudinary CDN
10. ✅ Multi-select Part Type filter with checkboxes
11. ✅ Individual filter badges for each selected stock type
12. ✅ Prestige Parts dedicated landing page
13. ✅ International Stockists section with map
14. ✅ Technical page with 60+ embedded YouTube videos
15. ✅ Category navigation on technical page
16. ✅ Homepage category links with proper filtering
17. ✅ Dynamic filters (only show options with products)

### 🔄 In Progress
18. ⬜ Stripe payments checkout
19. ⬜ Customer accounts/authentication
20. ⬜ Address lookup integration

### 📋 Backlog
21. ⬜ Khaos Control integration
22. ⬜ Customer vehicle matching (save my car)
23. ⬜ Discount pricing tiers

---

## 🆘 Support

If you encounter any issues:
1. Make sure you ran `npm install`
2. Check that Node.js 18+ is installed: `node --version`
3. Clear npm cache if needed: `npm cache clean --force`
4. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

---

## 📅 Recent Updates (January 2025)

### Multi-Select Part Type Filter
- Converted Part Type filter from single-select buttons to multi-select checkboxes
- Each selected stock type now shows its own filter badge
- Filter badges can be individually removed by clicking X
- Filter count badge shows number of selected types

### Prestige Parts Page Enhancements
- Added "Shop All Prestige Parts®" button loading all 3 stock types
- Added International Stockists grid with 6 global partners
- Added reseller map image
- Increased Prestige Parts logo size for better balance
- Spaced out buttons on one line

### Technical Page Improvements
- Embedded YouTube videos directly in iframes (play in frame)
- Added category navigation buttons at top
- Removed external links (Facebook, RR Technical Info)
- 60+ videos organized by category

### Homepage & Navigation
- Fixed category links to use exact category names for proper filtering
- Header/Footer Prestige Parts links load all 3 stock types with badges
- Find a Stockist link now goes to /prestige-parts page

---

Built with ❤️ for IntroCar
