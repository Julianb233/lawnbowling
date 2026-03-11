# Phase 14 Summary: Print-on-Demand Shop

## What was built

### Printify API Client (`src/lib/printify.ts`)
- Full API client with typed requests/responses
- Product sync: fetch, normalize, apply 40% markup pricing
- Order lifecycle: create, send to production, cancel, get status
- SKU generation: deterministic `LB-{CAT}-{PROD}-{VAR}` format
- Blueprint-to-category mapping for auto-categorization
- Webhook signature verification with HMAC-SHA256
- Custom error class `PrintifyApiError` for structured error handling

### Shop UI (existing + enhanced)
- **Catalog** — 15 products across t-shirts, hats, mugs, accessories
- **Product detail** — color swatches, size selectors, add-to-cart
- **Cart** — localStorage-backed, cross-tab sync, slide-out drawer
- **Checkout** — Stripe Checkout integration with success/cancel states
- **Equipment guide** — affiliate links to Henselite, Taylor, Drakes Pride, Amazon
- **Club custom merch** — quote request form for branded club merchandise

### Order Fulfillment Pipeline
1. Customer completes Stripe checkout
2. Stripe webhook fires `checkout.session.completed` with `source: "shop"`
3. Webhook extracts line items and shipping address from Stripe session
4. Creates Printify order via API
5. Sends order to production automatically
6. Printify webhook receives shipping/tracking updates

### API Routes
- `POST /api/shop/checkout` — Create Stripe checkout session
- `GET /api/shop/printify/sync` — Fetch & normalize Printify products
- `POST /api/shop/printify/orders` — Create Printify order manually
- `POST /api/shop/webhooks/printify` — Receive Printify status updates
- `POST /api/stripe/webhook` — Updated to handle shop order fulfillment

## Files changed/created
- `src/lib/printify.ts` (new) — Centralized Printify API client
- `src/app/shop/custom-merch/page.tsx` (new) — Club merch page
- `src/app/shop/custom-merch/CustomMerchForm.tsx` (new) — Quote form
- `src/app/shop/layout.tsx` (updated) — Added Club Merch nav link
- `src/app/api/stripe/webhook/route.ts` (updated) — Shop order fulfillment
- `src/app/api/shop/printify/sync/route.ts` (updated) — Uses centralized client
- `src/app/api/shop/printify/orders/route.ts` (updated) — Uses centralized client
- `src/app/api/shop/webhooks/printify/route.ts` (updated) — Proper signature verification
- `.planning/phases/14-printify-shop/PLAN.md` (new)
- `.planning/phases/14-printify-shop/SUMMARY.md` (new)
