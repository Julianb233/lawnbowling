import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createClient as createSupabaseServiceClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { computeExpiration } from "@/lib/membership";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_MEMBERSHIP_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Use service role client to bypass RLS — webhooks have no user session
  const supabase = createSupabaseServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  switch (event.type) {
    // ---- Checkout completed: activate membership ----
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const playerId = session.metadata?.player_id;
      const tier = session.metadata?.tier as "monthly" | "annual" | undefined;

      if (!playerId || !tier) break;

      const expiresAt = computeExpiration(tier).toISOString();

      await supabase
        .from("players")
        .update({
          membership_tier: tier,
          membership_expires_at: expiresAt,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
        })
        .eq("id", playerId);

      break;
    }

    // ---- Subscription cancelled: downgrade to free ----
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;

      await supabase
        .from("players")
        .update({
          membership_tier: "free",
          membership_expires_at: null,
          stripe_subscription_id: null,
        })
        .eq("stripe_subscription_id", sub.id);

      break;
    }

    // ---- Payment failed: log for now (could email / push-notify user) ----
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;

      logger.warn("Payment failed for customer", {
        route: "membership/webhook",
        customerId,
        invoiceId: invoice.id,
      });

      // Future: send push notification or email to the player
      break;
    }
  }

  return NextResponse.json({ received: true });
}
