# IntroCar US - Integration Notes

## Deployment

**Vercel Project:** `intro-car-us` (note the hyphens)
**Production URL:** https://intro-car-us.vercel.app
**GitHub Repo:** https://github.com/ani-e-e/IntroCar-US

⚠️ There's also an older `introcar-us` project in Vercel - that's NOT the active one.

## Architecture Overview

**Stack:** Next.js + Supabase + Vercel + GitHub

**Data Flow:**
- Source of truth: Supabase (moved from Google Sheets)
- Daily sync to JSON files
- Admin panel for housekeeping
- Chassis-to-SKU matching enabled by centralised data

## Magento Integration (Headless Approach)

Using Magento as headless ecommerce - Next.js handles frontend, Magento handles orders → Khaos sync.

### Order Creation
- Use native Magento API: https://developer.adobe.com/commerce/webapi/rest/tutorials/orders/order-create-order/
- Customer lookup by email to check if exists (for discount eligibility), but not for order history
- If no match, create as guest order

### Currency
- Magento only sees GBP values
- USD conversion happens in Vercel/Stripe

### Shipping
- Use free rate in Magento
- Add shipping cost as additional line item
- Calculation uses same matrix as Magento (already implemented)

### Payment Method
- Create duplicate of checkmo called "prepaid_stripe"
- Disabled on site but permitted via API
- Easy filter for US orders

### Khaos Exporter
- Keep using Magento → Khaos exporter as normal
- No changes needed since we want orders to flow through

### Stripe Considerations
- Handle delayed webhooks (fraud stops, 3DS failures)
- Ensure webhook secrets are properly checked

## Goals

1. Direct control over updates without complex dependencies
2. Simpler, more predictable workflow
3. Better security (static files, no public database exposure)
4. Potentially retire third-party extensions (Amasty attachments, etc.)
5. Strip Magento back to just order processing

## Questions for Web Team

- Which extensions can be retired vs. tied to order/Khaos functionality?
- Best practices for Supabase → Magento data sync?
- Risks or gotchas with this headless approach?

## Embeddable Vehicle Part Finder

An iframe-ready Vehicle Part Finder is available at:
```
https://intro-car-us.vercel.app/embed/vehicle-finder
```

### Usage
```html
<iframe
  src="https://intro-car-us.vercel.app/embed/vehicle-finder"
  width="100%"
  height="400"
  frameborder="0"
></iframe>
```

### URL Parameters
- `target` - Custom URL for results (default: /products on US site)
- `theme` - 'light' or 'dark' (default: light)
- `hideTitle` - 'true' to hide the header
- `buttonText` - Custom button text (default: "Find Parts")

### Behavior
When users click "Find Parts", results open in a **new tab** on intro-car-us.vercel.app.

---

*Last updated: January 2026*
