import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const revalidate = 300; // 5 minutes

import {
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
  ArrowRight,
} from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import bowlsIconImg from "@/../public/images/logo/bowls-icon.png";

export const metadata: Metadata = {
  title: "For Bowlers | Lawnbowling",
  description:
    "Everything a lawn bowler needs — find clubs near you, learn the sport, check in for tournament days, and track your stats. All from your phone.",
};

export default function ForPlayersPage() {
  return (
    <div className="min-h-screen bg-[#FEFCF9] overflow-hidden">
      {/* Navigation */}
      <PublicNav />

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pt-20 pb-14 sm:pb-20 md:pt-28 md:pb-28">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#1B5E20]/20 bg-[#1B5E20]/10 px-4 py-1.5">
            <Trophy className="h-4 w-4 text-[#1B5E20]" />
            <span className="text-sm font-medium text-[#1B5E20]">
              For Bowlers
            </span>
          </div>
          <h1
            className="max-w-4xl text-5xl font-extrabold leading-[1.1] tracking-tight text-[#0A2E12] md:text-7xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Your Game.{" "}
            <span className="italic text-[#1B5E20]">Elevated.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#3D5A3E] md:text-xl">
            Check in for tournament day from your phone. See your rink
            assignment, track your scores end by end, and watch your stats
            grow over the season. Lawnbowling makes the game you love even
            better.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-full bg-[#1B5E20] px-7 py-4 text-base font-semibold text-white shadow-2xl shadow-emerald-500/20 transition-all hover:bg-[#145218] hover:shadow-emerald-500/35 active:scale-[0.97]"
            >
              Start Bowling
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/clubs"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#0A2E12]/15 px-7 py-4 text-base font-semibold text-[#2D4A30] transition-all hover:border-[#0A2E12]/30 hover:bg-[#0A2E12]/[0.03] active:scale-[0.97]"
            >
              <MapPin className="h-4 w-4" /> Find a Club
            </Link>
          </div>
        </div>
      </section>

      {/* iPhone Mockup Showcase */}
      <section className="relative mx-auto max-w-6xl px-6 pb-14 sm:pb-20 md:pb-28">
        <div className="flex justify-center">
          <div className="relative mx-auto w-64 sm:w-72">
            {/* iPhone frame */}
            <div className="rounded-[2.5rem] border-4 border-[#0A2E12]/20 bg-white p-3 shadow-2xl">
              <div className="rounded-[2rem] bg-[#FEFCF9] overflow-hidden">
                {/* Status bar */}
                <div className="flex items-center justify-between px-5 py-2 bg-[#1B5E20]">
                  <span className="text-[10px] font-semibold text-white">9:41</span>
                  <span className="text-[10px] text-white/80">Lawnbowling</span>
                </div>
                {/* App content mockup */}
                <div className="p-4 space-y-3">
                  <div className="rounded-xl bg-[#1B5E20]/10 p-3 text-center">
                    <span className="text-xs font-bold text-[#1B5E20]">Tournament Day</span>
                    <p className="mt-1 text-[10px] text-[#3D5A3E]">You&apos;re checked in</p>
                  </div>
                  <div className="rounded-xl border border-[#0A2E12]/10 bg-white p-3">
                    <span className="text-[10px] font-semibold text-[#0A2E12]">Your Draw</span>
                    <div className="mt-2 flex justify-between">
                      <span className="text-[10px] text-[#3D5A3E]">Rink 3 - Skip</span>
                      <span className="text-[10px] font-bold text-[#1B5E20]">Pairs</span>
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#0A2E12]/10 bg-white p-3">
                    <span className="text-[10px] font-semibold text-[#0A2E12]">Live Score</span>
                    <div className="mt-2 flex justify-between">
                      <span className="text-[10px] text-[#3D5A3E]">End 4 of 15</span>
                      <span className="text-[10px] font-bold text-[#1B5E20]">12 - 8</span>
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#0A2E12]/10 bg-white p-3">
                    <span className="text-[10px] font-semibold text-[#0A2E12]">Season Stats</span>
                    <div className="mt-2 flex justify-between">
                      <span className="text-[10px] text-[#3D5A3E]">W: 14 L: 6</span>
                      <span className="text-[10px] font-bold text-[#B8860B]">70% Win</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative mx-auto max-w-6xl px-6 pb-14 sm:pb-20 md:pb-28">
        <div className="mb-12 text-center">
          <h2
            className="text-2xl font-bold text-[#0A2E12] sm:text-3xl md:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Everything You Need to Bowl
          </h2>
          <p className="mt-3 text-base text-[#3D5A3E] sm:mt-4 sm:text-lg">
            From finding a club to stepping on the green
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: MapPin,
              title: "Club Finder",
              desc: "Browse 100+ lawn bowling clubs across the USA. Find your nearest green and get directions.",
              gradient: "from-amber-500 to-orange-500",
              glow: "shadow-amber-500/20",
            },
            {
              icon: Trophy,
              title: "Tournament Sign-In",
              desc: "Sign in from your phone or the clubhouse iPad. Select your preferred position and see your rink assignment instantly.",
              gradient: "from-[#1B5E20] to-emerald-600",
              glow: "shadow-emerald-500/20",
            },
            {
              icon: Zap,
              title: "Live Scoring",
              desc: "Enter scores end by end on your phone. Results calculate automatically. No more paper scorecards.",
              gradient: "from-blue-600 to-blue-500",
              glow: "shadow-blue-500/20",
            },
            {
              icon: Target,
              title: "Stats & History",
              desc: "Track your wins, losses, and performance over time. See your stats for Singles, Pairs, Triples, and Fours.",
              gradient: "from-purple-500 to-pink-500",
              glow: "shadow-purple-500/20",
            },
            {
              icon: BookOpen,
              title: "Learn the Sport",
              desc: "Comprehensive guides covering rules, positions, formats, equipment, and an 80+ term glossary.",
              gradient: "from-purple-500 to-violet-500",
              glow: "shadow-purple-500/20",
            },
            {
              icon: Shield,
              title: "Per-Session Insurance",
              desc: "Optional per-session coverage for falls, sprains, and bowl-strike injuries. Activates at check-in.",
              gradient: "from-[#1B5E20] to-teal-500",
              glow: "shadow-emerald-500/20",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-[#0A2E12]/10 bg-white p-6 shadow-sm transition-all hover:shadow-lg"
            >
              <div
                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg ${feature.glow}`}
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

      {/* How It Works */}
      <section className="relative mx-auto max-w-6xl px-6 pb-14 sm:pb-20 md:pb-28">
        <div className="mb-12 text-center">
          <h2
            className="text-2xl font-bold text-[#0A2E12] sm:text-3xl md:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Tournament Day, Simplified
          </h2>
          <p className="mt-3 text-base text-[#3D5A3E] sm:mt-4 sm:text-lg">
            Three steps. That&apos;s it.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-3">
          {[
            {
              step: "01",
              icon: Smartphone,
              title: "Sign In",
              desc: "Arrive at the clubhouse. Sign in on the iPad kiosk or your own phone. Select your preferred position — lead, second, third, or skip.",
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
              <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5 sm:p-8 shadow-sm">
                <span
                  className="text-4xl font-black text-[#1B5E20]/15 sm:text-5xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {item.step}
                </span>
                <div className="mt-3 flex items-center gap-3 sm:mt-4">
                  <item.icon className="h-5 w-5 text-[#1B5E20]" />
                  <h3 className="text-lg font-bold text-[#0A2E12] sm:text-xl">
                    {item.title}
                  </h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[#3D5A3E] sm:mt-3 sm:text-base">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className="relative mx-auto max-w-6xl px-6 pb-14 sm:pb-20 md:pb-28">
        <div className="mb-8 text-center md:mb-12">
          <h2
            className="text-2xl font-bold text-[#0A2E12] sm:text-3xl md:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            What Bowlers Say
          </h2>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
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
                "Being able to sign in on my phone and see my rink assignment right away is brilliant. No more crowding the noticeboard.",
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
              className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5 sm:p-6 shadow-sm"
            >
              <div className="mb-3 flex gap-1 sm:mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 text-amber-400 fill-amber-400"
                  />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-[#2D4A30] italic sm:text-base">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm ${testimonial.avatarBg}`}
                >
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <span className="block text-sm font-semibold text-[#0A2E12]">
                    {testimonial.name}
                  </span>
                  <span className="block text-xs text-[#3D5A3E]">
                    {testimonial.role}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Download CTA */}
      <section className="relative mx-auto max-w-6xl px-6 pb-14 sm:pb-20 md:pb-28">
        <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5 sm:p-8 md:p-12 shadow-sm">
          <div className="grid items-center gap-6 sm:gap-8 md:grid-cols-2">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#1B5E20]/20 bg-[#1B5E20]/10 px-3 py-1.5 sm:mb-4 sm:px-4">
                <Smartphone className="h-4 w-4 text-[#1B5E20]" />
                <span className="text-sm font-medium text-[#1B5E20]">
                  Works Everywhere
                </span>
              </div>
              <h2
                className="text-2xl font-bold text-[#0A2E12] sm:text-3xl md:text-4xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Install the App.{" "}
                <span className="text-[#3D5A3E]/50">No Download.</span>
              </h2>
              <p className="mt-3 text-base leading-relaxed text-[#3D5A3E] sm:mt-4 sm:text-lg">
                Lawnbowling is a Progressive Web App. Just visit the site and
                tap &ldquo;Add to Home Screen&rdquo; for an app-like experience.
                Works on iPhone, Android, iPad, and desktop.
              </p>
              <ul className="mt-4 space-y-2.5 sm:mt-6 sm:space-y-3">
                {[
                  "Install via 'Add to Home Screen'",
                  "Works offline with cached data",
                  "iPad landscape kiosk mode",
                  "iPhone portrait personal mode",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2.5 text-sm text-[#2D4A30] sm:gap-3 sm:text-base"
                  >
                    <CheckCircle className="h-4 w-4 text-[#1B5E20] shrink-0 sm:h-5 sm:w-5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="h-52 w-64 rounded-2xl border border-[#0A2E12]/15 bg-[#FEFCF9] p-2.5 shadow-2xl sm:h-64 sm:w-80 sm:p-3 md:h-72 md:w-96">
                  <div className="flex h-full flex-col rounded-xl bg-white">
                    <div className="flex items-center gap-2 border-b border-[#0A2E12]/10 px-3 py-1.5 sm:px-4 sm:py-2">
                      <span className="text-xs font-bold text-[#1B5E20]">
                        Lawnbowling
                      </span>
                      <span className="ml-auto flex items-center gap-1">
                        <span className="live-dot" />
                        <span className="text-xs text-[#3D5A3E]">Live</span>
                      </span>
                    </div>
                    <div className="flex-1 p-2 sm:p-3">
                      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div
                            key={i}
                            className="rounded-lg border border-[#0A2E12]/10 bg-[#FEFCF9] p-1.5 sm:p-2"
                          >
                            <div className="mx-auto mb-1 h-5 w-5 rounded-full bg-[#0A2E12]/10 sm:h-6 sm:w-6" />
                            <div className="mx-auto h-1 w-8 rounded-full bg-[#0A2E12]/10 sm:h-1.5 sm:w-10" />
                            <div className="mx-auto mt-0.5 h-0.5 w-5 rounded-full bg-[#1B5E20]/30 sm:mt-1 sm:h-1 sm:w-6" />
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
      <section className="relative mx-auto max-w-6xl px-6 pb-14 sm:pb-20 md:pb-28">
        <div className="rounded-3xl bg-gradient-to-r from-[#0A2E12] to-[#1B5E20] p-8 text-center shadow-2xl shadow-emerald-500/15 md:p-16">
          <h2
            className="text-3xl font-bold text-white md:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Ready to Bowl?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-emerald-100/80">
            Sign up, find a club near you, and get on the green. It&apos;s
            free for players.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-base font-semibold text-[#1B5E20] shadow-lg transition hover:bg-[#F0FFF4] active:scale-[0.98]"
            >
              Get Started
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
