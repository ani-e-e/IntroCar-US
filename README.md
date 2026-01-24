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
- 50+ embedded YouTube technical videos with real IntroCar video IDs
- Organized by category (Continental GT, Brakes, Suspension, Engine, Service, Hydraulics, Diagnostics)
- Videos play directly in embedded iframes
- Category navigation buttons for quick jumping between sections
- Request a Technical Video email contact link
- Subscribe to YouTube channel CTA

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
14. ✅ Technical page with 50+ real IntroCar YouTube videos
15. ✅ Category navigation on technical page
16. ✅ Real YouTube video IDs from IntroCar channel
17. ✅ Homepage category links with proper filtering
18. ✅ Dynamic filters (only show options with products)
19. ✅ Prestige Parts page UI polish (logo size, button layout, map styling)

### 🔄 In Progress
20. ⬜ Stripe payments checkout
21. ⬜ Customer accounts/authentication
22. ⬜ Address lookup integration

### 📋 Backlog
23. ⬜ Khaos Control integration
24. ⬜ Customer vehicle matching (save my car)
25. ⬜ Discount pricing tiers

---

## 🆘 Support

If you encounter any issues:
1. Make sure you ran `npm install`
2. Check that Node.js 18+ is installed: `node --version`
3. Clear npm cache if needed: `npm cache clean --force`
4. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

---

## 📅 Recent Updates (January 2025)

### Latest Session (Jan 23, 2025)

#### UI Fixes
- **Prestige Parts buttons on one line** - Removed max-w-3xl constraint and reduced button padding so all 4 buttons (Shop All, Prestige Parts®, Prestige Parts® (OE), Uprated) fit on a single row
- **Prestige Parts logo enlarged** - Increased from w-64/h-32 to w-80/h-40 in "The Prestige Parts® Difference" section
- **Map with full-width white background** - Updated map section to have full-page-width white background with object-contain for proper fitting

#### Technical Page - Real YouTube Videos
- Replaced all placeholder video IDs with real IntroCar YouTube video IDs
- Videos sourced from IntroCar Technical Videos playlist (82 videos)
- Categories: Continental GT, Brakes, Suspension, Engine, Service, Hydraulics, Diagnostics
- All videos now play correctly in embedded iframes

**Key Video IDs (for reference):**
- Bentley GT 6 Common Issues: `KTXFOh_fFTg`
- 5 Common Issues Classic RR/Bentley: `FF-6KuYezBs`
- Brake Accumulator Disassembly: `em3vc2iNzDA`
- Brake Pump Test: `jFA4DWbtxlc`
- Brake Pump Reassembly: `__AFOuJvusY`
- Height Control Valve Part 1: `Wkwxnhe6Vsg`
- Height Control Valve Part 2: `0zaLqDI8BQc`

### Previous Session Updates

#### Multi-Select Part Type Filter
- Converted Part Type filter from single-select buttons to multi-select checkboxes
- Each selected stock type now shows its own filter badge
- Filter badges can be individually removed by clicking X
- Filter count badge shows number of selected types

#### Prestige Parts Page Enhancements
- Added "Shop All Prestige Parts®" button loading all 3 stock types
- Added International Stockists grid with 6 global partners:
  - Albers Motorcars (Indianapolis, USA) - albersclassics.com
  - Spur Parts (Sydney, Australia) - spurparts.com.au
  - Bruce McIlroy Ltd (New Zealand) - brucemcilroy.co.nz
  - Rohdins Classic Car AB (Sweden) - rohdins.com
  - IntroCar (London, UK) - introcar.com
  - Beroparts (Belgium) - beroparts.be
- Added reseller map image

#### Technical Page Improvements
- Embedded YouTube videos directly in iframes (play in frame)
- Added category navigation buttons at top
- Removed external links (Facebook, RR Technical Info box)
- Videos organized by category with counts

#### Homepage & Navigation
- Fixed category links to use exact URL-encoded category names:
  - `Brakes+%26+Hydraulics`
  - `Cooling+System`
  - `Electrical+%26+Ignition`
  - etc.
- Header/Footer Prestige Parts links load all 3 stock types with badges
- Find a Stockist link now goes to /prestige-parts page

---

## 🔗 Key URLs & Resources

### IntroCar YouTube Channel
- Channel: https://www.youtube.com/channel/UCXXKCVAUeBYx6TpLREJ_5rQ
- Technical Videos Playlist: https://www.youtube.com/playlist?list=PL_6ns-Vky0H1lUotzzxP4VcIQmqqTvzmM

### Live Site
- Production: https://intro-car-us.vercel.app
- GitHub: https://github.com/ani-e-e/IntroCar-US

### UK Site Reference
- Main site: https://www.introcar.com
- Technical page: https://www.introcar.com/technical

---

## 🔄 Session Handoff Guide

### Starting a New Cowork Session

When beginning a new session, use this prompt:

```
I'm continuing work on the IntroCar US e-commerce site (Rolls-Royce & Bentley parts).

Please read the README.md in my folder to get context on the project.

Today I want to work on: [SPECIFIC TASK]
```

### Key Files to Reference
- `README.md` - Project overview, features, and action plan
- `app/` - Next.js pages and routes
- `components/` - Reusable UI components
- `lib/data-server.js` - Server-side data layer
- `data/json/` - Product and catalogue data

### Environment & Credentials
For features requiring API keys (Stripe, etc.):
1. Create `.env.local` file (not committed to git)
2. Add keys in format: `STRIPE_SECRET_KEY=sk_test_...`
3. Access in code via `process.env.STRIPE_SECRET_KEY`

### Before Ending a Session
1. Update README.md with session notes
2. Commit all changes with descriptive message
3. Push to GitHub: `git push origin main`
4. Vercel auto-deploys from main branch

---

Built with ❤️ for IntroCar
