import Link from "next/link";
import Image from "next/image";
import {
  Users,
  Trophy,
  Shield,
  Smartphone,
  MapPin,
  Star,
  CheckCircle,
  QrCode,
  ClipboardList,
  BookOpen,
  ShoppingBag,
  BarChart3,
  Globe,
  ChevronRight,
  CircleDot,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-green-900/10 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1B5E20] shadow-lg shadow-green-900/20">
              <CircleDot className="h-5 w-5 text-white" />
            </div>
            <span className="text-base font-bold text-zinc-900 sm:text-lg">
              Lawnbowling
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/clubs"
              className="hidden sm:block rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
            >
              Club Directory
            </Link>
            <Link
              href="/learn"
              className="hidden sm:block rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
            >
              Learn
            </Link>
            <Link
              href="/bowls"
              className="hidden sm:block rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
            >
              Tournaments
            </Link>
            <Link
              href="/insurance"
              className="hidden lg:block rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
            >
              Insurance
            </Link>
            <Link
              href="/login"
              className="hidden sm:block rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-[#1B5E20] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-green-900/20 transition hover:bg-[#2E7D32] sm:px-5 sm:py-2.5"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-green-50 to-white py-16 sm:py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-1.5">
                <span className="h-2 w-2 rounded-full bg-[#1B5E20] animate-pulse" />
                <span className="text-sm font-medium text-[#1B5E20]">
                  The #1 Lawn Bowling App
                </span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl md:text-6xl">
                Run your club{" "}
                <span className="text-[#1B5E20]">like a pro.</span>
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-zinc-600 sm:mt-6 sm:text-xl">
                Tournament check-in, automatic draw generation, live scoring,
                and results — all from the clubhouse iPad. The modern way to
                manage lawn bowling.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:gap-4">
                <Link
                  href="/signup"
                  className="rounded-xl bg-[#1B5E20] px-6 py-3.5 text-center text-base font-semibold text-white shadow-lg shadow-green-900/20 transition hover:bg-[#2E7D32] active:scale-[0.98] sm:px-8 sm:py-4 sm:text-lg"
                >
                  Start Free Trial
                </Link>
                <Link
                  href="/clubs"
                  className="rounded-xl border-2 border-zinc-200 px-6 py-3.5 text-center text-base font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.98] sm:px-8 sm:py-4 sm:text-lg"
                >
                  Find a Club
                </Link>
              </div>
              <p className="mt-4 text-sm text-zinc-400">
                Free for clubs. No app download required.
              </p>
            </div>
            <div className="relative hidden md:block">
              {/* Clubhouse scene illustration */}
              <div className="relative rounded-2xl bg-gradient-to-br from-[#1B5E20]/5 to-green-50 p-8">
                <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-2xl">
                  <div className="flex items-center gap-3 border-b border-zinc-100 pb-3 mb-4">
                    <CircleDot className="h-5 w-5 text-[#1B5E20]" />
                    <span className="text-sm font-bold text-[#1B5E20]">Lawnbowling</span>
                    <span className="ml-auto flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs text-zinc-500">Tournament Day</span>
                    </span>
                  </div>
                  {/* Mock draw board */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Round 1 — Fours</div>
                    {[
                      { rink: 1, a: "Smith, Jones, Clark, Lee", b: "Brown, Davis, Hill, Ward" },
                      { rink: 2, a: "Taylor, White, King, Green", b: "Moore, Hall, Young, Allen" },
                      { rink: 3, a: "Wright, Adams, Scott, Baker", b: "Nelson, Carter, Mitchell, Roberts" },
                    ].map((match) => (
                      <div key={match.rink} className="rounded-lg border border-zinc-100 bg-zinc-50 p-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-[#1B5E20] bg-green-50 px-2 py-0.5 rounded">
                            Rink {match.rink}
                          </span>
                          <span className="text-[10px] text-zinc-400">In Progress</span>
                        </div>
                        <div className="mt-1.5 grid grid-cols-2 gap-2 text-[10px] text-zinc-600">
                          <div className="truncate">{match.a}</div>
                          <div className="truncate text-right">{match.b}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Floating accent elements */}
                <div className="absolute -top-3 -right-3 rounded-lg bg-white border border-zinc-200 shadow-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-4 w-4 text-[#1B5E20]" />
                    <span className="text-xs font-medium text-zinc-700">QR Check-in</span>
                  </div>
                </div>
                <div className="absolute -bottom-3 -left-3 rounded-lg bg-white border border-zinc-200 shadow-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#1B5E20]" />
                    <span className="text-xs font-medium text-zinc-700">24 Players</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-zinc-100 bg-zinc-50/50 py-10 sm:py-14">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 sm:grid-cols-4 sm:px-6">
          {[
            { value: "90+", label: "USA Clubs Listed" },
            { value: "24", label: "States Covered" },
            { value: "Free", label: "For All Clubs" },
            { value: "PWA", label: "No Download Needed" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <span className="text-2xl font-extrabold text-[#1B5E20] sm:text-3xl">
                {stat.value}
              </span>
              <span className="mt-1 block text-xs font-medium text-zinc-500 sm:text-sm">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mb-10 text-center md:mb-16">
          <h2 className="text-2xl font-bold text-zinc-900 sm:text-3xl md:text-4xl">
            Tournament Day in 3 Steps
          </h2>
          <p className="mt-3 text-base text-zinc-500 sm:mt-4 sm:text-lg">
            From arrival to draw in under 2 minutes
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Check In",
              desc: "Players scan the QR code at the clubhouse or tap their name on the kiosk iPad. Select your position — Skip, Lead, or Vice.",
              icon: QrCode,
            },
            {
              step: "02",
              title: "Generate Draw",
              desc: "The drawmaster taps one button. Teams are automatically balanced by position and skill. Rinks assigned instantly.",
              icon: ClipboardList,
            },
            {
              step: "03",
              title: "Play & Score",
              desc: "Live scoring per end, per rink. Results calculated automatically. Multi-round tournaments flow seamlessly.",
              icon: Trophy,
            },
          ].map((item) => (
            <div key={item.step} className="relative">
              <div className="rounded-xl border border-zinc-100 bg-white p-5 shadow-sm transition hover:shadow-md sm:rounded-2xl sm:p-8">
                <span className="text-5xl font-black text-[#1B5E20]/10">
                  {item.step}
                </span>
                <div className="mt-3 flex items-center gap-3 sm:mt-4">
                  <item.icon className="h-5 w-5 text-[#1B5E20]" />
                  <h3 className="text-lg font-bold text-zinc-900 sm:text-xl">
                    {item.title}
                  </h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500 sm:mt-3 sm:text-base">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-zinc-50 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 text-center md:mb-16">
            <h2 className="text-2xl font-bold text-zinc-900 sm:text-3xl md:text-4xl">
              Everything Your Club Needs
            </h2>
            <p className="mt-3 text-base text-zinc-500 sm:mt-4 sm:text-lg">
              Built specifically for lawn bowling — not adapted from another sport
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            {[
              {
                icon: QrCode,
                title: "QR Check-In",
                desc: "Players scan a QR code to check in. No accounts required. Position selection (Skip, Lead, Vice) built in.",
              },
              {
                icon: ClipboardList,
                title: "Automatic Draw",
                desc: "One-tap draw generation. Supports Fours, Triples, Pairs, and Singles. Teams balanced by position preference.",
              },
              {
                icon: BarChart3,
                title: "Live Scoring",
                desc: "Enter scores per end on the iPad. Running totals update for all rinks in real-time via Supabase Realtime.",
              },
              {
                icon: Globe,
                title: "Club Directory",
                desc: "90+ USA clubs searchable by state and region. State pages for local SEO. Claim your club listing.",
              },
              {
                icon: Shield,
                title: "Insurance",
                desc: "Daily Event Insurance integrated at check-in. Per-session coverage from $3/player. DEI — our own company.",
              },
              {
                icon: BookOpen,
                title: "Learn & Blog",
                desc: "Rules, positions, formats, glossary. Educational content for newcomers. Blog targeting top lawn bowling keywords.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-zinc-100 bg-white p-5 transition hover:shadow-md sm:rounded-2xl sm:p-6"
              >
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B5E20]/10">
                  <feature.icon className="h-5 w-5 text-[#1B5E20]" />
                </div>
                <h3 className="mb-1.5 text-base font-semibold text-zinc-900 sm:text-lg">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-500">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mb-10 text-center md:mb-16">
          <h2 className="text-2xl font-bold text-zinc-900 sm:text-3xl md:text-4xl">
            Trusted by Bowlers
          </h2>
          <p className="mt-3 text-base text-zinc-500 sm:mt-4 sm:text-lg">
            What club members and organizers are saying
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {[
            {
              quote:
                "We ditched the paper draw sheet and our tournament days run 30 minutes faster. The automatic team balancing is spot on.",
              name: "Margaret W.",
              role: "Drawmaster, Santa Monica LBC",
              avatarBg: "bg-green-100 text-[#1B5E20]",
            },
            {
              quote:
                "I love the QR check-in. Our older members just scan the code — no passwords, no apps to download. It just works.",
              name: "Robert K.",
              role: "Club Secretary, Sun City LBC",
              avatarBg: "bg-amber-100 text-amber-700",
            },
            {
              quote:
                "Finally, an app that understands lawn bowling positions. Skip, Lead, Vice — it balances the draw properly every time.",
              name: "Patricia L.",
              role: "Tournament Director, Laguna Beach LBC",
              avatarBg: "bg-blue-100 text-blue-700",
            },
          ].map((testimonial) => (
            <div
              key={testimonial.name}
              className="rounded-xl border border-zinc-100 bg-white p-5 sm:rounded-2xl sm:p-6"
            >
              <div className="mb-3 flex gap-1 sm:mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 text-amber-400 fill-amber-400"
                  />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-zinc-600 italic sm:text-base">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm ${testimonial.avatarBg}`}
                >
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <span className="block text-sm font-semibold text-zinc-900">
                    {testimonial.name}
                  </span>
                  <span className="block text-xs text-zinc-500">
                    {testimonial.role}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Device Showcase */}
      <section className="bg-zinc-50 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-2xl border border-zinc-100 bg-white p-5 sm:rounded-3xl sm:p-8 md:p-12">
            <div className="grid items-center gap-6 sm:gap-8 md:grid-cols-2">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 sm:mb-4 sm:px-4">
                  <Smartphone className="h-4 w-4 text-[#1B5E20]" />
                  <span className="text-xs font-medium text-[#1B5E20] sm:text-sm">
                    Progressive Web App
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 sm:text-3xl md:text-4xl">
                  iPad Kiosk.{" "}
                  <span className="text-zinc-400">iPhone Personal.</span>
                </h2>
                <p className="mt-3 text-base leading-relaxed text-zinc-600 sm:mt-4 sm:text-lg">
                  Set up an iPad at the clubhouse as a shared check-in kiosk.
                  Members can also use their own phones. No app store download
                  required — it&apos;s a PWA.
                </p>
                <ul className="mt-4 space-y-2.5 sm:mt-6 sm:space-y-3">
                  {[
                    "Install via 'Add to Home Screen'",
                    "Works offline with cached data",
                    "iPad landscape for drawmasters",
                    "iPhone portrait for players",
                    "56pt+ touch targets for elderly users",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2.5 text-sm text-zinc-600 sm:gap-3 sm:text-base"
                    >
                      <CheckCircle className="h-4 w-4 text-[#1B5E20] shrink-0 sm:h-5 sm:w-5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative">
                  {/* iPad mockup */}
                  <div className="h-52 w-64 rounded-2xl border border-zinc-200 bg-zinc-100 p-2.5 shadow-2xl sm:h-64 sm:w-80 sm:p-3 md:h-72 md:w-96">
                    <div className="flex h-full flex-col rounded-xl bg-white">
                      <div className="flex items-center gap-2 border-b border-zinc-100 px-3 py-1.5 sm:px-4 sm:py-2">
                        <CircleDot className="h-3 w-3 text-[#1B5E20]" />
                        <span className="text-xs font-bold text-[#1B5E20]">
                          Lawnbowling
                        </span>
                        <span className="ml-auto flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-[10px] text-zinc-500">Live</span>
                        </span>
                      </div>
                      <div className="flex-1 p-2 sm:p-3">
                        <div className="text-[9px] font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Check In — Fours</div>
                        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                          {["Skip", "Lead", "Vice", "Skip", "Lead", "Vice"].map((pos, i) => (
                            <div
                              key={i}
                              className="rounded-lg border border-zinc-100 bg-zinc-50 p-1.5 sm:p-2"
                            >
                              <div className="mx-auto mb-1 h-5 w-5 rounded-full bg-[#1B5E20]/20 sm:h-6 sm:w-6" />
                              <div className="mx-auto h-1 w-8 rounded-full bg-zinc-300 sm:h-1.5 sm:w-10" />
                              <div className="mx-auto mt-0.5 text-[6px] text-[#1B5E20] font-medium text-center">{pos}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Phone overlay */}
                  <div className="absolute -bottom-4 -right-4 h-32 w-16 rounded-xl border border-zinc-300 bg-zinc-100 p-1 shadow-2xl sm:-bottom-6 sm:-right-6 sm:h-40 sm:w-20 sm:rounded-2xl sm:p-1.5 md:-right-8 md:h-48 md:w-24">
                    <div className="flex h-full flex-col rounded-lg bg-white sm:rounded-xl">
                      <div className="border-b border-zinc-100 px-1.5 py-0.5 sm:px-2 sm:py-1">
                        <span className="text-[5px] font-bold text-[#1B5E20] sm:text-[6px]">
                          LB
                        </span>
                      </div>
                      <div className="flex-1 space-y-0.5 p-1 sm:space-y-1 sm:p-1.5">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="rounded border border-zinc-100 bg-zinc-50 p-0.5 sm:p-1"
                          >
                            <div className="h-0.5 w-full rounded-full bg-zinc-200 sm:h-1" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          <Link href="/clubs" className="group rounded-2xl border border-zinc-100 bg-white p-6 transition hover:shadow-md hover:border-[#1B5E20]/20">
            <Globe className="h-8 w-8 text-[#1B5E20] mb-3" />
            <h3 className="text-lg font-bold text-zinc-900 mb-1">Find a Club</h3>
            <p className="text-sm text-zinc-500 mb-3">Browse 90+ lawn bowling clubs across the USA. Filter by state, region, or activity.</p>
            <span className="inline-flex items-center text-sm font-medium text-[#1B5E20] group-hover:gap-2 transition-all gap-1">
              Explore Directory <ChevronRight className="h-4 w-4" />
            </span>
          </Link>
          <Link href="/learn" className="group rounded-2xl border border-zinc-100 bg-white p-6 transition hover:shadow-md hover:border-[#1B5E20]/20">
            <BookOpen className="h-8 w-8 text-[#1B5E20] mb-3" />
            <h3 className="text-lg font-bold text-zinc-900 mb-1">Learn Lawn Bowling</h3>
            <p className="text-sm text-zinc-500 mb-3">Rules, positions, formats, and an 80+ term glossary. Everything a beginner needs.</p>
            <span className="inline-flex items-center text-sm font-medium text-[#1B5E20] group-hover:gap-2 transition-all gap-1">
              Start Learning <ChevronRight className="h-4 w-4" />
            </span>
          </Link>
          <Link href="/bowls" className="group rounded-2xl border border-zinc-100 bg-white p-6 transition hover:shadow-md hover:border-[#1B5E20]/20">
            <Trophy className="h-8 w-8 text-[#1B5E20] mb-3" />
            <h3 className="text-lg font-bold text-zinc-900 mb-1">Run a Tournament</h3>
            <p className="text-sm text-zinc-500 mb-3">Check-in, draw generation, live scoring, and results. Everything for tournament day.</p>
            <span className="inline-flex items-center text-sm font-medium text-[#1B5E20] group-hover:gap-2 transition-all gap-1">
              Get Started <ChevronRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24">
        <div className="rounded-2xl bg-[#1B5E20] p-6 text-center shadow-2xl shadow-green-900/20 sm:rounded-3xl sm:p-8 md:p-16">
          <h2 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl">
            Ready to modernize your club?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-green-100/80 sm:mt-4 sm:text-lg">
            Replace the paper draw sheet. Lawnbowling handles check-in, draws,
            scoring, and results — so you can focus on the game.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:mt-8 sm:flex-row sm:gap-4">
            <Link
              href="/signup"
              className="w-full rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-[#1B5E20] shadow-lg transition hover:bg-zinc-50 active:scale-[0.98] sm:w-auto sm:rounded-2xl sm:px-8 sm:py-4 sm:text-lg"
            >
              Start Free Trial
            </Link>
            <Link
              href="/contact"
              className="w-full rounded-xl border-2 border-white/30 px-6 py-3.5 text-base font-semibold text-white transition hover:border-white/60 hover:bg-white/10 active:scale-[0.98] sm:w-auto sm:rounded-2xl sm:px-8 sm:py-4 sm:text-lg"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B5E20]">
                  <CircleDot className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-zinc-900">Lawnbowling</span>
              </div>
              <p className="text-sm text-zinc-500">
                The world&apos;s best lawn bowling app. Tournament management, club
                directory, and everything bowls.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-900 mb-3">Platform</h4>
              <div className="space-y-2">
                <Link href="/bowls" className="block text-sm text-zinc-500 hover:text-zinc-700">Tournaments</Link>
                <Link href="/clubs" className="block text-sm text-zinc-500 hover:text-zinc-700">Club Directory</Link>
                <Link href="/insurance" className="block text-sm text-zinc-500 hover:text-zinc-700">Insurance</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-900 mb-3">Learn</h4>
              <div className="space-y-2">
                <Link href="/learn" className="block text-sm text-zinc-500 hover:text-zinc-700">Learning Hub</Link>
                <Link href="/learn/rules" className="block text-sm text-zinc-500 hover:text-zinc-700">Rules</Link>
                <Link href="/learn/glossary" className="block text-sm text-zinc-500 hover:text-zinc-700">Glossary</Link>
                <Link href="/about" className="block text-sm text-zinc-500 hover:text-zinc-700">About</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-900 mb-3">Legal</h4>
              <div className="space-y-2">
                <Link href="/terms" className="block text-sm text-zinc-500 hover:text-zinc-700">Terms</Link>
                <Link href="/privacy" className="block text-sm text-zinc-500 hover:text-zinc-700">Privacy</Link>
                <Link href="/contact" className="block text-sm text-zinc-500 hover:text-zinc-700">Contact</Link>
                <Link href="/faq" className="block text-sm text-zinc-500 hover:text-zinc-700">FAQ</Link>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-zinc-100 pt-6 flex flex-col items-center justify-between gap-2 sm:flex-row">
            <span className="text-sm text-zinc-400">
              &copy; {new Date().getFullYear()} Lawnbowling. All rights reserved.
            </span>
            <span className="text-sm text-zinc-400">
              lawnbowl.app
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
