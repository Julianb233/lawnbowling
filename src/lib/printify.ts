/**
 * Printify API client for print-on-demand merchandise.
 *
 * Handles product sync, order creation, SKU mapping, and 40% markup pricing.
 * All API calls are server-side only (uses PRINTIFY_API_KEY env var).
 */

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const PRINTIFY_API_KEY = process.env.PRINTIFY_API_TOKEN ?? process.env.PRINTIFY_API_KEY;
const PRINTIFY_SHOP_ID = process.env.PRINTIFY_SHOP_ID;
const PRINTIFY_BASE = "https://api.printify.com/v1";

export function isPrintifyConfigured(): boolean {
  return !!(PRINTIFY_API_KEY && PRINTIFY_SHOP_ID);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PrintifyVariant {
  id: number;
  title: string;
  sku: string;
  cost: number; // cents
  price: number; // cents
  is_enabled: boolean;
  is_available: boolean;
  options: Record<string, string | number>;
}

export interface PrintifyImage {
  src: string;
  variant_ids: number[];
  position: string;
  is_default: boolean;
}

export interface PrintifyProduct {
  id: string;
  title: string;
  description: string;
  tags: string[];
  variants: PrintifyVariant[];
  images: PrintifyImage[];
  created_at: string;
  updated_at: string;
  visible: boolean;
  blueprint_id: number;
  print_provider_id: number;
}

export interface PrintifyOrder {
  id: string;
  external_id: string;
  status: string;
  line_items: {
    product_id: string;
    variant_id: number;
    quantity: number;
  }[];
  address_to: PrintifyAddress;
  shipments: PrintifyShipment[];
  created_at: string;
}

export interface PrintifyAddress {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address1: string;
  address2?: string;
  city: string;
  region: string;
  zip: string;
  country: string;
}

export interface PrintifyShipment {
  carrier: string;
  number: string;
  url: string;
  delivered_at?: string;
}

// Our normalized product shape
export interface NormalizedProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  baseCost: number;
  price: number;
  image: string;
  variants: NormalizedVariant[];
  tags: string[];
  printifyProductId: string;
}

export interface NormalizedVariant {
  id: string;
  label: string;
  sku: string;
  size?: string;
  color?: string;
  inStock: boolean;
  printifyVariantId: number;
}

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

async function printifyFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  if (!PRINTIFY_API_KEY) {
    throw new Error("PRINTIFY_API_KEY is not configured");
  }

  const url = `${PRINTIFY_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${PRINTIFY_API_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new PrintifyApiError(res.status, body, path);
  }

  return res.json() as Promise<T>;
}

export class PrintifyApiError extends Error {
  constructor(
    public status: number,
    public body: string,
    public path: string
  ) {
    super(`Printify API error ${status} on ${path}: ${body}`);
    this.name = "PrintifyApiError";
  }
}

// ---------------------------------------------------------------------------
// Pricing — 40% markup
// ---------------------------------------------------------------------------

/** Apply 40% markup, rounded to nearest .99 */
export function applyMarkup(baseCostCents: number): number {
  const baseDollars = baseCostCents / 100;
  const raw = baseDollars * 1.4;
  return Math.ceil(raw) - 0.01;
}

/** Calculate profit per item */
export function calculateProfit(baseCostCents: number): number {
  const retail = applyMarkup(baseCostCents);
  const cost = baseCostCents / 100;
  return Math.round((retail - cost) * 100) / 100;
}

// ---------------------------------------------------------------------------
// SKU mapping
// ---------------------------------------------------------------------------

/**
 * Generate a deterministic SKU from product and variant info.
 * Format: LB-{category}-{productCode}-{variantCode}
 */
export function generateSku(
  category: string,
  productName: string,
  variantTitle: string
): string {
  const catCode = category.slice(0, 3).toUpperCase();
  const prodCode = productName
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 6)
    .toUpperCase();
  const varCode = variantTitle
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 6)
    .toUpperCase();
  return `LB-${catCode}-${prodCode}-${varCode}`;
}

// ---------------------------------------------------------------------------
// Product operations
// ---------------------------------------------------------------------------

/** Fetch all products from the Printify shop */
export async function fetchProducts(): Promise<PrintifyProduct[]> {
  if (!PRINTIFY_SHOP_ID) throw new Error("PRINTIFY_SHOP_ID not configured");

  const data = await printifyFetch<{ data: PrintifyProduct[] }>(
    `/shops/${PRINTIFY_SHOP_ID}/products.json`
  );

  return data.data ?? [];
}

/** Fetch a single product by Printify ID */
export async function fetchProduct(
  productId: string
): Promise<PrintifyProduct> {
  if (!PRINTIFY_SHOP_ID) throw new Error("PRINTIFY_SHOP_ID not configured");

  return printifyFetch<PrintifyProduct>(
    `/shops/${PRINTIFY_SHOP_ID}/products/${productId}.json`
  );
}

/** Map Printify blueprint IDs to our category names */
const BLUEPRINT_CATEGORY_MAP: Record<number, string> = {
  // Gildan 64000 Unisex Softstyle T-Shirt
  6: "t-shirts",
  // Bella+Canvas 3001 Unisex Jersey Tee
  12: "t-shirts",
  // Generic t-shirt
  3: "t-shirts",
  // Hats
  60: "hats",
  83: "hats",
  // Mugs
  68: "mugs",
  69: "mugs",
  // Tote bags
  79: "accessories",
  // Stickers
  505: "accessories",
  // Default fallback handled in normalization
};

/** Normalize a Printify product to our app's product shape */
export function normalizeProduct(p: PrintifyProduct): NormalizedProduct {
  const enabledVariants = p.variants.filter((v) => v.is_enabled);

  // Get minimum base cost for pricing
  const minCostCents =
    enabledVariants.length > 0
      ? Math.min(...enabledVariants.map((v) => v.cost))
      : 0;

  const category =
    BLUEPRINT_CATEGORY_MAP[p.blueprint_id] ?? "accessories";

  const defaultImage = p.images.find((img) => img.is_default);
  const firstImage = p.images[0];
  const imageUrl = defaultImage?.src ?? firstImage?.src ?? "";

  // Generate slug from title
  const slug = p.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const variants: NormalizedVariant[] = enabledVariants.map((v) => ({
    id: String(v.id),
    label: v.title,
    sku: v.sku || generateSku(category, p.title, v.title),
    inStock: v.is_available,
    printifyVariantId: v.id,
  }));

  return {
    id: p.id,
    slug,
    name: p.title,
    description: p.description.replace(/<[^>]*>/g, ""), // strip HTML
    category,
    baseCost: minCostCents / 100,
    price: applyMarkup(minCostCents),
    image: imageUrl,
    variants,
    tags: p.tags ?? [],
    printifyProductId: p.id,
  };
}

/** Fetch and normalize all products */
export async function syncProducts(): Promise<NormalizedProduct[]> {
  const raw = await fetchProducts();
  return raw.filter((p) => p.visible).map(normalizeProduct);
}

// ---------------------------------------------------------------------------
// Order operations
// ---------------------------------------------------------------------------

export interface CreateOrderParams {
  externalId: string; // e.g. Stripe session ID
  items: {
    productId: string;
    variantId: number;
    quantity: number;
  }[];
  shippingAddress: PrintifyAddress;
  sendShippingNotification?: boolean;
}

/** Create a new order in Printify */
export async function createOrder(
  params: CreateOrderParams
): Promise<PrintifyOrder> {
  if (!PRINTIFY_SHOP_ID) throw new Error("PRINTIFY_SHOP_ID not configured");

  const body = {
    external_id: params.externalId,
    line_items: params.items.map((item) => ({
      product_id: item.productId,
      variant_id: item.variantId,
      quantity: item.quantity,
    })),
    shipping_method: 1, // standard shipping
    address_to: params.shippingAddress,
    send_shipping_notification: params.sendShippingNotification ?? true,
  };

  return printifyFetch<PrintifyOrder>(
    `/shops/${PRINTIFY_SHOP_ID}/orders.json`,
    { method: "POST", body: JSON.stringify(body) }
  );
}

/** Send an order to production (after payment confirmed) */
export async function sendToProduction(orderId: string): Promise<void> {
  if (!PRINTIFY_SHOP_ID) throw new Error("PRINTIFY_SHOP_ID not configured");

  await printifyFetch(
    `/shops/${PRINTIFY_SHOP_ID}/orders/${orderId}/send_to_production.json`,
    { method: "POST" }
  );
}

/** Fetch order status */
export async function getOrder(orderId: string): Promise<PrintifyOrder> {
  if (!PRINTIFY_SHOP_ID) throw new Error("PRINTIFY_SHOP_ID not configured");

  return printifyFetch<PrintifyOrder>(
    `/shops/${PRINTIFY_SHOP_ID}/orders/${orderId}.json`
  );
}

/** Fetch all orders */
export async function listOrders(): Promise<PrintifyOrder[]> {
  if (!PRINTIFY_SHOP_ID) throw new Error("PRINTIFY_SHOP_ID not configured");

  const data = await printifyFetch<{ data: PrintifyOrder[] }>(
    `/shops/${PRINTIFY_SHOP_ID}/orders.json`
  );

  return data.data ?? [];
}

/** Cancel an order (only if not yet in production) */
export async function cancelOrder(orderId: string): Promise<void> {
  if (!PRINTIFY_SHOP_ID) throw new Error("PRINTIFY_SHOP_ID not configured");

  await printifyFetch(
    `/shops/${PRINTIFY_SHOP_ID}/orders/${orderId}/cancel.json`,
    { method: "POST" }
  );
}

// ---------------------------------------------------------------------------
// Webhook signature verification
// ---------------------------------------------------------------------------

/**
 * Verify Printify webhook signature.
 * Uses HMAC-SHA256 with PRINTIFY_WEBHOOK_SECRET.
 */
export async function verifyWebhookSignature(
  rawBody: string,
  signature: string
): Promise<boolean> {
  const secret = process.env.PRINTIFY_WEBHOOK_SECRET;
  if (!secret) return false;

  const crypto = await import("crypto");
  const computed = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(computed, "hex"),
    Buffer.from(signature, "hex")
  );
}
