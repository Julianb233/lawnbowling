import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14?target=deno";
import { corsHeaders } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase.ts";

const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY")!;
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

const stripe = new Stripe(stripeSecret, {
  apiVersion: "2024-04-10",
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return new Response(JSON.stringify({ error: "No signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret
      );
    } catch (_err) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service role client to bypass RLS — webhooks have no user session
    const supabase = createServiceClient();

    switch (event.type) {
      // ── Checkout completed ───────────────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Shop orders are handled by the Next.js route (Printify integration)
        if (session.metadata?.source === "lawnbowl-shop") {
          console.log("Shop order — skipping (handled by Next.js route)");
          break;
        }

        // Subscription checkout
        const playerId = session.metadata?.player_id;
        const plan = session.metadata?.plan;
        if (!playerId || !plan) {
          console.warn("Missing player_id or plan in session metadata");
          break;
        }

        const { error: upsertError } = await supabase
          .from("subscriptions")
          .upsert(
            {
              player_id: playerId,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              plan,
              status: "active",
              current_period_end: null,
            },
            { onConflict: "player_id" }
          );

        if (upsertError) {
          console.error("Subscription upsert error:", upsertError);
        } else {
          console.log(`Subscription activated for player ${playerId}, plan=${plan}`);
        }
        break;
      }

      // ── Subscription updated ─────────────────────────────────────
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const periodEnd = (sub as Record<string, unknown>).current_period_end;
        const endDate =
          typeof periodEnd === "number"
            ? new Date(periodEnd * 1000).toISOString()
            : null;

        const { error: updateError } = await supabase
          .from("subscriptions")
          .update({
            status: sub.status === "active" ? "active" : "past_due",
            current_period_end: endDate,
          })
          .eq("stripe_subscription_id", sub.id);

        if (updateError) {
          console.error("Subscription update error:", updateError);
        } else {
          console.log(`Subscription ${sub.id} updated, status=${sub.status}`);
        }
        break;
      }

      // ── Subscription cancelled ───────────────────────────────────
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;

        const { error: cancelError } = await supabase
          .from("subscriptions")
          .update({ status: "cancelled" })
          .eq("stripe_subscription_id", sub.id);

        if (cancelError) {
          console.error("Subscription cancel error:", cancelError);
        } else {
          console.log(`Subscription ${sub.id} cancelled`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
