import type { Metadata } from "next";
import Link from "next/link";
import {
  Circle,
  Target,
  Ruler,
  MapPin,
  Trophy,
  Users,
  ChevronRight,
} from "lucide-react";
import { LearnNav } from "@/components/learn/LearnNav";
import { LearnFooter } from "@/components/learn/LearnFooter";
import { LearnBreadcrumb } from "@/components/learn/LearnBreadcrumb";
import { getArticleSchema, getBreadcrumbSchema, jsonLd } from "@/lib/schema";

export const metadata: Metadata = {
  title:
    "Lawn Bowling vs Bocce Ball: Complete Guide to the Differences | Lawnbowling",
  description:
    "What is the difference between lawn bowling and bocce ball? Compare rules, equipment, scoring, playing surfaces, and culture in this comprehensive side-by-side guide.",
  alternates: { canonical: "/learn/lawn-bowling-vs-bocce" },
  openGraph: {
    title: "Lawn Bowling vs Bocce Ball: Complete Guide to the Differences",
    description:
      "Compare lawn bowling and bocce ball -- rules, equipment, scoring, surfaces, and culture side by side.",
    url: "https://lawnbowl.app/learn/lawn-bowling-vs-bocce",
    type: "article",
  },
};

const articleSchema = getArticleSchema({
  title: "Lawn Bowling vs Bocce Ball: Complete Guide to the Differences",
  description:
    "What is the difference between lawn bowling and bocce ball? Compare rules, equipment, scoring, playing surfaces, and culture.",
  url: "/learn/lawn-bowling-vs-bocce",
});

const breadcrumbs = getBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Learn", url: "/learn" },
  { name: "Lawn Bowling vs Bocce", url: "/learn/lawn-bowling-vs-bocce" },
]);

const comparisonRows = [
  {
    category: "Balls",
    lawnBowling:
      "Asymmetrical (biased) composite resin bowls that curve as they slow down. Sizes 00-5, up to 1.59 kg.",
    bocce:
      "Perfectly round, balanced balls that roll straight. Standard 107mm diameter, ~920g.",
    icon: Circle,
  },
  {
    category: "Playing Surface",
    lawnBowling:
      "Manicured grass or synthetic green, flat and level. Divided into rinks (lanes). Typically 30-40m long.",
    bocce:
      "Can be played on almost any surface -- grass, sand, gravel, clay, or packed dirt. Courts are 27.5m x 4m.",
    icon: MapPin,
  },
  {
    category: "Target Ball",
    lawnBowling:
      'Called the "jack" (also kitty or mark). White or yellow, 63-67mm diameter.',
    bocce:
      'Called the "pallino" (also boccino or jack). Smaller than playing balls, 40-60mm.',
    icon: Target,
  },
  {
    category: "Delivery",
    lawnBowling:
      "Bowled from a mat with a smooth, low release. Players step onto the mat and deliver with a pendulum arm motion.",
    bocce:
      "Can be tossed underhand, rolled, or even lobbed through the air (volo). More varied throwing styles.",
    icon: Ruler,
  },
  {
    category: "Scoring",
    lawnBowling:
      "Only the team with the closest bowl to the jack scores. One point for each bowl closer than the opponent's nearest.",
    bocce:
      "Same principle -- only the team closest to the pallino scores. One point per ball closer than the opponent's best.",
    icon: Trophy,
  },
  {
    category: "Team Sizes",
    lawnBowling:
      "Singles (1v1), Pairs (2v2), Triples (3v3), or Fours (4v4). Each position has specialized roles.",
    bocce:
      "Usually 1v1, 2v2, or 4v4. Less formal role structure within teams.",
    icon: Users,
  },
];

export default function LawnBowlingVsBoccePage() {
  return (
    <div className="min-h-screen bg-[#FEFCF9] overflow-hidden">
      <LearnNav />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }}
      />

      <div className="mx-auto max-w-4xl px-6 pt-10 pb-24">
        <LearnBreadcrumb items={[{ label: "Lawn Bowling vs Bocce" }]} />

        {/* Hero */}
        <header className="mb-12 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#1B5E20]/20 bg-[#1B5E20]/10 px-4 py-1.5">
            <span className="text-sm font-medium text-[#1B5E20]">
              Sport Comparison
            </span>
          </div>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-zinc-900 md:text-5xl lg:text-6xl">
            Lawn Bowling vs Bocce Ball
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            They look similar at first glance, but lawn bowling and bocce ball
            are fundamentally different sports. Here is everything you need to
            know about how they compare.
          </p>
        </header>

        {/* Key Difference Callout */}
        <div className="mb-12 rounded-2xl border border-[#1B5E20]/20 bg-[#1B5E20]/5 p-8 md:p-10">
          <h2 className="mb-3 text-xl font-bold text-zinc-900 dark:text-zinc-100">
            The Fundamental Difference: Bias
          </h2>
          <p className="text-[16px] leading-relaxed text-zinc-700">
            In lawn bowling, the bowls are asymmetrical -- one side is heavier
            than the other, causing them to travel in a{" "}
            <strong>curved arc</strong>. As the bowl slows, the curve becomes
            more pronounced. Bocce balls are perfectly spherical and roll in a{" "}
            <strong>straight line</strong>. This single difference changes
            everything about strategy, technique, and the skill set required.
          </p>
        </div>

        {/* Comparison Table */}
        <section className="mb-16">
          <h2 className="mb-8 text-center text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Side-by-Side Comparison
          </h2>
          <div className="space-y-4">
            {comparisonRows.map((row) => (
              <div
                key={row.category}
                className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden"
              >
                <div className="flex items-center gap-3 border-b border-zinc-100 bg-zinc-50 px-6 py-3">
                  <row.icon className="h-5 w-5 text-[#1B5E20]" />
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{row.category}</h3>
                </div>
                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-100">
                  <div className="p-6">
                    <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-wider text-[#1B5E20]">
                      Lawn Bowling
                    </span>
                    <p className="text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {row.lawnBowling}
                    </p>
                  </div>
                  <div className="p-6">
                    <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Bocce Ball
                    </span>
                    <p className="text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {row.bocce}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Culture & Community */}
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Culture & Community
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200 p-6">
              <h3 className="mb-3 text-lg font-bold text-[#1B5E20]">
                Lawn Bowling
              </h3>
              <ul className="space-y-2 text-[15px] text-zinc-600 dark:text-zinc-400">
                <li>
                  Organized through national federations (World Bowls, Bowls USA)
                </li>
                <li>
                  Commonwealth Games sport since 1930; strong in Australia, UK,
                  NZ, Canada, and South Africa
                </li>
                <li>
                  Club-based culture with regular pennant (league) competitions
                </li>
                <li>
                  Dress code tradition: whites, although many clubs now allow
                  coloured attire
                </li>
                <li>Growing rapidly in the USA with over 150 active clubs</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-zinc-200 p-6">
              <h3 className="mb-3 text-lg font-bold text-zinc-500 dark:text-zinc-400">
                Bocce Ball
              </h3>
              <ul className="space-y-2 text-[15px] text-zinc-600 dark:text-zinc-400">
                <li>
                  Popular worldwide, especially in Italy, France, and South
                  America
                </li>
                <li>
                  Strong Italian-American tradition in the USA, with leagues in
                  many cities
                </li>
                <li>
                  Often played casually in backyards, parks, and beaches
                </li>
                <li>Less formal dress code; more relaxed social atmosphere</li>
                <li>
                  Growing as a recreational activity in bars and social venues
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Which Should You Try */}
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Which Should You Try?
          </h2>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 md:p-8">
            <div className="space-y-4 text-[16px] leading-relaxed text-zinc-700">
              <p>
                <strong>Choose lawn bowling if</strong> you enjoy precision,
                strategy, and the challenge of mastering bias. The curved
                delivery path adds a unique tactical dimension, and the
                club-based community offers structured competition and social
                events.
              </p>
              <p>
                <strong>Choose bocce if</strong> you want a more casual,
                accessible game you can play almost anywhere with minimal
                equipment. Bocce is easier to pick up and can be enjoyed in
                parks, beaches, and backyards.
              </p>
              <p>
                Of course, there is no reason you cannot enjoy both. Many lawn
                bowlers also play bocce socially, and bocce players who discover
                lawn bowling are often captivated by the added complexity of
                bias.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section>
          <div className="rounded-3xl bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] p-8 text-center shadow-2xl shadow-green-900/15 md:p-12">
            <h2 className="text-2xl font-bold text-white md:text-3xl">
              Ready to Try Lawn Bowling?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-green-100/80">
              Find a club near you, learn the rules, or explore our equipment
              guide to get started.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/clubs"
                className="group inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-base font-semibold text-[#1B5E20] shadow-lg transition hover:bg-zinc-100"
              >
                Find a Club
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/learn/rules"
                className="rounded-2xl border-2 border-white/30 px-6 py-3 text-base font-semibold text-white transition hover:border-white/60 hover:bg-white/10"
              >
                Learn the Rules
              </Link>
            </div>
          </div>
        </section>
      </div>

      <LearnFooter />
    </div>
  );
}
