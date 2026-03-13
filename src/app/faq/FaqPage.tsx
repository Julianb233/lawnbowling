"use client";

import { useState } from "react";
import Link from "next/link";
import * as Accordion from "@radix-ui/react-accordion";
import {
  CircleDot,
  ChevronDown,
  Search,
  Rocket,
  Trophy,
  Shield,
  Building2,
  UserCircle,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PublicNav } from "@/components/PublicNav";

interface FaqCategory {
  name: string;
  icon: LucideIcon;
  questions: { q: string; a: string }[];
}

const categories: FaqCategory[] = [
  {
    name: "Getting Started",
    icon: Rocket,
    questions: [
      {
        q: "What is Lawnbowling?",
        a: "Lawnbowling is the digital platform for lawn bowling clubs. It replaces the paper draw sheet with automatic tournament draws, live scoring, a nationwide club directory, and learning resources — all accessible from a phone, iPad, or desktop.",
      },
      {
        q: "How do I create an account?",
        a: "Tap 'Get Started' on the home page or visit the signup page. You can sign up with your email and a password. Once registered, you can set your preferred position, skill level, and profile details.",
      },
      {
        q: "Is Lawnbowling free for players?",
        a: "Yes. Lawnbowling is completely free for players. You can check in for tournament days, view your draw, enter scores, and track your stats at no cost.",
      },
      {
        q: "Do I need to download an app?",
        a: "No. Lawnbowling is a Progressive Web App (PWA). Just visit the site on your phone's browser and tap 'Add to Home Screen' for an app-like experience. It works on iPhone, Android, iPad, and desktop.",
      },
    ],
  },
  {
    name: "Playing",
    icon: Trophy,
    questions: [
      {
        q: "How do I check in for a tournament?",
        a: "Walk up to the clubhouse iPad kiosk or open Lawnbowling on your phone. Tap 'Check In' to mark yourself as available for the draw. You can also select your preferred position (lead, second, third, or skip).",
      },
      {
        q: "How does the draw work?",
        a: "The drawmaster taps one button to generate the draw. Teams are formed automatically, rinks are assigned, and positions are balanced. You see your team, rink, and position instantly on screen.",
      },
      {
        q: "What sports are supported?",
        a: "Lawnbowling is built specifically for lawn bowling. All features — tournament draws, live scoring, club directory, and learning resources — are designed for the sport of bowls.",
      },
      {
        q: "What formats are supported?",
        a: "Lawnbowling supports Singles, Pairs, Triples, and Fours. Multiple rotation formats are available including Mead Draw and Gavel Draw for multi-round tournaments.",
      },
      {
        q: "How does scoring work?",
        a: "Scores are entered per end, per rink on the iPad or phone. Results calculate automatically when all ends are complete. Stats update live.",
      },
    ],
  },
  {
    name: "Insurance",
    icon: Shield,
    questions: [
      {
        q: "What is Daily Event Insurance?",
        a: "Daily Event Insurance is per-event liability coverage for recreational sports. Instead of an annual policy, you pay a small fee per session — typically $5-$15 — and are covered for that specific event.",
      },
      {
        q: "How do I get insurance through Lawnbowling?",
        a: "After signing your digital waiver at the venue, an insurance offer appears in your profile. Tap 'Get Coverage' to activate instantly. No forms or phone calls required.",
      },
      {
        q: "What does the insurance cover?",
        a: "Coverage includes general liability, personal injury protection, equipment damage, medical payments, and third-party claims. Visit the Insurance page for full details.",
      },
      {
        q: "Is the insurance real?",
        a: "Yes. Policies are underwritten by licensed, regulated insurance carriers and meet all state requirements. Daily Event Insurance is powered by HiQOR's InsurTech platform.",
      },
    ],
  },
  {
    name: "Clubs",
    icon: Building2,
    questions: [
      {
        q: "How do I set up my club on Lawnbowling?",
        a: "Create a club account, enter your facility details (name, address, hours), define your rinks, and you're ready to go. Most clubs are live within 30 minutes.",
      },
      {
        q: "What equipment do I need?",
        a: "Just an iPad for the check-in kiosk and a Wi-Fi connection. Players can also use their own phones. No special hardware or installation required.",
      },
      {
        q: "How much does it cost for venues?",
        a: "We offer a free Starter tier (up to 4 courts), a Pro tier at $49/month (unlimited courts, analytics, insurance revenue share), and custom Enterprise pricing for multi-location organizations.",
      },
      {
        q: "Can I earn revenue from insurance?",
        a: "Yes. Pro and Enterprise venues earn a commission on every Daily Event Insurance policy purchased by players at their facility.",
      },
      {
        q: "Do players need to sign waivers?",
        a: "Digital waivers are built in. Players sign on check-in, and every signature is logged with a timestamp. This replaces paper waivers and ensures compliance.",
      },
    ],
  },
  {
    name: "Account",
    icon: UserCircle,
    questions: [
      {
        q: "How do I update my profile?",
        a: "Go to Settings > Profile to update your display name, avatar, preferred position, and skill level.",
      },
      {
        q: "How do I delete my account?",
        a: "Go to Settings > Account > Delete Account. This will permanently remove your profile, match history, and all associated data. This action cannot be undone.",
      },
      {
        q: "Is my data private?",
        a: "Yes. We only display your display name on the check-in board. Your email and personal details are never shared. See our Privacy Policy for details.",
      },
    ],
  },
  {
    name: "Technical",
    icon: Wrench,
    questions: [
      {
        q: "Does it work offline?",
        a: "Lawnbowling caches key data for offline access, but real-time features (live board, partner requests, court assignment) require an internet connection.",
      },
      {
        q: "What browsers are supported?",
        a: "Lawnbowling works in all modern browsers: Safari (iOS/macOS), Chrome (Android/desktop), Firefox, and Edge. We recommend the latest version for the best experience.",
      },
      {
        q: "How do I install the PWA?",
        a: "On iPhone: visit the site in Safari, tap the Share button, then 'Add to Home Screen.' On Android: visit the site in Chrome, tap the three-dot menu, then 'Add to Home Screen' or accept the install banner.",
      },
      {
        q: "Who do I contact for support?",
        a: "Use the Contact page to reach our support team. For venue-specific issues, Pro and Enterprise customers have access to priority support.",
      },
    ],
  },
];

export function FaqPage() {
  const [search, setSearch] = useState("");

  const filteredCategories = categories
    .map((cat) => ({
      ...cat,
      questions: cat.questions.filter(
        (item) =>
          item.q.toLowerCase().includes(search.toLowerCase()) ||
          item.a.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((cat) => cat.questions.length > 0);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Floating glowing orbs */}
      <div
        className="orb orb-emerald"
        style={{ top: "-5%", left: "-5%", width: "400px", height: "400px" }}
      />
      <div
        className="orb orb-blue"
        style={{
          bottom: "-10%",
          right: "-5%",
          width: "350px",
          height: "350px",
        }}
      />
      <div
        className="orb orb-amber"
        style={{ top: "40%", right: "5%", width: "250px", height: "250px" }}
      />

      {/* Navigation */}

      <PublicNav />

      {/* Hero */}
      <section className="relative mx-auto max-w-4xl px-6 pt-20 pb-12 md:pt-28 md:pb-16">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight text-[#0A2E12] md:text-6xl">
            Frequently Asked{" "}
            <span className="text-gradient">Questions</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#3D5A3E]">
            Everything you need to know about Lawnbowling — for players and
            venues alike.
          </p>

          {/* Search */}
          <div className="relative mt-10 w-full max-w-lg">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#3D5A3E]" />
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-[#0A2E12]/10 bg-white py-4 pl-12 pr-4 text-[#0A2E12] shadow-sm outline-none transition-all placeholder:text-[#3D5A3E] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="relative mx-auto max-w-4xl px-6 pb-24">
        {filteredCategories.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-lg text-[#3D5A3E]">
              No questions match &ldquo;{search}&rdquo;. Try a different search
              term.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {filteredCategories.map((category) => (
              <div key={category.name}>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                    <category.icon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-bold text-[#0A2E12]">
                    {category.name}
                  </h2>
                </div>

                <Accordion.Root type="multiple" className="space-y-2">
                  {category.questions.map((item, i) => (
                    <Accordion.Item
                      key={i}
                      value={`${category.name}-${i}`}
                      className="overflow-hidden rounded-xl border border-[#0A2E12]/10 bg-white shadow-sm"
                    >
                      <Accordion.Trigger className="flex w-full items-center justify-between px-5 py-4 text-left text-[#0A2E12] hover:bg-[#0A2E12]/[0.03] transition-colors min-h-[44px] group">
                        <span className="pr-4 font-medium">{item.q}</span>
                        <ChevronDown className="h-4 w-4 shrink-0 text-[#3D5A3E] transition-transform duration-200 group-data-[state=open]:rotate-180" />
                      </Accordion.Trigger>
                      <Accordion.Content className="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
                        <div className="border-t border-[#0A2E12]/10 px-5 py-4">
                          <p className="text-sm leading-relaxed text-[#3D5A3E]">
                            {item.a}
                          </p>
                        </div>
                      </Accordion.Content>
                    </Accordion.Item>
                  ))}
                </Accordion.Root>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Still Have Questions CTA */}
      <section className="relative mx-auto max-w-4xl px-6 pb-24">
        <div className="glass rounded-2xl p-8 text-center md:p-12">
          <h2 className="text-2xl font-bold text-[#0A2E12]">
            Still Have Questions?
          </h2>
          <p className="mt-3 text-[#3D5A3E]">
            Our team is happy to help. Reach out and we&apos;ll get back to you
            within 24 hours.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/15 transition hover:bg-emerald-500 active:scale-[0.98]"
          >
            Contact Us
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#0A2E12]/10 bg-[#0A2E12]/[0.03]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1B5E20]">
              <CircleDot className="h-4 w-4 text-white" />
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
            <Link href="/about" className="hover:text-[#2D4A30] transition">
              About
            </Link>
            <Link href="/faq" className="hover:text-[#2D4A30] transition">
              FAQ
            </Link>
            <Link
              href="/terms"
              className="hover:text-[#2D4A30] transition"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="hover:text-[#2D4A30] transition"
            >
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
