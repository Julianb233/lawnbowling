import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  User,
  Users,
  UsersRound,
  Crown,
} from "lucide-react";
import { LearnNav } from "@/components/learn/LearnNav";
import { LearnFooter } from "@/components/learn/LearnFooter";
import { LearnBreadcrumb } from "@/components/learn/LearnBreadcrumb";
import { getArticleSchema, getBreadcrumbSchema, jsonLd } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Lawn Bowling Game Formats | Singles, Pairs, Triples, Fours | Lawnbowling",
  description:
    "Learn about lawn bowling game formats: Singles, Pairs, Triples, and Fours. Understand how many players, bowls per player, standard ends, and social variations for each format.",
  alternates: { canonical: "/learn/formats" },
  keywords: [
    "lawn bowling formats",
    "lawn bowls singles",
    "lawn bowls pairs",
    "lawn bowls triples",
    "lawn bowls fours",
    "lawn bowling game types",
    "social bowls formats",
  ],
  openGraph: {
    title: "Lawn Bowling Game Formats | Singles, Pairs, Triples, Fours",
    description:
      "Learn about lawn bowling game formats and how many players, bowls, and ends each format uses.",
    url: "https://lawnbowl.app/learn/formats",
    type: "article",
  },
};

const formats = [
  {
    name: "Singles",
    icon: User,
    color: "bg-rose-500",
    lightBg: "bg-rose-50",
    lightBorder: "border-rose-200",
    textColor: "text-rose-700",
    playersPerSide: 1,
    bowlsPerPlayer: 4,
    totalBowlsPerEnd: 8,
    standardEnds: "First to 21 shots (not ends-based)",
    alternativeFormat: "Sets play: 2 sets of 9 ends, tiebreaker of 3 ends",
    positions: ["Player"],
    orderOfPlay:
      "Players alternate, each delivering one bowl at a time until all 4 have been played.",
    notes:
      'A non-playing marker assists by centring the jack, marking touchers, and answering distance questions. Singles is the purest test of individual skill.',
  },
  {
    name: "Pairs",
    icon: Users,
    color: "bg-blue-500",
    lightBg: "bg-blue-50",
    lightBorder: "border-blue-200",
    textColor: "text-blue-700",
    playersPerSide: 2,
    bowlsPerPlayer: 4,
    totalBowlsPerEnd: 16,
    standardEnds: "21 ends (championship)",
    alternativeFormat: "Often 15 or 18 ends for social/club play",
    positions: ["Lead", "Skip"],
    orderOfPlay:
      "Lead A, Lead B, Lead A, Lead B (each delivers all 4), then Skip A, Skip B, Skip A, Skip B.",
    notes:
      "Total shots across all ends determine the winner. With 4 bowls each, there is plenty of room for both draw and tactical play.",
  },
  {
    name: "Triples",
    icon: UsersRound,
    color: "bg-amber-500",
    lightBg: "bg-amber-50",
    lightBorder: "border-amber-200",
    textColor: "text-amber-700",
    playersPerSide: 3,
    bowlsPerPlayer: 3,
    totalBowlsPerEnd: 18,
    standardEnds: "18 ends (championship)",
    alternativeFormat:
      "Often 15 ends for social play. 2-bowl triples is a faster variation (6 bowls per team per end).",
    positions: ["Lead", "Second", "Skip"],
    orderOfPlay:
      "Each player delivers all 3 of their bowls before the next player begins. Lead A, Lead B, Second A, Second B, Skip A, Skip B.",
    notes:
      'In triples there is no dedicated "Third/Vice-Skip" position. The second player performs some vice-skip duties (measuring, communicating).',
  },
  {
    name: "Fours (Rinks)",
    icon: Crown,
    color: "bg-[#1B5E20]",
    lightBg: "bg-green-50",
    lightBorder: "border-green-200",
    textColor: "text-[#1B5E20]",
    playersPerSide: 4,
    bowlsPerPlayer: 2,
    totalBowlsPerEnd: 16,
    standardEnds: "21 ends (championship)",
    alternativeFormat: "Often 15 or 18 ends for social/club play",
    positions: ["Lead", "Second", "Third", "Skip"],
    orderOfPlay:
      "Lead A, Lead B, Second A, Second B, Third A, Third B, Skip A, Skip B -- each delivering both their bowls before the next pair begins.",
    notes:
      "This is the traditional team format and the basis of pennant (league) competition. With only 2 bowls each, every delivery matters -- there is less margin for error.",
  },
];

const playerCountTable = [
  { players: 4, format: "1 game of Pairs", teams: "2 teams of 2", rinks: 1 },
  { players: 6, format: "1 game of Triples", teams: "2 teams of 3", rinks: 1 },
  { players: 8, format: "1 game of Fours", teams: "2 teams of 4", rinks: 1 },
  { players: 8, format: "2 games of Pairs", teams: "4 teams of 2", rinks: 2 },
  { players: 12, format: "2 games of Triples", teams: "4 teams of 3", rinks: 2 },
  { players: 16, format: "2 games of Fours", teams: "4 teams of 4", rinks: 2 },
  { players: 16, format: "4 games of Pairs", teams: "8 teams of 2", rinks: 4 },
  { players: 24, format: "4 games of Triples", teams: "8 teams of 3", rinks: 4 },
  { players: 24, format: "3 games of Fours", teams: "6 teams of 4", rinks: 3 },
];

const socialFormats = [
  {
    name: "Tabs-In / Names-in-the-Hat",
    description:
      "Players arrive and put their name in. At start time, teams are drawn randomly. The organizer determines the format based on how many players showed up. Teams are assigned to rinks, also randomly.",
  },
  {
    name: "Multi-Game Social",
    description:
      "3 or 4 games of 7-8 ends each. After each game, teams are re-drawn so everyone plays with and against different people. Individual scores are tallied across all games -- the player with the highest cumulative score wins.",
  },
  {
    name: "Pick-a-Partner",
    description:
      "Players choose their own partner rather than being drawn randomly. Typically played as pairs. May be organized as a one-day tournament or a regular club event.",
  },
  {
    name: "Two-Bowl Formats",
    description:
      "Many social formats use 2 bowls per player regardless of team size to speed up play. A 2-bowl triples game averages about 40 minutes. Reduces time commitment and keeps the pace lively.",
  },
];

const formatsSchema = getArticleSchema({
  title: "Lawn Bowling Game Formats: Singles, Pairs, Triples, Fours",
  description:
    "Learn about lawn bowling game formats and how many players, bowls, and ends each format uses.",
  url: "/learn/formats",
});

const formatsBreadcrumbs = getBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Learn", url: "/learn" },
  { name: "Formats", url: "/learn/formats" },
]);

export default function FormatsPage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <LearnNav />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(formatsSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(formatsBreadcrumbs) }}
      />

      <div className="mx-auto max-w-4xl px-6 pt-10 pb-24">
        <LearnBreadcrumb items={[{ label: "Formats" }]} />

        {/* Page Header */}
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 md:text-5xl">
            Game <span className="text-[#1B5E20]">Formats</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-600">
            Lawn bowls can be played as individuals or in teams of two, three,
            or four. Each format has different numbers of bowls per player,
            different end counts, and a different tactical feel. Every game is
            always between two sides on a single rink.
          </p>
        </header>

        {/* Format Cards */}
        <div className="space-y-10">
          {formats.map((fmt) => (
            <section key={fmt.name} id={fmt.name.toLowerCase().replace(/[^a-z]/g, "-")}>
              <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
                {/* Header */}
                <div className={`${fmt.color} px-6 py-5 text-white`}>
                  <div className="flex items-center gap-3">
                    <fmt.icon className="h-7 w-7" />
                    <h2 className="text-2xl font-bold">{fmt.name}</h2>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  {/* Stats Grid */}
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className={`rounded-lg border ${fmt.lightBorder} ${fmt.lightBg} p-4`}>
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Players per Side
                      </p>
                      <p className={`mt-1 text-2xl font-bold ${fmt.textColor}`}>
                        {fmt.playersPerSide}
                      </p>
                    </div>
                    <div className={`rounded-lg border ${fmt.lightBorder} ${fmt.lightBg} p-4`}>
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Bowls per Player
                      </p>
                      <p className={`mt-1 text-2xl font-bold ${fmt.textColor}`}>
                        {fmt.bowlsPerPlayer}
                      </p>
                    </div>
                    <div className={`rounded-lg border ${fmt.lightBorder} ${fmt.lightBg} p-4`}>
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Total Bowls / End
                      </p>
                      <p className={`mt-1 text-2xl font-bold ${fmt.textColor}`}>
                        {fmt.totalBowlsPerEnd}
                      </p>
                    </div>
                    <div className={`rounded-lg border ${fmt.lightBorder} ${fmt.lightBg} p-4`}>
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Standard Length
                      </p>
                      <p className="mt-1 text-[14px] font-medium text-zinc-900">
                        {fmt.standardEnds}
                      </p>
                    </div>
                  </div>

                  {/* Positions */}
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-5">
                    <h3 className="mb-2 font-bold text-zinc-900">Positions</h3>
                    <div className="flex flex-wrap gap-2">
                      {fmt.positions.map((pos, i) => (
                        <span
                          key={pos}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium ${fmt.lightBorder} ${fmt.lightBg} ${fmt.textColor}`}
                        >
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold">
                            {i + 1}
                          </span>
                          {pos}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Order of Play */}
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-5">
                    <h3 className="mb-2 font-bold text-zinc-900">
                      Order of Play
                    </h3>
                    <p className="text-[15px] leading-relaxed text-zinc-700">
                      {fmt.orderOfPlay}
                    </p>
                  </div>

                  {/* Alternative Format */}
                  {fmt.alternativeFormat && (
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-5">
                      <h3 className="mb-2 font-bold text-zinc-900">
                        Shorter Variations
                      </h3>
                      <p className="text-[15px] leading-relaxed text-zinc-700">
                        {fmt.alternativeFormat}
                      </p>
                    </div>
                  )}

                  {/* Notes */}
                  <div className={`rounded-lg border ${fmt.lightBorder} ${fmt.lightBg} p-5`}>
                    <p className={`text-[15px] leading-relaxed ${fmt.textColor}`}>
                      {fmt.notes}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* Format Selection by Player Count */}
        <div className="mt-14">
          <h2 className="mb-2 text-2xl font-bold text-zinc-900 md:text-3xl">
            Choosing a Format by Player Count
          </h2>
          <p className="mb-6 text-[16px] leading-relaxed text-zinc-600">
            The format you play depends on how many players show up. Here are
            common configurations:
          </p>
          <div className="overflow-x-auto rounded-xl border border-zinc-200">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-zinc-900">
                    Players
                  </th>
                  <th className="px-4 py-3 font-semibold text-zinc-900">
                    Format
                  </th>
                  <th className="px-4 py-3 font-semibold text-zinc-900">
                    Teams
                  </th>
                  <th className="px-4 py-3 font-semibold text-zinc-900">
                    Rinks Needed
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {playerCountTable.map((row, i) => (
                  <tr key={i} className={i % 2 === 1 ? "bg-zinc-50/50" : ""}>
                    <td className="px-4 py-3 font-medium text-[#1B5E20]">
                      {row.players}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">{row.format}</td>
                    <td className="px-4 py-3 text-zinc-700">{row.teams}</td>
                    <td className="px-4 py-3 text-zinc-700">{row.rinks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Social Bowls Variations */}
        <div className="mt-14">
          <h2 className="mb-2 text-2xl font-bold text-zinc-900 md:text-3xl">
            Social Bowls Variations
          </h2>
          <p className="mb-6 text-[16px] leading-relaxed text-zinc-600">
            Beyond formal competition, clubs run a variety of social formats
            designed to mix players, keep things fun, and accommodate different
            numbers.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {socialFormats.map((sf) => (
              <div
                key={sf.name}
                className="rounded-xl border border-zinc-200 bg-zinc-50 p-6"
              >
                <h3 className="mb-2 text-lg font-bold text-[#1B5E20]">
                  {sf.name}
                </h3>
                <p className="text-[15px] leading-relaxed text-zinc-700">
                  {sf.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-16 flex flex-col gap-4 sm:flex-row sm:justify-between">
          <Link
            href="/learn/positions"
            className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#1B5E20] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous: Positions
          </Link>
          <Link
            href="/learn/glossary"
            className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#1B5E20] hover:underline"
          >
            Next: Glossary
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <LearnFooter />
    </div>
  );
}
