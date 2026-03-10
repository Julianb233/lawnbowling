import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Users,
  Zap,
  Shield,
  Timer,
  ChevronRight,
  Smartphone,
  Trophy,
  MapPin,
} from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/board");
  }

  return (
    <div className="min-h-screen bg-zinc-950 overflow-hidden">
      {/* Animated background orbs */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-[120px] animate-[gradientShift_15s_ease_infinite]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[120px] animate-[gradientShift_20s_ease_infinite_reverse]" />
        <div className="absolute top-[40%] right-[20%] h-[400px] w-[400px] rounded-full bg-amber-500/5 blur-[100px] animate-[gradientShift_25s_ease_infinite]" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/20">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">
              Pick a Partner
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 transition hover:text-white"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-500 hover:shadow-emerald-500/30"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-6xl px-6 pt-20 pb-32 md:pt-32 md:pb-40">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium text-emerald-400">
              Live at venues now
            </span>
          </div>

          {/* Headline */}
          <h1 className="max-w-4xl text-5xl font-extrabold leading-[1.1] tracking-tight text-white md:text-7xl">
            Find Your{" "}
            <span className="text-gradient">Perfect Partner</span>
            <br />
            Hit the Court
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400 md:text-xl">
            The real-time player board for recreational sports. Check in, pick a
            partner, and get matched to a court — all from your phone or the
            venue kiosk.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-8 py-4 text-lg font-semibold text-white shadow-2xl shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Playing
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900/50 px-8 py-4 text-lg font-semibold text-zinc-300 backdrop-blur transition-all hover:border-zinc-600 hover:bg-zinc-800/50 hover:text-white active:scale-[0.98]"
            >
              See How It Works
            </Link>
          </div>

          {/* Sport Tags */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-400">
              Pickleball
            </span>
            <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-400">
              Tennis
            </span>
            <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-400">
              Lawn Bowling
            </span>
            <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-sm font-medium text-purple-400">
              Badminton
            </span>
            <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-4 py-1.5 text-sm font-medium text-rose-400">
              Racquetball
            </span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative mx-auto max-w-6xl px-6 pb-32">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Zap,
              title: "Real-Time Board",
              desc: "See who's available right now. The board updates instantly as players check in and out.",
              gradient: "from-emerald-500 to-teal-500",
              glow: "shadow-emerald-500/20",
            },
            {
              icon: Users,
              title: "Pick & Match",
              desc: "Tap a player to send a partner request. Accept, decline, or let it expire — simple.",
              gradient: "from-blue-500 to-indigo-500",
              glow: "shadow-blue-500/20",
            },
            {
              icon: Timer,
              title: "Court Timers",
              desc: "Courts are assigned automatically. Match timers keep things moving so everyone plays.",
              gradient: "from-amber-500 to-orange-500",
              glow: "shadow-amber-500/20",
            },
            {
              icon: Shield,
              title: "Waiver Built In",
              desc: "Digital liability waivers are signed before play. Logged, timestamped, fully compliant.",
              gradient: "from-purple-500 to-pink-500",
              glow: "shadow-purple-500/20",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-white/5 bg-zinc-900/50 p-6 backdrop-blur transition-all hover:border-white/10 hover:bg-zinc-800/50"
            >
              <div
                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg ${feature.glow}`}
              >
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-400">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative mx-auto max-w-6xl px-6 pb-32">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            From check-in to court in under 60 seconds
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Check In",
              desc: "Walk up to the venue kiosk or open the app on your phone. Tap to mark yourself as available.",
              icon: MapPin,
            },
            {
              step: "02",
              title: "Pick a Partner",
              desc: "Browse available players filtered by sport and skill level. Tap someone to send a partner request.",
              icon: Users,
            },
            {
              step: "03",
              title: "Hit the Court",
              desc: "Once matched, you're assigned a court with a timer. Play your game, then free the court for the next pair.",
              icon: Trophy,
            },
          ].map((item) => (
            <div key={item.step} className="relative">
              <div className="glass rounded-2xl p-8">
                <span className="text-5xl font-black text-emerald-500/20">
                  {item.step}
                </span>
                <div className="mt-4 flex items-center gap-3">
                  <item.icon className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-xl font-bold text-white">{item.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Device Showcase */}
      <section className="relative mx-auto max-w-6xl px-6 pb-32">
        <div className="glass rounded-3xl p-8 md:p-12">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5">
                <Smartphone className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">
                  Works Everywhere
                </span>
              </div>
              <h2 className="text-3xl font-bold text-white md:text-4xl">
                iPad Kiosk.{" "}
                <span className="text-zinc-500">iPhone Personal.</span>
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-zinc-400">
                Set up an iPad at the front desk as a shared check-in kiosk.
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
                  <li key={item} className="flex items-center gap-3 text-zinc-300">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-center">
              {/* Device mockup */}
              <div className="relative">
                {/* iPad */}
                <div className="h-64 w-80 rounded-2xl border border-zinc-700 bg-zinc-800 p-3 shadow-2xl md:h-72 md:w-96">
                  <div className="flex h-full flex-col rounded-xl bg-zinc-900">
                    <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-2">
                      <span className="text-xs font-bold text-emerald-400">
                        Pick a Partner
                      </span>
                      <span className="ml-auto flex items-center gap-1">
                        <span className="live-dot" />
                        <span className="text-[10px] text-zinc-500">Live</span>
                      </span>
                    </div>
                    <div className="flex-1 p-3">
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div
                            key={i}
                            className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-2"
                          >
                            <div className="mx-auto mb-1 h-6 w-6 rounded-full bg-zinc-700" />
                            <div className="mx-auto h-1.5 w-10 rounded-full bg-zinc-700" />
                            <div className="mx-auto mt-1 h-1 w-6 rounded-full bg-emerald-500/30" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Phone overlay */}
                <div className="absolute -bottom-6 -right-6 h-40 w-20 rounded-2xl border border-zinc-600 bg-zinc-800 p-1.5 shadow-2xl md:-right-8 md:h-48 md:w-24">
                  <div className="flex h-full flex-col rounded-xl bg-zinc-900">
                    <div className="border-b border-zinc-800 px-2 py-1">
                      <span className="text-[6px] font-bold text-emerald-400">
                        PaP
                      </span>
                    </div>
                    <div className="flex-1 space-y-1 p-1.5">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="rounded border border-zinc-700/50 bg-zinc-800/30 p-1"
                        >
                          <div className="h-1 w-full rounded-full bg-zinc-700" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Venue CTA */}
      <section className="relative mx-auto max-w-6xl px-6 pb-32">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-emerald-500 p-8 text-center shadow-2xl shadow-emerald-500/20 md:p-16">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Ready to modernize your venue?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-emerald-100/80">
            Pick a Partner replaces the clipboard sign-up sheet. No more
            confusion about who&apos;s next or who&apos;s available.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-2xl bg-white px-8 py-4 text-lg font-semibold text-emerald-700 shadow-lg transition hover:bg-zinc-100 active:scale-[0.98]"
            >
              Set Up Your Venue
            </Link>
            <Link
              href="/(public)/contact"
              className="rounded-2xl border-2 border-white/30 px-8 py-4 text-lg font-semibold text-white transition hover:border-white/50 hover:bg-white/10 active:scale-[0.98]"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-zinc-950">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
              <Users className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-white">Pick a Partner</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <Link href="/(public)/terms" className="hover:text-zinc-300 transition">
              Terms
            </Link>
            <Link href="/(public)/privacy" className="hover:text-zinc-300 transition">
              Privacy
            </Link>
            <Link href="/(public)/contact" className="hover:text-zinc-300 transition">
              Contact
            </Link>
          </div>
          <span className="text-sm text-zinc-600">
            &copy; {new Date().getFullYear()} Pick a Partner
          </span>
        </div>
      </footer>
    </div>
  );
}
