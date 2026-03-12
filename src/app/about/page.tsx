import type { Metadata } from "next";
import Link from "next/link";
import {
  CircleDot,
  Zap,
  ChevronRight,
  Target,
  Smartphone,
  Trophy,
  Users,
  MapPin,
  BookOpen,
} from "lucide-react";
import { PublicNav } from "@/components/PublicNav";

export const metadata: Metadata = {
  title: "About | Lawnbowling",
  description:
    "Lawnbowling is the digital platform for lawn bowling clubs across America. Tournament draws, live scoring, club directory, and learning resources — all in one place.",
};

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

      {/* Navigation */}

      <PublicNav />

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
            Modernizing{" "}
            <span className="text-gradient">Lawn Bowling</span>{" "}
            Clubs
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 md:text-xl">
            Lawnbowling is the digital platform built specifically for lawn
            bowling clubs. We replace the paper draw sheet with automatic
            tournament draws, live scoring, and a nationwide club directory.
          </p>
        </div>
      </section>

      {/* The Problem */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold text-zinc-900 md:text-4xl">
              The Paper Draw Sheet Era Is Over
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-zinc-600">
              Walk into most lawn bowling clubs and you&apos;ll find the same
              thing: a drawmaster with a clipboard, shuffling names on paper,
              trying to balance teams fairly. Players crowd the noticeboard to
              find their rink assignment. Scores are tallied by hand.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Manual draw generation takes time and effort",
                "No fair rotation or position balancing",
                "Paper scorecards get lost or smudged",
                "No way to track stats or history",
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
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1B5E20]">
                  <CircleDot className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-bold text-zinc-900">
                  Tournament Draw
                </span>
                <span className="ml-auto flex items-center gap-1">
                  <span className="live-dot" />
                  <span className="text-[10px] text-zinc-400">16 players</span>
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-zinc-100 bg-zinc-50 p-2 text-center"
                  >
                    <div className="mx-auto mb-1 h-8 w-8 rounded-full bg-emerald-100" />
                    <div className="h-1.5 w-12 mx-auto rounded-full bg-zinc-200" />
                    <div className="mt-1 h-1 w-8 mx-auto rounded-full bg-emerald-500/30" />
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
              One Tap. Draw Generated.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-zinc-600">
              Lawnbowling automates tournament day for your club. Players check
              in on the iPad or their phone, select their preferred position, and
              the drawmaster taps one button. Teams are formed, rinks assigned,
              and positions balanced automatically.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Automatic draw generation for all formats",
                "Singles, Pairs, Triples, and Fours",
                "Multiple rotation formats (Mead, Gavel, and more)",
                "Live scoring per end, per rink",
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

      {/* What We Offer */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-zinc-900 md:text-4xl">
            Everything Your Club Needs
          </h2>
          <p className="mt-4 text-lg text-zinc-600">
            Built for lawn bowling clubs, designed for bowlers
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { icon: Trophy, name: "Tournament Draw", color: "emerald" },
            { icon: Zap, name: "Live Scoring", color: "blue" },
            { icon: MapPin, name: "Club Directory", color: "amber" },
            { icon: BookOpen, name: "Learn to Bowl", color: "purple" },
          ].map((item) => (
            <div
              key={item.name}
              className="flex flex-col items-center gap-3 rounded-2xl border border-zinc-200 p-6 transition-all hover:shadow-md"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-${item.color}-100`}>
                <item.icon className={`h-6 w-6 text-${item.color}-600`} />
              </div>
              <span className="text-sm font-semibold text-zinc-900">{item.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Key Numbers */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="glass rounded-3xl p-8 md:p-12">
          <div className="grid gap-8 text-center md:grid-cols-3">
            {[
              { number: "100+", label: "Clubs Listed" },
              { number: "50", label: "US States" },
              { number: "80+", label: "Glossary Terms" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl font-extrabold text-[#1B5E20] md:text-5xl">
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
        <div className="rounded-3xl bg-gradient-to-r from-[#1B5E20] to-emerald-600 p-8 text-center shadow-2xl shadow-emerald-500/15 md:p-16">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Ready to Modernize Your Club?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-emerald-100/80">
            Join clubs across America already using Lawnbowling to simplify
            tournament day.
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
