import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";

/** Stripe Price IDs for membership tiers (set via env vars). */
const MEMBERSHIP_PRICE_IDS: Record<string, string> = {
  monthly: process.env.STRIPE_MEMBERSHIP_MONTHLY_PRICE_ID || "",
  annual: process.env.STRIPE_MEMBERSHIP_ANNUAL_PRICE_ID || "",
};

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tier } = await req.json();

  if (tier !== "monthly" && tier !== "annual") {
    return NextResponse.json({ error: "Invalid tier. Must be 'monthly' or 'annual'." }, { status: 400 });
  }

  const priceId = MEMBERSHIP_PRICE_IDS[tier];
  if (!priceId) {
    return NextResponse.json(
      { error: `No Stripe price configured for tier '${tier}'. Set STRIPE_MEMBERSHIP_${tier.toUpperCase()}_PRICE_ID.` },
      { status: 500 },
    );
  }

  // Look up the player record
  const { data: player } = await supabase
    .from("players")
    .select("id, display_name, stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  if (!player) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  // Re-use or create Stripe customer
  let customerId = player.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { player_id: player.id },
    });
    customerId = customer.id;

    // Persist customer ID
    await supabase
      .from("players")
      .update({ stripe_customer_id: customerId })
      .eq("id", player.id);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${req.nextUrl.origin}/pricing?success=true`,
    cancel_url: `${req.nextUrl.origin}/pricing?cancelled=true`,
    metadata: { player_id: player.id, tier },
  });

  return NextResponse.json({ url: session.url });
}
