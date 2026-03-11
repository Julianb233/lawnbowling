/**
 * Order Fulfillment — Submit orders to Printify after Stripe payment.
 *
 * Flow:
 * 1. Stripe webhook fires `checkout.session.completed` for shop orders
 * 2. This module creates a Printify order from the session metadata
 * 3. Sends the order to production
 * 4. Returns order details for tracking
 *
 * Note: Requires PRINTIFY_API_TOKEN and PRINTIFY_SHOP_ID to be configured.
 */

import {
  createOrder,
  sendToProduction,
  isPrintifyConfigured,
  type CreateOrderPayload,
  type PrintifyAddress,
  type PrintifyOrder,
} from "./printify";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FulfillmentResult {
  success: boolean;
  printifyOrderId?: string;
  externalId: string;
  error?: string;
}

export interface ShopOrderData {
  /** Stripe session/payment ID used as external reference */
  externalId: string;
  /** Customer shipping address from Stripe */
  shippingAddress: {
    name: string;
    email: string;
    phone?: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  /** Line items from the order */
  items: {
    productId: string;
    variantId: string;
    quantity: number;
  }[];
}

// ---------------------------------------------------------------------------
// Fulfillment
// ---------------------------------------------------------------------------

/**
 * Submit an order to Printify for fulfillment.
 *
 * Called after successful Stripe payment.
 */
export async function fulfillOrder(
  orderData: ShopOrderData
): Promise<FulfillmentResult> {
  if (!isPrintifyConfigured()) {
    console.warn(
      "[fulfillment] Printify not configured, skipping order submission"
    );
    return {
      success: false,
      externalId: orderData.externalId,
      error: "Printify API not configured",
    };
  }

  try {
    // Parse name into first/last
    const nameParts = orderData.shippingAddress.name.split(" ");
    const firstName = nameParts[0] || "Customer";
    const lastName = nameParts.slice(1).join(" ") || "";

    const address: PrintifyAddress = {
      first_name: firstName,
      last_name: lastName,
      email: orderData.shippingAddress.email,
      phone: orderData.shippingAddress.phone || "",
      country: orderData.shippingAddress.country,
      region: orderData.shippingAddress.state,
      address1: orderData.shippingAddress.line1,
      address2: orderData.shippingAddress.line2,
      city: orderData.shippingAddress.city,
      zip: orderData.shippingAddress.postalCode,
    };

    const payload: CreateOrderPayload = {
      external_id: `lawnbowl-${orderData.externalId}`,
      label: `Lawnbowl Shop Order`,
      line_items: orderData.items.map((item) => ({
        product_id: item.productId,
        variant_id: parseInt(item.variantId, 10),
        quantity: item.quantity,
      })),
      shipping_method: 1, // Standard shipping
      send_shipping_notification: true,
      address_to: address,
    };

    // Create the order
    const order: PrintifyOrder = await createOrder(payload);
    console.log(
      `[fulfillment] Printify order created: ${order.id} (external: ${orderData.externalId})`
    );

    // Send to production
    try {
      await sendToProduction(order.id);
      console.log(
        `[fulfillment] Order ${order.id} sent to production`
      );
    } catch (prodError) {
      console.error(
        `[fulfillment] Failed to send order ${order.id} to production:`,
        prodError
      );
      // Order was created but not sent to production
      // This can be retried manually from Printify dashboard
    }

    return {
      success: true,
      printifyOrderId: order.id,
      externalId: orderData.externalId,
    };
  } catch (error) {
    console.error("[fulfillment] Order submission failed:", error);
    return {
      success: false,
      externalId: orderData.externalId,
      error: error instanceof Error ? error.message : "Unknown fulfillment error",
    };
  }
}

/**
 * Parse Stripe checkout session metadata to extract order item info.
 *
 * The metadata stores itemIds as "productId:variantId,productId:variantId,..."
 */
export function parseOrderItemsFromMetadata(
  itemIds: string | undefined
): { productId: string; variantId: string; quantity: number }[] {
  if (!itemIds) return [];

  return itemIds
    .split(",")
    .map((pair) => {
      const [productId, variantId] = pair.split(":");
      if (!productId || !variantId) return null;
      return { productId, variantId, quantity: 1 };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}
