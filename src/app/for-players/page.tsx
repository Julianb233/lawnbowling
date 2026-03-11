import type { Metadata } from "next";
import Link from "next/link";
import {
  CircleDot,
  ChevronRight,
  Shield,
  MapPin,
  Star,
  CheckCircle,
  Zap,
  Trophy,
  Target,
  Smartphone,
  BookOpen,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "For Bowlers | Lawnbowling",
  description:
    "Everything a lawn bowler needs — find clubs near you, learn the sport, check in for tournament days, and track your stats. All from your phone.",
};

export default function ForPlayersPage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Floating glowing orbs */}
      <div
        className="orb orb-emerald"
        style={{ top: "-5%", left: "-5%", width: "500px", height: "500px" }}
      />
      <div
        className="orb orb-amber"
        style={{
          bottom: "-10%",
          right: "-5%",
          width: "400px",
          height: "400px",
        }}
      />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-lg">
              <CircleDot className="h-5 w-5 text-[#1B5E20]" />
            </div>
            <span className="text-lg font-bold text-zinc-900">
              Lawnbowling
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/clubs"
              className="hidden sm:block rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
            >
              Clubs
            </Link>
            <Link
              href="/learn"
              className="hidden sm:block rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
            >
              Learn
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-[#1B5E20] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pt-20 pb-20 md:pt-28 md:pb-24">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5">
            <Trophy className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-600">
              For Bowlers
            </span>
          </div>
          <h1 className="max-w-4xl text-5xl font-extrabold leading-[1.1] tracking-tight text-zinc-900 md:text-7xl">
            Your{" "}
            <span className="text-gradient">Lawn Bowling</span>{" "}
            Companion
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 md:text-xl">
            Check in for tournament day from your phone. See your rink
            assignment, track your scores end by end, and watch your stats
            grow over the season. Lawnbowling makes the game you love even
            better.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#1B5E20] to-emerald-600 px-8 py-4 text-lg font-semibold text-white shadow-2xl shadow-emerald-500/20 transition-all hover:shadow-emerald-500/35 hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Bowling
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/clubs"
              className="inline-flex items-center gap-2 rounded-2xl border border-zinc-300 bg-white px-8 py-4 text-lg font-semibold text-zinc-700 backdrop-blur transition-all hover:border-zinc-400 hover:bg-zinc-50 hover:text-zinc-900 active:scale-[0.98]"
            >
              Find a Club
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-zinc-900 md:text-4xl">
            Everything You Need to Bowl
          </h2>
          <p className="mt-4 text-lg text-zinc-600">
            From finding a club to stepping on the green
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: MapPin,
              title: "Club Finder",
              desc: "Browse 100+ lawn bowling clubs across the USA. Find your nearest green and get directions.",
              gradient: "from-emerald-500 to-teal-500",
              glow: "shadow-emerald-500/15",
            },
            {
              icon: Trophy,
              title: "Tournament Check-In",
              desc: "Check in from your phone or the clubhouse iPad. Select your preferred position and see your rink assignment instantly.",
              gradient: "from-blue-500 to-indigo-500",
              glow: "shadow-blue-500/15",
            },
            {
              icon: Zap,
              title: "Live Scoring",
              desc: "Enter scores end by end on your phone. Results calculate automatically. No more paper scorecards.",
              gradient: "from-amber-500 to-orange-500",
              glow: "shadow-amber-500/15",
            },
            {
              icon: Target,
              title: "Stats & History",
              desc: "Track your wins, losses, and performance over time. See your stats for Singles, Pairs, Triples, and Fours.",
              gradient: "from-purple-500 to-pink-500",
              glow: "shadow-purple-500/15",
            },
            {
              icon: BookOpen,
              title: "Learn the Sport",
              desc: "Comprehensive guides covering rules, positions, formats, equipment, and an 80+ term glossary.",
              gradient: "from-rose-500 to-red-500",
              glow: "shadow-rose-500/15",
            },
            {
              icon: Shield,
              title: "Per-Session Insurance",
              desc: "Optional per-session coverage for falls, sprains, and bowl-strike injuries. Activates at check-in.",
              gradient: "from-teal-500 to-blue-500",
              glow: "shadow-teal-500/15",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md"
            >
              <div
                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg ${feature.glow}`}
              >
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-zinc-900">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-600">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-zinc-900 md:text-4xl">
            Tournament Day, Simplified
          </h2>
          <p className="mt-4 text-lg text-zinc-600">
            Three steps. That&apos;s it.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              step: "01",
              icon: Smartphone,
              title: "Check In",
              desc: "Arrive at the clubhouse. Check in on the iPad kiosk or your own phone. Select your preferred position — lead, second, third, or skip.",
            },
            {
              step: "02",
              icon: Users,
              title: "Get Your Draw",
              desc: "The drawmaster generates the draw with one tap. You see your team, your rink, and your position instantly on screen.",
            },
            {
              step: "03",
              icon: Trophy,
              title: "Play & Score",
              desc: "Bowl your game. Enter scores end by end on the iPad. Results calculate automatically. Your stats update live.",
            },
          ].map((item) => (
            <div key={item.step} className="relative">
              <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-8">
                <span className="text-5xl font-black text-[#1B5E20]/15">
                  {item.step}
                </span>
                <div className="mt-4 flex items-center gap-3">
                  <item.icon className="h-5 w-5 text-[#1B5E20]" />
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

      {/* Social Proof */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-zinc-900 md:text-4xl">
            What Bowlers Say
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              quote:
                "We replaced the paper draw sheet and everyone loves it. The iPad makes tournament day a breeze.",
              name: "Margaret H.",
              role: "Club Secretary",
              avatarBg: "bg-emerald-100 text-emerald-600",
            },
            {
              quote:
                "Being able to check in on my phone and see my rink assignment right away is brilliant. No more crowding the noticeboard.",
              name: "Bob T.",
              role: "Club Bowler",
              avatarBg: "bg-blue-100 text-blue-600",
            },
            {
              quote:
                "The learning hub helped my grandchildren understand the sport. Now they want to come bowl every weekend!",
              name: "Patricia L.",
              role: "Life Member",
              avatarBg: "bg-amber-100 text-amber-600",
            },
          ].map((testimonial) => (
            <div
              key={testimonial.name}
              className="rounded-2xl border border-zinc-100 bg-white p-6"
            >
              <div className="mb-4 flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 text-amber-400 fill-amber-400"
                  />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-zinc-600 italic">
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
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-8 md:p-12">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5">
                <Smartphone className="h-4 w-4 text-[#1B5E20]" />
                <span className="text-sm font-medium text-[#1B5E20]">
                  Works Everywhere
                </span>
              </div>
              <h2 className="text-3xl font-bold text-zinc-900 md:text-4xl">
                iPad Kiosk.{" "}
                <span className="text-zinc-400">Phone Personal.</span>
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-zinc-600">
                Set up an iPad at the clubhouse as a shared check-in kiosk.
                Players can also use their own phones — install the PWA for an
                app-like experience with no download required.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Install via 'Add to Home Screen'",
                  "Works offline with cached data",
                  "iPad landscape kiosk mode",
                  "iPhone portrait personal mode",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-zinc-600"
                  >
                    <CheckCircle className="h-5 w-5 text-[#1B5E20] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="h-72 w-96 rounded-2xl border border-zinc-200 bg-zinc-100 p-3 shadow-2xl">
                  <div className="flex h-full flex-col rounded-xl bg-white">
                    <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-2">
                      <span className="text-xs font-bold text-[#1B5E20]">
                        Lawnbowling
                      </span>
                      <span className="ml-auto flex items-center gap-1">
                        <span className="live-dot" />
                        <span className="text-xs text-zinc-500">Live</span>
                      </span>
                    </div>
                    <div className="flex-1 p-3">
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div
                            key={i}
                            className="rounded-lg border border-zinc-100 bg-zinc-50 p-2"
                          >
                            <div className="mx-auto mb-1 h-6 w-6 rounded-full bg-zinc-300" />
                            <div className="mx-auto h-1.5 w-10 rounded-full bg-zinc-300" />
                            <div className="mx-auto mt-1 h-1 w-6 rounded-full bg-emerald-300" />
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

      {/* CTA */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-3xl bg-gradient-to-r from-[#1B5E20] to-emerald-600 p-8 text-center shadow-2xl shadow-emerald-500/15 md:p-16">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Ready to Bowl?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-emerald-100/80">
            Sign up, find a club near you, and get on the green. It&apos;s
            free for players.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-semibold text-[#1B5E20] shadow-lg transition hover:bg-zinc-100 active:scale-[0.98]"
            >
              Get Started
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/clubs"
              className="rounded-2xl border-2 border-white/30 px-8 py-4 text-lg font-semibold text-white transition hover:border-white/60 hover:bg-white/10 active:scale-[0.98]"
            >
              Find a Club
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1B5E20]">
              <CircleDot className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-zinc-900">Lawnbowling</span>
          </Link>
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <Link href="/clubs" className="hover:text-zinc-700 transition">
              Clubs
            </Link>
            <Link href="/learn" className="hover:text-zinc-700 transition">
              Learn
            </Link>
            <Link href="/about" className="hover:text-zinc-700 transition">
              About
            </Link>
            <Link href="/terms" className="hover:text-zinc-700 transition">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-zinc-700 transition">
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
