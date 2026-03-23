import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/printify";
import { createServiceClient } from "@/lib/supabase/service";
import { logger } from "@/lib/logger";

/**
 * POST /api/shop/webhooks/printify
 *
 * Receives order status updates from Printify, persists every event
 * to printify_webhook_events, and updates shop_orders status/tracking.
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
  const resource = event.resource ?? {};
  const orderId = resource.id as string | undefined;

  const supabase = createServiceClient();

  try {
    switch (eventType) {
      case "order:shipped": {
        const { carrier, tracking_number, tracking_url } = resource;

        // Persist webhook event
        await persistWebhookEvent(supabase, {
          orderId: orderId ?? "unknown",
          eventType,
          carrier,
          tracking_number,
          tracking_url,
          status: "shipped",
          payload: event,
        });

        // Update shop_orders status and tracking info
        if (orderId) {
          const { error } = await supabase
            .from("shop_orders")
            .update({
              status: "shipped",
              tracking_number: tracking_number ?? null,
              tracking_url: tracking_url ?? null,
              updated_at: new Date().toISOString(),
            })
            .eq("fulfillment_id", orderId);

          if (error) {
            logger.error("Failed to update shop_order to shipped", {
              route: "shop/webhooks/printify",
              orderId,
              error,
            });
          } else {
            logger.info("Order shipped — status and tracking updated", {
              route: "shop/webhooks/printify",
              orderId,
              carrier,
              tracking_number,
            });
          }
        }
        break;
      }

      case "order:completed": {
        // Persist webhook event
        await persistWebhookEvent(supabase, {
          orderId: orderId ?? "unknown",
          eventType,
          status: "fulfilled",
          payload: event,
        });

        // Update shop_orders status to fulfilled
        if (orderId) {
          const { error } = await supabase
            .from("shop_orders")
            .update({
              status: "fulfilled",
              updated_at: new Date().toISOString(),
            })
            .eq("fulfillment_id", orderId);

          if (error) {
            logger.error("Failed to update shop_order to fulfilled", {
              route: "shop/webhooks/printify",
              orderId,
              error,
            });
          } else {
            logger.info("Order completed — status updated to fulfilled", {
              route: "shop/webhooks/printify",
              orderId,
            });
          }
        }
        break;
      }

      case "order:updated": {
        const { status } = resource;

        await persistWebhookEvent(supabase, {
          orderId: orderId ?? "unknown",
          eventType,
          status: status ?? "updated",
          payload: event,
        });

        logger.info("Order updated event persisted", {
          route: "shop/webhooks/printify",
          orderId,
          status,
        });
        break;
      }

      case "order:created": {
        await persistWebhookEvent(supabase, {
          orderId: orderId ?? "unknown",
          eventType,
          status: "created",
          payload: event,
        });

        logger.info("Order created event persisted", {
          route: "shop/webhooks/printify",
          orderId,
        });
        break;
      }

      default: {
        await persistWebhookEvent(supabase, {
          orderId: orderId ?? "unknown",
          eventType: eventType ?? "unknown",
          status: "unhandled",
          payload: event,
        });

        logger.warn("Unhandled Printify event persisted", {
          route: "shop/webhooks/printify",
          eventType,
        });
      }
    }
  } catch (err) {
    logger.error("Printify webhook handler error", {
      route: "shop/webhooks/printify",
      eventType,
      error: err,
    });
    // Return 200 to prevent Printify from retrying — errors are logged
  }

  return NextResponse.json({ received: true });
}

// ─── Helpers ────────────────────────────────────────────────────

interface WebhookEventRow {
  orderId: string;
  eventType: string;
  carrier?: string;
  tracking_number?: string;
  tracking_url?: string;
  status: string;
  payload: unknown;
}

async function persistWebhookEvent(
  supabase: ReturnType<typeof createServiceClient>,
  data: WebhookEventRow
) {
  const { error } = await supabase.from("printify_webhook_events").insert({
    order_id: data.orderId,
    event_type: data.eventType,
    carrier: data.carrier ?? null,
    tracking_number: data.tracking_number ?? null,
    tracking_url: data.tracking_url ?? null,
    status: data.status,
    payload: data.payload,
  });

  if (error) {
    logger.error("Failed to persist printify webhook event", {
      route: "shop/webhooks/printify",
      orderId: data.orderId,
      eventType: data.eventType,
      error,
    });
  }
}
