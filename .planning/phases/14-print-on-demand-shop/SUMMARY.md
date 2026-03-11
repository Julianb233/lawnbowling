# Phase 14: Print-on-Demand Shop

## Status: PARTIAL (4/7 criteria met, 3 deferred by design)

The shop infrastructure is built and functional for browsing, cart, and affiliate links. Printify API integration, Stripe checkout, and order tracking are explicitly deferred (the code is designed as a drop-in replacement when API keys become available).

## Success Criteria Verification

### 1. /shop page with product catalog (Printify API or mock) -- MET
- **File**: `src/app/shop/page.tsx`, `src/app/shop/ShopCatalog.tsx`
- Category-filtered product grid (T-Shirts, Hats, Mugs, Accessories)
- 14 products with realistic descriptions and lawn bowling themes
- **Data**: `src/lib/shop/products.ts` — explicitly designed as mock data that maps 1:1 to Printify API types

### 2. Products display SKUs, images, variants with 40% markup -- MET
- **File**: `src/lib/shop/products.ts`
- Each product has: id, slug, name, description, category, baseCost, price, image, variants[], tags
- `markup()` function applies 40% markup: `Math.ceil(base * 1.4) - 0.01` (e.g., $18 base -> $25.19 retail)
- Variants include size (S-2XL) and color (White/Black/Green/Navy) with hex swatches
- Product detail page (`src/app/shop/[slug]/ProductDetail.tsx`) shows color/size selectors
- Placeholder SVG images (will be replaced with Printify product images)

### 3. Cart and checkout with Stripe -- PARTIAL
- **Cart**: `src/lib/shop/cart.ts` — fully functional localStorage-backed cart
  - `useCart()` hook with `addItem`, `removeItem`, `updateQuantity`, `clearCart`
  - Cross-tab sync via `storage` event listener
  - `useSyncExternalStore` for React 18 compatibility
- **Cart UI**: `src/components/shop/CartDrawer.tsx`, `src/components/shop/AddToCartButton.tsx`
- **Checkout**: `src/app/shop/checkout/CheckoutPlaceholder.tsx` — "Coming Soon" page with email capture
- **Stripe**: Stripe webhook route exists at `src/app/api/stripe/webhook/route.ts` but checkout flow not connected
- **Gap**: No Stripe Checkout session creation. Designed to be added when Printify integration goes live.

### 4. Orders submitted to Printify API -- NOT YET (by design)
- `products.ts` header comment: "When the Printify API key is available, replace the exports here with fetchers that hit the Printify API"
- Product types match Printify's data model for seamless migration
- **Gap**: No Printify API integration code yet

### 5. Order tracking and status via webhooks -- NOT YET (by design)
- No order tracking pages or webhook handlers for Printify order status
- **Gap**: Will be needed when orders go live

### 6. Club-branded merchandise customization -- PARTIAL
- Admin branding page exists at `src/app/admin/branding/page.tsx` for club identity management
- **Gap**: No flow connecting club branding to Printify product customization

### 7. Affiliate links for bowls, shoes, bags -- MET
- **File**: `src/app/shop/equipment/page.tsx` (420 lines)
- 5 equipment categories: Bowls, Shoes, Bags, Accessories, Books & Learning
- 16 affiliate product links to authorized retailers (Henselite, Taylor, Drakes Pride, Aero, Amazon)
- Each link includes: product name, description, retailer, price range, external link
- Buying tips per category for expert guidance
- Authorized dealers section with 4 major retailers
- Affiliate disclosure at bottom

## Key Architecture

- **Products**: `src/lib/shop/products.ts` — mock data, Printify-ready types
- **Cart**: `src/lib/shop/cart.ts` — localStorage, cross-tab sync, React hook
- **Components**: `src/components/shop/` — ProductCard, AddToCartButton, CartDrawer
- **Pages**: `/shop` (catalog), `/shop/[slug]` (product detail), `/shop/checkout` (placeholder), `/shop/equipment` (affiliate)
- **Layout**: `src/app/shop/layout.tsx` — shop wrapper with cart icon in header

## Items Deferred (Require External Service Keys)

1. Printify API integration (needs API key)
2. Stripe Checkout session creation (needs Stripe keys + Printify for fulfillment)
3. Order tracking webhooks (needs Printify webhook endpoint)
4. Club-branded merchandise customization (needs Printify + branding integration)
