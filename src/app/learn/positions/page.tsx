export const revalidate = 300; // 5 minutes

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  Target,
  Shield,
  Eye,
  Crown,
} from "lucide-react";
import { LearnNav } from "@/components/learn/LearnNav";
import { LearnFooter } from "@/components/learn/LearnFooter";
import { LearnBreadcrumb } from "@/components/learn/LearnBreadcrumb";
import { getArticleSchema, getBreadcrumbSchema, jsonLd } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Lawn Bowling Positions | Lead, Second, Third, Skip | Lawnbowling",
  description:
    "Learn about the four lawn bowling team positions: Lead, Second, Third (Vice-Skip), and Skip. Understand each role's responsibilities, shot types, and tactical importance.",
};

const positions = [
  {
    name: "Lead",
    order: "1st to bowl",
    icon: Target,
    color: "bg-blue-500",
    lightColor: "bg-blue-500/10 text-blue-700 border-blue-200",
    focus: "Foundation and consistency",
    bowlsFours: 2,
    bowlsTriples: 3,
    bowlsPairs: 4,
    primarySkill: "Draw accuracy",
    responsibilities: [
      { title: "Place the mat", detail: "Positions it per the skip's instruction" },
      { title: "Deliver the jack", detail: "Must roll it to the agreed length consistently" },
      { title: "Draw to the jack", detail: "Primary shot is the draw -- getting close to the jack" },
      { title: "Set up the head", detail: "Establish a favourable position early" },
      { title: "Provide information", detail: "Their bowls show teammates the line and weight needed" },
    ],
    shotTypes:
      "Almost exclusively draw shots. Leads rarely play aggressive or weighted shots. Consistency and accuracy are valued above all else.",
    atTheHead:
      "When not bowling, the lead stands behind the head and stays out of the way. In Pairs, the lead measures shots and agrees the count with the opposing lead.",
  },
  {
    name: "Second",
    order: "2nd to bowl (Fours only)",
    icon: Shield,
    color: "bg-amber-500",
    lightColor: "bg-amber-500/10 text-amber-700 border-amber-200",
    focus: "Strengthening and applying pressure",
    bowlsFours: 2,
    bowlsTriples: null,
    bowlsPairs: null,
    primarySkill: "Versatility",
    responsibilities: [
      { title: "Reinforce the head", detail: "Build on the lead's position" },
      { title: "Add cover", detail: "Place bowls behind or beside the jack as insurance" },
      { title: "Adapt", detail: "Respond to what the head looks like after the leads have bowled" },
      { title: "Keep the scorecard", detail: "In Fours, the second traditionally keeps score" },
    ],
    shotTypes:
      "Primarily draw shots, but begins to develop controlled variations -- positional bowls, up-shots (slightly weighted to push bowls), and cover shots. The second is where versatility starts to matter.",
    atTheHead:
      'The tactical role is: "Apply steady pressure that forces the opposition to take risks later." The second\'s job is to make the skip\'s life easier.',
  },
  {
    name: "Third (Vice-Skip)",
    order: "3rd to bowl",
    icon: Eye,
    color: "bg-purple-500",
    lightColor: "bg-purple-500/10 text-purple-700 border-purple-200",
    focus: "Information, tactics, and decision support",
    bowlsFours: 2,
    bowlsTriples: 3,
    bowlsPairs: null,
    primarySkill: "Tactical reading",
    responsibilities: [
      {
        title: "Direct play at the head",
        detail:
          "When the skip is at the mat end bowling, the third takes charge at the head end, directing play",
      },
      {
        title: "Communicate head status",
        detail:
          "Tells the skip how many shots up or down, where bowls are, what shot to play",
      },
      {
        title: "Measure disputed shots",
        detail: "Uses calipers/tape to determine which bowl is closer",
      },
      {
        title: "Agree the count",
        detail:
          "With the opposing third, determines and agrees how many shots were scored before moving any bowls",
      },
      {
        title: "Support the skip's decisions",
        detail: "Provides tactical input but defers to the skip's authority",
      },
    ],
    shotTypes:
      "Variable -- must be able to play whatever the head demands. Draw, trail (moving the jack), wick (deflecting off another bowl), or weighted shots.",
    atTheHead:
      'Described as "the tactical engine of the team." The third must read the head accurately and communicate clearly. Poor communication from a third costs games.',
  },
  {
    name: "Skip",
    order: "Last to bowl (always)",
    icon: Crown,
    color: "bg-[#1B5E20]",
    lightColor: "bg-[#1B5E20]/10 text-[#1B5E20] border-[#1B5E20]/20",
    focus: "Leadership, strategy, and execution under pressure",
    bowlsFours: 2,
    bowlsTriples: 3,
    bowlsPairs: 4,
    primarySkill: "All-round, leadership",
    responsibilities: [
      {
        title: "Direct all play",
        detail:
          "Stands at the head end and signals/instructs each player what shot to play",
      },
      {
        title: "Set game strategy",
        detail: "Decides jack length, mat position, overall tactical approach",
      },
      {
        title: "Bowl last",
        detail: "Delivers the final (and often decisive) bowls of each end",
      },
      {
        title: "Manage the team",
        detail: "Handles morale, momentum, and personnel",
      },
      {
        title: "Make the big calls",
        detail:
          "Decides when to play safe vs aggressive, when to change tactics",
      },
    ],
    shotTypes:
      "Must master all shots -- draw, drive (heavy weight to blast bowls out), trail, wick, block, promotion (nudging own bowl closer). The skip often needs to rescue bad ends or capitalize on good ones.",
    atTheHead:
      'When it is the skip\'s turn to bowl, they walk to the mat end and the third takes over directing play from the head end. The skip "sees the bigger picture -- not just the head, but the score, conditions, momentum, and emotional state of the team." The skip is the captain.',
  },
];

export default function PositionsPage() {
  const articleSchema = getArticleSchema({
    title: "Lawn Bowling Positions | Lead, Second, Third, Skip",
    description: "Learn about the four lawn bowling team positions: Lead, Second, Third (Vice-Skip), and Skip.",
    url: "/learn/positions",
  });
  const breadcrumbs = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Learn", url: "/learn" },
    { name: "Positions", url: "/learn/positions" },
  ]);

  return (
    <div className="min-h-screen bg-[#FEFCF9] overflow-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }} />
      <LearnNav />

      <div className="mx-auto max-w-4xl px-6 pt-10 pb-24">
        <LearnBreadcrumb items={[{ label: "Positions" }]} />

        {/* Page Header */}
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 md:text-5xl" style={{ fontFamily: "var(--font-display)" }}>
            Player <span className="text-[#1B5E20]">Positions</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-600">
            In team formats (Pairs, Triples, Fours), each player has a
            designated position with specific responsibilities. Positions bowl
            in order: Lead first, then Second (in Fours), then Third/Vice-Skip,
            then Skip last.
          </p>
        </header>

        {/* Team Layout Diagram */}
        <div className="mb-14 rounded-xl border border-[#1B5E20]/20 bg-[#1B5E20]/5 p-6">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#1B5E20]" style={{ fontFamily: "var(--font-display)" }}>
            Bowling Order on the Rink
          </h2>
          <div className="relative mx-auto max-w-lg">
            <div className="flex items-center justify-between rounded-lg border-2 border-[#2E7D32]/30 bg-white p-4">
              {/* Mat end */}
              <div className="text-center">
                <div className="mb-2 rounded bg-zinc-800 px-3 py-1 text-xs font-bold text-white">
                  MAT END
                </div>
                <div className="space-y-2 text-xs text-zinc-600">
                  <div className="rounded-full bg-blue-100 px-3 py-1 font-semibold text-blue-700">
                    Lead bowls 1st
                  </div>
                  <div className="rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-700">
                    Second bowls 2nd
                  </div>
                  <div className="rounded-full bg-purple-100 px-3 py-1 font-semibold text-purple-700">
                    Third bowls 3rd
                  </div>
                  <div className="rounded-full bg-green-100 px-3 py-1 font-semibold text-[#1B5E20]">
                    Skip bowls last
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center gap-1 px-4">
                <div className="text-xs text-zinc-400">Direction of play</div>
                <div className="flex items-center">
                  <div className="h-px w-12 bg-zinc-300 sm:w-24" />
                  <ChevronRight className="h-4 w-4 text-zinc-400" />
                </div>
              </div>

              {/* Head end */}
              <div className="text-center">
                <div className="mb-2 rounded bg-[#1B5E20] px-3 py-1 text-xs font-bold text-white">
                  HEAD END
                </div>
                <div className="space-y-1 text-xs text-zinc-500">
                  <p>Skip directs play</p>
                  <p>(until it is their turn</p>
                  <p>to bowl, then Third</p>
                  <p>takes over here)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Position Cards */}
        <div className="space-y-12">
          {positions.map((pos) => (
            <section key={pos.name} id={pos.name.toLowerCase().replace(/[^a-z]/g, "-")}>
              <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
                {/* Header */}
                <div className={`${pos.color} px-6 py-5 text-white`}>
                  <div className="flex items-center gap-3">
                    <pos.icon className="h-7 w-7" />
                    <div>
                      <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{pos.name}</h2>
                      <p className="text-sm opacity-90">{pos.order}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Quick Stats */}
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Primary Focus
                      </p>
                      <p className="mt-1 text-[15px] font-medium text-zinc-900">
                        {pos.focus}
                      </p>
                    </div>
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Primary Skill
                      </p>
                      <p className="mt-1 text-[15px] font-medium text-zinc-900">
                        {pos.primarySkill}
                      </p>
                    </div>
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Bowls Per End
                      </p>
                      <p className="mt-1 text-[15px] font-medium text-zinc-900">
                        {pos.bowlsFours !== null ? `Fours: ${pos.bowlsFours}` : ""}
                        {pos.bowlsTriples !== null
                          ? `${pos.bowlsFours !== null ? " | " : ""}Triples: ${pos.bowlsTriples}`
                          : ""}
                        {pos.bowlsPairs !== null
                          ? `${pos.bowlsFours !== null || pos.bowlsTriples !== null ? " | " : ""}Pairs: ${pos.bowlsPairs}`
                          : ""}
                      </p>
                    </div>
                  </div>

                  {/* Responsibilities */}
                  <div>
                    <h3 className="mb-3 font-bold text-zinc-900">
                      Key Responsibilities
                    </h3>
                    <div className="space-y-2">
                      {pos.responsibilities.map((resp) => (
                        <div
                          key={resp.title}
                          className="flex items-start gap-3 rounded-lg border border-zinc-100 bg-zinc-50 p-4"
                        >
                          <div
                            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${pos.color} text-white`}
                          >
                            <ChevronRight className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <p className="font-semibold text-zinc-900">
                              {resp.title}
                            </p>
                            <p className="text-[14px] leading-relaxed text-zinc-600">
                              {resp.detail}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shot Types */}
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-5">
                    <h3 className="mb-2 font-bold text-zinc-900">
                      Typical Shot Types
                    </h3>
                    <p className="text-[15px] leading-relaxed text-zinc-700">
                      {pos.shotTypes}
                    </p>
                  </div>

                  {/* Tactical Role */}
                  <div className={`rounded-lg border p-5 ${pos.lightColor}`}>
                    <h3 className="mb-2 font-bold">Tactical Role</h3>
                    <p className="text-[15px] leading-relaxed">
                      {pos.atTheHead}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* Summary Table */}
        <div className="mt-14">
          <h2 className="mb-4 text-2xl font-bold text-zinc-900" style={{ fontFamily: "var(--font-display)" }}>
            Position Summary
          </h2>
          <div className="overflow-x-auto rounded-xl border border-zinc-200">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-zinc-900">
                    Position
                  </th>
                  <th className="px-4 py-3 font-semibold text-zinc-900">
                    Order
                  </th>
                  <th className="px-4 py-3 font-semibold text-zinc-900">
                    Bowls (Fours)
                  </th>
                  <th className="px-4 py-3 font-semibold text-zinc-900">
                    Bowls (Triples)
                  </th>
                  <th className="px-4 py-3 font-semibold text-zinc-900">
                    Bowls (Pairs)
                  </th>
                  <th className="px-4 py-3 font-semibold text-zinc-900">
                    Primary Skill
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {[
                  { pos: "Lead", order: "1st", f: 2, t: 3, p: 4, skill: "Draw accuracy" },
                  { pos: "Second", order: "2nd", f: 2, t: "--", p: "--", skill: "Versatility" },
                  { pos: "Third/Vice", order: "3rd", f: 2, t: 3, p: "--", skill: "Tactical reading" },
                  { pos: "Skip", order: "4th (last)", f: 2, t: 3, p: 4, skill: "All-round, leadership" },
                ].map((row) => (
                  <tr key={row.pos}>
                    <td className="px-4 py-3 font-medium text-[#1B5E20]">
                      {row.pos}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">{row.order}</td>
                    <td className="px-4 py-3 text-zinc-700">{row.f}</td>
                    <td className="px-4 py-3 text-zinc-700">{row.t}</td>
                    <td className="px-4 py-3 text-zinc-700">{row.p}</td>
                    <td className="px-4 py-3 text-zinc-700">{row.skill}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-16 flex flex-col gap-4 sm:flex-row sm:justify-between">
          <Link
            href="/learn/rules"
            className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#1B5E20] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous: Rules
          </Link>
          <Link
            href="/learn/formats"
            className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#1B5E20] hover:underline"
          >
            Next: Game Formats
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <LearnFooter />
    </div>
  );
}
