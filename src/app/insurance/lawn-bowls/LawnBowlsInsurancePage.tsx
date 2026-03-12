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
  Lock,
  Building2,
  BadgeCheck,
  ExternalLink,
  Ambulance,
  ShieldCheck,
  AlertTriangle,
  Target,
  Star,
  Phone,
  ArrowRight,
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
    notIncluded: [
      "Per-participant liability",
      "AD&D coverage",
      "Equipment protection",
    ],
    gradient: "from-[#0A2E12]/5 to-[#0A2E12]/[0.03]",
    borderColor: "border-[#0A2E12]/10",
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
    notIncluded: ["Equipment protection"],
    gradient: "from-[#1B5E20] to-[#2E7D32]",
    borderColor: "border-[#1B5E20]",
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
    notIncluded: [],
    gradient: "from-[#1B5E20] to-indigo-600",
    borderColor: "border-[#1B5E20]",
    badge: "Best Value",
  },
];

const COVERAGE_ITEMS = [
  {
    icon: Shield,
    title: "Per-Participant Liability",
    desc: "Your club's GL policy covers the club. It does not cover you when a bowl strikes another player's foot and causes a fracture. This does. Every player, every session.",
    gradient: "from-[#1B5E20] to-[#2E7D32]",
    glow: "shadow-[#1B5E20]/15",
  },
  {
    icon: Heart,
    title: "Activity Injury Medical",
    desc: "Strained your back on the delivery? Rolled an ankle stepping off the green? Sprained a wrist breaking a fall? Medical bills from on-green injuries are covered.",
    gradient: "from-rose-500 to-pink-500",
    glow: "shadow-rose-500/15",
  },
  {
    icon: Ambulance,
    title: "Emergency Transport",
    desc: "Need an ambulance from the green? That ride alone costs $2,500 or more. For bowlers aged 65 and older, cardiac events and serious falls are a real risk. Transport is covered.",
    gradient: "from-[#1B5E20] to-indigo-500",
    glow: "shadow-[#1B5E20]/15",
  },
  {
    icon: ShieldCheck,
    title: "ActiveGuard AD&D",
    desc: "Accidental Death and Dismemberment coverage through the ActiveGuard program. The coverage nobody wants to need, but it provides peace of mind for you and your family.",
    gradient: "from-teal-500 to-[#1B5E20]",
    glow: "shadow-teal-500/15",
  },
];

const INJURY_STATS = [
  { label: "Falls & Slips", value: "54%", detail: "of all lawn bowls injuries" },
  { label: "Fractures", value: "35%", detail: "of injury types reported" },
  { label: "Players 45+", value: "92%", detail: "of all participants" },
  { label: "Avg. ER Visit", value: "$12K+", detail: "without coverage" },
];

const FAQ_ITEMS = [
  {
    q: "I'm 78 years old. Can I still get coverage?",
    a: "Absolutely. There is no age limit for per-session coverage. In fact, this product was designed with experienced bowlers in mind. The 65+ demographic faces the highest injury risk from falls and overexertion, which is exactly why per-session coverage exists.",
  },
  {
    q: "Does this cover me at away matches and tournaments?",
    a: "Yes. Your coverage is active at any participating venue. Whether you're playing pennant at home, traveling for a pairs tournament, or visiting another club for social bowls, you're covered for that session.",
  },
  {
    q: "My club already has insurance. Why do I need this?",
    a: "Your club's general liability insurance protects the club entity. It does not cover individual player injuries during play. If you trip on the ditch bank and fracture your wrist, your club's policy protects the club from your lawsuit. It does not pay your $12,000 medical bill. Per-participant coverage fills that gap.",
  },
  {
    q: "I only play social bowls, not pennant. Am I still covered?",
    a: "Yes. Coverage applies regardless of competition level. Social roll-ups, club practice days, pennant matches, championship events -- if you're on the green and checked in, you're covered.",
  },
  {
    q: "Can our club buy coverage for all members?",
    a: "Yes. Club secretaries can purchase bulk coverage for tournaments and events. A club tournament package covers all registered players at a reduced per-player rate. Contact us about annual club-wide coverage options.",
  },
  {
    q: "What happens if someone gets injured? How do they file a claim?",
    a: "They visit the Daily Event Insurance portal and submit the details online. A real claims specialist picks it up and walks them through the entire process. No phone trees, no bureaucratic runaround. It's designed to be straightforward, especially for those dealing with an injury.",
  },
  {
    q: "Is this real insurance or some app gimmick?",
    a: "It's fully licensed insurance. Policies are underwritten by AIG, Lloyd's of London Syndicates, and Great American Insurance Group -- some of the largest and most established carriers in the world. Coverage is licensed and compliant in all 50 states.",
  },
  {
    q: "How does the coverage actually activate?",
    a: "When you check in at your club through the app, you'll see the coverage offer. Tap 'Get Covered,' choose your tier, and you're protected before your first bowl hits the green. Coverage lasts through your session. No paperwork, no waiting.",
  },
];

export function LawnBowlsInsurancePage() {
  return (
    <div className="min-h-screen bg-[#FEFCF9] overflow-hidden">
      {/* Floating glowing orbs */}
      <div
        className="orb orb-emerald"
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

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-[#0A2E12]/10 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#1B5E20] to-[#1B5E20] shadow-lg shadow-[#1B5E20]/15">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-[#0A2E12]">
              Lawnbowling
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/insurance"
              className="rounded-lg px-4 py-2 text-sm font-medium text-[#3D5A3E] transition hover:text-[#0A2E12]"
            >
              All Insurance
            </Link>
            <a
              href="https://dailyeventinsurance.com/m/lawnbowling/quote/new"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-[#1B5E20] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#1B5E20]/15 transition hover:bg-[#1B5E20] hover:shadow-[#1B5E20]/25"
            >
              Get a Quote
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-6xl px-6 pt-20 pb-20 md:pt-28 md:pb-24">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#1B5E20]/30 bg-[#1B5E20]/10 px-4 py-1.5">
            <Target className="h-4 w-4 text-[#1B5E20]" />
            <span className="text-sm font-semibold text-[#2E7D32]">
              Designed for Lawn Bowlers
            </span>
          </div>
          <h1 className="max-w-4xl text-5xl font-extrabold leading-[1.1] tracking-tight text-[#0A2E12] md:text-7xl">
            Play Protected.{" "}
            <span className="bg-gradient-to-r from-[#1B5E20] to-[#1B5E20] bg-clip-text text-transparent">
              Every Bowl, Every Session.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#3D5A3E] md:text-xl">
            Falls cause 54% of lawn bowls injuries. Fractures account for 35%.
            With an average player age over 65, a single fall on the green can
            mean a $12,000 medical bill. Per-session coverage starts at $3 and
            activates the moment you check in.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#1B5E20]/30 bg-[#1B5E20]/10 px-5 py-2">
            <DollarSign className="h-5 w-5 text-[#1B5E20]" />
            <span className="text-sm font-semibold text-[#2E7D32]">
              From $3 per session -- less than a post-game cuppa
            </span>
          </div>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="https://dailyeventinsurance.com/m/lawnbowling/quote/new"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] px-8 py-4 text-lg font-semibold text-white shadow-2xl shadow-[#1B5E20]/20 transition-all hover:shadow-[#1B5E20]/35 hover:scale-[1.02] active:scale-[0.98]"
            >
              Get a Quote
              <ExternalLink className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#coverage-tiers"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#0A2E12]/10 bg-white px-8 py-4 text-lg font-semibold text-[#2D4A30] backdrop-blur transition-all hover:border-[#0A2E12]/10 hover:bg-[#0A2E12]/[0.03] hover:text-[#0A2E12] active:scale-[0.98]"
            >
              View Coverage Tiers
            </a>
          </div>
        </div>
      </section>

      {/* Why Bowlers Need Coverage - Injury Stats */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-[#0A2E12] md:text-4xl">
            Why Lawn Bowlers Need Per-Session Coverage
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-[#3D5A3E]">
            Lawn bowls has a documented injury profile that puts players at real
            financial risk. Your club&apos;s insurance covers the club. It does
            not cover you.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {INJURY_STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-[#0A2E12]/10 bg-white p-6 text-center shadow-sm transition-all hover:border-[#0A2E12]/10 hover:shadow-md"
            >
              <div className="text-4xl font-extrabold text-[#1B5E20]">
                {stat.value}
              </div>
              <div className="mt-2 text-lg font-semibold text-[#0A2E12]">
                {stat.label}
              </div>
              <div className="mt-1 text-sm text-[#3D5A3E]">{stat.detail}</div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-6 md:p-8">
          <div className="flex gap-4">
            <AlertTriangle className="h-8 w-8 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <h3 className="text-lg font-bold text-[#0A2E12]">
                The Coverage Gap Most Bowlers Don&apos;t Know About
              </h3>
              <p className="mt-2 text-[#2D4A30] leading-relaxed">
                Margaret trips on the ditch bank and fractures her wrist.
                Without per-player coverage, that&apos;s her $12,000 problem.
                Your club&apos;s general liability protects the club from
                Margaret&apos;s lawsuit -- it does not pay Margaret&apos;s
                medical bills. Per-participant coverage closes that gap for as
                little as $3.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What's Covered */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-[#0A2E12] md:text-4xl">
            What&apos;s Covered on the Green
          </h2>
          <p className="mt-4 text-lg text-[#3D5A3E]">
            Coverage designed specifically for the risks lawn bowlers face
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {COVERAGE_ITEMS.map((item) => (
            <div
              key={item.title}
              className="group rounded-2xl border border-[#0A2E12]/10 bg-white p-6 shadow-sm transition-all hover:border-[#0A2E12]/10 hover:shadow-md"
            >
              <div
                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} shadow-lg ${item.glow}`}
              >
                <item.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-[#0A2E12]">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-[#3D5A3E]">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Coverage Tiers */}
      <section
        id="coverage-tiers"
        className="relative mx-auto max-w-6xl px-6 pb-24"
      >
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-[#0A2E12] md:text-4xl">
            Choose Your Coverage Tier
          </h2>
          <p className="mt-4 text-lg text-[#3D5A3E]">
            Per-session pricing. No annual commitment. Cancel anytime.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl border-2 ${tier.borderColor} bg-white p-8 shadow-sm transition-all hover:shadow-lg ${
                tier.badge === "Most Popular" ? "ring-2 ring-[#1B5E20]/20" : ""
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-4 py-1 text-xs font-bold text-white ${
                      tier.badge === "Most Popular"
                        ? "bg-[#1B5E20]"
                        : "bg-[#1B5E20]"
                    }`}
                  >
                    <Star className="h-3 w-3" />
                    {tier.badge}
                  </span>
                </div>
              )}
              <div className="text-center">
                <h3 className="text-xl font-bold text-[#0A2E12]">{tier.name}</h3>
                <div className="mt-4">
                  <span className="text-5xl font-extrabold text-[#0A2E12]">
                    {tier.price}
                  </span>
                  <span className="ml-1 text-sm text-[#3D5A3E]">
                    {tier.period}
                  </span>
                </div>
                <p className="mt-3 text-sm text-[#3D5A3E]">{tier.description}</p>
              </div>

              <ul className="mt-8 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 shrink-0 text-[#1B5E20] mt-0.5" />
                    <span className="text-sm text-[#2D4A30]">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <a
                  href="https://dailyeventinsurance.com/m/lawnbowling/quote/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-all active:scale-[0.98] ${
                    tier.badge === "Most Popular"
                      ? "bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-lg shadow-[#1B5E20]/15 hover:shadow-[#1B5E20]/30"
                      : "border border-[#0A2E12]/10 bg-white text-[#2D4A30] hover:border-[#0A2E12]/10 hover:bg-[#0A2E12]/[0.03]"
                  }`}
                >
                  Get a Quote
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-[#3D5A3E]">
          All tiers are backed by AIG, Lloyd&apos;s of London, and Great
          American Insurance Group. Licensed in all 50 states.
        </p>
      </section>

      {/* Tournament / Club Integration */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="glass rounded-3xl p-8 md:p-12">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold text-[#0A2E12] md:text-4xl">
                Built Into Tournament Check-In
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-[#3D5A3E]">
                When your players check in for a tournament through the app,
                insurance coverage is offered automatically. No separate forms,
                no phone calls, no hunting around. One tap and every player on
                the green is protected.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-[#3D5A3E]">
                Club secretaries can purchase coverage for the entire field in
                one transaction. A 32-player tournament? That&apos;s $256 at the
                Standard tier for complete peace of mind.
              </p>
            </div>
            <div className="space-y-4">
              {[
                {
                  icon: Users,
                  text: "Bulk purchase for tournaments -- cover all players at once",
                },
                {
                  icon: CheckCircle,
                  text: "Coverage activates at check-in, lasts through the session",
                },
                {
                  icon: DollarSign,
                  text: "Venues earn $2-$10 per covered participant",
                },
                {
                  icon: Shield,
                  text: "Visitors and non-members can purchase coverage too",
                },
                {
                  icon: BadgeCheck,
                  text: "Green shield badge shows who's covered on the roster",
                },
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-4 rounded-xl border border-[#0A2E12]/10 bg-white p-4 shadow-sm"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1B5E20]/10">
                    <item.icon className="h-5 w-5 text-[#1B5E20]" />
                  </div>
                  <span className="font-medium text-[#0A2E12]">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="relative mx-auto max-w-3xl px-6 pb-24">
        <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-8 shadow-sm text-center">
          <div className="flex justify-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className="h-5 w-5 fill-amber-400 text-amber-400"
              />
            ))}
          </div>
          <blockquote className="text-lg leading-relaxed text-[#2D4A30] italic">
            &ldquo;We had a member take a bad fall on a wet green last season.
            Fractured wrist, ambulance, the whole ordeal. Because she had
            per-session coverage through the app, her medical bills and transport
            were covered. Without it, she would have been looking at over $15,000
            out of pocket. Every club should have this.&rdquo;
          </blockquote>
          <div className="mt-4">
            <div className="font-semibold text-[#0A2E12]">
              Tournament Director
            </div>
            <div className="text-sm text-[#3D5A3E]">
              Southern California Lawn Bowling Club
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative mx-auto max-w-3xl px-6 pb-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-[#0A2E12] md:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-[#3D5A3E]">
            Common questions from lawn bowling clubs and players
          </p>
        </div>

        <Accordion.Root type="multiple" className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <Accordion.Item
              key={i}
              value={`faq-${i}`}
              className="overflow-hidden rounded-xl border border-[#0A2E12]/10 bg-white shadow-sm"
            >
              <Accordion.Trigger className="flex w-full items-center justify-between px-6 py-4 text-left text-[#0A2E12] hover:bg-[#0A2E12]/[0.03] transition-colors min-h-[44px] group">
                <span className="pr-4 font-semibold">{item.q}</span>
                <ChevronDown className="h-5 w-5 shrink-0 text-[#3D5A3E] transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </Accordion.Trigger>
              <Accordion.Content className="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
                <div className="border-t border-[#0A2E12]/10 px-6 py-4">
                  <p className="text-sm leading-relaxed text-[#3D5A3E]">
                    {item.a}
                  </p>
                </div>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>

        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-[#3D5A3E]">
          <Phone className="h-4 w-4" />
          <span>
            Prefer to talk to someone?{" "}
            <a
              href="https://dailyeventinsurance.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#1B5E20] hover:text-[#1B5E20] underline"
            >
              Contact Daily Event Insurance
            </a>
          </span>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-3xl bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] p-8 text-center shadow-2xl shadow-[#1B5E20]/15 md:p-16">
          <Shield className="mx-auto mb-6 h-14 w-14 text-white/90" />
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Don&apos;t Wait for the First Fall
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[#1B5E20]/10">
            35% of lawn bowls injuries are fractures. 54% are caused by falls.
            Per-session coverage from $3 means every player on your green is
            protected. Set it up in minutes.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="https://dailyeventinsurance.com/m/lawnbowling/quote/new"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-semibold text-[#2E7D32] shadow-lg transition hover:bg-[#0A2E12]/5 active:scale-[0.98]"
            >
              Get a Quote
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

      {/* Trust Badges */}
      <section className="relative mx-auto max-w-4xl px-6 pb-24">
        <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-12">
          {[
            { icon: BadgeCheck, label: "All 50 States" },
            { icon: Lock, label: "A-Rated Carriers" },
            { icon: Building2, label: "500+ Facilities" },
          ].map((badge) => (
            <div
              key={badge.label}
              className="flex items-center gap-3 text-[#3D5A3E]"
            >
              <badge.icon className="h-6 w-6 text-[#1B5E20]" />
              <span className="text-sm font-semibold uppercase tracking-wider">
                {badge.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#0A2E12]/10 bg-[#0A2E12]/[0.03]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#1B5E20] to-[#1B5E20]">
              <Users className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-[#0A2E12]">Lawnbowling</span>
          </Link>
          <div className="flex items-center gap-6 text-sm text-[#3D5A3E]">
            <Link
              href="/insurance"
              className="hover:text-[#2D4A30] transition"
            >
              Insurance
            </Link>
            <Link
              href="/insurance/lawn-bowls"
              className="hover:text-[#2D4A30] transition font-medium text-[#1B5E20]"
            >
              Lawn Bowls Coverage
            </Link>
            <Link href="/about" className="hover:text-[#2D4A30] transition">
              About
            </Link>
            <Link href="/faq" className="hover:text-[#2D4A30] transition">
              FAQ
            </Link>
          </div>
          <span className="text-sm text-[#3D5A3E]">
            &copy; {new Date().getFullYear()} Lawnbowling
          </span>
        </div>
      </footer>
    </div>
  );
}
