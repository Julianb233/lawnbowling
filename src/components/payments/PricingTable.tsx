"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, Crown, Building2, Zap } from "lucide-react";
import { PRICING_TIERS, type SubscriptionPlan } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PricingTableProps {
  currentPlan?: SubscriptionPlan;
}

const PLAN_ICONS: Record<string, React.ReactNode> = {
  free: <Zap className="h-6 w-6" />,
  premium: <Crown className="h-6 w-6" />,
  venue_owner: <Building2 className="h-6 w-6" />,
};

export function PricingTable({ currentPlan = "free" }: PricingTableProps) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSubscribe(plan: string) {
    if (plan === "free" || plan === currentPlan) return;
    setLoading(plan);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      // Handle error silently
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {PRICING_TIERS.map((tier, i) => {
        const isCurrentPlan = tier.plan === currentPlan;
        const isPopular = "popular" in tier && tier.popular;

        return (
          <motion.div
            key={tier.plan}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "relative flex flex-col rounded-2xl p-6 glass",
              isPopular && "ring-2 ring-green-500/50 scale-[1.02]"
            )}
          >
            {isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-green-500 px-4 py-1 text-xs font-bold text-white">
                Most Popular
              </div>
            )}

            <div className="mb-4 flex items-center gap-3">
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl",
                isPopular ? "bg-green-500/20 text-green-400" : "bg-zinc-100 text-zinc-400"
              )}>
                {PLAN_ICONS[tier.plan]}
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900">{tier.name}</h3>
                <p className="text-sm text-zinc-500">
                  {tier.price === 0 ? "Free forever" : `$${(tier.price / 100).toFixed(2)}/mo`}
                </p>
              </div>
            </div>

            <div className="mb-6 flex-1">
              <ul className="space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-zinc-400">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleSubscribe(tier.plan)}
              disabled={isCurrentPlan || loading === tier.plan}
              className={cn(
                "w-full rounded-xl px-4 py-3 text-sm font-bold transition-all min-h-[48px]",
                isCurrentPlan
                  ? "bg-zinc-100 text-zinc-500 cursor-default"
                  : isPopular
                    ? "bg-gradient-to-r from-green-500 to-[#1B5E20] text-white hover:shadow-lg hover:shadow-green-500/25"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-100"
              )}
            >
              {loading === tier.plan ? (
                <Loader2 className="mx-auto h-5 w-5 animate-spin" />
              ) : isCurrentPlan ? (
                "Current Plan"
              ) : (
                tier.cta
              )}
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}
