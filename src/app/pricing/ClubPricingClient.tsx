"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Users,
  Tv,
  Bell,
  Shield,
  Trophy,
  BarChart3,
  Zap,
  Crown,
  Building2,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CLUB_TIERS = [
  {
    id: "free",
    name: "Free",
    pricePerMember: 0,
    memberLimit: 20,
    icon: <Zap className="h-6 w-6" />,
    cta: "Get Started Free",
    description: "Perfect for small clubs just getting started",
    features: [
      "Up to 20 members",
      "Basic check-in system",
      "Draw generation",
      "Club directory listing",
      "Score entry",
    ],
    excluded: [
      "Member roster management",
      "Skill-balanced draws",
      "Match history & analytics",
      "TV scoreboard mode",
      "Push notifications",
      "Priority support",
    ],
  },
  {
    id: "club",
    name: "Club",
    pricePerMember: 5,
    memberLimit: null,
    icon: <Crown className="h-6 w-6" />,
    cta: "Start Club Plan",
    popular: true,
    description: "Full-featured club management",
    features: [
      "Unlimited members",
      "Full member roster",
      "Skill-balanced draw generation",
      "Match history & statistics",
      "Tournament management",
      "Round-robin brackets",
      "Score tracking & leaderboards",
      "Club admin dashboard",
      "Email support",
    ],
    excluded: [
      "TV scoreboard mode",
      "Push notifications",
      "Insurance integration",
      "Priority support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    pricePerMember: 10,
    memberLimit: null,
    icon: <Building2 className="h-6 w-6" />,
    cta: "Go Pro",
    description: "Everything your club needs and more",
    features: [
      "Everything in Club, plus:",
      "TV scoreboard for clubhouse display",
      "Push notifications for members",
      "Insurance integration & tracking",
      "Advanced analytics & reports",
      "Custom branding",
      "API access",
      "Priority support",
      "Dedicated account manager (200+ members)",
    ],
    excluded: [],
  },
];

const FAQ_ITEMS = [
  {
    q: "How does annual billing work?",
    a: "You are billed once per year based on your member count at the time of renewal. This matches the typical club dues cycle, so you can include the Lawnbowling fee in your annual membership dues.",
  },
  {
    q: "What if our member count changes during the year?",
    a: "You can add members anytime at no extra charge until your next renewal. At renewal, your bill adjusts to your current member count. If you grow significantly mid-year, we will work with you on fair prorating.",
  },
  {
    q: "Can we try the paid features before committing?",
    a: "Absolutely. Start with the Free tier (up to 20 members) to experience the core features. When you are ready, upgrade and we offer a 30-day money-back guarantee on all paid plans.",
  },
  {
    q: "How do clubs typically pay?",
    a: "Most clubs pay via credit card through our secure Stripe checkout. The club treasurer or secretary typically handles this as part of annual budget planning. We provide invoices for your records.",
  },
  {
    q: "Is there a discount for larger clubs?",
    a: "Yes. Clubs with 300+ members can contact us for custom pricing. We also offer multi-club discounts for organizations managing several clubs.",
  },
  {
    q: "What happens if we cancel?",
    a: "Your data is preserved for 90 days after cancellation. You can downgrade to the Free tier at any time and keep your first 20 members active. There are no cancellation fees.",
  },
  {
    q: "Do individual players pay anything?",
    a: "No. The Lawnbowling app is free for individual players. Only clubs pay for premium features. Players benefit from better tournament management, scoring, and draw generation through their club subscription.",
  },
];

export default function ClubPricingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [memberCount, setMemberCount] = useState(100);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const [loading, setLoading] = useState(true);
  const success = searchParams?.get("success");
  const cancelled = searchParams?.get("cancelled");

  useEffect(() => {
    async function loadSubscription() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.subscription?.plan) setCurrentPlan(data.subscription.plan);
        }
      } catch {
        // Not logged in
      } finally {
        setLoading(false);
      }
    }
    loadSubscription();
  }, []);

  const clubPrice = useMemo(() => memberCount * 5, [memberCount]);
  const proPrice = useMemo(() => memberCount * 10, [memberCount]);

  return (
    <div className="min-h-screen bg-[#FEFCF9] px-4 py-8 pb-24">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 min-h-[44px]"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl border border-green-500/30 bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            Welcome to your new plan! Your club subscription is now active.
          </motion.div>
        )}

        {cancelled && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400"
          >
            Checkout was cancelled. No charges were made.
          </motion.div>
        )}

        {/* Hero */}
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1B5E20]/10 px-3 py-1 text-xs font-semibold text-[#1B5E20] mb-4">
              <Trophy className="h-3.5 w-3.5" />
              Club Pricing
            </span>
            <h1 className="text-4xl font-black text-zinc-900 sm:text-5xl">
              Pricing that scales
              <br />
              <span className="text-[#1B5E20]">with your club</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-500 dark:text-zinc-400">
              Pay per member, per year. No surprises. Include it in your annual
              dues and give every member a better bowling experience.
            </p>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#1B5E20]" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3 mb-16">
            {CLUB_TIERS.map((tier, i) => {
              const isPopular = "popular" in tier && tier.popular;
              const isCurrent = tier.id === currentPlan;
              const annualPrice =
                tier.pricePerMember === 0
                  ? "Free"
                  : `$${(tier.pricePerMember * memberCount).toLocaleString()}`;

              return (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    "relative flex flex-col rounded-2xl border bg-white dark:bg-[#1a3d28] p-6 shadow-sm",
                    isPopular
                      ? "border-[#1B5E20] ring-2 ring-[#1B5E20]/20 scale-[1.02]"
                      : "border-zinc-200"
                  )}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#1B5E20] px-4 py-1 text-xs font-bold text-white">
                      Most Popular
                    </div>
                  )}

                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl",
                        isPopular
                          ? "bg-[#1B5E20]/10 text-[#1B5E20]"
                          : "bg-zinc-100 text-zinc-500 dark:text-zinc-400"
                      )}
                    >
                      {tier.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        {tier.name}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {tier.description}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    {tier.pricePerMember === 0 ? (
                      <div>
                        <span className="text-3xl font-black text-zinc-900 dark:text-zinc-100">
                          $0
                        </span>
                        <span className="text-sm text-zinc-500 ml-1">
                          forever
                        </span>
                        <p className="text-xs text-zinc-400 mt-1">
                          Up to {tier.memberLimit} members
                        </p>
                      </div>
                    ) : (
                      <div>
                        <span className="text-3xl font-black text-zinc-900 dark:text-zinc-100">
                          ${tier.pricePerMember}
                        </span>
                        <span className="text-sm text-zinc-500 ml-1">
                          /member/year
                        </span>
                        <p className="text-xs text-zinc-400 mt-1">
                          {annualPrice}/year for {memberCount} members
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="mb-6 flex-1">
                    <ul className="space-y-2.5">
                      {tier.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-sm text-zinc-700"
                        >
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#1B5E20]" />
                          {feature}
                        </li>
                      ))}
                      {tier.excluded.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-sm text-zinc-300 line-through"
                        >
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-zinc-200" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {tier.id === "free" ? (
                    <Link
                      href="/clubs/onboard"
                      className={cn(
                        "block w-full rounded-xl px-4 py-3 text-sm font-bold text-center transition-all min-h-[48px]",
                        isCurrent
                          ? "bg-zinc-100 text-zinc-500 cursor-default"
                          : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                      )}
                    >
                      {isCurrent ? "Current Plan" : tier.cta}
                    </Link>
                  ) : (
                    <Link
                      href={`/clubs/onboard?plan=${tier.id}&members=${memberCount}`}
                      className={cn(
                        "block w-full rounded-xl px-4 py-3 text-sm font-bold text-center transition-all min-h-[48px]",
                        isCurrent
                          ? "bg-zinc-100 text-zinc-500 cursor-default"
                          : isPopular
                            ? "bg-[#1B5E20] text-white hover:bg-[#2E7D32] shadow-lg shadow-[#1B5E20]/25"
                            : "bg-zinc-900 text-white hover:bg-zinc-800"
                      )}
                    >
                      {isCurrent ? "Current Plan" : tier.cta}
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Calculate Your Price Slider */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16 rounded-2xl border border-zinc-200 bg-zinc-50 p-8"
        >
          <h2 className="text-2xl font-black text-zinc-900 text-center mb-2">
            Calculate Your Price
          </h2>
          <p className="text-center text-sm text-zinc-500 mb-8">
            Drag the slider to see what your club would pay annually
          </p>

          <div className="mx-auto max-w-lg">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-zinc-700">
                Club Members
              </label>
              <span className="text-lg font-black text-zinc-900 tabular-nums">
                {memberCount}
              </span>
            </div>
            <input
              type="range"
              min={20}
              max={500}
              step={10}
              value={memberCount}
              onChange={(e) => setMemberCount(Number(e.target.value))}
              className="w-full accent-[#1B5E20] h-2 rounded-full"
            />
            <div className="flex justify-between text-xs text-zinc-400 mt-1">
              <span>20</span>
              <span>500</span>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 p-4">
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Free
                </p>
                <p className="mt-1 text-2xl font-black text-zinc-900 dark:text-zinc-100">$0</p>
                <p className="text-xs text-zinc-400">up to 20 members</p>
              </div>
              <div className="rounded-xl border-2 border-[#1B5E20] bg-white dark:bg-[#1a3d28] p-4 shadow-sm">
                <p className="text-xs font-medium text-[#1B5E20] uppercase tracking-wider">
                  Club
                </p>
                <p className="mt-1 text-2xl font-black text-[#1B5E20]">
                  ${clubPrice.toLocaleString()}
                </p>
                <p className="text-xs text-zinc-400">/year</p>
              </div>
              <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 p-4">
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Pro
                </p>
                <p className="mt-1 text-2xl font-black text-zinc-900 dark:text-zinc-100">
                  ${proPrice.toLocaleString()}
                </p>
                <p className="text-xs text-zinc-400">/year</p>
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-zinc-400">
              That&apos;s just ${(clubPrice / memberCount).toFixed(2)} per
              member on the Club plan -- less than a cup of coffee
            </p>
          </div>
        </motion.section>

        {/* Feature Highlights */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-black text-zinc-900 text-center mb-8">
            What Clubs Get
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <Users className="h-6 w-6" />,
                title: "Member Roster",
                desc: "Manage your full membership list with skill levels, contact info, and activity tracking.",
              },
              {
                icon: <Trophy className="h-6 w-6" />,
                title: "Tournament Engine",
                desc: "Run round-robin tournaments with automatic draw generation balanced by skill level.",
              },
              {
                icon: <BarChart3 className="h-6 w-6" />,
                title: "Stats & History",
                desc: "Track every game, end, and score. See who is improving and who is on a winning streak.",
              },
              {
                icon: <Tv className="h-6 w-6" />,
                title: "TV Scoreboard",
                desc: "Display live scores on your clubhouse TV. Beautiful, auto-updating scoreboard mode.",
              },
              {
                icon: <Bell className="h-6 w-6" />,
                title: "Push Notifications",
                desc: "Notify members about upcoming games, draw results, and tournament updates.",
              },
              {
                icon: <Shield className="h-6 w-6" />,
                title: "Insurance Tracking",
                desc: "Track member insurance status and integrate with your club coverage requirements.",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 p-6"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B5E20]/10 text-[#1B5E20]">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{feature.title}</h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* FAQ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-black text-zinc-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="mx-auto max-w-2xl space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-zinc-900 min-h-[48px]"
                >
                  {item.q}
                  {openFaq === i ? (
                    <ChevronUp className="h-4 w-4 shrink-0 text-zinc-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="border-t border-zinc-100 px-5 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl bg-[#1B5E20] p-8 sm:p-12 text-center"
        >
          <h2 className="text-2xl font-black text-white sm:text-3xl">
            Ready to modernize your club?
          </h2>
          <p className="mt-3 text-green-100 max-w-lg mx-auto">
            Join hundreds of lawn bowling clubs already using Lawnbowling to
            manage tournaments, track scores, and keep members engaged.
          </p>
          <Link
            href="/clubs/onboard"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-[#1B5E20] hover:bg-green-50 transition-colors"
          >
            Get Started Free
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
