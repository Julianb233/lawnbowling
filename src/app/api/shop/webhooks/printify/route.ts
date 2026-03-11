import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/printify";

/**
 * POST /api/shop/webhooks/printify
 *
 * Receives order status updates from Printify.
 *
 * Configure in Printify dashboard:
 *   URL: https://yourdomain.com/api/shop/webhooks/printify
 *   Events: order:created, order:updated, order:shipped, order:completed
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-pfy-signature");

  // Verify webhook signature in production
  if (process.env.PRINTIFY_WEBHOOK_SECRET) {
    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 401 }
      );
    }

    const valid = await verifyWebhookSignature(rawBody, signature);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }
  }

  const event = JSON.parse(rawBody);
  const eventType = event.type as string;

  switch (eventType) {
    case "order:shipped": {
      const { id, carrier, tracking_number, tracking_url } =
        event.resource ?? {};
      // TODO: In production, persist to database and send customer notification email
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

    case "order:created": {
      const { id } = event.resource ?? {};
      console.log(`[Printify] Order ${id} created`);
      break;
    }

    default:
      console.log(`[Printify] Unhandled event: ${eventType}`);
  }

  return NextResponse.json({ received: true });
}
