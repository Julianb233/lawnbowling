export const revalidate = 300; // 5 minutes

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Target,
  Circle,
  Ruler,
  Footprints,
  RotateCcw,
  Eye,
  ChevronRight,
} from "lucide-react";
import { LearnNav } from "@/components/learn/LearnNav";
import { LearnFooter } from "@/components/learn/LearnFooter";
import { LearnBreadcrumb } from "@/components/learn/LearnBreadcrumb";
import { getArticleSchema, getBreadcrumbSchema, jsonLd } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Lawn Bowls Rules | Complete Rules of Lawn Bowling Guide | Lawnbowling",
  description:
    "Complete guide to lawn bowls rules. Learn about the green, the jack, bias, delivery, scoring, and the sequence of play in each end. Perfect for beginners and experienced bowlers.",
  keywords: [
    "lawn bowls rules",
    "lawn bowling rules",
    "rules of lawn bowls",
    "how to play lawn bowls",
    "lawn bowls scoring rules",
    "lawn bowling rules for beginners",
    "bowls rules explained",
    "lawn bowls how to play",
  ],
  alternates: { canonical: "/learn/rules" },
  openGraph: {
    title: "Lawn Bowls Rules | Complete Guide to the Rules of Lawn Bowling",
    description:
      "Complete guide to lawn bowls rules. The green, the jack, bias, delivery, scoring, and sequence of play explained.",
    url: "https://lawnbowl.app/learn/rules",
    type: "article",
    siteName: "Lawnbowling",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lawn Bowls Rules | Complete Guide",
    description:
      "Learn the rules of lawn bowls — the green, jack, bias, delivery, scoring, and more.",
  },
};

export default function RulesPage() {
  const articleSchema = getArticleSchema({
    title: "Lawn Bowling Rules | Complete Guide",
    description: "Complete guide to lawn bowling rules. Learn about the green, the jack, bias, delivery, scoring, and the sequence of play in each end.",
    url: "/learn/rules",
  });
  const breadcrumbs = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Learn", url: "/learn" },
    { name: "Rules", url: "/learn/rules" },
  ]);

  return (
    <div className="min-h-screen bg-[#FEFCF9] overflow-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }} />
      <LearnNav />

      <div className="mx-auto max-w-4xl px-6 pt-10 pb-24">
        <LearnBreadcrumb items={[{ label: "Rules" }]} />

        {/* Page Header */}
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 md:text-5xl">
            Rules of <span className="text-[#1B5E20]">Lawn Bowling</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-600">
            Lawn bowls is a sport with elegant simplicity at its core: roll your
            bowls closer to the jack than your opponent. Here is everything you
            need to know to play.
          </p>
        </header>

        {/* Table of Contents */}
        <nav className="mb-12 rounded-xl border border-zinc-200 bg-zinc-50 p-6">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-500">
            On This Page
          </h2>
          <ul className="space-y-2 text-[15px]">
            {[
              { id: "objective", label: "The Objective" },
              { id: "the-green", label: "The Green" },
              { id: "the-jack", label: "The Jack" },
              { id: "the-bowls", label: "The Bowls" },
              { id: "bias", label: "Bias -- The Defining Feature" },
              { id: "the-mat", label: "The Mat" },
              { id: "delivery", label: "Delivery (How You Bowl)" },
              { id: "sequence-of-play", label: "Sequence of Play in an End" },
              { id: "scoring", label: "Scoring" },
              { id: "the-head", label: "The Head" },
              { id: "winning", label: "Winning the Game" },
            ].map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="text-[#1B5E20] hover:underline"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content Sections */}
        <div className="space-y-16">
          {/* The Objective */}
          <section id="objective">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1B5E20]/10">
                <Target className="h-5 w-5 text-[#1B5E20]" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 md:text-3xl">
                The Objective
              </h2>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6">
              <p className="text-[16px] leading-relaxed text-zinc-700">
                The objective of lawn bowls is simple: roll your bowls so they
                come to rest as close as possible to a small target ball called
                the <strong>jack</strong> (also called the &ldquo;kitty&rdquo;
                or &ldquo;mark&rdquo;). The team or player with one or more
                bowls closer to the jack than any of their opponent&rsquo;s bowls
                scores points (&ldquo;shots&rdquo;) for that{" "}
                <strong>end</strong>. A game consists of multiple ends.
              </p>
            </div>
          </section>

          {/* The Green */}
          <section id="the-green">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1B5E20]/10">
                <Ruler className="h-5 w-5 text-[#1B5E20]" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 md:text-3xl">
                The Green
              </h2>
            </div>
            <div className="space-y-4">
              <p className="text-[16px] leading-relaxed text-zinc-700">
                A <strong>bowling green</strong> is a flat, manicured grass (or
                synthetic) surface. The green is divided into parallel lanes
                called <strong>rinks</strong>.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    label: "Green Dimensions",
                    value: "31 to 40 metres long, up to 60 metres wide",
                  },
                  {
                    label: "Rink Width",
                    value: "4.3 to 5.8 metres each",
                  },
                  {
                    label: "Typical Layout",
                    value:
                      "6 rinks per green, allowing 6 games to play simultaneously",
                  },
                  {
                    label: "Boundaries",
                    value:
                      "Surrounded by a ditch (200-380mm wide) and a raised bank beyond",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-zinc-200 bg-zinc-50 p-5"
                  >
                    <p className="text-sm font-semibold text-[#1B5E20]">
                      {item.label}
                    </p>
                    <p className="mt-1 text-[15px] leading-relaxed text-zinc-700">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Green Diagram */}
              <div className="rounded-xl border border-[#1B5E20]/20 bg-[#1B5E20]/5 p-6">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#1B5E20]">
                  Bowling Green Layout
                </h3>
                <div className="relative mx-auto max-w-md">
                  <div className="rounded-lg border-2 border-[#2E7D32] bg-[#4CAF50]/20 p-4">
                    <div className="text-center text-xs font-semibold text-[#1B5E20] mb-2">
                      BANK
                    </div>
                    <div className="border border-dashed border-[#1B5E20]/40 rounded p-3">
                      <div className="text-center text-xs text-[#1B5E20]/60 mb-2">
                        DITCH
                      </div>
                      <div className="grid grid-cols-6 gap-1">
                        {[1, 2, 3, 4, 5, 6].map((rink) => (
                          <div
                            key={rink}
                            className="flex flex-col items-center rounded border border-[#1B5E20]/30 bg-[#4CAF50]/30 py-6"
                          >
                            <span className="text-xs font-bold text-[#1B5E20]">
                              Rink {rink}
                            </span>
                            <div className="mt-2 h-px w-4 border-t border-dashed border-[#1B5E20]/40" />
                            <span className="mt-1 text-xs text-[#1B5E20]/60">
                              centre line
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="text-center text-xs text-[#1B5E20]/60 mt-2">
                        DITCH
                      </div>
                    </div>
                    <div className="text-center text-xs font-semibold text-[#1B5E20] mt-2">
                      BANK
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* The Jack */}
          <section id="the-jack">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <Circle className="h-5 w-5 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 md:text-3xl">
                The Jack
              </h2>
            </div>
            <div className="space-y-4">
              <p className="text-[16px] leading-relaxed text-zinc-700">
                The jack is a small, solid, spherical ball -- the target.
                At the start of each end, the lead rolls it down the green
                to set the target distance.
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Diameter", value: "63 to 67mm" },
                  { label: "Colour", value: "White or yellow" },
                  {
                    label: "Minimum Distance",
                    value: "Must travel at least 23 metres from the mat",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-zinc-200 bg-zinc-50 p-5"
                  >
                    <p className="text-sm font-semibold text-amber-600">
                      {item.label}
                    </p>
                    <p className="mt-1 text-[15px] text-zinc-700">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-[16px] leading-relaxed text-zinc-700">
                The jack is <strong>unbiased</strong> (rolls in a straight line,
                unlike the bowls). Once at rest, the jack is centred on the rink
                -- moved laterally to the centre line.
              </p>
            </div>
          </section>

          {/* The Bowls */}
          <section id="the-bowls">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-200">
                <Circle className="h-5 w-5 text-zinc-600" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 md:text-3xl">
                The Bowls
              </h2>
            </div>
            <div className="space-y-4">
              <p className="text-[16px] leading-relaxed text-zinc-700">
                Bowls are larger balls made of composite resin (historically
                lignum vitae wood -- hence the term &ldquo;woods&rdquo;). Each
                player uses a matched set of bowls with identical markings.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    label: "Diameter",
                    value: "112mm to 134mm",
                  },
                  {
                    label: "Weight",
                    value: "Up to 1.59 kg",
                  },
                  {
                    label: "Sizes",
                    value:
                      "9 standard sizes (0000 through 5) -- choose the size that fits your hand",
                  },
                  {
                    label: "Identification",
                    value:
                      "Circular rings (discs) on each side. The smaller ring indicates the bias side.",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-zinc-200 bg-zinc-50 p-5"
                  >
                    <p className="text-sm font-semibold text-zinc-500">
                      {item.label}
                    </p>
                    <p className="mt-1 text-[15px] leading-relaxed text-zinc-700">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Bias */}
          <section id="bias">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1B5E20]/10">
                <RotateCcw className="h-5 w-5 text-[#1B5E20]" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 md:text-3xl">
                Bias -- The Defining Feature
              </h2>
            </div>
            <div className="space-y-4">
              <p className="text-[16px] leading-relaxed text-zinc-700">
                Bias is what makes lawn bowls unique. Every bowl is{" "}
                <strong>asymmetrical</strong> -- one side is slightly
                flatter/heavier than the other. This causes the bowl to travel
                in a <strong>curved arc</strong> rather than a straight line.
              </p>
              <div className="rounded-xl border border-[#1B5E20]/20 bg-[#1B5E20]/5 p-6">
                <h3 className="mb-4 font-bold text-[#1B5E20]">
                  How Bias Works
                </h3>
                <ul className="space-y-3">
                  {[
                    "When rolling fast, the bowl travels relatively straight.",
                    "As it slows down, the bias takes increasing effect, curving the bowl toward the heavier (bias) side.",
                    "The curve becomes most pronounced in the final few metres before the bowl stops.",
                    "The smaller concentric ring on the bowl marks the bias side -- the side toward which it will curve.",
                    "Different bowl models have different amounts of bias. Narrow-bias bowls curve less (better for leads). Wide-bias bowls curve more (preferred by skips).",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-[15px] leading-relaxed text-zinc-700"
                    >
                      <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1B5E20] text-xs font-bold text-white">
                        {i + 1}
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6">
                <h3 className="mb-3 font-bold text-zinc-900">
                  Playing with Bias
                </h3>
                <ul className="space-y-2 text-[15px] leading-relaxed text-zinc-700">
                  <li>
                    Players must aim <strong>wide of their target</strong>{" "}
                    (called &ldquo;taking grass&rdquo;) and let the bias bring
                    the bowl back toward the jack.
                  </li>
                  <li>
                    A <strong>forehand</strong> delivery has the bowl curving
                    from the dominant-hand side inward.
                  </li>
                  <li>
                    A <strong>backhand</strong> delivery has the bowl curving
                    from the non-dominant side.
                  </li>
                  <li>
                    Choosing the right hand (forehand vs backhand) is a tactical
                    decision based on what obstacles are in the way.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* The Mat */}
          <section id="the-mat">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-200">
                <Footprints className="h-5 w-5 text-zinc-600" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 md:text-3xl">
                The Mat
              </h2>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 space-y-3">
              <p className="text-[16px] leading-relaxed text-zinc-700">
                A rectangular mat (360mm x 600mm minimum for outdoor play) is
                placed on the rink to mark the delivery point.
              </p>
              <p className="text-[16px] leading-relaxed text-zinc-700">
                The player delivering must have at least one foot on or over the
                mat at the moment of release. Failing to do so is a{" "}
                <strong>foot fault</strong>.
              </p>
              <p className="text-[16px] leading-relaxed text-zinc-700">
                The lead places the mat at the start of each end. Its position
                can be varied tactically -- placing it further up the green
                shortens the playing distance.
              </p>
            </div>
          </section>

          {/* Delivery */}
          <section id="delivery">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 md:text-3xl">
                Delivery (How You Bowl)
              </h2>
            </div>
            <div className="space-y-3">
              {[
                {
                  step: 1,
                  text: "Stand on the mat, feet together or staggered.",
                },
                {
                  step: 2,
                  text: "Hold the bowl with the bias oriented correctly (small ring toward the direction you want it to curve).",
                },
                {
                  step: 3,
                  text: "Step forward, swing the arm smoothly, and release the bowl at ground level.",
                },
                {
                  step: 4,
                  text: 'The bowl should land smoothly on the green without bouncing ("dumping" is poor technique).',
                },
                {
                  step: 5,
                  text: "Follow through with the arm pointing in the direction of the aiming line.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="flex gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-5"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1B5E20] text-sm font-bold text-white">
                    {item.step}
                  </div>
                  <p className="text-[16px] leading-relaxed text-zinc-700 pt-1">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Sequence of Play */}
          <section id="sequence-of-play">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1B5E20]/10">
                <RotateCcw className="h-5 w-5 text-[#1B5E20]" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 md:text-3xl">
                Sequence of Play in an End
              </h2>
            </div>
            <div className="space-y-3">
              {[
                {
                  step: 1,
                  title: "Mat Placement",
                  desc: "The team that won the previous end (or won the coin toss for the first end) places the mat.",
                },
                {
                  step: 2,
                  title: "Jack Delivery",
                  desc: "The lead from the mat-placing team rolls the jack down the green. It must travel at least 23m. If it goes in the ditch or off the rink, the opposing lead delivers it.",
                },
                {
                  step: 3,
                  title: "Jack Centring",
                  desc: "Once the jack stops, it is moved laterally to the centre line of the rink.",
                },
                {
                  step: 4,
                  title: "Bowling",
                  desc: "Players from each team alternate delivering their bowls. In Fours: Lead A, Lead B (each delivers both), then Seconds, then Thirds, then Skips.",
                },
                {
                  step: 5,
                  title: "Determining the Count",
                  desc: "When all bowls have been delivered, the team with the bowl closest to the jack scores. They score one shot for each of their bowls closer to the jack than the opponent's nearest bowl.",
                },
                {
                  step: 6,
                  title: "Next End",
                  desc: "Play reverses direction. The team that scored places the mat and delivers the jack from the opposite end.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="flex gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-5"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1B5E20] text-sm font-bold text-white">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900">{item.title}</h3>
                    <p className="mt-1 text-[15px] leading-relaxed text-zinc-600">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Scoring */}
          <section id="scoring">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <Target className="h-5 w-5 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 md:text-3xl">
                Scoring
              </h2>
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6">
                <h3 className="mb-3 font-bold text-zinc-900">
                  How Scoring Works
                </h3>
                <ol className="space-y-2 text-[15px] leading-relaxed text-zinc-700 list-decimal list-inside">
                  <li>
                    Identify which team has the <strong>closest bowl</strong> to
                    the jack.
                  </li>
                  <li>
                    That team scores <strong>one shot for each bowl</strong>{" "}
                    closer to the jack than the opposing team&rsquo;s nearest
                    bowl.
                  </li>
                  <li>
                    The opposing team scores <strong>zero</strong> for that end.
                  </li>
                  <li>
                    If the closest bowls from each team are{" "}
                    <strong>equidistant</strong> from the jack, the end is a tied
                    end (no score).
                  </li>
                </ol>
              </div>
              <div className="rounded-xl border border-[#1B5E20]/20 bg-[#1B5E20]/5 p-6">
                <h3 className="mb-3 font-bold text-[#1B5E20]">
                  Scoring Example
                </h3>
                <p className="text-[15px] leading-relaxed text-zinc-700">
                  Team A has bowls at 30cm, 45cm, and 90cm from the jack. Team
                  B&rsquo;s nearest bowl is at 60cm. Team A scores{" "}
                  <strong>2 shots</strong> (the 30cm and 45cm bowls are both
                  closer than Team B&rsquo;s 60cm bowl). The 90cm bowl does not
                  count.
                </p>
              </div>
            </div>
          </section>

          {/* The Head */}
          <section id="the-head">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <Eye className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 md:text-3xl">
                The Head
              </h2>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6">
              <p className="text-[16px] leading-relaxed text-zinc-700">
                The <strong>head</strong> is the cluster of bowls and the jack
                at the far end of the rink. Reading the head -- understanding
                which bowls are closest, what gaps exist, where to place your
                next bowl -- is the core tactical skill of the game.
              </p>
            </div>
          </section>

          {/* Winning */}
          <section id="winning">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <Target className="h-5 w-5 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 md:text-3xl">
                Winning the Game
              </h2>
            </div>
            <div className="overflow-hidden rounded-xl border border-zinc-200">
              <table className="w-full text-left text-[15px]">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="px-5 py-3 font-semibold text-zinc-900">
                      Format
                    </th>
                    <th className="px-5 py-3 font-semibold text-zinc-900">
                      How Winner Is Determined
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {[
                    {
                      format: "Singles",
                      how: "First player to 21 shots (or sets play: best of 2 sets of 9 ends)",
                    },
                    {
                      format: "Pairs",
                      how: "Most total shots after 21 ends",
                    },
                    {
                      format: "Triples",
                      how: "Most total shots after 18 ends",
                    },
                    {
                      format: "Fours",
                      how: "Most total shots after 21 ends",
                    },
                    {
                      format: "Social Games",
                      how: "Most total shots after agreed number of ends (often 10-15)",
                    },
                  ].map((row) => (
                    <tr key={row.format}>
                      <td className="px-5 py-3 font-medium text-[#1B5E20]">
                        {row.format}
                      </td>
                      <td className="px-5 py-3 text-zinc-700">{row.how}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Navigation */}
        <div className="mt-16 flex flex-col gap-4 sm:flex-row sm:justify-between">
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#1B5E20] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Learning Hub
          </Link>
          <Link
            href="/learn/positions"
            className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#1B5E20] hover:underline"
          >
            Next: Player Positions
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <LearnFooter />
    </div>
  );
}
