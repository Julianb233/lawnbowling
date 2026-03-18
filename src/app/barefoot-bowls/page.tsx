import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Sun,
  Music,
  Users,
  MapPin,
  ChevronRight,
  CheckCircle,
  PartyPopper,
  Shirt,
  Clock,
  Heart,
  Star,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import { getArticleSchema, getBreadcrumbSchema, getFAQSchema, jsonLd } from "@/lib/schema";
import bowlsIconImg from "@/../public/images/logo/bowls-icon.png";

export const metadata: Metadata = {
  title: "Barefoot Bowls | What Is Barefoot Bowls? Find Events Near You | Lawnbowling",
  description:
    "Barefoot bowls is the fun, social way to experience lawn bowling — shoes off, drinks in hand, music playing. Learn what to expect, what to wear, and find barefoot bowls events near you.",
  keywords: [
    "barefoot bowls",
    "barefoot bowls near me",
    "barefoot bowling",
    "social bowls",
    "barefoot bowls what to wear",
    "barefoot bowls events",
    "barefoot bowls party",
    "social lawn bowls",
    "lawn bowls social",
    "casual lawn bowling",
  ],
  alternates: { canonical: "/barefoot-bowls" },
  openGraph: {
    title: "Barefoot Bowls | The Fun Social Way to Bowl",
    description:
      "Kick off your shoes and roll some bowls. Barefoot bowls is lawn bowling's most social format — perfect for groups, parties, and date nights.",
    url: "https://lawnbowl.app/barefoot-bowls",
    type: "article",
    siteName: "Lawnbowling",
  },
  twitter: {
    card: "summary_large_image",
    title: "Barefoot Bowls | Social Lawn Bowling for Everyone",
    description:
      "Shoes off, bowls in hand. Discover barefoot bowls — the social side of lawn bowling perfect for groups and parties.",
  },
};

const faqs = [
  {
    question: "What is barefoot bowls?",
    answer:
      "Barefoot bowls is a casual, social version of lawn bowls where players kick off their shoes and play on the grass in bare feet or socks. It's popular at bowling clubs, pubs, and social venues, especially in Australia and increasingly in the US and UK.",
  },
  {
    question: "Do I need to bring my own bowls?",
    answer:
      "No! Venues always provide bowls for barefoot bowls sessions. Just show up ready to have fun.",
  },
  {
    question: "What should I wear to barefoot bowls?",
    answer:
      "Wear comfortable, casual clothing. Think summer BBQ attire — shorts, a t-shirt or sundress, and clothes you can move in. You'll be playing on grass, so avoid anything too formal. Sunscreen and a hat are recommended for outdoor sessions.",
  },
  {
    question: "How long does a barefoot bowls session last?",
    answer:
      "Most sessions run 1.5 to 2.5 hours, though this varies by venue. Some include a meal or drinks package. Corporate and party bookings can be customized.",
  },
  {
    question: "Can I book barefoot bowls for a party or corporate event?",
    answer:
      "Absolutely! Barefoot bowls is one of the most popular group activities for birthday parties, work functions, hen's/buck's parties, and team-building events. Most clubs offer group packages with catering.",
  },
  {
    question: "Do I need any experience to play?",
    answer:
      "None at all. Barefoot bowls is designed for complete beginners. The rules are simplified, and most venues provide a quick tutorial before you start. The whole point is to have fun, not to be competitive.",
  },
];

export default function BarefootBowlsPage() {
  const articleSchema = getArticleSchema({
    title: "Barefoot Bowls | What Is Barefoot Bowls?",
    description:
      "Barefoot bowls is the fun, social way to experience lawn bowling. Learn what to expect, what to wear, and find events near you.",
    url: "/barefoot-bowls",
  });
  const breadcrumbs = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Barefoot Bowls", url: "/barefoot-bowls" },
  ]);
  const faqSchema = getFAQSchema(faqs);

  return (
    <div className="min-h-screen bg-[#FEFCF9] overflow-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />
      <PublicNav />

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pt-20 pb-14 sm:pb-20 md:pt-28 md:pb-28">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#1B5E20]/20 bg-[#1B5E20]/10 px-4 py-1.5">
            <Sun className="h-4 w-4 text-[#1B5E20]" />
            <span className="text-sm font-medium text-[#1B5E20]">
              Social Bowls
            </span>
          </div>
          <h1
            className="max-w-4xl text-5xl font-extrabold leading-[1.1] tracking-tight text-[#0A2E12] md:text-7xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Barefoot{" "}
            <span className="italic text-[#1B5E20]">Bowls</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#3D5A3E] md:text-xl">
            Kick off your shoes, grab a drink, and roll some bowls on the green.
            Barefoot bowls is lawn bowling at its most fun and social — perfect
            for groups, parties, date nights, and anyone who wants to try
            something different.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/clubs"
              className="group inline-flex items-center gap-2 rounded-xl bg-[#1B5E20] px-7 py-4 text-base font-semibold text-white shadow-2xl shadow-emerald-500/20 transition-all hover:bg-[#145218] hover:shadow-emerald-500/35 active:scale-[0.97] min-h-[44px]"
            >
              <MapPin className="h-4 w-4" />
              Find Barefoot Bowls Near Me
            </Link>
            <Link
              href="#what-is-barefoot-bowls"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-[#0A2E12]/15 px-7 py-4 text-base font-semibold text-[#2D4A30] transition-all hover:border-[#0A2E12]/30 hover:bg-[#0A2E12]/[0.03] active:scale-[0.97] min-h-[44px]"
            >
              Learn More
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* What is Barefoot Bowls */}
      <section id="what-is-barefoot-bowls" className="relative mx-auto max-w-6xl px-6 pb-14 sm:pb-20 md:pb-28">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.15em] text-[#B8860B]">
              The Social Side of Bowls
            </p>
            <h2
              className="text-3xl font-bold text-[#0A2E12] md:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              What Is Barefoot Bowls?
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-[#3D5A3E]">
              Barefoot bowls is a relaxed, social version of lawn bowling where you
              play without shoes on real grass greens. No experience needed, no
              special equipment required — just show up and have fun.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-[#3D5A3E]">
              Born in Australia where it became a cultural phenomenon, barefoot bowls
              has spread around the world. Bowling clubs host regular sessions with
              music, food, drinks, and a party atmosphere that attracts a younger,
              more diverse crowd than traditional competition bowls.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-[#3D5A3E]">
              Think of it as the bowling equivalent of a casual pick-up game — the
              rules are simplified, the vibe is relaxed, and the emphasis is on
              having a great time with friends.
            </p>
          </div>
          <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5 sm:p-6 shadow-sm">
            <h3
              className="mb-4 text-xl font-bold text-[#0A2E12]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Why People Love It
            </h3>
            <ul className="space-y-3">
              {[
                { icon: Users, text: "Social — perfect for groups of any size" },
                { icon: Sun, text: "Outdoors on beautiful grass greens" },
                { icon: Music, text: "Music, food, and drinks on the green" },
                { icon: Heart, text: "No experience or fitness required" },
                { icon: PartyPopper, text: "Great for parties and corporate events" },
                { icon: Clock, text: "Easy to learn in 5 minutes" },
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-3 text-[#3D5A3E]">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1B5E20]/10">
                    <item.icon className="h-4 w-4 text-[#1B5E20]" />
                  </div>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="relative mx-auto max-w-6xl px-6 pb-14 sm:pb-20 md:pb-28">
        <div className="mb-12 text-center">
          <h2
            className="text-3xl font-bold text-[#0A2E12] md:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            What to Expect
          </h2>
          <p className="mt-4 text-lg text-[#3D5A3E]">
            Your first barefoot bowls session, step by step
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-4">
          {[
            {
              step: "01",
              title: "Arrive & Check In",
              desc: "Head to the bowling club. Take off your shoes and grab a drink from the bar. The club provides all the bowls you need.",
            },
            {
              step: "02",
              title: "Quick Tutorial",
              desc: "A host gives a 5-minute intro on how to hold and roll the bowls. The key thing: bowls are biased — they curve as they slow down.",
            },
            {
              step: "03",
              title: "Play on the Green",
              desc: "Split into teams and start bowling. Roll your bowls as close to the small white jack as possible. Closest bowl wins the end.",
            },
            {
              step: "04",
              title: "Enjoy the Vibe",
              desc: "Between ends, enjoy the music, grab food, and soak up the atmosphere. Most sessions run 1.5 to 2.5 hours.",
            },
          ].map((item) => (
            <div key={item.step} className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5 sm:p-6 shadow-sm">
              <span
                className="text-4xl font-black text-[#1B5E20]/15 sm:text-5xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {item.step}
              </span>
              <h3 className="mt-3 text-lg font-bold text-[#0A2E12]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#3D5A3E]">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* What to Wear */}
      <section className="relative mx-auto max-w-6xl px-6 pb-14 sm:pb-20 md:pb-28">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#1B5E20]">
                Dress Code Cheat Sheet
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Footwear", value: "Bare feet or socks (that's the whole point!)", ok: true },
                  { label: "Bottoms", value: "Shorts, skirts, casual pants — anything comfy", ok: true },
                  { label: "Tops", value: "T-shirts, singlets, sundresses, casual shirts", ok: true },
                  { label: "Sun protection", value: "Hat, sunglasses, and sunscreen recommended", ok: true },
                  { label: "High heels", value: "Leave them at home — you're on grass", ok: false },
                  { label: "Formal wear", value: "Save it for another occasion", ok: false },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3 rounded-xl border border-[#0A2E12]/5 bg-[#FEFCF9] p-3">
                    <CheckCircle className={`h-5 w-5 mt-0.5 shrink-0 ${item.ok ? "text-[#1B5E20]" : "text-rose-400"}`} />
                    <div>
                      <span className="text-sm font-semibold text-[#0A2E12]">{item.label}</span>
                      <p className="text-sm text-[#3D5A3E]">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#1B5E20]/20 bg-[#1B5E20]/10 px-4 py-1.5">
              <Shirt className="h-4 w-4 text-[#1B5E20]" />
              <span className="text-sm font-medium text-[#1B5E20]">
                What to Wear
              </span>
            </div>
            <h2
              className="text-3xl font-bold text-[#0A2E12] md:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Keep It Casual
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-[#3D5A3E]">
              The dress code for barefoot bowls is simple: wear whatever you&apos;d
              wear to a summer BBQ. Comfortable, casual, and ready for the grass.
              The only real rule is no shoes on the green — that&apos;s the whole
              point of &ldquo;barefoot&rdquo; bowls.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-[#3D5A3E]">
              If it&apos;s sunny, don&apos;t forget sunscreen and a hat. You&apos;ll
              be outside on the green for a couple of hours, so plan for the
              weather.
            </p>
          </div>
        </div>
      </section>

      {/* Perfect For */}
      <section className="relative mx-auto max-w-6xl px-6 pb-14 sm:pb-20 md:pb-28">
        <div className="mb-12 text-center">
          <h2
            className="text-3xl font-bold text-[#0A2E12] md:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Perfect For Every Occasion
          </h2>
          <p className="mt-4 text-lg text-[#3D5A3E]">
            Barefoot bowls works for almost any group event
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Birthday Parties", icon: PartyPopper },
            { label: "Corporate Events", icon: Users },
            { label: "Date Nights", icon: Heart },
            { label: "Hen & Buck Parties", icon: Star },
            { label: "Uni Socials", icon: Music },
            { label: "Family Gatherings", icon: Sun },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center gap-3 rounded-2xl border border-[#0A2E12]/10 bg-white p-5 text-center transition-all hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1B5E20]/10">
                <item.icon className="h-6 w-6 text-[#1B5E20]" />
              </div>
              <span className="text-sm font-semibold text-[#0A2E12]">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How to Find Events */}
      <section className="relative mx-auto max-w-6xl px-6 pb-14 sm:pb-20 md:pb-28">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.15em] text-[#B8860B]">
              Find an Event
            </p>
            <h2
              className="text-3xl font-bold text-[#0A2E12] md:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Barefoot Bowls Near You
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-[#3D5A3E]">
              Most lawn bowling clubs offer barefoot bowls sessions — especially
              during warmer months. Use our club directory to find a club near you,
              then check their events calendar or call to ask about barefoot bowls
              availability.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Search our directory of 500+ lawn bowling clubs",
                "Filter by state, city, or use your location",
                "Look for clubs that offer social bowls and events",
                "Many clubs host weekly barefoot bowls nights",
                "Corporate and group bookings usually available",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-[#3D5A3E]">
                  <CheckCircle className="h-5 w-5 text-[#1B5E20] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Link
                href="/clubs"
                className="group inline-flex items-center gap-2 rounded-xl bg-[#1B5E20] px-7 py-4 text-base font-semibold text-white shadow-2xl shadow-emerald-500/20 transition-all hover:bg-[#145218] hover:shadow-emerald-500/35 active:scale-[0.97] min-h-[44px]"
              >
                <MapPin className="h-4 w-4" />
                Browse Club Directory
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-6 shadow-lg">
            <div className="flex items-center gap-2 border-b border-[#0A2E12]/10 pb-3">
              <MapPin className="h-5 w-5 text-[#1B5E20]" />
              <span className="text-sm font-bold text-[#0A2E12]">
                Club Directory
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {[
                { name: "Sunset Bowling Club", location: "San Francisco, CA", tag: "Barefoot Fridays" },
                { name: "Lakeside Bowls", location: "Chicago, IL", tag: "Social Bowls" },
                { name: "Riverside Green", location: "Portland, OR", tag: "Weekend Events" },
              ].map((club) => (
                <div key={club.name} className="flex items-center justify-between rounded-xl border border-[#0A2E12]/5 bg-[#FEFCF9] p-3">
                  <div>
                    <span className="text-sm font-semibold text-[#0A2E12]">{club.name}</span>
                    <p className="text-xs text-[#3D5A3E]">{club.location}</p>
                  </div>
                  <span className="rounded-full bg-[#1B5E20]/10 px-2.5 py-1 text-xs font-medium text-[#1B5E20]">
                    {club.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative mx-auto max-w-6xl px-6 pb-14 sm:pb-20 md:pb-28">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#1B5E20]/20 bg-[#1B5E20]/10 px-4 py-1.5">
            <HelpCircle className="h-4 w-4 text-[#1B5E20]" />
            <span className="text-sm font-medium text-[#1B5E20]">FAQ</span>
          </div>
          <h2
            className="text-3xl font-bold text-[#0A2E12] md:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Frequently Asked Questions
          </h2>
        </div>

        <div className="mx-auto max-w-3xl space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.question}
              className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5 sm:p-6"
            >
              <h3 className="text-lg font-semibold text-[#0A2E12]">
                {faq.question}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#3D5A3E]">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Barefoot Bowls vs Traditional */}
      <section className="relative mx-auto max-w-6xl px-6 pb-14 sm:pb-20 md:pb-28">
        <div className="mb-12 text-center">
          <h2
            className="text-3xl font-bold text-[#0A2E12] md:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Barefoot Bowls vs Traditional Bowls
          </h2>
          <p className="mt-4 text-lg text-[#3D5A3E]">
            Same great sport, different vibes
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#0A2E12]/10">
          <table className="w-full text-left text-[15px]">
            <thead className="bg-[#1B5E20]/5">
              <tr>
                <th className="px-5 py-4 font-semibold text-[#0A2E12]" />
                <th className="px-5 py-4 font-semibold text-[#1B5E20]">
                  Barefoot Bowls
                </th>
                <th className="px-5 py-4 font-semibold text-[#0A2E12]">
                  Traditional Bowls
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0A2E12]/5 bg-white">
              {[
                { aspect: "Footwear", barefoot: "Bare feet or socks", traditional: "Flat-soled bowling shoes" },
                { aspect: "Dress Code", barefoot: "Casual — whatever you like", traditional: "Whites or club uniform" },
                { aspect: "Atmosphere", barefoot: "Music, drinks, party vibe", traditional: "Quiet, focused, traditional" },
                { aspect: "Rules", barefoot: "Simplified for fun", traditional: "Full World Bowls rules" },
                { aspect: "Experience Needed", barefoot: "None — beginners welcome", traditional: "Helpful but not required" },
                { aspect: "Duration", barefoot: "1.5 to 2.5 hours", traditional: "2 to 3 hours" },
                { aspect: "Best For", barefoot: "Groups, parties, socializing", traditional: "Competition, pennant, leagues" },
              ].map((row) => (
                <tr key={row.aspect}>
                  <td className="px-5 py-3 font-medium text-[#0A2E12]">{row.aspect}</td>
                  <td className="px-5 py-3 text-[#3D5A3E]">{row.barefoot}</td>
                  <td className="px-5 py-3 text-[#3D5A3E]">{row.traditional}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-6xl px-6 pb-14 sm:pb-20 md:pb-28">
        <div className="rounded-3xl bg-gradient-to-r from-[#0A2E12] to-[#1B5E20] p-8 text-center shadow-2xl shadow-emerald-500/15 md:p-16">
          <h2
            className="text-3xl font-bold text-white md:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Ready to Try Barefoot Bowls?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-emerald-100/80">
            Find a lawn bowling club near you that hosts barefoot bowls sessions.
            No experience needed — just bring yourself and some friends.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/clubs"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-base font-semibold text-[#1B5E20] shadow-lg transition hover:bg-[#F0FFF4] active:scale-[0.98] min-h-[44px]"
            >
              <MapPin className="h-4 w-4" />
              Find a Club
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/learn/rules"
              className="rounded-full border-2 border-white/30 px-7 py-4 text-base font-semibold text-white transition hover:border-white/60 hover:bg-white/10 active:scale-[0.98] min-h-[44px]"
            >
              Learn the Rules
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
            <Link href="/clubs" className="hover:text-[#0A2E12] transition">Clubs</Link>
            <Link href="/learn" className="hover:text-[#0A2E12] transition">Learn</Link>
            <Link href="/learn/rules" className="hover:text-[#0A2E12] transition">Rules</Link>
            <Link href="/about" className="hover:text-[#0A2E12] transition">About</Link>
            <Link href="/terms" className="hover:text-[#0A2E12] transition">Terms</Link>
            <Link href="/privacy" className="hover:text-[#0A2E12] transition">Privacy</Link>
          </div>
          <span className="text-sm text-[#3D5A3E]">
            &copy; {new Date().getFullYear()} Lawnbowling
          </span>
        </div>
      </footer>
    </div>
  );
}
