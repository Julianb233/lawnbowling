/**
 * Printify API Client — Server-side only.
 *
 * All Printify API calls must be made server-side (no CORS support).
 * Uses Personal Access Token authentication.
 *
 * API Reference: https://developers.printify.com/
 */

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const PRINTIFY_BASE_URL = "https://api.printify.com/v1";
const PRINTIFY_API_TOKEN = process.env.PRINTIFY_API_TOKEN ?? "";
const PRINTIFY_SHOP_ID = process.env.PRINTIFY_SHOP_ID ?? "";

// ---------------------------------------------------------------------------
// Printify API Types
// ---------------------------------------------------------------------------

/** Blueprint = a product template (e.g., "Unisex Jersey Tee") */
export interface PrintifyBlueprint {
  id: number;
  title: string;
  description: string;
  brand: string;
  model: string;
  images: string[];
}

/** Print provider for a blueprint */
export interface PrintifyPrintProvider {
  id: number;
  title: string;
  location: {
    address1: string;
    address2: string;
    city: string;
    country: string;
    region: string;
    zip: string;
  };
}

/** Variant from a print provider */
export interface PrintifyVariantOption {
  id: number;
  title: string;
  options: Record<string, string>; // e.g. { color: "White", size: "M" }
  placeholders: {
    position: string;
    height: number;
    width: number;
  }[];
}

/** Shipping info for a provider */
export interface PrintifyShippingInfo {
  handling_time: {
    value: number;
    unit: string;
  };
  profiles: {
    variant_ids: number[];
    first_item: { cost: number; currency: string };
    additional_items: { cost: number; currency: string };
    countries: string[];
  }[];
}

/** A product you've created in your Printify shop */
export interface PrintifyProduct {
  id: string;
  title: string;
  description: string;
  tags: string[];
  options: {
    name: string;
    type: string;
    values: { id: number; title: string }[];
  }[];
  variants: PrintifyProductVariant[];
  images: PrintifyProductImage[];
  created_at: string;
  updated_at: string;
  visible: boolean;
  is_locked: boolean;
  blueprint_id: number;
  user_id: number;
  shop_id: number;
  print_provider_id: number;
  print_areas: Record<string, unknown>[];
  sales_channel_properties: unknown[];
}

export interface PrintifyProductVariant {
  id: number;
  sku: string;
  cost: number; // in cents
  price: number; // in cents (your set price)
  title: string;
  grams: number;
  is_enabled: boolean;
  is_default: boolean;
  is_available: boolean;
  options: number[]; // option value IDs
  quantity: number;
}

export interface PrintifyProductImage {
  src: string;
  variant_ids: number[];
  position: string;
  is_default: boolean;
  is_selected_for_publishing: boolean;
}

/** Printify order */
export interface PrintifyOrder {
  id: string;
  address_to: PrintifyAddress;
  line_items: PrintifyLineItem[];
  metadata: Record<string, string>;
  total_price: number;
  total_shipping: number;
  total_tax: number;
  status: string;
  shipping_method: number;
  send_shipping_notification: boolean;
  created_at: string;
  shipments: PrintifyShipment[];
}

export interface PrintifyAddress {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string;
  region: string;
  address1: string;
  address2?: string;
  city: string;
  zip: string;
}

export interface PrintifyLineItem {
  product_id: string;
  variant_id: number;
  quantity: number;
  print_provider_id?: number;
  blueprint_id?: number;
  sku?: string;
}

export interface PrintifyShipment {
  carrier: string;
  number: string;
  url: string;
  delivered_at: string | null;
}

/** Webhook payload */
export interface PrintifyWebhookEvent {
  id: string;
  type: string;
  created_at: string;
  resource: {
    id: string;
    type: string;
    data: Record<string, unknown>;
  };
}

// ---------------------------------------------------------------------------
// API Client
// ---------------------------------------------------------------------------

class PrintifyAPIError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body: unknown
  ) {
    super(`Printify API Error ${status}: ${statusText}`);
    this.name = "PrintifyAPIError";
  }
}

async function printifyFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  if (!PRINTIFY_API_TOKEN) {
    throw new Error(
      "PRINTIFY_API_TOKEN is not configured. Set it in your environment variables."
    );
  }

  const url = `${PRINTIFY_BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${PRINTIFY_API_TOKEN}`,
      "Content-Type": "application/json;charset=utf-8",
      "User-Agent": "lawnbowl-app/1.0",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new PrintifyAPIError(response.status, response.statusText, body);
  }

  return response.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Catalog Endpoints
// ---------------------------------------------------------------------------

/** List all available product blueprints */
export async function getBlueprints(): Promise<PrintifyBlueprint[]> {
  return printifyFetch<PrintifyBlueprint[]>("/catalog/blueprints.json");
}

/** Get a specific blueprint */
export async function getBlueprint(
  blueprintId: number
): Promise<PrintifyBlueprint> {
  return printifyFetch<PrintifyBlueprint>(
    `/catalog/blueprints/${blueprintId}.json`
  );
}

/** Get print providers for a blueprint */
export async function getPrintProviders(
  blueprintId: number
): Promise<PrintifyPrintProvider[]> {
  return printifyFetch<PrintifyPrintProvider[]>(
    `/catalog/blueprints/${blueprintId}/print_providers.json`
  );
}

/** Get variants for a blueprint + provider combo */
export async function getVariants(
  blueprintId: number,
  providerId: number
): Promise<{ id: number; variants: PrintifyVariantOption[] }> {
  return printifyFetch<{ id: number; variants: PrintifyVariantOption[] }>(
    `/catalog/blueprints/${blueprintId}/print_providers/${providerId}/variants.json`
  );
}

/** Get shipping info for a blueprint + provider */
export async function getShipping(
  blueprintId: number,
  providerId: number
): Promise<PrintifyShippingInfo> {
  return printifyFetch<PrintifyShippingInfo>(
    `/catalog/blueprints/${blueprintId}/print_providers/${providerId}/shipping.json`
  );
}

// ---------------------------------------------------------------------------
// Product Endpoints (your shop's products)
// ---------------------------------------------------------------------------

/** List products in your shop */
export async function getProducts(
  shopId?: string
): Promise<{ current_page: number; data: PrintifyProduct[] }> {
  const id = shopId ?? PRINTIFY_SHOP_ID;
  return printifyFetch<{ current_page: number; data: PrintifyProduct[] }>(
    `/shops/${id}/products.json`
  );
}

/** Get a single product */
export async function getProduct(
  productId: string,
  shopId?: string
): Promise<PrintifyProduct> {
  const id = shopId ?? PRINTIFY_SHOP_ID;
  return printifyFetch<PrintifyProduct>(
    `/shops/${id}/products/${productId}.json`
  );
}

// ---------------------------------------------------------------------------
// Order Endpoints
// ---------------------------------------------------------------------------

export interface CreateOrderPayload {
  external_id: string;
  label?: string;
  line_items: PrintifyLineItem[];
  shipping_method: number;
  send_shipping_notification: boolean;
  address_to: PrintifyAddress;
}

/** Create an order */
export async function createOrder(
  payload: CreateOrderPayload,
  shopId?: string
): Promise<PrintifyOrder> {
  const id = shopId ?? PRINTIFY_SHOP_ID;
  return printifyFetch<PrintifyOrder>(`/shops/${id}/orders.json`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** Send order to production */
export async function sendToProduction(
  orderId: string,
  shopId?: string
): Promise<PrintifyOrder> {
  const id = shopId ?? PRINTIFY_SHOP_ID;
  return printifyFetch<PrintifyOrder>(
    `/shops/${id}/orders/${orderId}/send_to_production.json`,
    { method: "POST" }
  );
}

/** Get order details */
export async function getOrder(
  orderId: string,
  shopId?: string
): Promise<PrintifyOrder> {
  const id = shopId ?? PRINTIFY_SHOP_ID;
  return printifyFetch<PrintifyOrder>(`/shops/${id}/orders/${orderId}.json`);
}

/** List orders */
export async function getOrders(
  shopId?: string
): Promise<{ current_page: number; data: PrintifyOrder[] }> {
  const id = shopId ?? PRINTIFY_SHOP_ID;
  return printifyFetch<{ current_page: number; data: PrintifyOrder[] }>(
    `/shops/${id}/orders.json`
  );
}

/** Cancel an order */
export async function cancelOrder(
  orderId: string,
  shopId?: string
): Promise<PrintifyOrder> {
  const id = shopId ?? PRINTIFY_SHOP_ID;
  return printifyFetch<PrintifyOrder>(
    `/shops/${id}/orders/${orderId}/cancel.json`,
    { method: "POST" }
  );
}

// ---------------------------------------------------------------------------
// Shipping Calculation
// ---------------------------------------------------------------------------

export interface ShippingEstimate {
  standard: { cost: number; currency: string };
  additionalItem: { cost: number; currency: string };
  handlingDays: number;
}

/** Calculate shipping for a blueprint/provider to the US */
export async function estimateShipping(
  blueprintId: number,
  providerId: number
): Promise<ShippingEstimate | null> {
  try {
    const shipping = await getShipping(blueprintId, providerId);
    const usProfile = shipping.profiles.find((p) =>
      p.countries.includes("US")
    );
    if (!usProfile) return null;

    return {
      standard: usProfile.first_item,
      additionalItem: usProfile.additional_items,
      handlingDays: shipping.handling_time.value,
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Utility: Check if Printify is configured
// ---------------------------------------------------------------------------

export function isPrintifyConfigured(): boolean {
  return Boolean(PRINTIFY_API_TOKEN) && Boolean(PRINTIFY_SHOP_ID);
}
