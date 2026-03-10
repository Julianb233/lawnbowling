import Stripe from "stripe";

const stripeKey = process.env.STRIPE_SECRET_KEY;

export const stripe = stripeKey
  ? new Stripe(stripeKey, {
      apiVersion: "2026-02-25.clover",
      typescript: true,
    })
  : null;

export const PRICE_IDS: Record<string, string> = {
  premium: process.env.STRIPE_PREMIUM_PRICE_ID || "",
  venue_owner: process.env.STRIPE_VENUE_OWNER_PRICE_ID || "",
};
