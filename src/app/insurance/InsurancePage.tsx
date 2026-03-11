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
              Lawnbowling
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
            Injuries{" "}
            <span className="bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">
              Happen.
            </span>
            {" "}Lawsuits Don&apos;t Have To.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 md:text-xl">
            Your pickleball player rolls an ankle. Without coverage, that&apos;s
            a $15K problem. With Lawnbowling, every participant is covered
            the moment they check in. No paperwork. No monthly fees. No cost to
            your venue at all.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-5 py-2">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700">
              FREE for venues — you actually earn $2 to $10 per participant
            </span>
          </div>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="https://dailyeventinsurance.com/m/lawnbowling/quote/new"
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
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* Lawn Bowls Coverage Callout */}
      <section className="relative mx-auto max-w-6xl px-6 pb-16">
        <Link
          href="/insurance/lawn-bowls"
          className="group block rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-50 to-emerald-100/50 p-6 shadow-sm transition-all hover:border-emerald-500/50 hover:shadow-md md:p-8"
        >
          <div className="flex flex-col items-center gap-6 md:flex-row">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 shadow-lg shadow-emerald-600/15">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-zinc-900 md:text-3xl">
                Lawn Bowls Coverage
              </h2>
              <p className="mt-2 text-zinc-600">
                Per-session insurance designed specifically for lawn bowlers.
                Coverage from $3/player covers falls, sprains, bowl-strike
                injuries, and more. 54% of lawn bowls injuries are from falls
                -- don&apos;t play unprotected.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/15 transition group-hover:bg-emerald-500">
              View Lawn Bowls Coverage
              <ExternalLink className="h-4 w-4" />
            </div>
          </div>
        </Link>
      </section>

      {/* How Insurance Works */}
      <section
        id="how-it-works"
        className="relative mx-auto max-w-6xl px-6 pb-24"
      >
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-zinc-900 md:text-4xl">
            Coverage in Three Taps
          </h2>
          <p className="mt-4 text-lg text-zinc-600">
            No phone calls. No forms. No waiting on hold with an insurance rep.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              step: "01",
              icon: ClipboardCheck,
              title: "Check In and Sign the Waiver",
              desc: "Walk up, scan in, sign. The digital waiver takes about 30 seconds and lives in your profile forever. No clipboards, no lost paperwork.",
            },
            {
              step: "02",
              icon: UserCircle,
              title: "Insurance Offer Pops Up",
              desc: "Right after your waiver, you see the coverage offer. No separate app, no hunting around. It shows up automatically in your Lawnbowling profile.",
            },
            {
              step: "03",
              icon: MousePointerClick,
              title: "One Tap. You're Covered.",
              desc: "Hit the button and you're protected before your shoes hit the court. Coverage activates instantly and lasts through your session. That's it.",
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
            What&apos;s Actually Covered
          </h2>
          <p className="mt-4 text-lg text-zinc-600">
            The stuff your general liability policy quietly excludes
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {[
            {
              icon: Shield,
              title: "Per-Participant Liability",
              desc: "Your GL policy covers your employees. It does not cover the guy who tears his ACL on court 3. This does. Every player, every session.",
              gradient: "from-teal-500 to-teal-600",
              glow: "shadow-teal-500/15",
            },
            {
              icon: Heart,
              title: "Activity Injury Medical",
              desc: "Sprained wrist, rolled ankle, pulled hamstring. Medical bills from on-court injuries are covered so players aren't stuck with the tab.",
              gradient: "from-rose-500 to-pink-500",
              glow: "shadow-rose-500/15",
            },
            {
              icon: Ambulance,
              title: "Emergency Transport",
              desc: "If someone needs an ambulance from the court, that ride alone can cost $2,500+. This covers emergency transport so nobody panics about the bill.",
              gradient: "from-blue-500 to-indigo-500",
              glow: "shadow-blue-500/15",
            },
            {
              icon: ShieldCheck,
              title: "ActiveGuard\u2122 AD&D",
              desc: "Accidental Death and Dismemberment coverage through the ActiveGuard\u2122 program. The serious stuff nobody wants to think about, handled.",
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
                Your GL Policy Has a Blind Spot
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-zinc-600">
                Most venue operators assume their general liability covers
                everything. It doesn&apos;t. GL protects your staff. The 40
                pickleball players on your courts right now? They&apos;re in a
                coverage gap. Daily Event Insurance closes it, automatically,
                for every participant, every session.
              </p>
            </div>
            <div className="space-y-4">
              {[
                {
                  icon: DollarSign,
                  text: "Costs you nothing. Literally zero. No setup, no monthly, no hidden fees.",
                },
                {
                  icon: Zap,
                  text: "You earn $2-$10 per covered participant. Insurance that pays you.",
                },
                {
                  icon: CheckCircle,
                  text: "10-minute onboarding. No credit card. No sales call.",
                },
                {
                  icon: Shield,
                  text: "Live within 48 hours. Coverage flows through the waiver automatically.",
                },
                {
                  icon: Lock,
                  text: "Backed by AIG, Lloyd's of London, and Great American. A-rated carriers.",
                },
                {
                  icon: BadgeCheck,
                  text: "Licensed in all 50 states. Compliant everywhere you operate.",
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
            Questions? We Get These a Lot.
          </h2>
        </div>

        <Accordion.Root type="multiple" className="space-y-3">
          {[
            {
              q: "Wait, it's really free for venues?",
              a: "Yes, completely. No setup fees, no monthly charges, nothing hidden in the fine print. You actually make money on it. Venues earn $2 to $10 for every participant who opts into coverage. It's a revenue stream, not an expense.",
            },
            {
              q: "What sports does this cover?",
              a: "Everything Lawnbowling supports: pickleball, tennis, lawn bowling, badminton, racquetball, flag football, and more. Doesn't matter if it's a league night or casual open play. If it's happening at a participating venue, it's coverable.",
            },
            {
              q: "How does the coverage actually work?",
              a: "It turns on the moment the participant taps \"Get Coverage\" and turns off when their session ends. Think of it like a light switch. No pre-scheduling, no policy management, no renewal dates. The coverage lives inside the waiver flow, so there's nothing extra for you or the player to manage.",
            },
            {
              q: "Someone got hurt. How do they file a claim?",
              a: "They go to the Daily Event Insurance portal and submit the details. A real claims specialist picks it up and walks them through it. No phone trees, no \"press 1 for claims.\" It's designed to be painless because the last thing someone with a sprained ankle wants is a bureaucratic maze.",
            },
            {
              q: "Is this legit insurance or some startup gimmick?",
              a: "It's the real deal. Policies are underwritten by AIG, Lloyd's of London Syndicates, and Great American Insurance Group. These are some of the largest, most established carriers in the world. Coverage is licensed and compliant in all 50 states.",
            },
            {
              q: "What if my venue already has general liability?",
              a: "Good, you should. But GL covers your employees and your premises. It typically does not cover participant-on-participant injuries during sporting activities. That's the gap. A player takes a bad fall during a match and blames the other player or the venue? GL might not help. Per-participant coverage fills that hole.",
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
            Stop Hoping Nobody Gets Hurt
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-teal-100/80">
            Free coverage for your venue. Revenue per participant. Backed by
            AIG, Lloyd&apos;s of London, and Great American. Set it up in 10
            minutes and never think about it again.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="https://dailyeventinsurance.com/m/lawnbowling/quote/new"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-semibold text-teal-700 shadow-lg transition hover:bg-zinc-100 active:scale-[0.98]"
            >
              Get Free Coverage
              <ExternalLink className="h-5 w-5" />
            </a>
            <a
              href="https://dailyeventinsurance.com/m/lawnbowling"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border-2 border-white/30 px-8 py-4 text-lg font-semibold text-white transition hover:border-white/50 hover:bg-white/10 active:scale-[0.98]"
            >
              Learn More About DEI
            </a>
          </div>
        </div>
      </section>

      {/* Trust / Compliance Badges */}
      <section className="relative mx-auto max-w-4xl px-6 pb-24">
        <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-12">
          {[
            { icon: BadgeCheck, label: "All 50 States" },
            { icon: Lock, label: "A-Rated Carriers" },
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
            <span className="font-semibold text-zinc-900">Lawnbowling</span>
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
            &copy; {new Date().getFullYear()} Lawnbowling
          </span>
        </div>
      </footer>
    </div>
  );
}
