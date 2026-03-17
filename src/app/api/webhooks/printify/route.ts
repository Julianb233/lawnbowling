import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/**
 * Creates a Supabase admin client using the service role key.
 * Webhooks don't have user cookies, so we use the service role for DB access.
 */
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * POST /api/webhooks/printify
 *
 * Handles Printify webhook events for order status updates.
 *
 * Events handled:
 *   - order:created — New order created
 *   - order:updated — Order status changed
 *   - order:sent-to-production — Order sent to print provider
 *   - order:shipment:created — Shipment created with tracking number
 *   - order:shipment:delivered — Shipment delivered
 *
 * In production, this should:
 *   1. Verify the webhook signature
 *   2. Update the order status in Supabase
 *   3. Send email notifications to the customer
 *   4. Log the event for analytics
 */
export async function POST(request: Request) {
  try {
    // Verify webhook signature if PRINTIFY_WEBHOOK_SECRET is configured
    const webhookSecret = process.env.PRINTIFY_WEBHOOK_SECRET;
    const rawBody = await request.text();

    if (webhookSecret) {
      const signature = request.headers.get("x-pfy-signature");
      if (!signature) {
        console.error("[printify-webhook] Missing x-pfy-signature header");
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
        console.error("[printify-webhook] Invalid webhook signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const body = JSON.parse(rawBody);
    const eventType = body?.type ?? body?.event;

    console.log(`[printify-webhook] Received event: ${eventType}`, {
      id: body?.id,
      resourceType: body?.resource?.type,
      resourceId: body?.resource?.id,
    });

    const supabase = getSupabaseAdmin();

    switch (eventType) {
      case "order:created": {
        console.log("[printify-webhook] Order created:", body.resource?.id);

        const { error } = await supabase.from("shop_orders").upsert(
          {
            printify_order_id: body.resource?.id,
            status: "created",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "printify_order_id" }
        );

        if (error) {
          console.error("[printify-webhook] Failed to insert order:", error);
        }
        break;
      }

      case "order:updated": {
        const newStatus = body.resource?.data?.status ?? "updated";
        console.log("[printify-webhook] Order updated:", body.resource?.id, {
          status: newStatus,
        });

        const { error } = await supabase
          .from("shop_orders")
          .update({
            status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq("printify_order_id", body.resource?.id);

        if (error) {
          console.error("[printify-webhook] Failed to update order:", error);
        }
        break;
      }

      case "order:sent-to-production": {
        console.log(
          "[printify-webhook] Order sent to production:",
          body.resource?.id
        );

        const { error } = await supabase
          .from("shop_orders")
          .update({
            status: "in_production",
            updated_at: new Date().toISOString(),
          })
          .eq("printify_order_id", body.resource?.id);

        if (error) {
          console.error(
            "[printify-webhook] Failed to update order to in_production:",
            error
          );
        }

        // Email notification would be sent here when email service is configured
        // e.g. sendEmail({ to: customerEmail, subject: "Your order is being produced", ... })
        console.log(
          "[printify-webhook] Production notification email would be sent for order:",
          body.resource?.id
        );
        break;
      }

      case "order:shipment:created": {
        const shipmentData = body.resource?.data;
        console.log("[printify-webhook] Shipment created:", {
          orderId: body.resource?.id,
          carrier: shipmentData?.carrier,
          trackingNumber: shipmentData?.number,
          trackingUrl: shipmentData?.url,
        });

        const { error } = await supabase
          .from("shop_orders")
          .update({
            status: "shipped",
            tracking_number: shipmentData?.number ?? null,
            tracking_url: shipmentData?.url ?? null,
            updated_at: new Date().toISOString(),
          })
          .eq("printify_order_id", body.resource?.id);

        if (error) {
          console.error(
            "[printify-webhook] Failed to update order with tracking info:",
            error
          );
        }

        // Email notification would be sent here when email service is configured
        // e.g. sendEmail({ to: customerEmail, subject: "Your order has shipped!", ... })
        console.log(
          "[printify-webhook] Shipping notification email would be sent for order:",
          body.resource?.id
        );
        break;
      }

      case "order:shipment:delivered": {
        console.log(
          "[printify-webhook] Shipment delivered:",
          body.resource?.id
        );

        const { error } = await supabase
          .from("shop_orders")
          .update({
            status: "delivered",
            updated_at: new Date().toISOString(),
          })
          .eq("printify_order_id", body.resource?.id);

        if (error) {
          console.error(
            "[printify-webhook] Failed to update order to delivered:",
            error
          );
        }

        // Email notification would be sent here when email service is configured
        // e.g. sendEmail({ to: customerEmail, subject: "Your order has been delivered!", ... })
        console.log(
          "[printify-webhook] Delivery confirmation email would be sent for order:",
          body.resource?.id
        );
        break;
      }

      default:
        console.log("[printify-webhook] Unknown event type:", eventType);
    }

    // Printify expects a 200 response to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[printify-webhook] Error processing webhook:", error);
    // Still return 200 to prevent Printify from retrying
    return NextResponse.json({ received: true, error: "Processing failed" });
  }
}
