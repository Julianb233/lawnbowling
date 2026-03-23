import Stripe from "stripe";

const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();

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

/** Membership tier price IDs ($5/month and $15/year). */
export const MEMBERSHIP_PRICE_IDS: Record<string, string> = {
  monthly: process.env.STRIPE_MEMBERSHIP_MONTHLY_PRICE_ID || "",
  annual: process.env.STRIPE_MEMBERSHIP_ANNUAL_PRICE_ID || "",
};
