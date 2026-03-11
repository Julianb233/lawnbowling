import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  Users,
  Trophy,
  Search,
  Target,
  ChevronRight,
  Lightbulb,
  CircleDot,
  Scale,
} from "lucide-react";
import { LearnNav } from "@/components/learn/LearnNav";
import { LearnFooter } from "@/components/learn/LearnFooter";
import { getBreadcrumbSchema, jsonLd } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Learn Lawn Bowling | Lawnbowling",
  description:
    "Your complete guide to lawn bowling. Learn the rules, player positions, game formats, and over 80 terms in our glossary. Perfect for beginners and experienced bowlers alike.",
  alternates: { canonical: "/learn" },
  keywords: [
    "learn lawn bowling",
    "lawn bowling guide",
    "how to play lawn bowls",
    "lawn bowling for beginners",
    "lawn bowls rules",
    "lawn bowling positions",
    "lawn bowling formats",
    "lawn bowling glossary",
  ],
  openGraph: {
    title: "Learn Lawn Bowling | Lawnbowling",
    description:
      "Your complete guide to lawn bowling. Rules, positions, formats, glossary, equipment guide, and more.",
    url: "https://lawnbowl.app/learn",
    type: "website",
  },
};

const learnHubSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Learn Lawn Bowling",
  description:
    "Your complete guide to lawn bowling. Learn the rules, player positions, game formats, and over 80 terms in our glossary.",
  url: "https://lawnbowl.app/learn",
  isPartOf: {
    "@type": "WebSite",
    name: "Lawnbowling",
    url: "https://lawnbowl.app",
  },
  about: {
    "@type": "Thing",
    name: "Lawn Bowling",
    alternateName: "Lawn Bowls",
  },
  hasPart: [
    { "@type": "Article", name: "Rules of Lawn Bowling", url: "https://lawnbowl.app/learn/rules" },
    { "@type": "Article", name: "Player Positions", url: "https://lawnbowl.app/learn/positions" },
    { "@type": "Article", name: "Game Formats", url: "https://lawnbowl.app/learn/formats" },
    { "@type": "Article", name: "Glossary", url: "https://lawnbowl.app/learn/glossary" },
    { "@type": "Article", name: "Equipment Buying Guide", url: "https://lawnbowl.app/learn/equipment" },
    { "@type": "Article", name: "Lawn Bowling vs Bocce", url: "https://lawnbowl.app/learn/lawn-bowling-vs-bocce" },
  ],
};

const learnBreadcrumbs = getBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Learn", url: "/learn" },
]);

const topics = [
  {
    title: "Rules of Lawn Bowling",
    description:
      "Learn how the game works from start to finish -- the green, the jack, bias, delivery, and how each end is played and scored.",
    href: "/learn/rules",
    icon: BookOpen,
    color: "bg-[#1B5E20]/10 text-[#1B5E20]",
    borderColor: "border-[#1B5E20]/20 hover:border-[#1B5E20]/40",
  },
  {
    title: "Player Positions",
    description:
      "Understand the four team positions -- Lead, Second, Third (Vice-Skip), and Skip -- their roles, responsibilities, and shot types.",
    href: "/learn/positions",
    icon: Users,
    color: "bg-[#1B5E20]/10 text-[#2E7D32]",
    borderColor: "border-blue-200 hover:border-blue-400",
  },
  {
    title: "Game Formats",
    description:
      "Explore Singles, Pairs, Triples, and Fours. Learn how many bowls each player uses, standard end counts, and social variations.",
    href: "/learn/formats",
    icon: Trophy,
    color: "bg-amber-500/10 text-amber-700",
    borderColor: "border-amber-200 hover:border-amber-400",
  },
  {
    title: "Glossary",
    description:
      "Over 80 lawn bowling terms defined -- from bias and draw to toucher and pennant. Searchable and organized by category.",
    href: "/learn/glossary",
    icon: Search,
    color: "bg-purple-500/10 text-purple-700",
    borderColor: "border-purple-200 hover:border-purple-400",
  },
  {
    title: "Equipment Buying Guide",
    description:
      "Everything you need to get started -- bowls, shoes, bags, and accessories with expert tips and links to trusted retailers.",
    href: "/learn/equipment",
    icon: CircleDot,
    color: "bg-orange-500/10 text-orange-700",
    borderColor: "border-orange-200 hover:border-orange-400",
  },
  {
    title: "Lawn Bowling vs Bocce",
    description:
      "How does lawn bowling compare to bocce ball? A detailed side-by-side comparison of equipment, rules, surfaces, and strategy.",
    href: "/learn/lawn-bowling-vs-bocce",
    icon: Scale,
    color: "bg-teal-500/10 text-teal-700",
    borderColor: "border-teal-200 hover:border-teal-400",
  },
];

const quickFacts = [
  {
    icon: Target,
    text: "The goal is to roll your bowls as close to the jack (target ball) as possible.",
  },
  {
    icon: Lightbulb,
    text: "Bowls are asymmetrical -- they curve as they slow down, which is called bias.",
  },
  {
    icon: Users,
    text: "Games can be played individually (Singles) or in teams of 2, 3, or 4.",
  },
  {
    icon: Trophy,
    text: "Lawn bowls has been in the Commonwealth Games since 1930.",
  },
];

export default function LearnHubPage() {
  return (
    <div className="min-h-screen bg-[#FEFCF9] overflow-hidden">
      <LearnNav />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(learnHubSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(learnBreadcrumbs) }}
      />

      {/* Hero Section */}
      <section className="relative mx-auto max-w-6xl px-6 pt-20 pb-16 md:pt-28 md:pb-20">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#1B5E20]/20 bg-[#1B5E20]/10 px-4 py-1.5">
            <BookOpen className="h-4 w-4 text-[#1B5E20]" />
            <span className="text-sm font-medium text-[#1B5E20]">
              Learning Hub
            </span>
          </div>
          <h1 className="max-w-4xl text-5xl font-extrabold leading-[1.1] tracking-tight text-zinc-900 md:text-7xl">
            Learn{" "}
            <span className="text-[#1B5E20]">Lawn Bowling</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 md:text-xl">
            Whether you are picking up a bowl for the first time or brushing up
            on the finer points, our guides cover everything you need to know
            about the sport of lawn bowls.
          </p>
        </div>
      </section>

      {/* Quick Facts */}
      <section className="relative mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickFacts.map((fact) => (
            <div
              key={fact.text}
              className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1B5E20]/10">
                <fact.icon className="h-5 w-5 text-[#1B5E20]" />
              </div>
              <p className="text-[15px] leading-relaxed text-zinc-700">
                {fact.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Topic Cards */}
      <section className="relative mx-auto max-w-6xl px-6 pb-20">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-zinc-900 md:text-4xl">
            Choose a Topic
          </h2>
          <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
            Dive deep into any aspect of lawn bowling
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {topics.map((topic) => (
            <Link
              key={topic.href}
              href={topic.href}
              className={`group flex flex-col rounded-2xl border bg-white dark:bg-[#1a3d28] p-8 shadow-sm transition-all hover:shadow-md ${topic.borderColor}`}
            >
              <div className="mb-5 flex items-center gap-4">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-xl ${topic.color}`}
                >
                  <topic.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 md:text-2xl">
                  {topic.title}
                </h3>
              </div>
              <p className="flex-1 text-[16px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                {topic.description}
              </p>
              <div className="mt-6 flex items-center gap-1 text-sm font-semibold text-[#1B5E20] group-hover:gap-2 transition-all">
                Start reading
                <ChevronRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* New to Bowls CTA */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-3xl bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] p-8 text-center shadow-2xl shadow-green-900/15 md:p-16">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            New to Lawn Bowling?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-green-100/80">
            Start with the rules to understand the basics, then explore
            positions and formats. The glossary is always there when you
            encounter an unfamiliar term.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/learn/rules"
              className="group inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-semibold text-[#1B5E20] shadow-lg transition hover:bg-zinc-100 active:scale-[0.98]"
            >
              Start with the Rules
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/learn/glossary"
              className="rounded-2xl border-2 border-white/30 px-8 py-4 text-lg font-semibold text-white transition hover:border-white/60 hover:bg-white/10 active:scale-[0.98]"
            >
              Browse the Glossary
            </Link>
          </div>
        </div>
      </section>

      <LearnFooter />
    </div>
  );
}
