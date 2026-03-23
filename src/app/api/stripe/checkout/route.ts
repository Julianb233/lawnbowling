import { NextRequest, NextResponse } from "next/server";
import { stripe, PRICE_IDS } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";
import { validateBody, isValidationError } from "@/lib/schemas/validate";
import { stripeCheckoutSchema } from "@/lib/schemas";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await validateBody(req, stripeCheckoutSchema);
  if (isValidationError(result)) return result;

  const priceId = PRICE_IDS[result.plan];
  if (!priceId) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const { data: player } = await supabase
    .from("players")
    .select("id, display_name")
    .eq("user_id", user.id)
    .single();

  if (!player) return NextResponse.json({ error: "Player not found" }, { status: 404 });

  // Check for existing Stripe customer
  const { data: existingSub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("player_id", player.id)
    .not("stripe_customer_id", "is", null)
    .limit(1)
    .single();

  if (!stripe) return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });

  let customerId = existingSub?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { player_id: player.id },
    });
    customerId = customer.id;
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${req.nextUrl.origin}/pricing?success=true`,
    cancel_url: `${req.nextUrl.origin}/pricing?cancelled=true`,
    metadata: { player_id: player.id, plan: result.plan },
  });

  return NextResponse.json({ url: session.url });
}
