# Phase 14: Print-on-Demand Shop with Printify Integration

## Overview
Full merch shop with Printify print-on-demand fulfillment, Stripe checkout, affiliate equipment links, and club custom merch ordering.

## Sub-tasks

### 14-01: Printify API Integration
- [x] Centralized Printify client (`src/lib/printify.ts`)
- [x] Product sync with normalization
- [x] SKU mapping (LB-{category}-{product}-{variant})
- [x] 40% markup pricing (Math.ceil(base * 1.4) - 0.01)
- [x] Order creation, send-to-production, cancel
- [x] Webhook signature verification (HMAC-SHA256)
- [x] Blueprint-to-category mapping

### 14-02: Shop UI
- [x] Shop layout with nav (Merch, Equipment, Club Merch)
- [x] Catalog page with category filters
- [x] Product cards with tags (best-seller, new, gift-idea)
- [x] Product detail page with color/size selectors
- [x] Add to cart button with feedback animation
- [x] Cart drawer (floating button, slide-out panel)
- [x] Checkout page with Stripe integration
- [x] Success/cancelled/empty states
- [x] 15 mock products across 4 categories

### 14-03: Order Fulfillment & Custom Merch
- [x] Stripe webhook handles shop orders (source: "shop")
- [x] Auto-creates Printify order on payment confirmation
- [x] Auto-sends to production after order creation
- [x] Printify webhook receives shipping/tracking updates
- [x] Club custom merch quote request form
- [x] Equipment & gear guide with affiliate links
- [x] Authorized dealer section

## Environment Variables Required
- `PRINTIFY_API_KEY` — Printify API token
- `PRINTIFY_SHOP_ID` — Printify shop identifier
- `PRINTIFY_WEBHOOK_SECRET` — For webhook signature verification
- `STRIPE_SECRET_KEY` — Stripe server-side key
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Stripe client-side key
