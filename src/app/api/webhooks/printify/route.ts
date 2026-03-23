import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * POST /api/webhooks/printify
 *
 * Handles Printify webhook events for order status updates.
 * Persists every event to printify_webhook_events and updates shop_orders.
 *
 * Events handled:
 *   - order:created — New order created
 *   - order:updated — Order status changed
 *   - order:sent-to-production — Order sent to print provider
 *   - order:shipment:created — Shipment created with tracking number
 *   - order:shipment:delivered — Shipment delivered
 */
export async function POST(request: Request) {
  try {
    // Verify webhook signature if PRINTIFY_WEBHOOK_SECRET is configured
    const webhookSecret = process.env.PRINTIFY_WEBHOOK_SECRET;
    const rawBody = await request.text();

    if (webhookSecret) {
      const signature = request.headers.get("x-pfy-signature");
      if (!signature) {
        logger.error("Missing x-pfy-signature header", { route: "webhooks/printify" });
        return NextResponse.json({ error: "Missing signature" }, { status: 401 });
      }

      // Printify HMAC-SHA256 signature verification
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(webhookSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const signatureBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
      const expectedSignature = Array.from(new Uint8Array(signatureBytes))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

      if (signature !== expectedSignature) {
        logger.error("Invalid webhook signature", { route: "webhooks/printify" });
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const body = JSON.parse(rawBody);
    const eventType = body?.type ?? body?.event;
    const orderId = body?.resource?.id as string | undefined;

    const supabase = createServiceClient();

    // Persist every webhook event
    const { error: insertError } = await supabase.from("printify_webhook_events").insert({
      order_id: orderId ?? "unknown",
      event_type: eventType ?? "unknown",
      carrier: body?.resource?.data?.carrier ?? null,
      tracking_number: body?.resource?.data?.number ?? null,
      tracking_url: body?.resource?.data?.url ?? null,
      status: "received",
      payload: body,
    });

    if (insertError) {
      logger.error("Failed to persist webhook event", {
        route: "webhooks/printify",
        orderId,
        eventType,
        error: insertError,
      });
    }

    logger.info("Printify webhook received", {
      route: "webhooks/printify",
      eventType,
      orderId,
      resourceType: body?.resource?.type,
    });

    switch (eventType) {
      case "order:created": {
        const { error } = await supabase.from("shop_orders").upsert(
          {
            printify_order_id: orderId,
            status: "created",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "printify_order_id" }
        );

        if (error) {
          logger.error("Failed to insert order", { route: "webhooks/printify", orderId, error });
        }
        break;
      }

      case "order:updated": {
        const newStatus = body.resource?.data?.status ?? "updated";

        const { error } = await supabase
          .from("shop_orders")
          .update({
            status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq("printify_order_id", orderId);

        if (error) {
          logger.error("Failed to update order", { route: "webhooks/printify", orderId, error });
        } else {
          logger.info("Order updated", { route: "webhooks/printify", orderId, status: newStatus });
        }
        break;
      }

      case "order:sent-to-production": {
        const { error } = await supabase
          .from("shop_orders")
          .update({
            status: "in_production",
            updated_at: new Date().toISOString(),
          })
          .eq("printify_order_id", orderId);

        if (error) {
          logger.error("Failed to update order to in_production", { route: "webhooks/printify", orderId, error });
        } else {
          logger.info("Order sent to production", { route: "webhooks/printify", orderId });
        }
        break;
      }

      case "order:shipment:created": {
        const shipmentData = body.resource?.data;

        const { error } = await supabase
          .from("shop_orders")
          .update({
            status: "shipped",
            tracking_number: shipmentData?.number ?? null,
            tracking_url: shipmentData?.url ?? null,
            updated_at: new Date().toISOString(),
          })
          .eq("printify_order_id", orderId);

        if (error) {
          logger.error("Failed to update order with tracking info", { route: "webhooks/printify", orderId, error });
        } else {
          logger.info("Shipment created with tracking", {
            route: "webhooks/printify",
            orderId,
            carrier: shipmentData?.carrier,
            trackingNumber: shipmentData?.number,
          });
        }
        break;
      }

      case "order:shipment:delivered": {
        const { error } = await supabase
          .from("shop_orders")
          .update({
            status: "delivered",
            updated_at: new Date().toISOString(),
          })
          .eq("printify_order_id", orderId);

        if (error) {
          logger.error("Failed to update order to delivered", { route: "webhooks/printify", orderId, error });
        } else {
          logger.info("Order delivered", { route: "webhooks/printify", orderId });
        }
        break;
      }

      default:
        logger.warn("Unknown Printify event type", { route: "webhooks/printify", eventType });
    }

    // Printify expects a 200 response to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error("Error processing Printify webhook", { route: "webhooks/printify", error });
    // Still return 200 to prevent Printify from retrying
    return NextResponse.json({ received: true, error: "Processing failed" });
  }
}
