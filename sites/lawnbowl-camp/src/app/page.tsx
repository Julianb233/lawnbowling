"use client";

import { useState } from "react";
import {
  Shield,
  CheckCircle,
  ChevronDown,
  Users,
  Building2,
  Ambulance,
  Heart,
  DollarSign,
  Phone,
  Mail,
  ArrowRight,
  Target,
  Star,
} from "lucide-react";

const TIERS = [
  {
    name: "Basic",
    price: "$3",
    period: "per player / session",
    description: "Essential coverage for social bowlers and visitors",
    features: [
      "Activity injury medical coverage",
      "Emergency transport (ambulance)",
      "On-green injury protection",
      "Covers falls, sprains, and strains",
    ],
    bg: "bg-white",
    border: "border-zinc-200",
    accent: "text-zinc-900",
    badge: null,
  },
  {
    name: "Standard",
    price: "$8",
    period: "per player / session",
    description: "Complete protection for regular club members",
    features: [
      "Everything in Basic, plus:",
      "Per-participant liability coverage",
      "ActiveGuard AD&D protection",
      "Bowl-strike injury claims",
      "Coverage at any participating venue",
    ],
    bg: "bg-emerald-900",
    border: "border-emerald-700",
    accent: "text-white",
    badge: "Most Popular",
  },
  {
    name: "Premium",
    price: "$15",
    period: "per player / session",
    description: "Full coverage for tournament and traveling competitors",
    features: [
      "Everything in Standard, plus:",
      "Enhanced medical limits",
      "Equipment damage protection",
      "Bowls, bags, and shoes covered",
      "Away match and tournament coverage",
    ],
    bg: "bg-white",
    border: "border-zinc-200",
    accent: "text-zinc-900",
    badge: "Best Value",
  },
];

const BULK_TIERS = [
  {
    name: "Club Starter",
    members: "Up to 50 members",
    price: "$149",
    period: "per month",
    features: [
      "Standard coverage for all members",
      "Unlimited social bowls sessions",
      "Monthly reporting dashboard",
      "Email support",
    ],
  },
  {
    name: "Club Pro",
    members: "Up to 150 members",
    price: "$349",
    period: "per month",
    features: [
      "Premium coverage for all members",
      "Tournament and away match coverage",
      "Equipment protection included",
      "Priority support",
      "Custom coverage certificates",
    ],
  },
  {
    name: "Enterprise",
    members: "Unlimited members",
    price: "Custom",
    period: "contact us",
    features: [
      "Tailored coverage for large clubs",
      "Multi-venue support",
      "Dedicated account manager",
      "API integration available",
      "Custom claims process",
    ],
  },
];

const FAQ = [
  {
    q: "How does per-session coverage work?",
    a: "When players check in at a participating venue through the Lawnbowling app, they can opt into insurance for that session. Coverage begins at check-in and ends when the session closes. No forms, no annual commitment.",
  },
  {
    q: "What injuries are covered?",
    a: "Our policies cover common lawn bowling injuries including falls, sprains, strains, bowl-strike injuries, sunburn requiring medical attention, and more. The Premium tier also covers equipment damage.",
  },
  {
    q: "Is this real insurance?",
    a: "Yes. Our per-session policies are underwritten by A-rated carriers. You receive a digital certificate of coverage for every session.",
  },
  {
    q: "Can our club get bulk coverage?",
    a: "Absolutely. Club-wide plans cover all members automatically at a significant discount. Contact us for a custom quote.",
  },
  {
    q: "What about tournaments?",
    a: "Standard and Premium tiers cover tournament play. Premium also covers away matches and travel to competitions at other venues.",
  },
  {
    q: "How do I file a claim?",
    a: "Claims can be filed through the Lawnbowling app or by contacting our claims team directly. Most claims are processed within 5 business days.",
  },
];

export default function LawnBowlCampPage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <Hero />
      <Stats />
      <HowItWorks />
      <PricingSection />
      <BulkSection />
      <FAQSection />
      <QuoteForm />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Shield className="h-7 w-7 text-emerald-700" />
          <span className="text-lg font-black tracking-tight text-zinc-900">
            LawnBowl<span className="text-emerald-700">.camp</span>
          </span>
        </div>
        <div className="hidden items-center gap-8 text-sm font-medium text-zinc-600 md:flex">
          <a href="#pricing" className="hover:text-zinc-900 transition-colors">
            Pricing
          </a>
          <a href="#clubs" className="hover:text-zinc-900 transition-colors">
            For Clubs
          </a>
          <a href="#faq" className="hover:text-zinc-900 transition-colors">
            FAQ
          </a>
          <a
            href="#quote"
            className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 transition-colors"
          >
            Get a Quote
          </a>
        </div>
        <a
          href="#quote"
          className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800 transition-colors md:hidden"
        >
          Get a Quote
        </a>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-white px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-800">
          <Shield className="h-4 w-4" />
          Co-branded with DEI &amp; Lawnbowling
        </div>
        <h1 className="text-4xl font-black tracking-tight text-zinc-900 sm:text-6xl">
          Per-Session Insurance
          <br />
          <span className="text-emerald-700">for Lawn Bowlers</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-500 leading-relaxed">
          The only insurance designed for lawn bowling. Coverage starts when you
          check in, ends when you leave. No forms. No annual commitment.
          From <strong className="text-zinc-900">$3 per session</strong>.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-8 py-4 text-base font-bold text-white hover:bg-emerald-800 transition-colors"
          >
            View Plans
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#quote"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-8 py-4 text-base font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            Get a Club Quote
          </a>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { value: "$3", label: "Starting price per session", icon: DollarSign },
    { value: "30s", label: "To opt in at check-in", icon: Target },
    { value: "5 days", label: "Average claim processing", icon: Heart },
    { value: "A-Rated", label: "Insurance carrier backing", icon: Star },
  ];

  return (
    <section className="border-y border-zinc-100 bg-zinc-50 px-6 py-12">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <s.icon className="mx-auto mb-2 h-6 w-6 text-emerald-700" />
            <p className="text-2xl font-black text-zinc-900">{s.value}</p>
            <p className="mt-1 text-sm text-zinc-500">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: Users,
      title: "Check In",
      description:
        "Players check in at a participating lawn bowls venue through the Lawnbowling app.",
    },
    {
      icon: Shield,
      title: "Choose Coverage",
      description:
        "Select your coverage tier. Basic, Standard, or Premium. One tap.",
    },
    {
      icon: CheckCircle,
      title: "You're Covered",
      description:
        "Insurance is active for your session. Digital certificate available instantly.",
    },
    {
      icon: Ambulance,
      title: "File a Claim",
      description:
        "If something happens, file a claim through the app. Most processed in 5 days.",
    },
  ];

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="text-3xl font-black tracking-tight text-zinc-900">
            How It Works
          </h2>
          <p className="mt-3 text-base text-zinc-500">
            Insurance that fits how lawn bowlers actually play
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.title} className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
                <step.icon className="h-6 w-6 text-emerald-700" />
              </div>
              <div className="mt-1 text-sm font-bold text-emerald-700">
                Step {i + 1}
              </div>
              <h3 className="mt-2 text-lg font-bold text-zinc-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="bg-zinc-50 px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="text-3xl font-black tracking-tight text-zinc-900">
            Per-Session Pricing
          </h2>
          <p className="mt-3 text-base text-zinc-500">
            Pay only when you play. No annual fees. No hidden costs.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl border ${tier.border} ${tier.bg} p-6 shadow-sm`}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
                    {tier.badge}
                  </span>
                </div>
              )}
              <h3
                className={`text-xl font-black ${tier.accent}`}
              >
                {tier.name}
              </h3>
              <div className="mt-4">
                <span
                  className={`text-4xl font-black ${tier.accent}`}
                >
                  {tier.price}
                </span>
                <span
                  className={`text-sm ${tier.bg === "bg-emerald-900" ? "text-emerald-200" : "text-zinc-500"}`}
                >
                  {" "}
                  {tier.period}
                </span>
              </div>
              <p
                className={`mt-2 text-sm ${tier.bg === "bg-emerald-900" ? "text-emerald-200" : "text-zinc-500"}`}
              >
                {tier.description}
              </p>
              <ul className="mt-6 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <CheckCircle
                      className={`mt-0.5 h-4 w-4 shrink-0 ${tier.bg === "bg-emerald-900" ? "text-emerald-400" : "text-emerald-600"}`}
                    />
                    <span
                      className={`text-sm ${tier.bg === "bg-emerald-900" ? "text-emerald-100" : "text-zinc-700"}`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <a
                href="#quote"
                className={`mt-6 block w-full rounded-xl py-3 text-center text-sm font-bold transition-colors ${
                  tier.bg === "bg-emerald-900"
                    ? "bg-white text-emerald-900 hover:bg-emerald-50"
                    : "bg-emerald-700 text-white hover:bg-emerald-800"
                }`}
              >
                Get Started
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BulkSection() {
  return (
    <section id="clubs" className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-800">
            <Building2 className="h-4 w-4" />
            For Clubs
          </div>
          <h2 className="text-3xl font-black tracking-tight text-zinc-900">
            Club-Wide Coverage
          </h2>
          <p className="mt-3 text-base text-zinc-500">
            Cover all your members automatically with bulk plans
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {BULK_TIERS.map((tier) => (
            <div
              key={tier.name}
              className="rounded-2xl border border-zinc-200 bg-white p-6"
            >
              <h3 className="text-lg font-bold text-zinc-900">{tier.name}</h3>
              <p className="mt-1 text-sm text-zinc-500">{tier.members}</p>
              <div className="mt-4">
                <span className="text-3xl font-black text-zinc-900">
                  {tier.price}
                </span>
                <span className="text-sm text-zinc-500"> {tier.period}</span>
              </div>
              <ul className="mt-6 space-y-2">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span className="text-sm text-zinc-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#quote"
                className="mt-6 block w-full rounded-xl border border-zinc-200 py-3 text-center text-sm font-bold text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                {tier.price === "Custom" ? "Contact Us" : "Get a Quote"}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-zinc-50 px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <h2 className="text-3xl font-black tracking-tight text-zinc-900">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="mt-10 space-y-3">
          {FAQ.map((item, i) => (
            <div
              key={i}
              className="rounded-2xl border border-zinc-200 bg-white"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between px-6 py-4 text-left"
              >
                <span className="text-sm font-bold text-zinc-900">
                  {item.q}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${openIndex === i ? "rotate-180" : ""}`}
                />
              </button>
              {openIndex === i && (
                <div className="border-t border-zinc-100 px-6 pb-4 pt-3">
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    {item.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function QuoteForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <section id="quote" className="px-6 py-20">
        <div className="mx-auto max-w-xl rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-emerald-600" />
          <h3 className="mt-4 text-xl font-bold text-zinc-900">
            Quote Request Received
          </h3>
          <p className="mt-2 text-sm text-zinc-600">
            We will get back to you within 1-2 business days with a custom quote
            for your club.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="quote" className="px-6 py-20">
      <div className="mx-auto max-w-xl">
        <div className="text-center">
          <h2 className="text-3xl font-black tracking-tight text-zinc-900">
            Get a Quote
          </h2>
          <p className="mt-3 text-base text-zinc-500">
            Tell us about your club and we will send you a custom quote
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
          className="mt-8 space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Your Name *
              </label>
              <input
                type="text"
                required
                placeholder="John Smith"
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Email *
              </label>
              <input
                type="email"
                required
                placeholder="john@example.com"
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              Club Name *
            </label>
            <input
              type="text"
              required
              placeholder="Springfield Lawn Bowling Club"
              className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Number of Members
              </label>
              <input
                type="number"
                placeholder="50"
                min="1"
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Coverage Interest
              </label>
              <select className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                <option value="">Select...</option>
                <option value="per-session">Per-Session (individuals)</option>
                <option value="club-starter">Club Starter (up to 50)</option>
                <option value="club-pro">Club Pro (up to 150)</option>
                <option value="enterprise">Enterprise (unlimited)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              Additional Details
            </label>
            <textarea
              rows={3}
              placeholder="Tell us about your club's needs..."
              className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-700 py-3.5 text-sm font-bold text-white hover:bg-emerald-800 transition-colors"
          >
            Request a Quote
          </button>
          <p className="text-center text-xs text-zinc-400">
            We typically respond within 1-2 business days.
          </p>
        </form>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-100 bg-zinc-50 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-emerald-700" />
              <span className="text-lg font-black tracking-tight text-zinc-900">
                LawnBowl<span className="text-emerald-700">.camp</span>
              </span>
            </div>
            <p className="mt-3 text-sm text-zinc-500 leading-relaxed">
              Per-session insurance designed specifically for the lawn bowling
              community. A partnership between DEI and Lawnbowling.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-zinc-900">Quick Links</h4>
            <ul className="mt-3 space-y-2 text-sm text-zinc-500">
              <li>
                <a href="#pricing" className="hover:text-zinc-900 transition-colors">
                  Per-Session Pricing
                </a>
              </li>
              <li>
                <a href="#clubs" className="hover:text-zinc-900 transition-colors">
                  Club-Wide Plans
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-zinc-900 transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#quote" className="hover:text-zinc-900 transition-colors">
                  Get a Quote
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-zinc-900">Contact</h4>
            <ul className="mt-3 space-y-2 text-sm text-zinc-500">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                insurance@lawnbowl.camp
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                (555) 123-4567
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-zinc-200 pt-6 text-center text-xs text-zinc-400">
          <p>
            &copy; {new Date().getFullYear()} LawnBowl Camp. All rights
            reserved. A DEI &amp; Lawnbowling partnership.
          </p>
          <p className="mt-1">
            Insurance products underwritten by A-rated carriers. Coverage terms
            and conditions apply.
          </p>
        </div>
      </div>
    </footer>
  );
}
