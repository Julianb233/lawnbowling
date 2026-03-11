"use client";

import { useState } from "react";
import Link from "next/link";
import * as Accordion from "@radix-ui/react-accordion";
import {
  Users,
  ChevronDown,
  Search,
  Rocket,
  Gamepad2,
  Shield,
  Building2,
  UserCircle,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

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
        a: "Lawnbowling is a real-time digital player board for recreational sports at community venues. It replaces the traditional clipboard sign-up sheet, letting you check in, find partners, and get matched to courts — all from your phone or the venue kiosk.",
      },
      {
        q: "How do I create an account?",
        a: "Tap 'Get Started' on the home page or visit the signup page. You can sign up with your email and a password. Once registered, you can set your preferred sports, skill levels, and profile details.",
      },
      {
        q: "Is Lawnbowling free for players?",
        a: "Yes. Lawnbowling is completely free for players. You can check in, browse available players, send partner requests, and get assigned to courts at no cost.",
      },
      {
        q: "Do I need to download an app?",
        a: "No. Lawnbowling is a Progressive Web App (PWA). Just visit the site on your phone's browser and tap 'Add to Home Screen' for an app-like experience. It works on iPhone, Android, iPad, and desktop.",
      },
    ],
  },
  {
    name: "Playing",
    icon: Gamepad2,
    questions: [
      {
        q: "How do I check in at a venue?",
        a: "Walk up to the venue's iPad kiosk or open Lawnbowling on your phone. Select your sport and tap 'Check In' to mark yourself as available on the live board.",
      },
      {
        q: "How does partner matching work?",
        a: "Browse the live board to see who's available. Tap a player to send a partner request. If they accept, you're matched and assigned a court automatically. Requests expire after a set time if not accepted.",
      },
      {
        q: "What sports are supported?",
        a: "Currently supported: pickleball, tennis, lawn bowling, badminton, racquetball, and flag football. We're actively adding more sports based on venue and player requests.",
      },
      {
        q: "How do court timers work?",
        a: "Once matched, your pair is assigned to an available court with a countdown timer (usually 15-30 minutes depending on venue settings). When time is up, the court is freed for the next players in rotation.",
      },
      {
        q: "Can I play with a specific friend?",
        a: "Yes. Find them on the board and tap their name to send a partner request directly. You can also add players as friends to quickly find them in future sessions.",
      },
    ],
  },
  {
    name: "Insurance",
    icon: Shield,
    questions: [
      {
        q: "What is Daily Event Insurance?",
        a: "Daily Event Insurance provides per-participant liability coverage for recreational sports. It fills gaps in general liability policies that protect only employees, not participants. Coverage activates instantly at the point of activity and deactivates when the event ends.",
      },
      {
        q: "How much does it cost for venues?",
        a: "Daily Event Insurance is completely FREE for venue partners. There are zero setup fees, no monthly costs, and no hidden charges. Partners actually earn $2 to $10 for every covered participant.",
      },
      {
        q: "What does the insurance cover?",
        a: "Coverage includes per-participant liability, activity injury medical expenses, emergency transport, and Accidental Death & Dismemberment (AD&D) through the ActiveGuard\u2122 program. Visit the Insurance page for full details.",
      },
      {
        q: "Is the insurance real?",
        a: "Yes. Policies are underwritten by A-rated carriers including AIG, Lloyd's of London Syndicates, and Great American Insurance Group. Daily Event Insurance is licensed in all 50 states.",
      },
    ],
  },
  {
    name: "Venues",
    icon: Building2,
    questions: [
      {
        q: "How do I set up my venue on Lawnbowling?",
        a: "Create a venue account, enter your facility details (name, address, hours, sports), define your courts, and you're ready to go. Most venues are live within 30 minutes.",
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
        a: "Yes. Daily Event Insurance is completely free for venues to offer, and partners earn $2 to $10 for every covered participant. Onboarding takes about 10 minutes with no credit card required, and coverage integrates within 48 hours.",
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
        a: "Go to Settings > Profile to update your display name, avatar, preferred sports, and skill levels.",
      },
      {
        q: "Can I change my skill level?",
        a: "Yes. Visit your profile and tap on any sport to adjust your self-reported skill level. Venues may also have admin-set ratings based on observed play.",
      },
      {
        q: "How do I delete my account?",
        a: "Go to Settings > Account > Delete Account. This will permanently remove your profile, match history, and all associated data. This action cannot be undone.",
      },
      {
        q: "Is my data private?",
        a: "Yes. We only display your display name and sport preferences on the live board. Your email and personal details are never shared. See our Privacy Policy for details.",
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
    <div className="min-h-screen bg-[#FEFCF9] overflow-hidden">
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
      <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#1B5E20] to-[#1B5E20] shadow-lg shadow-[#1B5E20]/15">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-zinc-900">
              Lawnbowling
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/about"
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
            >
              About
            </Link>
            <Link
              href="/insurance"
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
            >
              Insurance
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-[#1B5E20] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#1B5E20]/15 transition hover:bg-[#1B5E20] hover:shadow-[#1B5E20]/25"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative mx-auto max-w-4xl px-6 pt-20 pb-12 md:pt-28 md:pb-16">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight text-zinc-900 md:text-6xl">
            Frequently Asked{" "}
            <span className="text-gradient">Questions</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-600">
            Everything you need to know about Lawnbowling — for players and
            venues alike.
          </p>

          {/* Search */}
          <div className="relative mt-10 w-full max-w-lg">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 bg-white py-4 pl-12 pr-4 text-zinc-900 shadow-sm outline-none transition-all placeholder:text-zinc-400 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20"
            />
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="relative mx-auto max-w-4xl px-6 pb-24">
        {filteredCategories.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-lg text-zinc-500">
              No questions match &ldquo;{search}&rdquo;. Try a different search
              term.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {filteredCategories.map((category) => (
              <div key={category.name}>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1B5E20]/10">
                    <category.icon className="h-5 w-5 text-[#1B5E20]" />
                  </div>
                  <h2 className="text-xl font-bold text-zinc-900">
                    {category.name}
                  </h2>
                </div>

                <Accordion.Root type="multiple" className="space-y-2">
                  {category.questions.map((item, i) => (
                    <Accordion.Item
                      key={i}
                      value={`${category.name}-${i}`}
                      className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"
                    >
                      <Accordion.Trigger className="flex w-full items-center justify-between px-5 py-4 text-left text-zinc-900 hover:bg-zinc-50 transition-colors min-h-[44px] group">
                        <span className="pr-4 font-medium">{item.q}</span>
                        <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                      </Accordion.Trigger>
                      <Accordion.Content className="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
                        <div className="border-t border-zinc-100 px-5 py-4">
                          <p className="text-sm leading-relaxed text-zinc-600">
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
          <h2 className="text-2xl font-bold text-zinc-900">
            Still Have Questions?
          </h2>
          <p className="mt-3 text-zinc-600">
            Our team is happy to help. Reach out and we&apos;ll get back to you
            within 24 hours.
          </p>
          <Link
            href="/(public)/contact"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1B5E20] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#1B5E20]/15 transition hover:bg-[#1B5E20] active:scale-[0.98]"
          >
            Contact Us
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-zinc-50">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#1B5E20] to-[#1B5E20]">
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
