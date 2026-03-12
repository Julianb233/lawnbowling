import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createClient as createSupabaseServiceClient } from "@supabase/supabase-js";
import {
  isPrintifyConfigured,
  createOrder,
  sendToProduction,
} from "@/lib/printify";
import Stripe from "stripe";
import { logger } from "@/lib/logger";

// Service-role Supabase client for webhook handlers (bypasses RLS)
function getServiceSupabase() {
  return createSupabaseServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) return NextResponse.json({ error: "No signature" }, { status: 400 });
  if (!stripe) return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = getServiceSupabase();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Handle shop orders — persist to shop_orders + forward to Printify
        if (session.metadata?.source === "lawnbowl-shop") {
          await handleShopOrder(session, supabase);
          break;
        }

        // Handle subscription checkout — create subscription record
        const playerId = session.metadata?.player_id;
        const plan = session.metadata?.plan;
        if (!playerId || !plan) break;

        const subscriptionId = session.subscription as string;
        if (!subscriptionId) break;

        // Use stripe_subscription_id as the conflict key (matches DB unique constraint)
        await supabase.from("subscriptions").upsert({
          player_id: playerId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscriptionId,
          plan,
          status: "active",
          current_period_end: null,
          updated_at: new Date().toISOString(),
        }, { onConflict: "stripe_subscription_id" });

        logger.info("Subscription created via checkout", {
          route: "stripe/webhook",
          playerId,
          plan,
          subscriptionId,
        });
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const periodEnd = (sub as unknown as { current_period_end: number }).current_period_end;
        await supabase
          .from("subscriptions")
          .update({
            status: sub.status === "active" ? "active" : "past_due",
            current_period_end: new Date(periodEnd * 1000).toISOString(),
            cancel_at_period_end: sub.cancel_at_period_end ?? false,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", sub.id);

        logger.info("Subscription updated", {
          route: "stripe/webhook",
          subscriptionId: sub.id,
          status: sub.status,
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await supabase
          .from("subscriptions")
          .update({
            status: "cancelled",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", sub.id);

        logger.info("Subscription cancelled", {
          route: "stripe/webhook",
          subscriptionId: sub.id,
        });
        break;
      }
    }
  } catch (err) {
    logger.error("Webhook handler error", { route: "stripe/webhook", eventType: event.type, error: err });
    // Return 200 to prevent Stripe from retrying — errors are logged for investigation
  }

  return NextResponse.json({ received: true });
}

/**
 * Handle a completed shop checkout:
 * 1. Write a record to shop_orders table
 * 2. Forward to Printify for fulfillment (if configured)
 */
async function handleShopOrder(
  session: Stripe.Checkout.Session,
  supabase: ReturnType<typeof getServiceSupabase>
) {
  if (!stripe) return;

  try {
    // Retrieve line items from Stripe session
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ["data.price.product"],
    });

    // Extract shipping address from the session
    const collected = session.collected_information;
    const shipping = collected?.shipping_details;

    const shippingAddress = shipping?.address
      ? {
          name: shipping.name ?? "",
          line1: shipping.address.line1 ?? "",
          line2: shipping.address.line2 ?? "",
          city: shipping.address.city ?? "",
          state: shipping.address.state ?? "",
          postal_code: shipping.address.postal_code ?? "",
          country: shipping.address.country ?? "US",
        }
      : null;

    // Build items array for DB record
    const items = lineItems.data.map((li) => {
      const product = li.price?.product;
      const p = product && typeof product !== "string" ? (product as Stripe.Product) : null;
      return {
        name: li.description ?? p?.name ?? "Unknown item",
        quantity: li.quantity ?? 1,
        amount: li.amount_total ?? 0,
        product_id: p?.metadata?.product_id ?? null,
        variant_id: p?.metadata?.variant_id ?? null,
      };
    });

    // Calculate total from line items
    const totalAmount = lineItems.data.reduce(
      (sum, li) => sum + (li.amount_total ?? 0),
      0
    );

    // Persist order to shop_orders table
    const playerId = session.metadata?.player_id ?? null;
    const { error: insertError } = await supabase.from("shop_orders").insert({
      player_id: playerId,
      stripe_session_id: session.id,
      stripe_payment_intent: session.payment_intent as string | null,
      status: "paid",
      items,
      total_amount: totalAmount,
      currency: session.currency ?? "usd",
      shipping_address: shippingAddress,
    });

    if (insertError) {
      logger.error("Failed to insert shop_order", {
        route: "stripe/webhook",
        sessionId: session.id,
        error: insertError,
      });
    } else {
      logger.info("Shop order recorded", {
        route: "stripe/webhook",
        sessionId: session.id,
        totalAmount,
      });
    }

    // Forward to Printify for fulfillment if configured
    if (!isPrintifyConfigured()) {
      logger.info("Printify not configured — skipping order fulfillment", { route: "stripe/webhook" });
      return;
    }

    if (!shippingAddress) {
      logger.error("No shipping address on session", { route: "stripe/webhook", sessionId: session.id });
      return;
    }

    const nameParts = (shipping?.name ?? "").split(" ");
    const firstName = nameParts[0] ?? "";
    const lastName = nameParts.slice(1).join(" ") || firstName;

    const printifyItems = lineItems.data
      .map((li) => {
        const product = li.price?.product;
        if (!product || typeof product === "string") return null;
        const p = product as Stripe.Product;
        return {
          productId: p.metadata?.product_id ?? "",
          variantId: Number(p.metadata?.variant_id ?? 0),
          quantity: li.quantity ?? 1,
        };
      })
      .filter(
        (item): item is NonNullable<typeof item> =>
          item !== null && !!item.productId
      );

    if (printifyItems.length === 0) {
      logger.warn("No valid line items for Printify order", { route: "stripe/webhook", sessionId: session.id });
      return;
    }

    const order = await createOrder({
      externalId: session.id,
      items: printifyItems,
      shippingAddress: {
        first_name: firstName,
        last_name: lastName,
        email: session.customer_email ?? session.customer_details?.email ?? "",
        address1: shippingAddress.line1,
        address2: shippingAddress.line2,
        city: shippingAddress.city,
        region: shippingAddress.state,
        zip: shippingAddress.postal_code,
        country: shippingAddress.country,
      },
    });

    // Update shop_orders with fulfillment info
    await supabase
      .from("shop_orders")
      .update({
        status: "fulfilled",
        fulfillment_provider: "printify",
        fulfillment_id: order.id,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_session_id", session.id);

    await sendToProduction(order.id);
    logger.info("Printify order created and sent to production", {
      route: "stripe/webhook",
      orderId: order.id,
      sessionId: session.id,
    });
  } catch (err) {
    logger.error("Failed to process shop order", { route: "stripe/webhook", error: err, sessionId: session.id });
  }
}
