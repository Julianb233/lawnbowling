"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Crown,
  Loader2,
  Calendar,
  MessageCircle,
  Bell,
  BarChart3,
  Users,
  Headphones,
  X,
  Star,
  Zap,
} from "lucide-react";

type MembershipTier = "free" | "monthly" | "annual";

const FEATURES = [
  { label: "Browse club directory", free: true, paid: true, icon: <Users className="h-5 w-5" /> },
  { label: "Basic player profile", free: true, paid: true, icon: <Star className="h-5 w-5" /> },
  { label: "Current month events", free: true, paid: true, icon: <Calendar className="h-5 w-5" /> },
  { label: "Full event calendar (all months)", free: false, paid: true, icon: <Calendar className="h-5 w-5" /> },
  { label: "Chat access", free: false, paid: true, icon: <MessageCircle className="h-5 w-5" /> },
  { label: "Push notifications", free: false, paid: true, icon: <Bell className="h-5 w-5" /> },
  { label: "Stats tracking", free: false, paid: true, icon: <BarChart3 className="h-5 w-5" /> },
  { label: "Social features", free: false, paid: true, icon: <Users className="h-5 w-5" /> },
  { label: "Priority support", free: false, paid: true, icon: <Headphones className="h-5 w-5" /> },
];

export default function PricingPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentTier, setCurrentTier] = useState<MembershipTier>("free");
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");
  const success = searchParams?.get("success");
  const cancelled = searchParams?.get("cancelled");

  useEffect(() => {
    async function loadMembership() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.membership_tier) setCurrentTier(data.membership_tier);
        }
      } catch {
        // Not logged in — show as free
      } finally {
        setLoading(false);
      }
    }
    loadMembership();
  }, []);

  async function handleCheckout(tier: "monthly" | "annual") {
    setCheckoutLoading(tier);
    try {
      const res = await fetch("/api/membership/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // Silently handle
    } finally {
      setCheckoutLoading(null);
    }
  }

  const isPaid = currentTier === "monthly" || currentTier === "annual";

  return (
    <div className="min-h-screen bg-[#FEFCF9] px-4 py-8 pb-24">
      <div className="mx-auto max-w-5xl">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-1 text-sm text-[#3D5A3E] hover:text-[#0A2E12] min-h-[44px] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Success / Cancelled banners */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl border border-[#1B5E20]/30 bg-[#1B5E20]/10 px-5 py-4 text-base text-[#1B5E20] font-medium"
          >
            Welcome to your membership! Your plan is now active.
          </motion.div>
        )}
        {cancelled && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl border border-[#0A2E12]/10 bg-white px-5 py-4 text-base text-[#3D5A3E]"
          >
            Checkout was cancelled. No charges were made.
          </motion.div>
        )}

        {/* Header */}
        <div className="mb-10 text-center">
          <h1
            className="mb-3 text-4xl font-black tracking-tight text-[#0A2E12] sm:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Simple, Fair Pricing
          </h1>
          <p className="text-lg text-[#3D5A3E] max-w-xl mx-auto">
            Get the most out of your lawn bowling experience with a membership
          </p>
        </div>

        {/* Monthly / Annual Toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center rounded-full border border-[#0A2E12]/10 bg-white p-1 shadow-sm">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${
                billingPeriod === "monthly"
                  ? "bg-[#1B5E20] text-white shadow-md"
                  : "text-[#3D5A3E] hover:text-[#0A2E12]"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("annual")}
              className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${
                billingPeriod === "annual"
                  ? "bg-[#1B5E20] text-white shadow-md"
                  : "text-[#3D5A3E] hover:text-[#0A2E12]"
              }`}
            >
              Annual
              <span className="ml-1.5 inline-flex items-center rounded-full bg-[#B8860B]/20 px-2 py-0.5 text-[10px] font-bold text-[#B8860B]">
                Save 75%
              </span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#1B5E20]" />
          </div>
        ) : (
          <>
            {/* Pricing cards — 3 tier layout */}
            <div className="grid gap-6 md:grid-cols-3 mb-16 max-w-4xl mx-auto">
              {/* Free */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative flex flex-col rounded-2xl border border-[#0A2E12]/10 bg-white p-8"
              >
                <div className="mb-6">
                  <h3
                    className="text-2xl font-bold text-[#0A2E12]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Free
                  </h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span
                      className="text-4xl font-black text-[#0A2E12]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      $0
                    </span>
                    <span className="text-lg text-[#3D5A3E]">/forever</span>
                  </div>
                  <p className="mt-2 text-base text-[#3D5A3E]">
                    Get started with the basics
                  </p>
                </div>

                <ul className="mb-8 flex-1 space-y-3">
                  {FEATURES.filter((f) => f.free).map((feature) => (
                    <li key={feature.label} className="flex items-center gap-3 text-base text-[#3D5A3E]">
                      <Check className="h-5 w-5 shrink-0 text-[#1B5E20]" />
                      {feature.label}
                    </li>
                  ))}
                </ul>

                <button
                  disabled={currentTier === "free"}
                  className={`w-full rounded-full px-6 py-4 text-base font-bold transition-all min-h-[56px] ${
                    currentTier === "free"
                      ? "bg-[#0A2E12]/5 text-[#3D5A3E] cursor-default"
                      : "border-2 border-[#1B5E20] text-[#1B5E20] hover:bg-[#1B5E20] hover:text-white"
                  }`}
                >
                  {currentTier === "free" ? "Current Plan" : "Downgrade"}
                </button>
              </motion.div>

              {/* Club — MOST POPULAR */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative flex flex-col rounded-2xl border-2 border-[#1B5E20] bg-[#1B5E20] p-8 shadow-xl shadow-emerald-500/10"
              >
                {/* Badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-[#B8860B] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-md">
                  <Crown className="h-3.5 w-3.5" />
                  Most Popular
                </div>

                <div className="mb-6">
                  <h3
                    className="text-2xl font-bold text-white"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Club
                  </h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span
                      className="text-4xl font-black text-white"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {billingPeriod === "monthly" ? "$29" : "$15"}
                    </span>
                    <span className="text-lg text-emerald-200">
                      /{billingPeriod === "monthly" ? "mo" : "year"}
                    </span>
                  </div>
                  <p className="mt-2 text-base text-emerald-100/80">
                    {billingPeriod === "annual"
                      ? "Just $1.25/month — best value"
                      : "Full access for your club"}
                  </p>
                </div>

                <ul className="mb-8 flex-1 space-y-3">
                  {FEATURES.filter((f) => f.paid).map((feature) => (
                    <li key={feature.label} className="flex items-center gap-3 text-base text-emerald-100">
                      <Check className="h-5 w-5 shrink-0 text-emerald-300" />
                      {feature.label}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleCheckout(billingPeriod)}
                  disabled={currentTier === billingPeriod || checkoutLoading === billingPeriod}
                  className={`w-full rounded-full px-6 py-4 text-base font-bold transition-all min-h-[56px] ${
                    currentTier === billingPeriod
                      ? "bg-white/20 text-white/80 cursor-default"
                      : "bg-white text-[#1B5E20] hover:bg-[#F0FFF4] shadow-md"
                  }`}
                >
                  {checkoutLoading === billingPeriod ? (
                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                  ) : currentTier === billingPeriod ? (
                    "Current Plan"
                  ) : (
                    "Subscribe"
                  )}
                </button>
              </motion.div>

              {/* Pro */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative flex flex-col rounded-2xl border border-[#0A2E12]/10 bg-white p-8"
              >
                <div className="mb-6">
                  <h3
                    className="text-2xl font-bold text-[#0A2E12]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Pro
                  </h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span
                      className="text-4xl font-black text-[#0A2E12]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {billingPeriod === "monthly" ? "$79" : "$49"}
                    </span>
                    <span className="text-lg text-[#3D5A3E]">
                      /{billingPeriod === "monthly" ? "mo" : "year"}
                    </span>
                  </div>
                  <p className="mt-2 text-base text-[#3D5A3E]">
                    For competitive clubs & leagues
                  </p>
                </div>

                <ul className="mb-8 flex-1 space-y-3">
                  {FEATURES.filter((f) => f.paid).map((feature) => (
                    <li key={feature.label} className="flex items-center gap-3 text-base text-[#3D5A3E]">
                      <Check className="h-5 w-5 shrink-0 text-[#1B5E20]" />
                      {feature.label}
                    </li>
                  ))}
                  <li className="flex items-center gap-3 text-base text-[#3D5A3E]">
                    <Zap className="h-5 w-5 shrink-0 text-[#B8860B]" />
                    Advanced analytics
                  </li>
                </ul>

                <button
                  onClick={() => handleCheckout(billingPeriod)}
                  disabled={checkoutLoading !== null}
                  className="w-full rounded-full px-6 py-4 text-base font-bold transition-all min-h-[56px] border-2 border-[#1B5E20] text-[#1B5E20] hover:bg-[#1B5E20] hover:text-white"
                >
                  Contact Sales
                </button>
              </motion.div>
            </div>

            {/* Feature comparison table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl border border-[#0A2E12]/10 bg-white overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-[#0A2E12]/10">
                <h2
                  className="text-2xl font-bold text-[#0A2E12]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Compare Features
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#0A2E12]/10 bg-[#FEFCF9]">
                      <th className="px-6 py-4 text-base font-bold text-[#0A2E12]">Feature</th>
                      <th className="px-6 py-4 text-center text-base font-bold text-[#3D5A3E]">Free</th>
                      <th className="px-6 py-4 text-center text-base font-bold text-[#1B5E20]">Club</th>
                      <th className="px-6 py-4 text-center text-base font-bold text-[#0A2E12]">Pro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FEATURES.map((feature, i) => (
                      <tr
                        key={feature.label}
                        className={i < FEATURES.length - 1 ? "border-b border-[#0A2E12]/5" : ""}
                      >
                        <td className="px-6 py-4 text-base text-[#3D5A3E]">
                          <span className="flex items-center gap-3">
                            <span className="text-[#1B5E20]">{feature.icon}</span>
                            {feature.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {feature.free ? (
                            <Check className="mx-auto h-5 w-5 text-[#1B5E20]" />
                          ) : (
                            <X className="mx-auto h-5 w-5 text-[#0A2E12]/20" />
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {feature.paid ? (
                            <Check className="mx-auto h-5 w-5 text-[#1B5E20]" />
                          ) : (
                            <X className="mx-auto h-5 w-5 text-[#0A2E12]/20" />
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {feature.paid ? (
                            <Check className="mx-auto h-5 w-5 text-[#1B5E20]" />
                          ) : (
                            <X className="mx-auto h-5 w-5 text-[#0A2E12]/20" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Free tier note */}
            {!isPaid && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-center text-base text-[#3D5A3E]"
              >
                Currently on the <span className="font-semibold text-[#0A2E12]">Free</span> plan.{" "}
                <Link href="/clubs" className="text-[#1B5E20] underline hover:text-[#145218]">
                  Browse clubs
                </Link>{" "}
                or upgrade above to unlock everything.
              </motion.p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
