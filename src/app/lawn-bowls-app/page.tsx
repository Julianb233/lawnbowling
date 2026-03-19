import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Smartphone,
  Trophy,
  Zap,
  MapPin,
  Users,
  BookOpen,
  CheckCircle,
  ChevronRight,
  Monitor,
  Star,
  Shield,
  ArrowRight,
  BarChart3,
  QrCode,
  Tv,
} from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import { getSoftwareApplicationSchema, getBreadcrumbSchema, getFAQSchema, jsonLd } from "@/lib/schema";
import bowlsIconImg from "@/../public/images/logo/bowls-icon.png";

export const metadata: Metadata = {
  title: "Lawn Bowls App | Best Bowls Scoring & Tournament App | Lawnbowling",
  description:
    "The #1 lawn bowls app for clubs and players. Automatic tournament draws, live scoring, club directory, kiosk check-in, and player stats. Free for players. Works on iPhone, iPad, Android, and desktop.",
  keywords: [
    "lawn bowls app",
    "bowls scoring app",
    "bowls tournament app",
    "lawn bowling app",
    "bowls draw generator",
    "lawn bowls scoring",
    "bowls club management",
    "bowls app free",
    "lawn bowls software",
    "bowls draw app",
  ],
  alternates: { canonical: "/lawn-bowls-app" },
  openGraph: {
    title: "Lawn Bowls App | The Best App for Bowls Clubs & Players",
    description:
      "Automatic tournament draws, live scoring, club directory, and player stats. The all-in-one lawn bowls app. Free for players.",
    url: "https://lawnbowl.app/lawn-bowls-app",
    type: "website",
    siteName: "Lawnbowling",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lawn Bowls App | Lawnbowling",
    description:
      "The #1 lawn bowls app. Tournament draws, live scoring, club directory, and more. Free for players.",
  },
};

const faqs = [
  {
    question: "Is the lawn bowls app free?",
    answer:
      "Yes! Lawnbowling is completely free for individual players. You can find clubs, check in for tournaments, view scores, and track your stats at no cost. Clubs pay a small subscription for premium features like automatic draw generation and kiosk mode.",
  },
  {
    question: "Does it work on iPhone and Android?",
    answer:
      "Yes. Lawnbowling is a Progressive Web App (PWA) that works on any device with a browser — iPhone, Android, iPad, tablet, and desktop. Install it by visiting lawnbowl.app and tapping 'Add to Home Screen' for a native app experience.",
  },
  {
    question: "How does the tournament draw generator work?",
    answer:
      "Players check in via the app or kiosk. The drawmaster taps one button and the app automatically generates balanced teams, assigns rinks, and rotates positions fairly across multiple rounds. It supports Singles, Pairs, Triples, and Fours in formats like Mead and Gavel.",
  },
  {
    question: "Can I use it for just scoring, without the draw feature?",
    answer:
      "Absolutely. You can use the live scoring feature independently. Enter scores end by end, and the app calculates totals automatically. Perfect for pennant matches, social games, or any format.",
  },
  {
    question: "What makes this different from other bowls apps?",
    answer:
      "Lawnbowling is purpose-built for lawn bowls clubs. It combines tournament draws, live scoring, player management, a club directory, learning resources, and a kiosk mode into one platform. Most other apps only do one of these things.",
  },
];

export default function LawnBowlsAppPage() {
  const appSchema = getSoftwareApplicationSchema();
  const breadcrumbs = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Lawn Bowls App", url: "/lawn-bowls-app" },
  ]);
  const faqSchema = getFAQSchema(faqs);

  return (
    <div className="min-h-screen bg-[#FEFCF9] overflow-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(appSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />
      <PublicNav />

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pt-20 pb-14 sm:pb-20 md:pt-28 md:pb-28">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#1B5E20]/20 bg-[#1B5E20]/10 px-4 py-1.5">
            <Smartphone className="h-4 w-4 text-[#1B5E20]" />
            <span className="text-sm font-medium text-[#1B5E20]">
              The #1 Lawn Bowls App
            </span>
          </div>
          <h1
            className="max-w-4xl text-5xl font-extrabold leading-[1.1] tracking-tight text-[#0A2E12] md:text-7xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            The{" "}
            <span className="italic text-[#1B5E20]">Lawn Bowls App</span>{" "}
            Your Club Needs
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#3D5A3E] md:text-xl">
            Automatic tournament draws, live scoring, club directory, kiosk
            check-in, and player stats — all in one app. Free for players.
            Built specifically for lawn bowling clubs.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-xl bg-[#1B5E20] px-7 py-4 text-base font-semibold text-white shadow-2xl shadow-emerald-500/20 transition-all hover:bg-[#145218] hover:shadow-emerald-500/35 active:scale-[0.97] min-h-[44px]"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-[#0A2E12]/15 px-7 py-4 text-base font-semibold text-[#2D4A30] transition-all hover:border-[#0A2E12]/30 hover:bg-[#0A2E12]/[0.03] active:scale-[0.97] min-h-[44px]"
            >
              See Features
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* App Mockup */}
      <section className="relative mx-auto max-w-6xl px-6 pb-14 sm:pb-20 md:pb-28">
        <div className="flex justify-center gap-6">
          {/* Phone mockup */}
          <div className="relative w-56 sm:w-64">
            <div className="rounded-[2.5rem] border-4 border-[#0A2E12]/20 bg-white p-2.5 shadow-2xl">
              <div className="rounded-[2rem] bg-[#FEFCF9] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-[#1B5E20]">
                  <span className="text-[10px] font-semibold text-white">9:41</span>
                  <span className="text-[10px] text-white/80">Lawnbowling</span>
                </div>
                <div className="p-3 space-y-2.5">
                  <div className="rounded-xl bg-[#1B5E20]/10 p-3 text-center">
                    <span className="text-xs font-bold text-[#1B5E20]">Tournament Day</span>
                    <p className="mt-1 text-[10px] text-[#3D5A3E]">16 players checked in</p>
                  </div>
                  <div className="rounded-xl border border-[#0A2E12]/10 bg-white p-2.5">
                    <span className="text-[10px] font-semibold text-[#0A2E12]">Your Draw</span>
                    <div className="mt-1.5 flex justify-between">
                      <span className="text-[10px] text-[#3D5A3E]">Rink 3 - Skip</span>
                      <span className="text-[10px] font-bold text-[#1B5E20]">Triples</span>
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#0A2E12]/10 bg-white p-2.5">
                    <span className="text-[10px] font-semibold text-[#0A2E12]">Live Scores</span>
                    <div className="mt-1.5 space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-[#3D5A3E]">Rink 1</span>
                        <span className="font-bold text-[#1B5E20]">14 - 10</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-[#3D5A3E]">Rink 2</span>
                        <span className="font-bold text-[#1B5E20]">8 - 12</span>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#0A2E12]/10 bg-white p-2.5">
                    <span className="text-[10px] font-semibold text-[#0A2E12]">Season Stats</span>
                    <div className="mt-1.5 flex justify-between">
                      <span className="text-[10px] text-[#3D5A3E]">W: 18 L: 7</span>
                      <span className="text-[10px] font-bold text-[#B8860B]">72% Win</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Tablet mockup */}
          <div className="hidden md:block relative w-96">
            <div className="rounded-[1.5rem] border-4 border-[#0A2E12]/20 bg-white p-2.5 shadow-2xl">
              <div className="rounded-[1rem] bg-[#FEFCF9] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-2 bg-[#1B5E20]">
                  <span className="text-[11px] font-bold text-white">Lawnbowling Kiosk</span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                    <span className="text-[10px] text-white/80">Live</span>
                  </span>
                </div>
                <div className="p-4">
                  <div className="mb-3 text-center">
                    <span className="text-xs font-bold text-[#0A2E12]">Draw Board - Round 2</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6].map((rink) => (
                      <div key={rink} className="rounded-lg border border-[#0A2E12]/10 bg-white p-2">
                        <div className="text-center text-[10px] font-bold text-[#1B5E20] mb-1">
                          Rink {rink}
                        </div>
                        <div className="space-y-0.5">
                          {["Skip", "Lead"].map((pos) => (
                            <div key={pos} className="flex items-center gap-1">
                              <div className="h-3 w-3 rounded-full bg-[#0A2E12]/10" />
                              <div className="h-1.5 flex-1 rounded bg-[#0A2E12]/10" />
                            </div>
                          ))}
                        </div>
                        <div className="mt-1 text-center text-[9px] font-bold text-[#B8860B]">
                          12 - 9
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative mx-auto max-w-6xl px-6 pb-14 sm:pb-20 md:pb-28">
        <div className="mb-12 text-center">
          <h2
            className="text-3xl font-bold text-[#0A2E12] md:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Everything Your Club Needs in One App
          </h2>
          <p className="mt-4 text-lg text-[#3D5A3E]">
            Purpose-built for lawn bowling — not adapted from another sport
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Trophy,
              title: "Automatic Draw Generator",
              desc: "One-tap tournament draws for Singles, Pairs, Triples, and Fours. Supports Mead, Gavel, and custom rotation formats. Fair position balancing across rounds.",
              gradient: "from-[#1B5E20] to-emerald-600",
            },
            {
              icon: Zap,
              title: "Live Scoring",
              desc: "Enter scores end by end from any device. Automatic totals, real-time updates across all screens, and score history for every match.",
              gradient: "from-blue-600 to-blue-500",
            },
            {
              icon: QrCode,
              title: "Kiosk Check-In",
              desc: "Set up an iPad as a self-service kiosk. Players check in, select their preferred position, and see their draw assignment — no clipboard needed.",
              gradient: "from-purple-600 to-purple-500",
            },
            {
              icon: MapPin,
              title: "Club Directory",
              desc: "A searchable directory of 500+ lawn bowling clubs across the USA. Help new bowlers find your club with your listing, photos, and contact info.",
              gradient: "from-amber-500 to-orange-500",
            },
            {
              icon: BarChart3,
              title: "Player Stats",
              desc: "Track wins, losses, positions played, and performance trends over the season. Players can view their own stats; clubs see the leaderboard.",
              gradient: "from-teal-500 to-cyan-500",
            },
            {
              icon: Tv,
              title: "TV Draw Board",
              desc: "Display the draw and live scores on a TV in the clubhouse. Auto-updates as scores come in. Perfect for the bar area or green entrance.",
              gradient: "from-rose-500 to-pink-500",
            },
            {
              icon: Users,
              title: "Member Management",
              desc: "Manage your club roster, track attendance, and handle guest players. Import members from a spreadsheet or add them individually.",
              gradient: "from-indigo-500 to-blue-500",
            },
            {
              icon: BookOpen,
              title: "Learning Hub",
              desc: "Comprehensive guides for rules, positions, formats, equipment, and an 80+ term glossary. Help new members learn the sport.",
              gradient: "from-emerald-500 to-teal-500",
            },
            {
              icon: Shield,
              title: "Per-Session Insurance",
              desc: "Optional per-session coverage for falls, sprains, and bowl-strike injuries. Activates automatically at check-in for participating clubs.",
              gradient: "from-[#1B5E20] to-emerald-700",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-[#0A2E12]/10 bg-white p-5 sm:p-6 shadow-sm transition-all hover:shadow-lg"
            >
              <div
                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg`}
              >
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-[#0A2E12]">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-[#3D5A3E]">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How to Install */}
      <section className="relative mx-auto max-w-6xl px-6 pb-14 sm:pb-20 md:pb-28">
        <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5 sm:p-8 md:p-12 shadow-sm">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#1B5E20]/20 bg-[#1B5E20]/10 px-4 py-1.5">
                <Monitor className="h-4 w-4 text-[#1B5E20]" />
                <span className="text-sm font-medium text-[#1B5E20]">
                  Works Everywhere
                </span>
              </div>
              <h2
                className="text-3xl font-bold text-[#0A2E12] md:text-4xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Install in Seconds.{" "}
                <span className="text-[#3D5A3E]/50">No App Store.</span>
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-[#3D5A3E]">
                Lawnbowling is a Progressive Web App (PWA). Visit{" "}
                <strong>lawnbowl.app</strong> on any device and tap
                &ldquo;Add to Home Screen&rdquo; for a native app experience.
                No download required, always up to date.
              </p>
              <div className="mt-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-[#0A2E12]">iPhone / iPad</h3>
                  <ol className="mt-2 space-y-1 text-sm text-[#3D5A3E]">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-[#1B5E20]">1.</span>
                      Open Safari and go to lawnbowl.app
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-[#1B5E20]">2.</span>
                      Tap the Share button (box with arrow)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-[#1B5E20]">3.</span>
                      Tap &ldquo;Add to Home Screen&rdquo;
                    </li>
                  </ol>
                </div>
                <div>
                  <h3 className="font-semibold text-[#0A2E12]">Android</h3>
                  <ol className="mt-2 space-y-1 text-sm text-[#3D5A3E]">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-[#1B5E20]">1.</span>
                      Open Chrome and go to lawnbowl.app
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-[#1B5E20]">2.</span>
                      Tap the install banner or menu &rarr; &ldquo;Install app&rdquo;
                    </li>
                  </ol>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { device: "iPhone", desc: "Personal mode" },
                  { device: "iPad", desc: "Kiosk mode" },
                  { device: "Android", desc: "Phone & tablet" },
                  { device: "Desktop", desc: "Full browser" },
                ].map((item) => (
                  <div key={item.device} className="flex flex-col items-center gap-2 rounded-2xl border border-[#0A2E12]/10 bg-[#FEFCF9] p-5">
                    <Monitor className="h-8 w-8 text-[#1B5E20]" />
                    <span className="text-sm font-semibold text-[#0A2E12]">{item.device}</span>
                    <span className="text-xs text-[#3D5A3E]">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Overview */}
      <section className="relative mx-auto max-w-6xl px-6 pb-14 sm:pb-20 md:pb-28">
        <div className="mb-12 text-center">
          <h2
            className="text-3xl font-bold text-[#0A2E12] md:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Simple, Fair Pricing
          </h2>
          <p className="mt-4 text-lg text-[#3D5A3E]">
            Free for players. Affordable plans for clubs.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
          <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-6 shadow-sm">
            <span className="text-sm font-semibold text-[#1B5E20]">Players</span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-[#0A2E12]" style={{ fontFamily: "var(--font-display)" }}>Free</span>
            </div>
            <p className="mt-3 text-sm text-[#3D5A3E]">Everything you need as a bowler</p>
            <ul className="mt-5 space-y-2.5">
              {[
                "Find clubs near you",
                "Check in for tournaments",
                "View live scores",
                "Track your stats",
                "Learning hub access",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-[#3D5A3E]">
                  <CheckCircle className="h-4 w-4 text-[#1B5E20] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border-2 border-[#1B5E20] bg-white p-6 shadow-lg relative">
            <span className="absolute -top-3 right-6 rounded-full bg-[#1B5E20] px-3 py-1 text-xs font-bold text-white">
              Most Popular
            </span>
            <span className="text-sm font-semibold text-[#1B5E20]">Clubs</span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-[#0A2E12]" style={{ fontFamily: "var(--font-display)" }}>$29</span>
              <span className="text-sm text-[#3D5A3E]">/month</span>
            </div>
            <p className="mt-3 text-sm text-[#3D5A3E]">Everything to run tournament day</p>
            <ul className="mt-5 space-y-2.5">
              {[
                "Automatic draw generation",
                "Live scoring across all rinks",
                "Kiosk mode for iPad check-in",
                "TV draw board display",
                "Member management",
                "Stats and leaderboards",
                "Priority support",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-[#3D5A3E]">
                  <CheckCircle className="h-4 w-4 text-[#1B5E20] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/pricing"
              className="mt-6 block w-full rounded-xl bg-[#1B5E20] px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#145218] min-h-[44px]"
            >
              View Full Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative mx-auto max-w-6xl px-6 pb-14 sm:pb-20 md:pb-28">
        <div className="mb-12 text-center">
          <h2
            className="text-3xl font-bold text-[#0A2E12] md:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Trusted by Clubs Across America
          </h2>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {[
            {
              quote: "We replaced our paper draw system and haven't looked back. The app generates fair draws in seconds and everyone can see their rink on their phone.",
              name: "Margaret H.",
              role: "Club Secretary, CA",
              avatarBg: "bg-emerald-100 text-emerald-600",
            },
            {
              quote: "The kiosk mode is brilliant. We set up an iPad at the entrance and players check themselves in. Saves us 30 minutes every tournament day.",
              name: "David R.",
              role: "Drawmaster, FL",
              avatarBg: "bg-blue-100 text-blue-600",
            },
            {
              quote: "As a player, I love being able to see my stats and history. Knowing my win rate by position helps me improve my game.",
              name: "Bob T.",
              role: "Club Bowler, OR",
              avatarBg: "bg-amber-100 text-amber-600",
            },
          ].map((testimonial) => (
            <div key={testimonial.name} className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5 sm:p-6 shadow-sm">
              <div className="mb-3 flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-[#2D4A30] italic">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm ${testimonial.avatarBg}`}>
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <span className="block text-sm font-semibold text-[#0A2E12]">{testimonial.name}</span>
                  <span className="block text-xs text-[#3D5A3E]">{testimonial.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section className="relative mx-auto max-w-6xl px-6 pb-14 sm:pb-20 md:pb-28">
        <div className="mb-12 text-center">
          <h2
            className="text-3xl font-bold text-[#0A2E12] md:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Why Clubs Choose Lawnbowling
          </h2>
          <p className="mt-4 text-lg text-[#3D5A3E]">
            Compare us to the alternatives
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#0A2E12]/10">
          <table className="w-full text-left text-[15px]">
            <thead className="bg-[#1B5E20]/5">
              <tr>
                <th className="px-5 py-4 font-semibold text-[#0A2E12]">Feature</th>
                <th className="px-5 py-4 font-semibold text-[#1B5E20]">Lawnbowling</th>
                <th className="px-5 py-4 font-semibold text-[#0A2E12]">Paper / Clipboard</th>
                <th className="hidden sm:table-cell px-5 py-4 font-semibold text-[#0A2E12]">Generic Sports App</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0A2E12]/5 bg-white">
              {[
                { feature: "Draw generation", us: "Automatic, one tap", paper: "Manual, 15-30 min", generic: "Not bowls-specific" },
                { feature: "Live scoring", us: "Real-time, all devices", paper: "Paper scorecards", generic: "Basic" },
                { feature: "Kiosk check-in", us: "iPad self-service", paper: "Sign-in sheet", generic: "Not available" },
                { feature: "Bowls formats", us: "Singles, Pairs, Triples, Fours", paper: "All (manual)", generic: "Limited" },
                { feature: "Player stats", us: "Automatic tracking", paper: "Not tracked", generic: "Generic stats" },
                { feature: "TV draw board", us: "Built in", paper: "Whiteboard", generic: "Not available" },
                { feature: "Cost for players", us: "Free", paper: "Free", generic: "Varies" },
              ].map((row) => (
                <tr key={row.feature}>
                  <td className="px-5 py-3 font-medium text-[#0A2E12]">{row.feature}</td>
                  <td className="px-5 py-3 text-[#1B5E20] font-medium">{row.us}</td>
                  <td className="px-5 py-3 text-[#3D5A3E]">{row.paper}</td>
                  <td className="hidden sm:table-cell px-5 py-3 text-[#3D5A3E]">{row.generic}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative mx-auto max-w-6xl px-6 pb-14 sm:pb-20 md:pb-28">
        <div className="mb-12 text-center">
          <h2
            className="text-3xl font-bold text-[#0A2E12] md:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Frequently Asked Questions
          </h2>
        </div>

        <div className="mx-auto max-w-3xl space-y-4">
          {faqs.map((faq) => (
            <div key={faq.question} className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5 sm:p-6">
              <h3 className="text-lg font-semibold text-[#0A2E12]">{faq.question}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#3D5A3E]">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-6xl px-6 pb-14 sm:pb-20 md:pb-28">
        <div className="rounded-3xl bg-gradient-to-r from-[#0A2E12] to-[#1B5E20] p-8 text-center shadow-2xl shadow-emerald-500/15 md:p-16">
          <h2
            className="text-3xl font-bold text-white md:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Ready to Modernize Your Club?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-emerald-100/80">
            Join 500+ clubs already using Lawnbowling. Free for players.
            Set up takes less than 5 minutes.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-base font-semibold text-[#1B5E20] shadow-lg transition hover:bg-[#F0FFF4] active:scale-[0.98] min-h-[44px]"
            >
              Get Started Free
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/contact"
              className="rounded-full border-2 border-white/30 px-7 py-4 text-base font-semibold text-white transition hover:border-white/60 hover:bg-white/10 active:scale-[0.98] min-h-[44px]"
            >
              Talk to Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#0A2E12]/10 bg-[#FEFCF9]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src={bowlsIconImg}
              alt="Lawnbowling logo"
              width={32}
              height={32}
              className="rounded-full"
              placeholder="blur"
            />
            <span className="font-semibold text-[#0A2E12]" style={{ fontFamily: "var(--font-display)" }}>
              Lawnbowling
            </span>
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[#3D5A3E]">
            <Link href="/clubs" className="hover:text-[#0A2E12] transition">Clubs</Link>
            <Link href="/learn" className="hover:text-[#0A2E12] transition">Learn</Link>
            <Link href="/pricing" className="hover:text-[#0A2E12] transition">Pricing</Link>
            <Link href="/about" className="hover:text-[#0A2E12] transition">About</Link>
            <Link href="/terms" className="hover:text-[#0A2E12] transition">Terms</Link>
            <Link href="/privacy" className="hover:text-[#0A2E12] transition">Privacy</Link>
          </div>
          <span className="text-sm text-[#3D5A3E]">
            &copy; {new Date().getFullYear()} Lawnbowling
          </span>
        </div>
      </footer>
    </div>
  );
}
