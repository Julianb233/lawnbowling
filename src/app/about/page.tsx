import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
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
  Heart,
  Star,
} from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import bowlsIconImg from "@/../public/images/logo/bowls-icon.png";

export const metadata: Metadata = {
  title: "About | Lawnbowling",
  description:
    "Lawnbowling is the digital platform for lawn bowling clubs across America. Tournament draws, live scoring, club directory, and learning resources — all in one place.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FEFCF9] overflow-hidden">
      {/* Navigation */}
      <PublicNav />

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pt-20 pb-14 sm:pb-20 md:pt-28 md:pb-28">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#1B5E20]/20 bg-[#1B5E20]/10 px-4 py-1.5">
            <Target className="h-4 w-4 text-[#1B5E20]" />
            <span className="text-sm font-medium text-[#1B5E20]">
              Our Mission
            </span>
          </div>
          <h1
            className="max-w-4xl text-5xl font-extrabold leading-[1.1] tracking-tight text-[#0A2E12] md:text-7xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Making Tournament Day Easier for{" "}
            <span className="italic text-[#1B5E20]">Lawn Bowling</span>{" "}
            Clubs
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#3D5A3E] md:text-xl">
            Lawnbowling is the digital platform built specifically for lawn
            bowling clubs. We replace the paper draw sheet with automatic
            tournament draws, live scoring, and a nationwide club directory.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="relative mx-auto max-w-6xl px-6 pb-14 sm:pb-20 md:pb-28">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.15em] text-[#B8860B]">
              Our Story
            </p>
            <h2
              className="text-3xl font-bold text-[#0A2E12] md:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              The Paper Draw Sheet Era Is Over
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-[#3D5A3E]">
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
                  className="flex items-center gap-3 text-[#3D5A3E]"
                >
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-8 shadow-sm">
            <div className="space-y-4">
              <div className="h-6 w-48 rounded bg-[#0A2E12]/10" />
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border border-[#0A2E12]/5 bg-[#FEFCF9] p-3"
                  >
                    <div className="h-4 w-4 rounded border-2 border-[#0A2E12]/20" />
                    <div className="h-3 w-32 rounded bg-[#0A2E12]/10" />
                    <div className="ml-auto h-3 w-16 rounded bg-[#0A2E12]/10" />
                  </div>
                ))}
              </div>
              <p className="text-center text-xs italic text-[#3D5A3E]">
                Sound familiar?
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="relative mx-auto max-w-6xl px-6 pb-14 sm:pb-20 md:pb-28">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-6 shadow-lg">
              <div className="flex items-center gap-2 border-b border-[#0A2E12]/10 pb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1B5E20]">
                  <CircleDot className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-bold text-[#0A2E12]">
                  Tournament Draw
                </span>
                <span className="ml-auto flex items-center gap-1">
                  <span className="live-dot" />
                  <span className="text-[10px] text-[#3D5A3E]">16 players</span>
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-[#0A2E12]/5 bg-[#FEFCF9] p-2 text-center"
                  >
                    <div className="mx-auto mb-1 h-8 w-8 rounded-full bg-[#1B5E20]/10" />
                    <div className="h-1.5 w-12 mx-auto rounded-full bg-[#0A2E12]/10" />
                    <div className="mt-1 h-1 w-8 mx-auto rounded-full bg-[#1B5E20]/30" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#1B5E20]/20 bg-[#1B5E20]/10 px-4 py-1.5">
              <Zap className="h-4 w-4 text-[#1B5E20]" />
              <span className="text-sm font-medium text-[#1B5E20]">
                The Solution
              </span>
            </div>
            <h2
              className="text-3xl font-bold text-[#0A2E12] md:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              One Tap. Draw Generated.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-[#3D5A3E]">
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
                  className="flex items-center gap-3 text-[#3D5A3E]"
                >
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#1B5E20]/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#1B5E20]" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="relative mx-auto max-w-6xl px-6 pb-14 sm:pb-20 md:pb-28">
        <div className="mb-12 text-center">
          <h2
            className="text-3xl font-bold text-[#0A2E12] md:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Everything Your Club Needs
          </h2>
          <p className="mt-4 text-lg text-[#3D5A3E]">
            Built for lawn bowling clubs, designed for bowlers
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { icon: Trophy, name: "Tournament Draw", gradient: "from-[#1B5E20] to-emerald-600", glow: "shadow-emerald-500/20" },
            { icon: Zap, name: "Live Scoring", gradient: "from-blue-600 to-blue-500", glow: "shadow-blue-500/20" },
            { icon: MapPin, name: "Club Directory", gradient: "from-amber-500 to-orange-500", glow: "shadow-amber-500/20" },
            { icon: BookOpen, name: "Learn to Bowl", gradient: "from-purple-500 to-pink-500", glow: "shadow-purple-500/20" },
          ].map((item) => (
            <div
              key={item.name}
              className="flex flex-col items-center gap-3 rounded-2xl border border-[#0A2E12]/10 bg-white p-6 transition-all hover:shadow-md"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} shadow-lg ${item.glow}`}>
                <item.icon className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-semibold text-[#0A2E12]">{item.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Key Numbers */}
      <section className="relative mx-auto max-w-6xl px-6 pb-14 sm:pb-20 md:pb-28">
        <div className="rounded-3xl border border-[#0A2E12]/10 bg-white p-8 shadow-sm md:p-12">
          <div className="grid gap-8 text-center md:grid-cols-3">
            {[
              { number: "500+", label: "Clubs" },
              { number: "10,000+", label: "Bowlers" },
              { number: "50,000+", label: "Matches" },
            ].map((stat) => (
              <div key={stat.label}>
                <div
                  className="text-4xl font-extrabold text-[#0A2E12] md:text-5xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {stat.number}
                </div>
                <div className="mt-2 text-sm font-medium uppercase tracking-wider text-[#3D5A3E]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team / Founder */}
      <section className="relative mx-auto max-w-6xl px-6 pb-14 sm:pb-20 md:pb-28">
        <div className="mb-12 text-center">
          <h2
            className="text-3xl font-bold text-[#0A2E12] md:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Built by Bowlers, for Bowlers
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-[#3D5A3E]">
            We&apos;re a small team of lawn bowling enthusiasts and software engineers
            who believe the sport deserves modern tools. Every feature is designed
            with real club operations in mind.
          </p>
        </div>
        <div className="flex justify-center">
          <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-8 text-center shadow-sm max-w-sm">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#1B5E20]/10">
              <Heart className="h-10 w-10 text-[#1B5E20]" />
            </div>
            <h3
              className="text-xl font-bold text-[#0A2E12]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Community First
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#3D5A3E]">
              Lawnbowling was born from the belief that every club — big or small —
              deserves a platform that respects the traditions of the sport while
              embracing modern convenience.
            </p>
          </div>
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
            Join clubs across America already using Lawnbowling to simplify
            tournament day.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-base font-semibold text-[#1B5E20] shadow-lg transition hover:bg-[#F0FFF4] active:scale-[0.98]"
            >
              Start Free
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/clubs"
              className="rounded-full border-2 border-white/30 px-7 py-4 text-base font-semibold text-white transition hover:border-white/60 hover:bg-white/10 active:scale-[0.98]"
            >
              Find a Club
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
            <Link href="/clubs" className="hover:text-[#0A2E12] transition">
              Clubs
            </Link>
            <Link href="/learn" className="hover:text-[#0A2E12] transition">
              Learn
            </Link>
            <Link href="/about" className="hover:text-[#0A2E12] transition">
              About
            </Link>
            <Link href="/terms" className="hover:text-[#0A2E12] transition">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-[#0A2E12] transition">
              Privacy
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
