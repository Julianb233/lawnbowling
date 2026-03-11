import { NextRequest, NextResponse } from "next/server";
import {
  isPrintifyConfigured,
  createOrder,
  PrintifyApiError,
  type PrintifyAddress,
} from "@/lib/printify";

interface OrderItem {
  productId: string;
  variantId: string;
  quantity: number;
}

/**
 * POST /api/shop/printify/orders
 *
 * Creates a Printify order after successful Stripe payment.
 * Called by the Stripe webhook handler or manually for order fulfillment.
 */
export async function POST(req: NextRequest) {
  if (!isPrintifyConfigured()) {
    return NextResponse.json(
      { error: "Printify not configured" },
      { status: 503 }
    );
  }

  const { items, shipping, stripeSessionId } = (await req.json()) as {
    items: OrderItem[];
    shipping: PrintifyAddress;
    stripeSessionId: string;
  };

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "No items" }, { status: 400 });
  }

  try {
    const order = await createOrder({
      externalId: stripeSessionId,
      items: items.map((item) => ({
        productId: item.productId,
        variantId: Number(item.variantId),
        quantity: item.quantity,
      })),
      shippingAddress: shipping,
    });

    return NextResponse.json({
      orderId: order.id,
      status: order.status,
    });
  } catch (err) {
    const message =
      err instanceof PrintifyApiError
        ? `Printify API ${err.status}: ${err.body}`
        : "Failed to create order";

    console.error("[Printify Order]", message);
    return NextResponse.json(
      { error: "Failed to create Printify order", detail: message },
      { status: 502 }
    );
  }
}
