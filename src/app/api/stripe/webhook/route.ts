import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";
import Stripe from "stripe";
import { fulfillOrder, parseOrderItemsFromMetadata } from "@/lib/shop/fulfillment";

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

      // Handle shop orders (one-time payments)
      if (session.metadata?.source === "lawnbowl-shop") {
        const shippingDetails = session.collected_information?.shipping_details;
        if (shippingDetails?.address) {
          const items = parseOrderItemsFromMetadata(session.metadata?.itemIds);
          if (items.length > 0) {
            const result = await fulfillOrder({
              externalId: session.id,
              shippingAddress: {
                name: shippingDetails.name || "Customer",
                email: session.customer_details?.email || "",
                phone: session.customer_details?.phone || undefined,
                line1: shippingDetails.address.line1 || "",
                line2: shippingDetails.address.line2 || undefined,
                city: shippingDetails.address.city || "",
                state: shippingDetails.address.state || "",
                postalCode: shippingDetails.address.postal_code || "",
                country: shippingDetails.address.country || "US",
              },
              items,
            });
            console.log("[stripe-webhook] Shop order fulfillment result:", result);
          }
        }
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
