import type { Metadata } from "next";
import Link from "next/link";
import {
  CircleDot,
  Trophy,
  QrCode,
  Shield,
  Globe,
  BookOpen,
  ChevronRight,
  Target,
  Users,
  BarChart3,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Lawnbowling | The World's Best Lawn Bowling App",
  description:
    "Lawnbowling is the modern platform for lawn bowling clubs — tournament management, club directory, insurance, and education. Built for bowlers, by bowlers.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B5E20]">
              <CircleDot className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-bold text-zinc-900 sm:text-lg">
              Lawnbowling
            </span>
          </Link>
          <Link
            href="/signup"
            className="rounded-xl bg-[#1B5E20] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2E7D32]"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-12 pb-12 sm:px-6 sm:pt-20 sm:pb-16">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-1.5">
            <Target className="h-4 w-4 text-[#1B5E20]" />
            <span className="text-sm font-medium text-[#1B5E20]">
              Our Mission
            </span>
          </div>
          <h1 className="max-w-3xl text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl md:text-6xl">
            The Modern Way to{" "}
            <span className="text-[#1B5E20]">Run a Bowling Club</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-600 sm:mt-6 sm:text-lg">
            Lawnbowling replaces the paper draw sheet, the shouted announcements,
            and the clipboard sign-ups. One app for tournament days, club management,
            and growing the sport nationally.
          </p>
        </div>
      </section>

      {/* The Problem */}
      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 sm:pb-20">
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
              The Paper Draw Era Is Over
            </h2>
            <p className="mt-3 text-base leading-relaxed text-zinc-600 sm:mt-4 sm:text-lg">
              Walk into any lawn bowling club on tournament day and you&apos;ll see
              the same scene: a drawmaster writing names on a whiteboard, shouting
              team assignments across the green, and players squinting to read
              their rink numbers.
            </p>
            <ul className="mt-5 space-y-3">
              {[
                "Manual draw takes 15-20 minutes per round",
                "Position balance is guesswork",
                "Score tracking scattered on paper slips",
                "Results lost after tournament day",
                "New members don't know the rules or terminology",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-zinc-600 sm:text-base"
                >
                  <span className="mt-1.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-6 sm:p-8">
            <div className="space-y-3">
              <div className="h-5 w-36 rounded bg-zinc-200" />
              <div className="space-y-2">
                {["Rink 1: ???", "Rink 2: ???", "Rink 3: (illegible)", "Rink 4: ???"].map((text, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3"
                  >
                    <div className="h-3 w-3 rounded border-2 border-zinc-300" />
                    <span className="text-sm text-zinc-400 italic">{text}</span>
                  </div>
                ))}
              </div>
              <p className="text-center text-xs italic text-zinc-400 pt-2">
                Sound familiar?
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="bg-green-50/50 py-12 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-8 text-center sm:mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 sm:text-3xl md:text-4xl">
              One App. Everything Bowls.
            </h2>
            <p className="mt-3 text-base text-zinc-600 sm:text-lg">
              Built specifically for lawn bowling — not adapted from another sport
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            {[
              {
                icon: QrCode,
                title: "QR Check-In",
                desc: "Players scan a QR code at the clubhouse. No accounts needed. Select your position — Skip, Lead, or Vice.",
              },
              {
                icon: Trophy,
                title: "Auto Draw & Scoring",
                desc: "One-tap draw generation balanced by position. Live scoring per end, per rink. Results calculated instantly.",
              },
              {
                icon: Globe,
                title: "Club Directory",
                desc: "90+ USA clubs searchable by state. Claim your club listing. State-level pages for local SEO.",
              },
              {
                icon: Shield,
                title: "Day-of Insurance",
                desc: "Daily Event Insurance from $3/player. Integrated at check-in for maximum convenience.",
              },
              {
                icon: BookOpen,
                title: "Learning Hub",
                desc: "Rules, positions, formats, and an 80+ term glossary. Everything newcomers need to get started.",
              },
              {
                icon: BarChart3,
                title: "History & Stats",
                desc: "Tournament results archived. Player statistics tracked. Print-friendly draw sheets.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-zinc-100 bg-white p-5 sm:p-6"
              >
                <feature.icon className="h-6 w-6 text-[#1B5E20] mb-3" />
                <h3 className="text-base font-semibold text-zinc-900 sm:text-lg">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Numbers */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
        <div className="rounded-2xl bg-[#1B5E20] p-6 sm:p-10 md:p-12">
          <div className="grid gap-6 text-center sm:grid-cols-4 sm:gap-8">
            {[
              { number: "90+", label: "USA Clubs" },
              { number: "24", label: "States" },
              { number: "2min", label: "Check-in to Draw" },
              { number: "Free", label: "For All Clubs" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-extrabold text-white sm:text-4xl">
                  {stat.number}
                </div>
                <div className="mt-1 text-sm font-medium text-green-200/70 uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 sm:pb-20">
        <h2 className="text-2xl font-bold text-zinc-900 mb-6 sm:text-3xl sm:mb-10 text-center">
          Built for Every Role at the Club
        </h2>
        <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
          {[
            {
              title: "Drawmasters",
              desc: "Generate balanced draws in one tap. Enter scores on the iPad. Print draw sheets. Run multi-round tournaments effortlessly.",
              icon: Trophy,
            },
            {
              title: "Players",
              desc: "Check in with a QR scan. See your team and rink instantly on your phone. View results and stats after the game.",
              icon: Users,
            },
            {
              title: "Club Committees",
              desc: "Track member participation. View tournament history. Manage insurance coverage. List your club in the national directory.",
              icon: BarChart3,
            },
          ].map((role) => (
            <div key={role.title} className="rounded-xl border border-zinc-100 bg-white p-5 sm:p-6">
              <role.icon className="h-6 w-6 text-[#1B5E20] mb-3" />
              <h3 className="text-lg font-bold text-zinc-900 mb-2">{role.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-500">{role.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 sm:pb-20">
        <div className="rounded-2xl bg-[#1B5E20] p-6 text-center sm:p-10 md:p-16">
          <h2 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl">
            Ready to Modernize Your Club?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-green-100/80 sm:mt-4 sm:text-lg">
            Join the clubs already using Lawnbowling to run better tournament days.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:mt-8 sm:flex-row sm:gap-4">
            <Link
              href="/signup"
              className="w-full rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-[#1B5E20] transition hover:bg-zinc-50 active:scale-[0.98] sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
            >
              Start Free Trial
            </Link>
            <Link
              href="/contact"
              className="w-full rounded-xl border-2 border-white/30 px-6 py-3.5 text-base font-semibold text-white transition hover:border-white/60 hover:bg-white/10 active:scale-[0.98] sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 sm:px-6 sm:py-8 md:flex-row">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B5E20]">
              <CircleDot className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-zinc-900">Lawnbowling</span>
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-zinc-500">
            <Link href="/clubs" className="hover:text-zinc-700 transition">Clubs</Link>
            <Link href="/learn" className="hover:text-zinc-700 transition">Learn</Link>
            <Link href="/insurance" className="hover:text-zinc-700 transition">Insurance</Link>
            <Link href="/faq" className="hover:text-zinc-700 transition">FAQ</Link>
            <Link href="/terms" className="hover:text-zinc-700 transition">Terms</Link>
            <Link href="/privacy" className="hover:text-zinc-700 transition">Privacy</Link>
          </div>
          <span className="text-sm text-zinc-400">
            &copy; {new Date().getFullYear()} Lawnbowling
          </span>
        </div>
      </footer>
    </div>
  );
}
