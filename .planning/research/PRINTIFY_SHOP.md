# Printify Print-on-Demand Shop Research

**Project:** lawnbowl.app merchandise shop
**Researched:** 2026-03-11
**Overall Confidence:** MEDIUM-HIGH (API docs verified, product pricing from official sources, competitor landscape surveyed)

---

## 1. Printify API Integration

### Can You Build a Custom Storefront?

**YES.** Printify explicitly supports custom storefronts via their REST API. You do NOT need Shopify, Etsy, or any third-party platform. The API lets you manage products, submit orders, handle uploads, and receive webhook notifications -- everything needed for a headless commerce integration built directly into lawnbowl.app.

**Confidence: HIGH** -- Verified via official API reference at [developers.printify.com](https://developers.printify.com/).

### API Base URLs

| Version | Base URL | Status |
|---------|----------|--------|
| V1 | `https://api.printify.com/v1/` | Supported, stable |
| V2 | `https://api.printify.com/v2/` | Newer, JSON:API spec, recommended for new integrations |

### Authentication

**Option A: Personal Access Token (recommended for single-merchant)**
- Generated in Printify account: My Profile > Connections
- Valid for 1 year, then must be regenerated
- Sent as: `Authorization: Bearer $PRINTIFY_API_TOKEN`
- Must include `User-Agent` header
- Best for: lawnbowl.app (single shop, server-side calls)

**Option B: OAuth 2.0 (for multi-merchant platforms)**
- Requires app registration and approval (up to 1 week)
- Token flow: grant code -> access token + refresh token
- Access tokens expire after 6 hours
- Overkill for our use case unless we later enable clubs to run their own shops

**Recommendation:** Use Personal Access Token. Store in environment variable. Call API server-side only (Next.js API routes / Server Actions). Never expose token to client.

### Core API Endpoints

**Catalog (browsing products):**
```
GET  /v1/catalog/blueprints.json                                    # List all product types
GET  /v1/catalog/blueprints/{blueprint_id}.json                     # Specific product type
GET  /v1/catalog/blueprints/{id}/print_providers.json               # Providers for a product
GET  /v1/catalog/blueprints/{id}/print_providers/{id}/variants.json # Size/color variants
GET  /v1/catalog/blueprints/{id}/print_providers/{id}/shipping.json # Shipping costs
GET  /v1/catalog/print_providers.json                               # All providers
```

**Products (your designed products):**
```
GET    /v1/shops/{shop_id}/products.json                # List your products
POST   /v1/shops/{shop_id}/products.json                # Create a product
PUT    /v1/shops/{shop_id}/products/{id}.json            # Update a product
DELETE /v1/shops/{shop_id}/products/{id}.json            # Delete a product
POST   /v1/shops/{shop_id}/products/{id}/publish.json    # Publish product
```

**Orders:**
```
GET    /v1/shops/{shop_id}/orders.json                  # List orders
GET    /v1/shops/{shop_id}/orders/{id}.json             # Get specific order
POST   /v1/shops/{shop_id}/orders.json                  # Create an order
POST   /v1/shops/{shop_id}/orders/{id}/send_to_production.json  # Submit to print
POST   /v1/shops/{shop_id}/orders/{id}/cancel.json      # Cancel order
```

**Uploads (design images):**
```
POST   /v1/uploads/images.json                          # Upload an image
GET    /v1/uploads.json                                 # List uploads
GET    /v1/uploads/{id}.json                            # Get upload details
```

**Webhooks:**
```
GET    /v1/shops/{shop_id}/webhooks.json                # List webhooks
POST   /v1/shops/{shop_id}/webhooks.json                # Create webhook
PUT    /v1/shops/{shop_id}/webhooks/{id}.json           # Update webhook
DELETE /v1/shops/{shop_id}/webhooks/{id}.json           # Delete webhook
```

### Order Creation JSON Example

```json
{
  "external_id": "lawnbowl-order-12345",
  "line_items": [
    {
      "product_id": "5bfd0b66a342bcc9b5563216",
      "variant_id": 17887,
      "quantity": 1
    }
  ],
  "shipping_method": 1,
  "send_shipping_notification": true,
  "address_to": {
    "first_name": "John",
    "last_name": "Smith",
    "email": "bowler@example.com",
    "phone": "555-123-4567",
    "country": "US",
    "region": "CA",
    "address1": "123 Green Lane",
    "address2": "Apt 4",
    "city": "Sun City",
    "zip": "92586"
  }
}
```

### Webhook Events

| Event | Description |
|-------|-------------|
| `order:created` | New order submitted |
| `order:updated` | Order status changed |
| `order:sent-to-production` | Order sent to print provider |
| `order:shipment:created` | Shipment created with tracking number |
| `order:shipment:delivered` | Shipment delivered |

### Rate Limits

| Scope | Limit |
|-------|-------|
| Global | 600 requests/minute |
| Catalog endpoints | 100 requests/minute per integration |
| Product publishing | 200 requests/30 minutes |
| Order creation from products | Not limited |

### Important Technical Notes

- **No CORS support** -- all API calls must be server-side (Next.js API routes / Server Actions)
- All data must be `application/json;charset=utf-8`
- Timestamps in UTC
- Pagination via `first_page_url`, `next_page_url`, `last_page_url`
- Products in catalog are called "blueprints"; they become "products" after artwork is added
- Error rate must not exceed 5% of total requests

### API Access Scopes

| Scope | Purpose |
|-------|---------|
| `shops.read` | Access merchant shops |
| `catalog.read` | View blueprints and providers |
| `products.read` / `products.write` | Manage designed products |
| `orders.read` / `orders.write` | Manage orders |
| `webhooks.read` / `webhooks.write` | Manage webhook subscriptions |
| `uploads.read` / `uploads.write` | Upload design files |

---

## 2. Product Catalog & Pricing

### Printify Plans

| Plan | Cost | Benefit |
|------|------|---------|
| Free | $0/month | Up to 5 stores, standard pricing |
| Premium | $29/month | Unlimited stores, up to 20% off base costs |
| Enterprise | Custom | Custom pricing, dedicated support |

**Recommendation:** Start Free, upgrade to Premium once shop is generating sales. The 20% discount pays for itself at roughly $145/month in product costs.

### Recommended Products for Lawn Bowlers

Pricing uses Free plan base costs. Premium plan costs shown where available. Retail prices target 40%+ markup.

#### Polo Shirts (THE core product for lawn bowlers)

| Product | Brand | Base Cost | Premium Cost | Retail Price | Margin |
|---------|-------|-----------|--------------|--------------|--------|
| Men's Pique Polo | JERZEES 443M | $16.81 | $12.58 | $29.99 | 44-58% |
| Unisex Pique Polo (Embroidery) | Gildan 64800 | $19.29 | $17.57 | $34.99 | 45-50% |
| Embroidered Polo | Port Authority K500 | $22.35 | $20.33 | $39.99 | 44-49% |
| Sport Polo | Sport-Tek ST650 | $31.58 | $24.48 | $49.99 | 37-51% |
| UV Micropique Polo | Sport-Tek ST740 | $26.50 | $19.49 | $44.99 | 41-57% |
| Snag-Proof Polo | CornerStone CS418 | $27.14 | $19.97 | $44.99 | 40-56% |
| Fine Pique Blend Polo | Port Authority K830 | $30.85 | $22.77 | $49.99 | 38-54% |
| adidas Performance Polo | adidas A230 | $50.13 | $38.06 | $79.99 | 37-52% |
| Under Armour Polo (Embroidery) | Under Armour | $52.95 | $44.89 | $84.99 | 37-47% |

**Top Pick:** JERZEES 443M at $16.81 base / $29.99 retail = excellent margin. For premium positioning, Sport-Tek ST740 UV polo at $26.50 / $44.99 -- UV protection is a genuine selling point for outdoor bowlers.

#### T-Shirts

| Product | Brand | Base Cost | Premium Cost | Retail Price | Margin |
|---------|-------|-----------|--------------|--------------|--------|
| Unisex Jersey Tee | Bella+Canvas 3001 | $9.11 | ~$7.50 | $24.99 | 63-70% |
| Classic Tee | Gildan 5000 | $8.47 | ~$7.00 | $22.99 | 63-70% |

**Top Pick:** Bella+Canvas 3001 -- softer fabric, better fit, worth the $0.64 premium. Lawn bowlers skew older and appreciate quality feel.

#### Hoodies & Sweatshirts

| Product | Type | Base Cost | Retail Price | Margin |
|---------|------|-----------|--------------|--------|
| Pullover Hoodie | Gildan 18500 | ~$20.65 | $49.99 | 59% |
| Crewneck Sweatshirt | Gildan 18000 | ~$15.24 | $39.99 | 62% |

#### Hats & Visors

| Product | Type | Base Cost | Retail Price | Margin |
|---------|------|-----------|--------------|--------|
| Trucker Cap | Various | ~$23.29 | $34.99 | 33% |
| Baseball Cap (Embroidered) | Various | ~$20-25 | $34.99 | 29-43% |

**Note:** Hats have lower margins due to higher base costs. Still worth offering -- bowlers NEED sun protection. Consider visor options if available (check Printify catalog at build time).

#### Drinkware

| Product | Type | Base Cost | Retail Price | Margin |
|---------|------|-----------|--------------|--------|
| Ceramic Mug (11oz) | White | ~$4.93 | $16.99 | 71% |
| Ceramic Mug (15oz) | White | ~$6.50 | $19.99 | 68% |
| Stainless Tumbler (20oz) | Various | ~$15-20 | $34.99 | 43-57% |

**Top Pick:** 11oz mugs are the highest-margin product. Clubhouse mugs with lawn bowling designs are a natural fit.

#### Bags

| Product | Type | Base Cost | Retail Price | Margin |
|---------|------|-----------|--------------|--------|
| AOP Tote Bag | Canvas | ~$12.38 | $29.99 | 59% |
| Cotton Tote | Natural | ~$8-10 | $24.99 | 60-68% |

**Top Pick:** Cotton tote bags. Bowlers carry their bowls, towels, and water to the green -- a branded tote is highly functional.

#### Phone Cases

| Product | Type | Base Cost | Retail Price | Margin |
|---------|------|-----------|--------------|--------|
| Tough Phone Case | iPhone/Samsung | ~$10.06 | $24.99 | 60% |
| Snap Phone Case | iPhone/Samsung | ~$19.65 | $34.99 | 44% |

#### Towels

| Product | Type | Base Cost | Retail Price | Margin |
|---------|------|-----------|--------------|--------|
| Rally Towel | Small (11x18) | ~$8-12 | $19.99 | 40-60% |
| Beach Towel | Large (30x60) | ~$20-25 | $44.99 | 44-56% |

**Key Product:** Bowlers use towels to clean their bowls every end. A branded bowling towel is possibly the most functional merch item.

#### Socks

| Product | Type | Base Cost | Retail Price | Margin |
|---------|------|-----------|--------------|--------|
| Crew Socks (AOP) | Polyester | ~$8-12 | $19.99 | 40-60% |

#### Stickers

| Product | Type | Base Cost | Retail Price | Margin |
|---------|------|-----------|--------------|--------|
| Die-Cut Sticker | Various sizes | ~$2.88 | $4.99 | 42% |
| Sticker Pack | Multiple | ~$5-8 | $12.99 | 38-61% |

---

## 3. Design Strategy

### Design Categories

**1. Position/Role Designs (high appeal)**
- "I'm the Skip" / "Born to Skip"
- "Lead Life" / "Lead the Way"
- "Second to None" (Second position)
- "Third Eye" / "Vice Skip Vibes"
- Position-specific icons with bowls imagery

**2. Lifestyle/Humor (broad appeal)**
- "I'd Rather Be Bowling" (classic)
- "Bias Is My Superpower"
- "Keep Calm and Bowl On"
- "Lawn Bowl Life"
- "On the Green Since [Year]"
- "Get Low" (bowling delivery stance)
- "Jack Hunter" (the jack/kitty is the target)
- "Weight Please!" (common call on the green)
- "Toucher!" (when bowl touches the jack)

**3. Vintage/Retro (premium feel)**
- Retro lawn bowling club crest designs
- Vintage "Lawn Bowling Association" typography
- Art deco bowling green illustrations
- Heritage-style emblems

**4. Club-Branded (custom orders)**
- Club logo on polos (embroidery)
- Club name + colors on t-shirts
- Custom tournament merchandise
- Annual event commemorative items

**5. National Tournament Merch**
- US Lawn Bowls Association event merchandise
- Regional tournament designs
- Championship series branding

### Design Production

Designs can be created using:
- AI image generation (Nano Banana / Gemini -- already in tech stack)
- Vector designs in Figma/Illustrator for clean typography
- Upload via Printify API: `POST /v1/uploads/images.json`
- Designs stored with unique IDs, referenced when creating products

---

## 4. Print Providers

### Decoration Methods

| Method | Best For | Quality | Cost |
|--------|----------|---------|------|
| **DTG** (Direct-to-Garment) | T-shirts, hoodies | Good for detailed/photo designs | Low-medium |
| **AOP** (All-Over Print) | Tote bags, leggings, some polos | Full coverage designs | Medium |
| **Embroidery** | Polos, hats, jackets | Premium, durable, professional | Higher |
| **DTF** (Direct-to-Film) | Multi-material, vivid colors | Versatile, vibrant | Medium |
| **Sublimation** | Mugs, tumblers, phone cases | Permanent, won't crack/fade | Medium |

### Recommended Providers by Product

| Product | Provider | Why |
|---------|----------|-----|
| Polos (embroidery) | Fulfill Engine | 18 color options, Sport-Tek/Port Authority brands, US-based |
| Polos (budget) | SwiftPOD | JERZEES brand, lowest base cost |
| T-shirts | Monster Digital / SwiftPOD | Fast US shipping, good DTG quality |
| Mugs | Various | Multiple US providers, sublimation |
| Hats | Fulfill Engine | Embroidery, US-based |

### Quality Considerations for Lawn Bowling Demographic

The lawn bowling demographic skews older (55+) and values quality over price. Key considerations:

- **Embroidery over DTG for polos** -- looks more professional, feels premium, lasts longer through washes
- **Performance fabrics** -- moisture-wicking, UV protection matter for outdoor sport
- **Brand-name blanks** -- Port Authority, Sport-Tek, adidas, Under Armour command respect
- **Avoid cheap-feeling products** -- this audience will not buy again if quality disappoints
- **Size range** -- ensure extended sizes (up to 4XL) are available

---

## 5. Shipping & Logistics

### Printify Shipping (US Domestic)

| Product Category | Estimated Shipping | Additional Items |
|------------------|-------------------|-----------------|
| T-shirts / Polos | $3.99 - $5.99 | +$1.50 - $2.00 |
| Hoodies | $5.99 - $7.99 | +$2.00 - $3.00 |
| Mugs | $4.99 - $6.99 | +$2.00 |
| Hats | $3.99 - $5.99 | +$1.50 |
| Tote Bags | $3.99 - $5.99 | +$1.50 |
| Phone Cases | $3.99 - $4.99 | +$1.00 |

**Note:** Exact shipping costs available via API: `GET /v1/catalog/blueprints/{id}/print_providers/{id}/shipping.json`

### Shipping Strategy Options

| Strategy | Pros | Cons |
|----------|------|------|
| Customer pays actual shipping | Transparent, no margin loss | Higher checkout friction |
| Flat rate $5.99 shipping | Simple, predictable | May lose money on heavy items |
| Free shipping over $50 | Increases average order value | Must absorb shipping cost |
| Free shipping (built into price) | Best conversion rate | Higher visible prices |

**Recommendation:** Charge actual shipping at checkout, offer free shipping on orders over $75. This encourages multi-item purchases and the demographic is less price-sensitive.

### Production & Delivery Timeline

| Stage | Duration |
|-------|----------|
| Order to production | 1-2 business days |
| Production | 2-5 business days |
| Shipping (US standard) | 3-7 business days |
| **Total customer wait** | **6-14 business days** |

Display "Ships in 1-2 weeks" on the storefront.

---

## 6. Competitor Landscape

### Existing Lawn Bowling Merchandise

| Competitor | Products | Price Range | Strengths | Weaknesses |
|------------|----------|-------------|-----------|------------|
| Redbubble | T-shirts, stickers, mugs | $20-40 | Huge selection, independent artists | Generic, no lawn bowling expertise |
| Etsy | Custom shirts, towels | $15-45 | Handmade/personalized options | Fragmented, inconsistent quality |
| Amazon | 3D polyester shirts | $25-40 | Fast shipping, trust | Tacky designs, no community tie-in |
| Zazzle | 1,300+ lawn bowling items | $15-50 | Variety | Generic platform, no niche focus |
| Allegheny Apparel | T-shirts, polos, hoodies | $29.99+ | Dedicated lawn bowling line | Small selection, basic designs |
| Taylor Bowls | Performance clothing | $30-60+ | Bowling-specific brand | UK-based, not US market |
| BLK Sport | Custom teamwear | Custom quote | Professional sublimation | Minimum orders, long lead times |
| My Club Kit | Club uniforms | $17.50+ (GBP) | Full custom design | UK-based, 5-6 week turnaround, 10 item minimum |
| Bowls Direct | Club shirts | $38.95 (GBP) | No minimum order | UK-based, limited selection |

### Competitive Advantage for lawnbowl.app

1. **Integrated platform** -- buy merch where you already manage tournaments and find clubs
2. **US-focused** -- most competitors are UK/Australian; US lawn bowling is underserved
3. **Club customization** -- clubs already on the platform can order branded merch
4. **Community-driven designs** -- designs by bowlers, for bowlers
5. **Tournament merchandise** -- event-specific merch tied to tournaments run on the platform
6. **No minimum orders** -- print-on-demand means single items available

---

## 7. Technical Integration Plan

### Architecture Overview

```
lawnbowl.app/shop
    |
    v
[Next.js Frontend]  <-->  [Supabase]
    |                        |
    | (Server Actions)       | (orders, cart, products cache)
    v                        |
[Next.js API Routes] -------+
    |
    v
[Printify API] --webhook--> [Webhook Handler API Route]
    |                              |
    v                              v
[Print Provider]             [Update order status in Supabase]
    |
    v
[Ship to Customer]
```

### Implementation Components

#### A. Product Catalog Sync

```typescript
// Server action or cron job to sync Printify products to Supabase
// Cache products locally to avoid API rate limits (100 req/min for catalog)

// Tables needed in Supabase:
// - shop_products (id, printify_product_id, title, description, images, variants, price, category)
// - shop_variants (id, product_id, printify_variant_id, title, price, sku, in_stock)
```

- Sync products on deploy or via admin action (not on every page load)
- Store product images in Supabase Storage or use Printify CDN URLs
- Cache blueprint/variant data to reduce API calls

#### B. Storefront Pages

| Route | Purpose |
|-------|---------|
| `/shop` | Product listing with categories |
| `/shop/[category]` | Category page (polos, t-shirts, accessories) |
| `/shop/[category]/[product]` | Product detail with variant selector |
| `/shop/cart` | Shopping cart |
| `/shop/checkout` | Checkout with Stripe |
| `/shop/orders` | Order history (authenticated users) |
| `/shop/orders/[id]` | Order detail with tracking |

#### C. Cart System

**Option 1: Local state only (simpler)**
- Use Zustand or React Context
- Cart stored in localStorage
- Lost on device switch
- No server cost

**Option 2: Supabase cart (better for authenticated users)**
- Cart persisted in Supabase
- Survives device switches
- Enables abandoned cart recovery
- Slightly more complex

**Recommendation:** Hybrid. localStorage for anonymous users, Supabase for authenticated users. Most lawnbowl.app users will be authenticated (they use the app for tournaments).

#### D. Checkout Flow

```
1. User adds items to cart
2. User clicks "Checkout"
3. Collect shipping address (form)
4. Calculate shipping via Printify API
5. Create Stripe Payment Intent (product cost + shipping)
6. User completes Stripe payment
7. On payment success:
   a. Create order in Supabase (status: "paid")
   b. Submit order to Printify API (POST /v1/shops/{id}/orders.json)
   c. Send order to production (POST /v1/shops/{id}/orders/{id}/send_to_production.json)
   d. Send confirmation email to customer
8. Printify fulfills and ships
9. Webhook updates order status in Supabase
10. Customer receives tracking notification
```

#### E. Webhook Handler

```typescript
// app/api/webhooks/printify/route.ts

export async function POST(request: Request) {
  const body = await request.json();

  switch (body.event) {
    case 'order:shipment:created':
      // Update order status, save tracking number
      // Notify customer via email
      break;
    case 'order:shipment:delivered':
      // Mark order as delivered
      break;
    case 'order:updated':
      // Sync order status
      break;
  }
}
```

#### F. Supabase Schema

```sql
-- Products (cached from Printify)
CREATE TABLE shop_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  printify_product_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'polo', 'tshirt', 'mug', 'hat', 'bag', 'accessory'
  images JSONB, -- array of image URLs
  base_price DECIMAL(10,2),
  retail_price DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Variants (sizes, colors)
CREATE TABLE shop_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES shop_products(id),
  printify_variant_id INTEGER NOT NULL,
  title TEXT NOT NULL, -- e.g., "Large / White"
  sku TEXT,
  price DECIMAL(10,2),
  is_available BOOLEAN DEFAULT true
);

-- Orders
CREATE TABLE shop_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  printify_order_id TEXT,
  external_id TEXT UNIQUE,
  status TEXT DEFAULT 'pending', -- pending, paid, submitted, in_production, shipped, delivered, cancelled
  stripe_payment_intent TEXT,
  shipping_address JSONB,
  line_items JSONB,
  subtotal DECIMAL(10,2),
  shipping_cost DECIMAL(10,2),
  total DECIMAL(10,2),
  tracking_number TEXT,
  tracking_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Cart (for authenticated users)
CREATE TABLE shop_cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  product_id UUID REFERENCES shop_products(id),
  variant_id UUID REFERENCES shop_variants(id),
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 8. Club Customization Opportunity

### How It Could Work

Printify supports personalization through their API. For club-branded merchandise:

**Approach 1: Pre-designed club products (simpler)**
- Admin creates products for each club using their logo
- Upload club logo via `POST /v1/uploads/images.json`
- Create club-specific products via API
- Club members see their club's merchandise in the shop
- Works well for clubs already on lawnbowl.app

**Approach 2: Customer personalization (more complex)**
- Customer selects a base design and enters club name
- Design is generated server-side (compositing club name onto template)
- Uploaded to Printify as a custom image
- Order created with the custom design
- Requires image generation/compositing on our end

**Approach 3: Bulk club orders (highest value)**
- Club admin places bulk order (10+ items)
- Volume discount negotiated or absorbed
- Single shipping to club address
- Club distributes to members

**Recommendation:** Start with Approach 1. For the MVP shop, offer a "Request Custom Club Merch" form that collects club name, logo, and desired products. Fulfill manually at first, then automate when volume justifies it.

### Printify Personalization API

- Each personalized order creates a separate editable version
- Original product design remains unchanged
- Can automate with approved personalization (skip manual review)
- Third-party tools like Customily can enhance personalization workflow
- Custom designs uploaded via API get unique IDs for reuse

---

## 9. Pricing Strategy

### Standard Product Pricing (40% Markup Target)

| Product | Base Cost | Retail | Markup | Shipping | Customer Pays |
|---------|-----------|--------|--------|----------|---------------|
| JERZEES Polo | $16.81 | $29.99 | 78% | $4.99 | $34.98 |
| Sport-Tek UV Polo | $26.50 | $44.99 | 70% | $4.99 | $49.98 |
| Bella+Canvas Tee | $9.11 | $24.99 | 174% | $3.99 | $28.98 |
| Gildan Hoodie | $20.65 | $49.99 | 142% | $5.99 | $55.98 |
| 11oz Mug | $4.93 | $16.99 | 245% | $4.99 | $21.98 |
| Tote Bag | $12.38 | $29.99 | 142% | $3.99 | $33.98 |
| Trucker Hat | $23.29 | $34.99 | 50% | $3.99 | $38.98 |
| Phone Case | $10.06 | $24.99 | 148% | $3.99 | $28.98 |
| Sticker | $2.88 | $4.99 | 73% | $1.99 | $6.98 |
| Bowling Towel | $10.00 | $19.99 | 100% | $3.99 | $23.98 |

**Note:** A 40% markup is actually very conservative for POD. Industry standard is 2-3x base cost. Our pricing targets roughly 50-250% markup depending on product category, which is normal. Mugs and t-shirts have the best margins.

### Revenue Projections (Conservative)

| Scenario | Monthly Orders | Avg Order Value | Monthly Revenue | Monthly Profit (after base costs) |
|----------|---------------|-----------------|-----------------|-----------------------------------|
| Launch month | 10 | $35 | $350 | ~$175 |
| 3 months in | 30 | $40 | $1,200 | ~$600 |
| 6 months in | 75 | $45 | $3,375 | ~$1,700 |
| 12 months in | 150 | $50 | $7,500 | ~$3,750 |

At ~75 orders/month, Premium plan ($29/month) pays for itself with the 20% discount.

---

## 10. MVP Launch Checklist

### Phase 1: Minimum Viable Shop

1. **Set up Printify account** and generate API token
2. **Design 10-15 initial products** across categories:
   - 3 polo designs (JERZEES + Sport-Tek UV)
   - 3 t-shirt designs (Bella+Canvas 3001)
   - 2 mug designs
   - 2 tote bag designs
   - 2 hat designs
   - 3 sticker designs
3. **Create products via Printify dashboard** (faster for initial setup than API)
4. **Build shop pages** in Next.js at `/shop`
5. **Implement Stripe checkout** with shipping address collection
6. **Build order submission** to Printify API
7. **Set up webhook handler** for order status updates
8. **Test with sample orders** (Printify allows test/sample orders)

### Phase 2: Enhanced Shop

- Product catalog sync from Printify to Supabase
- Cart persistence for authenticated users
- Order history page
- Email notifications (order confirmation, shipping)
- Product reviews
- Category filtering and search

### Phase 3: Club Customization

- Club-branded product creation workflow
- Bulk ordering for clubs
- Club admin merchandise management
- Custom design upload for clubs

---

## 11. Key Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| API token expires (1 year) | Orders stop working | Calendar reminder, auto-renewal check |
| Print provider quality issues | Bad reviews, returns | Order samples first, monitor reviews |
| Shipping delays | Customer frustration | Set realistic expectations ("1-2 weeks"), provide tracking |
| Low initial sales | Wasted development time | Start with small catalog, validate demand before expanding |
| Printify API changes | Integration breaks | Pin to V1 API, monitor changelog |
| Rate limiting | Catalog sync fails | Cache aggressively, sync infrequently |
| Returns/refunds | Margin loss | Clear return policy, Printify handles defective items |

---

## Sources

### HIGH Confidence (Official Documentation)
- [Printify API Reference](https://developers.printify.com/) -- Full API documentation
- [Printify Custom Polo Shirts](https://printify.com/custom-polo-shirts/) -- Product catalog with pricing
- [Printify API Information](https://printify.com/printify-api/) -- API overview and access
- [Printify Blog: Custom Solutions with API](https://printify.com/blog/powerful-custom-solutions-with-printify-api/) -- Integration patterns
- [Printify Blog: Most Profitable POD Products](https://printify.com/blog/most-profitable-print-on-demand-products/) -- Product pricing data
- [Printify Personalization Guide](https://printify.com/guide/personalization-guide/) -- Custom design features

### MEDIUM Confidence (Verified Third-Party)
- [Bootstrapping Ecommerce: Printify Pricing Guide 2025](https://bootstrappingecommerce.com/printify-pricing/) -- Pricing analysis
- [Fourthwall: How Much Does Printify Charge 2025](https://fourthwall.com/blog/how-much-does-printify-charge-to-sell) -- Cost breakdown
- [Swagify: Printify Shirt Pricing](https://www.swagify.com/blog/how-much-does-printify-charge-per-shirt/) -- Per-shirt costs
- [printify-sdk-js](https://github.com/spencerlepine/printify-sdk-js/blob/main/docs/API.md) -- Community SDK reference

### LOW Confidence (Market Research, May Be Outdated)
- [Redbubble Lawn Bowls](https://www.redbubble.com/shop/lawn+bowls) -- Competitor products
- [Etsy Lawn Bowling Shirts](https://www.etsy.com/market/lawn_bowling_shirts) -- Competitor pricing
- [Allegheny Apparel Lawn Bowling](https://www.alleghenyapparel.com/collections/lawn-bowling) -- Niche competitor
- [Taylor Bowls Clothing](https://www.taylorbowls.com/browse/c-clothing-2/) -- UK competitor
- [My Club Kit Custom Bowls](https://myclubgroup.com/custom-bowls-kit/) -- UK club merchandise
