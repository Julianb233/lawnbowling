"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  MapPin,
  Phone,
  Mail,
  Users,
  CheckCircle,
  Crown,
  Zap,
  Loader2,
  CreditCard,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Step = "info" | "plan" | "members" | "payment" | "confirmation";

const STEPS: { key: Step; label: string }[] = [
  { key: "info", label: "Club Info" },
  { key: "plan", label: "Choose Plan" },
  { key: "members", label: "Members" },
  { key: "payment", label: "Payment" },
  { key: "confirmation", label: "Done" },
];

const PLANS = [
  {
    id: "free",
    name: "Free",
    pricePerMember: 0,
    description: "Up to 20 members, basic check-in + draw generation",
    icon: <Zap className="h-6 w-6" />,
    features: [
      "Up to 20 members",
      "Basic check-in",
      "Draw generation",
      "Score entry",
    ],
  },
  {
    id: "club",
    name: "Club",
    pricePerMember: 5,
    description: "Full features: roster, scoring, history, draw balancing",
    icon: <Crown className="h-6 w-6" />,
    popular: true,
    features: [
      "Unlimited members",
      "Full member roster",
      "Skill-balanced draws",
      "Match history & stats",
      "Tournament management",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    pricePerMember: 10,
    description:
      "Everything + TV scoreboard, push notifications, insurance, priority support",
    icon: <Building2 className="h-6 w-6" />,
    features: [
      "Everything in Club",
      "TV scoreboard mode",
      "Push notifications",
      "Insurance integration",
      "Priority support",
    ],
  },
];

const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
  { code: "DC", name: "Washington DC" },
];

function getRegion(stateCode: string): string {
  const west = [
    "AK",
    "AZ",
    "CA",
    "CO",
    "HI",
    "ID",
    "MT",
    "NM",
    "NV",
    "OR",
    "UT",
    "WA",
    "WY",
  ];
  const south = [
    "AL",
    "AR",
    "FL",
    "GA",
    "KY",
    "LA",
    "MS",
    "NC",
    "OK",
    "SC",
    "TN",
    "TX",
  ];
  const midwest = [
    "IA",
    "IL",
    "IN",
    "KS",
    "MI",
    "MN",
    "MO",
    "ND",
    "NE",
    "OH",
    "SD",
    "WI",
  ];
  if (west.includes(stateCode)) return "west";
  if (south.includes(stateCode)) return "south";
  if (midwest.includes(stateCode)) return "midwest";
  return "east";
}

export default function ClubOnboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1B5E20]" />
        </div>
      }
    >
      <ClubOnboardContent />
    </Suspense>
  );
}

function ClubOnboardContent() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("info");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createdClubId, setCreatedClubId] = useState<string | null>(null);

  // Club info
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [numRinks, setNumRinks] = useState("2");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // Plan selection
  const [selectedPlan, setSelectedPlan] = useState(
    searchParams?.get("plan") || "club"
  );

  // Member estimate
  const [memberEstimate, setMemberEstimate] = useState(
    Number(searchParams?.get("members")) || 100
  );

  // Payment processing
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
    });
  }, []);

  // Handle returning from cancelled checkout
  useEffect(() => {
    if (searchParams?.get("cancelled") === "true") {
      setStep("payment");
      setError("Checkout was cancelled. No charges were made. Try again when ready.");
    }
  }, [searchParams]);

  const currentIndex = STEPS.findIndex((s) => s.key === step);

  function goNext() {
    if (currentIndex < STEPS.length - 1) {
      setStep(STEPS[currentIndex + 1].key);
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      setStep(STEPS[currentIndex - 1].key);
      setError("");
    }
  }

  const selectedPlanData = PLANS.find((p) => p.id === selectedPlan)!;
  const annualTotal =
    selectedPlan === "free"
      ? 0
      : selectedPlanData.pricePerMember * memberEstimate;

  async function handleRegisterClub() {
    setSubmitting(true);
    setError("");

    const state = US_STATES.find((s) => s.code === stateCode);

    try {
      const res = await fetch("/api/clubs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          city,
          state: state?.name || "",
          state_code: stateCode,
          region: getRegion(stateCode),
          rinks: numRinks ? parseInt(numRinks) : 2,
          phone: contactPhone || null,
          email: contactEmail || null,
          member_count: memberEstimate,
          status: "unverified",
          description: null,
          website: null,
          address: null,
          greens: null,
          surface_type: "unknown",
          activities: [],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to register club");
        setSubmitting(false);
        return;
      }

      if (data.club?.id) {
        setCreatedClubId(data.club.id);
        // Submit a claim
        await fetch("/api/clubs/claims", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            club_id: data.club.id,
            role_at_club: "Club Manager",
            message: `Registered through onboarding flow. Plan: ${selectedPlan}, Est. members: ${memberEstimate}`,
          }),
        });
      }

      setSubmitting(false);
      return data.club?.id || null;
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
      return null;
    }
  }

  async function handlePaymentStep() {
    setError("");

    if (selectedPlan === "free") {
      // Free plan: register club and go to confirmation
      const clubId = await handleRegisterClub();
      if (clubId) {
        setStep("confirmation");
      }
      return;
    }

    // Paid plan: register club first, then redirect to Stripe
    setProcessingPayment(true);
    const clubId = createdClubId || (await handleRegisterClub());
    if (!clubId) {
      setProcessingPayment(false);
      return;
    }

    try {
      const res = await fetch("/api/clubs/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          memberCount: memberEstimate,
          clubName: name,
          clubId,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Failed to start checkout");
        setProcessingPayment(false);
      }
    } catch {
      setError("Network error. Please try again.");
      setProcessingPayment(false);
    }
  }

  // Step 5: Confirmation
  if (step === "confirmation") {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-zinc-200 bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1B5E20]/10">
            <CheckCircle className="h-8 w-8 text-[#1B5E20]" />
          </div>
          <h1 className="text-xl font-bold text-zinc-900">
            Welcome to Lawnbowling!
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Your club <strong>{name}</strong> has been registered
            {selectedPlan !== "free"
              ? ` on the ${selectedPlanData.name} plan`
              : " on the Free plan"}
            .
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/clubs/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B5E20] px-6 py-3 text-sm font-bold text-white hover:bg-[#2E7D32] transition-colors"
            >
              <Users className="h-4 w-4" />
              Add Your First Members
            </Link>
            <Link
              href="/clubs"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-6 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              View Club Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <Link
            href="/clubs"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Club Directory
          </Link>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-zinc-900">
            Set Up Your Club
          </h1>
          <p className="text-sm text-zinc-500">
            Get your club on Lawnbowling in minutes
          </p>

          {/* Step indicator */}
          <div className="mt-4 flex gap-2">
            {STEPS.filter((s) => s.key !== "confirmation").map((s, i) => (
              <div
                key={s.key}
                className={cn(
                  "flex-1 rounded-full py-1.5 text-xs font-medium text-center transition-colors",
                  i <= currentIndex
                    ? "bg-[#1B5E20] text-white"
                    : "bg-zinc-100 text-zinc-400"
                )}
              >
                {s.label}
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {isLoggedIn === false && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
            <p className="text-sm font-medium text-amber-800">
              You need to be logged in to register a club.
            </p>
            <Link
              href="/login"
              className="mt-3 inline-flex rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-700 transition-colors"
            >
              Log In
            </Link>
          </div>
        )}

        {/* Step 1: Club Info */}
        {step === "info" && (
          <div className="space-y-6">
            <section className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="text-lg font-bold text-zinc-900 mb-4">
                Club Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 mb-1.5">
                    <Building2 className="h-4 w-4 text-zinc-400" />
                    Club Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Springfield Lawn Bowling Club"
                    required
                    className="w-full rounded-xl border border-zinc-200 py-3 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#1B5E20]/50 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 mb-1.5">
                      <MapPin className="h-4 w-4 text-zinc-400" />
                      City *
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. San Francisco"
                      required
                      className="w-full rounded-xl border border-zinc-200 py-3 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#1B5E20]/50 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-zinc-700 mb-1.5 block">
                      State *
                    </label>
                    <select
                      value={stateCode}
                      onChange={(e) => setStateCode(e.target.value)}
                      required
                      className="w-full rounded-xl border border-zinc-200 py-3 px-4 text-sm text-zinc-900 focus:border-[#1B5E20]/50 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
                    >
                      <option value="">Select state...</option>
                      {US_STATES.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-700 mb-1.5 block">
                    Number of Rinks
                  </label>
                  <select
                    value={numRinks}
                    onChange={(e) => setNumRinks(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 py-3 px-4 text-sm text-zinc-900 focus:border-[#1B5E20]/50 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
                  >
                    <option value="2">2 rinks</option>
                    <option value="3">3 rinks</option>
                    <option value="4">4 rinks</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="text-lg font-bold text-zinc-900 mb-4">
                Contact Person
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-zinc-700 mb-1.5 block">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="John Smith"
                    className="w-full rounded-xl border border-zinc-200 py-3 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#1B5E20]/50 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 mb-1.5">
                      <Mail className="h-4 w-4 text-zinc-400" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="info@yourclub.com"
                      className="w-full rounded-xl border border-zinc-200 py-3 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#1B5E20]/50 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 mb-1.5">
                      <Phone className="h-4 w-4 text-zinc-400" />
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                      className="w-full rounded-xl border border-zinc-200 py-3 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#1B5E20]/50 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
                    />
                  </div>
                </div>
              </div>
            </section>

            <div className="flex justify-end">
              <button
                onClick={goNext}
                disabled={!name || !city || !stateCode}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1B5E20] px-6 py-3 text-sm font-bold text-white hover:bg-[#2E7D32] disabled:opacity-50 transition-colors"
              >
                Next: Choose Plan
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Choose Plan */}
        {step === "plan" && (
          <div className="space-y-6">
            <section className="space-y-4">
              {PLANS.map((plan) => {
                const isSelected = selectedPlan === plan.id;
                return (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={cn(
                      "w-full rounded-2xl border-2 bg-white p-6 text-left transition-all",
                      isSelected
                        ? "border-[#1B5E20] shadow-md"
                        : "border-zinc-200 hover:border-zinc-300"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                          isSelected
                            ? "bg-[#1B5E20]/10 text-[#1B5E20]"
                            : "bg-zinc-100 text-zinc-500"
                        )}
                      >
                        {plan.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-zinc-900">
                            {plan.name}
                          </h3>
                          {"popular" in plan && plan.popular && (
                            <span className="rounded-full bg-[#1B5E20] px-2.5 py-0.5 text-[10px] font-bold text-white uppercase">
                              Popular
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-zinc-500 mt-0.5">
                          {plan.description}
                        </p>
                        <p className="text-xl font-black text-zinc-900 mt-2">
                          {plan.pricePerMember === 0 ? (
                            "Free"
                          ) : (
                            <>
                              ${plan.pricePerMember}
                              <span className="text-sm font-normal text-zinc-500">
                                /member/year
                              </span>
                            </>
                          )}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {plan.features.map((f) => (
                            <span
                              key={f}
                              className="inline-flex items-center gap-1 rounded-full bg-zinc-50 px-2.5 py-1 text-xs text-zinc-600"
                            >
                              <CheckCircle className="h-3 w-3 text-[#1B5E20]" />
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div
                        className={cn(
                          "mt-1 h-5 w-5 shrink-0 rounded-full border-2 transition-colors",
                          isSelected
                            ? "border-[#1B5E20] bg-[#1B5E20]"
                            : "border-zinc-300"
                        )}
                      >
                        {isSelected && (
                          <CheckCircle className="h-full w-full text-white" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </section>

            <div className="flex justify-between">
              <button
                onClick={goPrev}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-6 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                onClick={goNext}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1B5E20] px-6 py-3 text-sm font-bold text-white hover:bg-[#2E7D32] transition-colors"
              >
                Next: Members
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Estimate Members */}
        {step === "members" && (
          <div className="space-y-6">
            <section className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="text-lg font-bold text-zinc-900 mb-2">
                How many members does your club have?
              </h2>
              <p className="text-sm text-zinc-500 mb-6">
                This determines your annual subscription cost. You can update
                this anytime.
              </p>

              <div className="flex items-center justify-center mb-4">
                <div className="text-center">
                  <div className="flex items-center gap-3">
                    <Users className="h-6 w-6 text-[#1B5E20]" />
                    <span className="text-5xl font-black text-zinc-900 tabular-nums">
                      {memberEstimate}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500 mt-1">members</p>
                </div>
              </div>

              <input
                type="range"
                min={20}
                max={500}
                step={5}
                value={memberEstimate}
                onChange={(e) => setMemberEstimate(Number(e.target.value))}
                className="w-full accent-[#1B5E20] h-2 rounded-full"
              />
              <div className="flex justify-between text-xs text-zinc-400 mt-1">
                <span>20</span>
                <span>100</span>
                <span>250</span>
                <span>500</span>
              </div>

              {selectedPlan !== "free" && (
                <div className="mt-8 rounded-xl bg-[#1B5E20]/5 border border-[#1B5E20]/20 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-zinc-700">
                        {selectedPlanData.name} Plan
                      </p>
                      <p className="text-xs text-zinc-500">
                        ${selectedPlanData.pricePerMember}/member x{" "}
                        {memberEstimate} members
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-[#1B5E20]">
                        ${annualTotal.toLocaleString()}
                      </p>
                      <p className="text-xs text-zinc-500">per year</p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-zinc-400">
                    That&apos;s ${selectedPlanData.pricePerMember} per member
                    per year, billed annually
                  </p>
                </div>
              )}

              {selectedPlan === "free" && memberEstimate > 20 && (
                <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm text-amber-800">
                    The Free plan supports up to 20 members. With{" "}
                    {memberEstimate} members, consider upgrading to the{" "}
                    <button
                      onClick={() => {
                        setSelectedPlan("club");
                        setStep("plan");
                      }}
                      className="font-bold underline"
                    >
                      Club plan
                    </button>
                    .
                  </p>
                </div>
              )}
            </section>

            <div className="flex justify-between">
              <button
                onClick={goPrev}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-6 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                onClick={goNext}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1B5E20] px-6 py-3 text-sm font-bold text-white hover:bg-[#2E7D32] transition-colors"
              >
                Next: Payment
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Payment */}
        {step === "payment" && (
          <div className="space-y-6">
            <section className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="text-lg font-bold text-zinc-900 mb-4">
                Review & Confirm
              </h2>

              <div className="space-y-4 divide-y divide-zinc-100">
                <div className="pb-4">
                  <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">
                    Club
                  </p>
                  <p className="text-sm font-bold text-zinc-900">{name}</p>
                  <p className="text-sm text-zinc-500">
                    {city},{" "}
                    {US_STATES.find((s) => s.code === stateCode)?.name ||
                      stateCode}{" "}
                    -- {numRinks} rinks
                  </p>
                </div>

                <div className="pt-4 pb-4">
                  <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">
                    Plan
                  </p>
                  <p className="text-sm font-bold text-zinc-900">
                    {selectedPlanData.name}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {selectedPlan === "free"
                      ? "Free forever, up to 20 members"
                      : `$${selectedPlanData.pricePerMember}/member/year`}
                  </p>
                </div>

                <div className="pt-4 pb-4">
                  <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">
                    Members
                  </p>
                  <p className="text-sm font-bold text-zinc-900">
                    {memberEstimate} estimated members
                  </p>
                </div>

                {selectedPlan !== "free" && (
                  <div className="pt-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-zinc-900">
                        Annual Total
                      </p>
                      <p className="text-2xl font-black text-[#1B5E20]">
                        ${annualTotal.toLocaleString()}/year
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {contactName && (
              <section className="rounded-2xl border border-zinc-200 bg-white p-6">
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">
                  Contact
                </p>
                <p className="text-sm text-zinc-700">
                  {contactName}
                  {contactEmail && ` -- ${contactEmail}`}
                  {contactPhone && ` -- ${contactPhone}`}
                </p>
              </section>
            )}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={goPrev}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-6 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                onClick={handlePaymentStep}
                disabled={
                  submitting ||
                  processingPayment ||
                  !name ||
                  !city ||
                  !stateCode ||
                  isLoggedIn === false
                }
                className="inline-flex items-center gap-2 rounded-xl bg-[#1B5E20] px-8 py-3 text-sm font-bold text-white hover:bg-[#2E7D32] disabled:opacity-50 transition-colors"
              >
                {submitting || processingPayment ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : selectedPlan === "free" ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Register Club
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Pay ${annualTotal.toLocaleString()} & Register
                  </>
                )}
              </button>
            </div>

            {selectedPlan !== "free" && (
              <p className="text-center text-xs text-zinc-400">
                You will be redirected to Stripe for secure payment. 30-day
                money-back guarantee.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
