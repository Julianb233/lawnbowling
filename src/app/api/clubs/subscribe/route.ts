import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!stripe)
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 503 }
    );

  const { plan, memberCount, clubName, clubId } = await req.json();

  if (!plan || !memberCount) {
    return NextResponse.json(
      { error: "Missing plan or member count" },
      { status: 400 }
    );
  }

  // Validate plan
  const pricePerMember = plan === "club" ? 5 : plan === "pro" ? 10 : 0;
  if (pricePerMember === 0) {
    return NextResponse.json(
      { error: "Invalid plan for paid subscription" },
      { status: 400 }
    );
  }

  const totalAmount = pricePerMember * memberCount; // dollars
  const totalCents = totalAmount * 100;

  // Check for existing Stripe customer from player subscriptions
  const { data: player } = await supabase
    .from("players")
    .select("id, display_name")
    .eq("user_id", user.id)
    .single();

  if (!player)
    return NextResponse.json({ error: "Player not found" }, { status: 404 });

  // Look for existing club subscription customer
  const { data: existingSub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("player_id", player.id)
    .not("stripe_customer_id", "is", null)
    .limit(1)
    .single();

  let customerId = existingSub?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        player_id: player.id,
        club_id: clubId || "",
        club_name: clubName || "",
        type: "club_subscription",
      },
    });
    customerId = customer.id;
  }

  // Create a Checkout session with a one-time-style annual subscription
  // Using price_data for dynamic per-member pricing
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Lawnbowling ${plan === "pro" ? "Pro" : "Club"} Plan`,
            description: `Annual club subscription for ${memberCount} members at $${pricePerMember}/member/year`,
          },
          unit_amount: totalCents,
          recurring: {
            interval: "year",
          },
        },
        quantity: 1,
      },
    ],
    subscription_data: {
      metadata: {
        player_id: player.id,
        club_id: clubId || "",
        club_name: clubName || "",
        plan,
        member_count: memberCount.toString(),
        type: "club_subscription",
      },
    },
    success_url: `${req.nextUrl.origin}/clubs/dashboard?success=true`,
    cancel_url: `${req.nextUrl.origin}/clubs/onboard?cancelled=true&plan=${plan}&members=${memberCount}`,
    metadata: {
      player_id: player.id,
      club_id: clubId || "",
      plan,
      member_count: memberCount.toString(),
      type: "club_subscription",
    },
  });

  return NextResponse.json({ url: session.url });
}
