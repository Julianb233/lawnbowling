import { NextRequest, NextResponse } from "next/server";

/**
 * Printify webhook endpoint for order status updates.
 *
 * Configure in Printify dashboard:
 *   URL: https://yourdomain.com/api/shop/webhooks/printify
 *   Events: order:created, order:updated, order:shipped, order:completed
 *
 * In production, verify the webhook signature from the
 * `X-Pfy-Signature` header using PRINTIFY_WEBHOOK_SECRET.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.PRINTIFY_WEBHOOK_SECRET;

  // Verify webhook signature in production
  if (secret) {
    const signature = req.headers.get("x-pfy-signature");
    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 401 }
      );
    }
    // In production: verify HMAC-SHA256 signature
    // const crypto = await import("crypto");
    // const computed = crypto.createHmac("sha256", secret).update(body).digest("hex");
    // if (computed !== signature) return NextResponse.json({ error: "Invalid" }, { status: 401 });
  }

  const event = await req.json();
  const eventType = event.type as string;

  switch (eventType) {
    case "order:shipped": {
      const { id, carrier, tracking_number, tracking_url } =
        event.resource ?? {};
      // Store tracking info — in production, persist to database and notify customer
      console.log(
        `[Printify] Order ${id} shipped via ${carrier}: ${tracking_number}`,
        tracking_url
      );
      break;
    }

    case "order:completed": {
      const { id } = event.resource ?? {};
      console.log(`[Printify] Order ${id} completed`);
      break;
    }

    case "order:updated": {
      const { id, status } = event.resource ?? {};
      console.log(`[Printify] Order ${id} updated to ${status}`);
      break;
    }

    default:
      console.log(`[Printify] Unhandled event: ${eventType}`);
  }

  return NextResponse.json({ received: true });
}
