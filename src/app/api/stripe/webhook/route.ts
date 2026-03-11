import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";
import {
  isPrintifyConfigured,
  createOrder,
  sendToProduction,
} from "@/lib/printify";
import Stripe from "stripe";

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

  const supabase = await createClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      // Handle shop orders — forward to Printify for fulfillment
      if (session.metadata?.source === "shop") {
        await handleShopOrder(session);
        break;
      }

      // Handle subscription payments
      const playerId = session.metadata?.player_id;
      const plan = session.metadata?.plan;
      if (!playerId || !plan) break;

      await supabase.from("subscriptions").upsert({
        player_id: playerId,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        plan,
        status: "active",
        current_period_end: null,
      }, { onConflict: "player_id" });
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      await supabase
        .from("subscriptions")
        .update({
          status: sub.status === "active" ? "active" : "past_due",
          current_period_end: new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
        })
        .eq("stripe_subscription_id", sub.id);
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await supabase
        .from("subscriptions")
        .update({ status: "cancelled" })
        .eq("stripe_subscription_id", sub.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}

/**
 * Handle a completed shop checkout: create a Printify order and send to production.
 */
async function handleShopOrder(session: Stripe.Checkout.Session) {
  if (!isPrintifyConfigured() || !stripe) {
    console.log("[Shop] Printify not configured — skipping order fulfillment");
    return;
  }

  try {
    // Retrieve line items from Stripe session
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ["data.price.product"],
    });

    // Extract shipping address from the session
    const collected = session.collected_information;
    const shipping = collected?.shipping_details;
    if (!shipping?.address) {
      console.error("[Shop] No shipping address on session", session.id);
      return;
    }

    const nameParts = (shipping.name ?? "").split(" ");
    const firstName = nameParts[0] ?? "";
    const lastName = nameParts.slice(1).join(" ") || firstName;

    const items = lineItems.data
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

    if (items.length === 0) {
      console.log("[Shop] No valid line items for Printify order");
      return;
    }

    const order = await createOrder({
      externalId: session.id,
      items,
      shippingAddress: {
        first_name: firstName,
        last_name: lastName,
        email: session.customer_email ?? session.customer_details?.email ?? "",
        address1: shipping.address.line1 ?? "",
        address2: shipping.address.line2 ?? "",
        city: shipping.address.city ?? "",
        region: shipping.address.state ?? "",
        zip: shipping.address.postal_code ?? "",
        country: shipping.address.country ?? "US",
      },
    });

    // Automatically send to production since payment is confirmed
    await sendToProduction(order.id);
    console.log(
      `[Shop] Printify order ${order.id} created and sent to production for session ${session.id}`
    );
  } catch (err) {
    console.error("[Shop] Failed to create Printify order:", err);
    // In production: queue for retry, alert admin
  }
}
