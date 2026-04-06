import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { apiError } from "@/lib/api-error-handler";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * POST /api/shop/checkout
 *
 * Creates a Stripe Checkout session for shop purchases (one-time payment).
 * Rate limited to 10 requests per minute per IP to prevent abuse.
 *
 * Body: { items: [{ name, price, quantity, image?, variantLabel? }], shippingCost? }
 */

interface CheckoutItem {
  name: string;
  price: number; // in dollars
  quantity: number;
  image?: string;
  variantLabel?: string;
  productId?: string;
  variantId?: string;
}

interface CheckoutBody {
  items: CheckoutItem[];
  shippingCost?: number;
}

export async function POST(req: NextRequest) {
  // C-007: Rate limit checkout to prevent Stripe session creation spam
  const ip = getClientIp(req);
  const { success, remaining, resetAt } = rateLimit(`checkout:${ip}`, 10, 60_000);
  if (!success) {
    return NextResponse.json(
      { error: "Too many checkout requests. Please try again shortly." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 503 }
    );
  }

  try {
    const body = (await req.json()) as CheckoutBody;

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    // Validate item count and values to prevent abuse
    if (body.items.length > 50) {
      return NextResponse.json({ error: "Too many items" }, { status: 400 });
    }
    for (const item of body.items) {
      if (!item.name || typeof item.price !== "number" || item.price <= 0 || item.price > 10_000) {
        return NextResponse.json({ error: "Invalid item data" }, { status: 400 });
      }
      if (!item.quantity || item.quantity < 1 || item.quantity > 100) {
        return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
      }
    }

    // Build Stripe line items
    const lineItems: {
      price_data: {
        currency: string;
        product_data: {
          name: string;
          description?: string;
          images?: string[];
        };
        unit_amount: number;
      };
      quantity: number;
    }[] = body.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          description: item.variantLabel || undefined,
          images: item.image && !item.image.startsWith("data:")
            ? [item.image]
            : undefined,
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Add shipping as a line item if specified
    if (body.shippingCost && body.shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Shipping",
            description: "Standard shipping (1-2 weeks)",
          },
          unit_amount: Math.round(body.shippingCost * 100),
        },
        quantity: 1,
      });
    }

    const origin = req.nextUrl.origin;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      shipping_address_collection: {
        allowed_countries: ["US"],
      },
      metadata: {
        source: "lawnbowl-shop",
        itemCount: String(body.items.length),
        itemIds: body.items
          .map((i) => `${i.productId}:${i.variantId}`)
          .join(",")
          .slice(0, 500), // Stripe metadata value limit
      },
      success_url: `${origin}/shop/checkout?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop/checkout?cancelled=true`,
    });

    return NextResponse.json(
      { url: session.url, sessionId: session.id },
      { headers: { "X-RateLimit-Remaining": String(remaining) } }
    );
  } catch (error) {
    console.error("[shop/checkout] Error creating checkout session:", error);
    return apiError(error, "POST /api/shop/checkout", 500);
  }
}
