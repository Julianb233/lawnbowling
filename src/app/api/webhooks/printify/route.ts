import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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
    const body = await request.json();
    const eventType = body?.type ?? body?.event;

    console.log(`[printify-webhook] Received event: ${eventType}`, {
      id: body?.id,
      resourceType: body?.resource?.type,
      resourceId: body?.resource?.id,
    });

    switch (eventType) {
      case "order:created":
        // Log new order creation
        console.log("[printify-webhook] Order created:", body.resource?.id);
        break;

      case "order:updated":
        // Update order status in local database
        console.log("[printify-webhook] Order updated:", body.resource?.id, {
          status: body.resource?.data?.status,
        });
        // TODO: Update Supabase shop_orders table when implemented
        break;

      case "order:sent-to-production":
        console.log(
          "[printify-webhook] Order sent to production:",
          body.resource?.id
        );
        // TODO: Update order status to "in_production"
        // TODO: Send email notification to customer
        break;

      case "order:shipment:created": {
        const shipmentData = body.resource?.data;
        console.log("[printify-webhook] Shipment created:", {
          orderId: body.resource?.id,
          carrier: shipmentData?.carrier,
          trackingNumber: shipmentData?.number,
          trackingUrl: shipmentData?.url,
        });
        // TODO: Update order with tracking info
        // TODO: Send shipping notification email to customer
        break;
      }

      case "order:shipment:delivered":
        console.log(
          "[printify-webhook] Shipment delivered:",
          body.resource?.id
        );
        // TODO: Update order status to "delivered"
        // TODO: Send delivery confirmation email
        break;

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
