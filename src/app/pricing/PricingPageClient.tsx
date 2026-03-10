"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { PricingTable } from "@/components/payments/PricingTable";
import type { SubscriptionPlan } from "@/lib/types";

export default function PricingPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan>("free");
  const [loading, setLoading] = useState(true);
  const success = searchParams.get("success");
  const cancelled = searchParams.get("cancelled");

  useEffect(() => {
    async function loadSubscription() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.subscription?.plan) setCurrentPlan(data.subscription.plan);
        }
      } catch {
        // Not logged in, show free
      } finally {
        setLoading(false);
      }
    }
    loadSubscription();
  }, []);

  async function handleManage() {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.href = url;
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-8 pb-24">
      <div className="mx-auto max-w-4xl">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-1 text-sm text-white/60 hover:text-white min-h-[44px]"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400"
          >
            Welcome to your new plan! Your subscription is now active.
          </motion.div>
        )}

        {cancelled && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-sm text-zinc-400"
          >
            Checkout was cancelled. No charges were made.
          </motion.div>
        )}

        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-black text-zinc-100">Choose Your Plan</h1>
          <p className="text-zinc-500">Unlock premium features for players and venues</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-green-500" />
          </div>
        ) : (
          <>
            <PricingTable currentPlan={currentPlan} />

            {currentPlan !== "free" && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleManage}
                  className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200"
                >
                  <ExternalLink className="h-4 w-4" />
                  Manage Subscription
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
