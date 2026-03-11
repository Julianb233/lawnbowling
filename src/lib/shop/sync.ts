/**
 * Product sync from Printify API to local catalog.
 *
 * Fetches products from Printify, maps them to our local Product/Variant types,
 * applies 40% markup pricing, and generates URL-friendly slugs.
 *
 * Usage:
 *   - Called from admin sync API route or as a server action
 *   - Falls back to mock products if Printify is not configured
 */

import {
  getProducts,
  isPrintifyConfigured,
  type PrintifyProduct,
  type PrintifyProductVariant,
} from "./printify";
import type { Product, ProductVariant, ProductCategory } from "./products";

// ---------------------------------------------------------------------------
// SKU Mapping & Category Detection
// ---------------------------------------------------------------------------

/** Map Printify tags/titles to our product categories */
const CATEGORY_KEYWORDS: Record<ProductCategory, string[]> = {
  "t-shirts": ["tee", "t-shirt", "tshirt", "jersey", "hoodie", "sweatshirt", "polo"],
  hats: ["hat", "cap", "visor", "beanie", "bucket"],
  mugs: ["mug", "tumbler", "cup", "drinkware", "bottle"],
  accessories: [
    "tote",
    "bag",
    "towel",
    "sticker",
    "pin",
    "socks",
    "phone case",
    "case",
  ],
};

function detectCategory(product: PrintifyProduct): ProductCategory {
  const searchText = `${product.title} ${product.tags.join(" ")}`.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => searchText.includes(kw))) {
      return category as ProductCategory;
    }
  }

  return "accessories"; // default fallback
}

// ---------------------------------------------------------------------------
// Slug Generation
// ---------------------------------------------------------------------------

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------

/** Apply 40% markup, rounded to nearest .99 */
function applyMarkup(baseCostCents: number): number {
  const baseDollars = baseCostCents / 100;
  const raw = baseDollars * 1.4;
  return Math.ceil(raw) - 0.01;
}

/** Get the lowest variant cost as the base display price */
function getBasePrice(variants: PrintifyProductVariant[]): number {
  const enabledVariants = variants.filter((v) => v.is_enabled && v.is_available);
  if (enabledVariants.length === 0) return 0;
  const lowestCost = Math.min(...enabledVariants.map((v) => v.cost));
  return lowestCost;
}

// ---------------------------------------------------------------------------
// Variant Mapping
// ---------------------------------------------------------------------------

function mapVariant(pv: PrintifyProductVariant): ProductVariant {
  return {
    id: String(pv.id),
    label: pv.title,
    size: extractSize(pv.title),
    color: extractColor(pv.title),
    colorHex: guessColorHex(extractColor(pv.title)),
    inStock: pv.is_available && pv.is_enabled,
    // Extended fields for Printify
    sku: pv.sku || undefined,
    printifyVariantId: pv.id,
    costCents: pv.cost,
    retailPrice: applyMarkup(pv.cost),
  };
}

/** Extract size from variant title like "M / White" or "Large" */
function extractSize(title: string): string | undefined {
  const sizePatterns = [
    /\b(XXS|XS|S|M|L|XL|2XL|3XL|4XL|5XL)\b/i,
    /\b(Small|Medium|Large|X-Large|XX-Large)\b/i,
    /\b(11\s?oz|15\s?oz|20\s?oz)\b/i,
    /\b(3"|4"|5"|6")\b/,
    /\b(One Size)\b/i,
  ];

  for (const pattern of sizePatterns) {
    const match = title.match(pattern);
    if (match) return match[1].toUpperCase();
  }
  return undefined;
}

/** Extract color from variant title like "M / White" */
function extractColor(title: string): string | undefined {
  // Try to get color from after " / " separator
  const parts = title.split("/").map((s) => s.trim());
  if (parts.length >= 2) {
    // The color is usually the second part, or the first if there's no size
    const colorPart = parts.length === 2 ? parts[1] : parts[parts.length - 1];
    if (colorPart && !extractSize(colorPart)) return colorPart;
  }

  // Known colors
  const colorNames = [
    "White",
    "Black",
    "Navy",
    "Green",
    "Red",
    "Blue",
    "Grey",
    "Gray",
    "Pink",
    "Yellow",
    "Orange",
    "Purple",
    "Natural",
    "Heather",
    "Charcoal",
    "Forest",
    "Royal",
    "Maroon",
    "Tan",
    "Cream",
  ];

  for (const color of colorNames) {
    if (title.toLowerCase().includes(color.toLowerCase())) return color;
  }

  return undefined;
}

/** Map common color names to hex codes */
function guessColorHex(color: string | undefined): string | undefined {
  if (!color) return undefined;
  const map: Record<string, string> = {
    white: "#FFFFFF",
    black: "#1A1A1A",
    navy: "#1A237E",
    green: "#1B5E20",
    red: "#D32F2F",
    blue: "#1976D2",
    grey: "#757575",
    gray: "#757575",
    pink: "#E91E63",
    yellow: "#FBC02D",
    orange: "#F57C00",
    purple: "#7B1FA2",
    natural: "#F5F0E1",
    heather: "#9E9E9E",
    charcoal: "#424242",
    forest: "#2E7D32",
    royal: "#1565C0",
    maroon: "#880E4F",
    tan: "#D7CCC8",
    cream: "#FFF8E1",
  };
  return map[color.toLowerCase()] ?? undefined;
}

// ---------------------------------------------------------------------------
// Product Mapping
// ---------------------------------------------------------------------------

function mapProduct(pp: PrintifyProduct): Product {
  const enabledVariants = pp.variants.filter((v) => v.is_enabled);
  const baseCostCents = getBasePrice(pp.variants);
  const defaultImage =
    pp.images.find((img) => img.is_default)?.src ?? pp.images[0]?.src ?? "";

  return {
    id: pp.id,
    slug: generateSlug(pp.title),
    name: pp.title,
    description: pp.description.replace(/<[^>]*>/g, "").slice(0, 500), // Strip HTML
    category: detectCategory(pp),
    baseCost: baseCostCents / 100,
    price: applyMarkup(baseCostCents),
    image: defaultImage,
    variants: enabledVariants.map(mapVariant),
    tags: pp.tags,
    // Printify-specific fields
    printifyProductId: pp.id,
    printifyBlueprintId: pp.blueprint_id,
    printifyProviderId: pp.print_provider_id,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface SyncResult {
  success: boolean;
  productCount: number;
  products: Product[];
  error?: string;
  syncedAt: string;
}

/**
 * Sync products from Printify API.
 * Returns mapped products with 40% markup pricing.
 * Falls back to empty array if Printify is not configured.
 */
export async function syncProducts(): Promise<SyncResult> {
  if (!isPrintifyConfigured()) {
    return {
      success: false,
      productCount: 0,
      products: [],
      error: "Printify API is not configured. Set PRINTIFY_API_TOKEN and PRINTIFY_SHOP_ID.",
      syncedAt: new Date().toISOString(),
    };
  }

  try {
    const response = await getProducts();
    const visibleProducts = response.data.filter((p) => p.visible);
    const mapped = visibleProducts.map(mapProduct);

    return {
      success: true,
      productCount: mapped.length,
      products: mapped,
      syncedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      productCount: 0,
      products: [],
      error: error instanceof Error ? error.message : "Unknown sync error",
      syncedAt: new Date().toISOString(),
    };
  }
}

/**
 * Get the product catalog — Printify products if configured, mock data otherwise.
 */
export async function getProductCatalog(): Promise<Product[]> {
  if (!isPrintifyConfigured()) {
    // Fall back to mock products
    const { PRODUCTS } = await import("./products");
    return PRODUCTS;
  }

  const result = await syncProducts();
  if (result.success && result.products.length > 0) {
    return result.products;
  }

  // Fallback to mock if sync fails
  const { PRODUCTS } = await import("./products");
  return PRODUCTS;
}

// ---------------------------------------------------------------------------
// SKU Lookup
// ---------------------------------------------------------------------------

export interface SKUMapping {
  localProductId: string;
  localVariantId: string;
  printifyProductId: string;
  printifyVariantId: number;
  sku: string;
  baseCostCents: number;
  retailPrice: number;
}

/** Build a SKU lookup map from synced products */
export function buildSKUMap(products: Product[]): Map<string, SKUMapping> {
  const map = new Map<string, SKUMapping>();

  for (const product of products) {
    for (const variant of product.variants) {
      if (variant.sku) {
        map.set(variant.sku, {
          localProductId: product.id,
          localVariantId: variant.id,
          printifyProductId: product.printifyProductId ?? product.id,
          printifyVariantId: variant.printifyVariantId ?? parseInt(variant.id, 10),
          sku: variant.sku,
          baseCostCents: variant.costCents ?? Math.round(product.baseCost * 100),
          retailPrice: variant.retailPrice ?? product.price,
        });
      }
    }
  }

  return map;
}
