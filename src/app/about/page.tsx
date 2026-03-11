import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Users,
  ClipboardList,
  Zap,
  ChevronRight,
  Target,
  Smartphone,
  BarChart3,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About | Lawnbowling",
  description:
    "Lawnbowling replaces the clipboard sign-up sheet at rec centers with a real-time digital player board for pickleball, tennis, lawn bowling, and more.",
};

const sports = [
  {
    name: "Pickleball",
    image: "/images/sports/pickleball/hero.webp",
    color: "emerald",
  },
  {
    name: "Tennis",
    image: "/images/sports/tennis/hero.webp",
    color: "amber",
  },
  {
    name: "Lawn Bowling",
    image: "/images/sports/lawn-bowling/hero.webp",
    color: "blue",
  },
  {
    name: "Badminton",
    image: "/images/sports/badminton/hero.webp",
    color: "purple",
  },
  {
    name: "Racquetball",
    image: "/images/sports/racquetball/hero.webp",
    color: "rose",
  },
  {
    name: "Flag Football",
    image: "/images/sports/flag-football/hero.webp",
    color: "orange",
  },
];

export default function AboutPage() {
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
      <div
        className="orb orb-blue"
        style={{ top: "30%", right: "5%", width: "350px", height: "350px" }}
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
              href="/insurance"
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
            >
              Insurance
            </Link>
            <Link
              href="/for-venues"
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
            >
              For Venues
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

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pt-20 pb-20 md:pt-28 md:pb-24">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5">
            <Target className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-600">
              Our Mission
            </span>
          </div>
          <h1 className="max-w-4xl text-5xl font-extrabold leading-[1.1] tracking-tight text-zinc-900 md:text-7xl">
            Built for the Way People{" "}
            <span className="text-gradient">Actually Play</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 md:text-xl">
            Lawnbowling is the real-time player board that replaces the
            clipboard sign-up sheet at recreation centers, community courts, and
            sports facilities everywhere.
          </p>
        </div>
      </section>

      {/* The Problem */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-4 py-1.5">
              <ClipboardList className="h-4 w-4 text-rose-600" />
              <span className="text-sm font-medium text-rose-600">
                The Problem
              </span>
            </div>
            <h2 className="text-3xl font-bold text-zinc-900 md:text-4xl">
              The Clipboard Era Is Over
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-zinc-600">
              Walk into any rec center and you&apos;ll find the same thing: a
              clipboard hanging on the wall with a sign-up sheet. Names
              scratched out, confusion about who&apos;s next, arguments over
              court time, and no way to know who&apos;s actually available.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "No visibility into who's waiting",
                "No fair rotation system",
                "No digital waivers or records",
                "No data for venue operators",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-zinc-600"
                >
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass rounded-2xl p-8">
            <div className="space-y-4">
              <div className="h-6 w-48 rounded bg-zinc-200" />
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border border-zinc-100 bg-zinc-50 p-3"
                  >
                    <div className="h-4 w-4 rounded border-2 border-zinc-300" />
                    <div className="h-3 w-32 rounded bg-zinc-200" />
                    <div className="ml-auto h-3 w-16 rounded bg-zinc-200" />
                  </div>
                ))}
              </div>
              <p className="text-center text-xs italic text-zinc-400">
                Sound familiar?
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg">
              <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-bold text-zinc-900">
                  Live Board
                </span>
                <span className="ml-auto flex items-center gap-1">
                  <span className="live-dot" />
                  <span className="text-[10px] text-zinc-400">12 players</span>
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  "emerald",
                  "emerald",
                  "amber",
                  "blue",
                  "emerald",
                  "amber",
                ].map((color, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-zinc-100 bg-zinc-50 p-2 text-center"
                  >
                    <div
                      className={`mx-auto mb-1 h-8 w-8 rounded-full bg-${color}-100`}
                    />
                    <div className="h-1.5 w-12 mx-auto rounded-full bg-zinc-200" />
                    <div
                      className={`mt-1 h-1 w-8 mx-auto rounded-full bg-${color}-500/30`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5">
              <Zap className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-600">
                The Solution
              </span>
            </div>
            <h2 className="text-3xl font-bold text-zinc-900 md:text-4xl">
              A Real-Time Digital Player Board
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-zinc-600">
              Lawnbowling gives every player a live view of who&apos;s
              available, what sport they play, and their skill level. Check in
              from your phone or the venue kiosk. Tap a name to send a partner
              request. Get matched to a court automatically.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Real-time availability updates",
                "One-tap partner requests",
                "Automatic court assignment",
                "Digital waivers built in",
                "Works on any device — phone, tablet, kiosk",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-zinc-600"
                >
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Sports We Support */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-zinc-900 md:text-4xl">
            Sports We Support
          </h2>
          <p className="mt-4 text-lg text-zinc-600">
            Built for the sports people actually play at rec centers
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {sports.map((sport) => (
            <div
              key={sport.name}
              className="group relative overflow-hidden rounded-2xl shadow-sm"
            >
              <div className="aspect-[4/3] relative">
                <Image
                  src={sport.image}
                  alt={`${sport.name} players in action`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <span className="text-lg font-bold text-white drop-shadow-lg">
                  {sport.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Key Numbers */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="glass rounded-3xl p-8 md:p-12">
          <div className="grid gap-8 text-center md:grid-cols-3">
            {[
              { number: "500+", label: "Facilities" },
              { number: "6", label: "Sports Supported" },
              { number: "60s", label: "Check-In to Court" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl font-extrabold text-emerald-600 md:text-5xl">
                  {stat.number}
                </div>
                <div className="mt-2 text-sm font-medium uppercase tracking-wider text-zinc-500">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-emerald-500 p-8 text-center shadow-2xl shadow-emerald-500/15 md:p-16">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Ready to Get Started?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-emerald-100/80">
            Join the players and venues already using Lawnbowling to make rec
            sports better for everyone.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-semibold text-emerald-700 shadow-lg transition hover:bg-zinc-100 active:scale-[0.98]"
            >
              Start Playing
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/for-venues"
              className="rounded-2xl border-2 border-white/30 px-8 py-4 text-lg font-semibold text-white transition hover:border-zinc-2000 hover:bg-zinc-100 active:scale-[0.98]"
            >
              I Manage a Venue
            </Link>
          </div>
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
