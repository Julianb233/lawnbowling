#!/usr/bin/env bash
# verify-printify.sh — Test Printify API connection and product sync
#
# Usage:
#   PRINTIFY_API_TOKEN=xxx PRINTIFY_SHOP_ID=123 bash scripts/verify-printify.sh
#
# Or if .env.local is configured:
#   bash scripts/verify-printify.sh

set -euo pipefail

# Load .env.local if it exists
if [ -f .env.local ]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
fi

TOKEN="${PRINTIFY_API_TOKEN:-${PRINTIFY_API_KEY:-}}"
SHOP_ID="${PRINTIFY_SHOP_ID:-}"

echo "=== Printify API Verification ==="
echo ""

# 1. Check env vars
if [ -z "$TOKEN" ]; then
  echo "FAIL: No PRINTIFY_API_TOKEN or PRINTIFY_API_KEY set"
  echo "  Set one in .env.local or pass as env var"
  exit 1
fi
echo "OK: API token configured (${TOKEN:0:12}...)"

if [ -z "$SHOP_ID" ]; then
  echo "WARN: No PRINTIFY_SHOP_ID set — will attempt to discover shops"
fi

# 2. Test API connection — list shops
echo ""
echo "--- Testing API connection (GET /shops) ---"
SHOPS=$(curl -sf -H "Authorization: Bearer $TOKEN" \
  "https://api.printify.com/v1/shops.json" 2>&1) || {
  echo "FAIL: Could not connect to Printify API"
  echo "  Response: $SHOPS"
  exit 1
}

SHOP_COUNT=$(echo "$SHOPS" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
echo "OK: Connected to Printify API — found $SHOP_COUNT shop(s)"

if [ "$SHOP_COUNT" -gt 0 ]; then
  echo "$SHOPS" | python3 -c "
import sys, json
shops = json.load(sys.stdin)
for s in shops:
    print(f\"  - Shop ID: {s['id']}  Title: {s['title']}  Sales channel: {s.get('sales_channel', 'N/A')}\")
"
fi

# Auto-detect shop ID if not set
if [ -z "$SHOP_ID" ] && [ "$SHOP_COUNT" -gt 0 ]; then
  SHOP_ID=$(echo "$SHOPS" | python3 -c "import sys,json; print(json.load(sys.stdin)[0]['id'])")
  echo "  Using first shop: $SHOP_ID"
fi

if [ -z "$SHOP_ID" ]; then
  echo "FAIL: No shop found. Create a shop on printify.com first."
  exit 1
fi

# 3. List products in shop
echo ""
echo "--- Fetching products (GET /shops/$SHOP_ID/products) ---"
PRODUCTS=$(curl -sf -H "Authorization: Bearer $TOKEN" \
  "https://api.printify.com/v1/shops/$SHOP_ID/products.json" 2>&1) || {
  echo "FAIL: Could not fetch products"
  echo "  Response: $PRODUCTS"
  exit 1
}

PRODUCT_COUNT=$(echo "$PRODUCTS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('data',[])))" 2>/dev/null || echo "0")
VISIBLE_COUNT=$(echo "$PRODUCTS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len([p for p in d.get('data',[]) if p.get('visible')]))" 2>/dev/null || echo "0")

echo "OK: Found $PRODUCT_COUNT product(s), $VISIBLE_COUNT visible"

if [ "$PRODUCT_COUNT" -gt 0 ]; then
  echo ""
  echo "--- Product Summary ---"
  echo "$PRODUCTS" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for p in data.get('data', []):
    variants = [v for v in p.get('variants', []) if v.get('is_enabled')]
    min_cost = min((v['cost'] for v in variants), default=0) if variants else 0
    markup = round((min_cost / 100) * 1.4, 2)
    retail = round(markup + 0.99 - (markup % 1), 2) if markup > 0 else 0
    status = 'visible' if p.get('visible') else 'hidden'
    print(f\"  [{status}] {p['title']}\")
    print(f\"    ID: {p['id']}  Variants: {len(variants)}  Base cost: \${min_cost/100:.2f}  Retail (40% markup): \${retail:.2f}\")
"
fi

echo ""
echo "=== Verification Complete ==="
echo ""
echo "Next steps:"
if [ "$PRODUCT_COUNT" -eq 0 ]; then
  echo "  1. Create products in your Printify shop at https://printify.com"
  echo "  2. Publish them (set visible=true)"
  echo "  3. Re-run this script to verify sync"
else
  echo "  1. Add to .env.local:"
  echo "     PRINTIFY_API_TOKEN=$TOKEN"
  echo "     PRINTIFY_SHOP_ID=$SHOP_ID"
  echo "  2. Set same vars on Vercel: npx vercel env add PRINTIFY_API_TOKEN"
  echo "  3. Visit /shop to see synced products"
  echo "  4. Test /api/shop/sync endpoint"
fi
