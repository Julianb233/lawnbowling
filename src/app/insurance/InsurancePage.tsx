"use client";

import Link from "next/link";
import * as Accordion from "@radix-ui/react-accordion";
import {
  Shield,
  CheckCircle,
  Heart,
  DollarSign,
  ChevronDown,
  Users,
  Zap,
  Lock,
  Building2,
  BadgeCheck,
  ExternalLink,
  ClipboardCheck,
  UserCircle,
  MousePointerClick,
  Ambulance,
  ShieldCheck,
} from "lucide-react";

export function InsurancePage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Floating glowing orbs */}
      <div
        className="orb orb-blue"
        style={{ top: "-5%", left: "-5%", width: "500px", height: "500px" }}
      />
      <div
        className="orb orb-emerald"
        style={{
          bottom: "-10%",
          right: "-5%",
          width: "400px",
          height: "400px",
        }}
      />
      <div
        className="orb orb-purple"
        style={{ top: "40%", right: "5%", width: "300px", height: "300px" }}
      />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/15">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-zinc-900">
              Pick a Partner
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
            >
              Home
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/15 transition hover:bg-emerald-500 hover:shadow-emerald-500/25"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-6xl px-6 pt-20 pb-20 md:pt-28 md:pb-24">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-blue-500 shadow-2xl shadow-teal-500/20">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.1] tracking-tight text-zinc-900 md:text-7xl">
            Play{" "}
            <span className="bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">
              Protected
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 md:text-xl">
            Free per-participant liability coverage for recreational sports
            venues. Activate instantly through Pick a Partner — no setup fees, no
            monthly costs, no hidden charges.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-5 py-2">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700">
              FREE for venues — Earn $2 to $10 per participant
            </span>
          </div>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="https://dailyeventinsurance.com/m/pick-a-partner/quote/new"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-2xl shadow-teal-500/20 transition-all hover:shadow-teal-500/35 hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Free Coverage
              <ExternalLink className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-2xl border border-zinc-300 bg-white px-8 py-4 text-lg font-semibold text-zinc-700 backdrop-blur transition-all hover:border-zinc-400 hover:bg-zinc-50 hover:text-zinc-900 active:scale-[0.98]"
            >
              How It Works
            </a>
          </div>
        </div>
      </section>

      {/* How Insurance Works */}
      <section
        id="how-it-works"
        className="relative mx-auto max-w-6xl px-6 pb-24"
      >
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-zinc-900 md:text-4xl">
            How Insurance Works
          </h2>
          <p className="mt-4 text-lg text-zinc-600">
            Three simple steps to coverage
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              step: "01",
              icon: ClipboardCheck,
              title: "Sign Your Digital Waiver",
              desc: "When you check in at the venue, complete your digital waiver. It takes less than a minute and is fully stored in your profile.",
            },
            {
              step: "02",
              icon: UserCircle,
              title: "See the Insurance Offer",
              desc: "After signing your waiver, you'll see a personalized insurance offer right in your Pick a Partner profile. Review coverage details at your own pace.",
            },
            {
              step: "03",
              icon: MousePointerClick,
              title: 'Tap "Get Coverage"',
              desc: "One tap activates your coverage instantly. No forms, no phone calls, no waiting. You're protected before you step on the court.",
            },
          ].map((item) => (
            <div key={item.step} className="relative">
              <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md">
                <span className="text-5xl font-black text-teal-500/20">
                  {item.step}
                </span>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-blue-500 shadow-lg shadow-teal-500/15">
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900">
                    {item.title}
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What's Covered */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-zinc-900 md:text-4xl">
            What&apos;s Covered
          </h2>
          <p className="mt-4 text-lg text-zinc-600">
            Per-participant coverage that fills gaps in general liability
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {[
            {
              icon: Shield,
              title: "Per-Participant Liability",
              desc: "Coverage for each participant during sporting activities, filling gaps that general liability policies don't cover.",
              gradient: "from-teal-500 to-teal-600",
              glow: "shadow-teal-500/15",
            },
            {
              icon: Heart,
              title: "Activity Injury Medical",
              desc: "Medical expenses from activity-related injuries sustained during insured events.",
              gradient: "from-rose-500 to-pink-500",
              glow: "shadow-rose-500/15",
            },
            {
              icon: Ambulance,
              title: "Emergency Transport",
              desc: "Coverage for emergency transport if a participant is injured during an insured activity.",
              gradient: "from-blue-500 to-indigo-500",
              glow: "shadow-blue-500/15",
            },
            {
              icon: ShieldCheck,
              title: "ActiveGuard\u2122 AD&D",
              desc: "Accidental Death & Dismemberment protection through Daily Event Insurance's ActiveGuard\u2122 program.",
              gradient: "from-emerald-500 to-teal-500",
              glow: "shadow-emerald-500/15",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md"
            >
              <div
                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} shadow-lg ${item.glow}`}
              >
                <item.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-zinc-900">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-600">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Daily Event Insurance */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="glass rounded-3xl p-8 md:p-12">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold text-zinc-900 md:text-4xl">
                Why Daily Event Insurance?
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-zinc-600">
                General liability policies protect your employees — not your
                participants. Daily Event Insurance fills that gap with
                per-participant coverage that activates at point of activity and
                deactivates when the event ends.
              </p>
            </div>
            <div className="space-y-4">
              {[
                {
                  icon: DollarSign,
                  text: "FREE for venues — zero setup fees, no monthly costs",
                },
                {
                  icon: Zap,
                  text: "Venues earn $2-$10 for every covered participant",
                },
                {
                  icon: CheckCircle,
                  text: "10-minute onboarding, no credit card required",
                },
                {
                  icon: Shield,
                  text: "Coverage integrates within 48 hours",
                },
                {
                  icon: Lock,
                  text: "A-rated carriers: AIG, Lloyd's of London, Great American",
                },
                {
                  icon: BadgeCheck,
                  text: "Licensed in all 50 states",
                },
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-500/10">
                    <item.icon className="h-5 w-5 text-teal-600" />
                  </div>
                  <span className="font-medium text-zinc-800">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="relative mx-auto max-w-3xl px-6 pb-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-zinc-900 md:text-4xl">
            Frequently Asked Questions
          </h2>
        </div>

        <Accordion.Root type="multiple" className="space-y-3">
          {[
            {
              q: "How much does it cost for venues?",
              a: "Daily Event Insurance is completely FREE for venue partners. There are zero setup fees, no monthly costs, and no hidden charges. Partners actually earn $2 to $10 for every covered participant.",
            },
            {
              q: "What sports are covered?",
              a: "All sports supported by Pick a Partner are covered, including pickleball, tennis, lawn bowling, badminton, racquetball, and flag football. Coverage extends to organized and casual play at participating venues.",
            },
            {
              q: "How does coverage work?",
              a: "Coverage activates instantly at the point of activity and deactivates when the event ends. It provides per-participant liability that fills gaps in general liability policies, which typically only protect employees — not participants.",
            },
            {
              q: "What happens if I need to file a claim?",
              a: "Filing a claim is straightforward. Visit the Daily Event Insurance portal, submit your claim details and any supporting documentation, and a claims specialist will guide you through the process.",
            },
            {
              q: "Is this real insurance?",
              a: "Yes. Daily Event Insurance policies are underwritten by A-rated carriers including AIG, Lloyd's of London Syndicates, and Great American Insurance Group. Coverage is licensed in all 50 states.",
            },
          ].map((item, i) => (
            <Accordion.Item
              key={i}
              value={`faq-${i}`}
              className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"
            >
              <Accordion.Trigger className="flex w-full items-center justify-between px-6 py-4 text-left text-zinc-900 hover:bg-zinc-50 transition-colors min-h-[44px] group">
                <span className="pr-4 font-semibold">{item.q}</span>
                <ChevronDown className="h-5 w-5 shrink-0 text-zinc-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </Accordion.Trigger>
              <Accordion.Content className="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
                <div className="border-t border-zinc-100 px-6 py-4">
                  <p className="text-sm leading-relaxed text-zinc-600">
                    {item.a}
                  </p>
                </div>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </section>

      {/* CTA Section */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-3xl bg-gradient-to-r from-teal-600 to-blue-600 p-8 text-center shadow-2xl shadow-teal-500/15 md:p-16">
          <Shield className="mx-auto mb-6 h-14 w-14 text-white/90" />
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Ready to Play Protected?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-teal-100/80">
            FREE per-participant liability coverage for your venue. Earn $2-$10
            per participant. Underwritten by AIG, Lloyd&apos;s of London, and Great
            American Insurance Group.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="https://dailyeventinsurance.com/m/pick-a-partner/quote/new"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-semibold text-teal-700 shadow-lg transition hover:bg-zinc-100 active:scale-[0.98]"
            >
              Get Free Coverage
              <ExternalLink className="h-5 w-5" />
            </a>
            <a
              href="https://dailyeventinsurance.com/m/pick-a-partner"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border-2 border-white/30 px-8 py-4 text-lg font-semibold text-white transition hover:border-white/50 hover:bg-white/10 active:scale-[0.98]"
            >
              Visit Our Insurance Page
            </a>
          </div>
        </div>
      </section>

      {/* Trust / Compliance Badges */}
      <section className="relative mx-auto max-w-4xl px-6 pb-24">
        <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-12">
          {[
            { icon: BadgeCheck, label: "Licensed" },
            { icon: Lock, label: "Secure Payments" },
            { icon: Building2, label: "500+ Facilities" },
          ].map((badge) => (
            <div
              key={badge.label}
              className="flex items-center gap-3 text-zinc-500"
            >
              <badge.icon className="h-6 w-6 text-teal-500" />
              <span className="text-sm font-semibold uppercase tracking-wider">
                {badge.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-zinc-50">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
              <Users className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-zinc-900">Pick a Partner</span>
          </Link>
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <Link
              href="/insurance"
              className="hover:text-zinc-700 transition"
            >
              Insurance
            </Link>
            <Link href="/about" className="hover:text-zinc-700 transition">
              About
            </Link>
            <Link href="/faq" className="hover:text-zinc-700 transition">
              FAQ
            </Link>
            <Link
              href="/(public)/terms"
              className="hover:text-zinc-700 transition"
            >
              Terms
            </Link>
            <Link
              href="/(public)/privacy"
              className="hover:text-zinc-700 transition"
            >
              Privacy
            </Link>
          </div>
          <span className="text-sm text-zinc-400">
            &copy; {new Date().getFullYear()} Pick a Partner
          </span>
        </div>
      </footer>
    </div>
  );
}
