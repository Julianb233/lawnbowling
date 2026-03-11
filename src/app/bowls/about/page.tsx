"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { BottomNav } from "@/components/board/BottomNav";

const POSITIONS = [
  {
    name: "Skip",
    color: "bg-[#1B5E20]",
    description:
      "The team captain who directs strategy and bowls last. Reads the head, calls the shots, and makes tactical decisions for the team.",
  },
  {
    name: "Vice (Third)",
    color: "bg-purple-500",
    description:
      "Second in command. Measures disputed shots, keeps score, and takes over when the Skip is bowling.",
  },
  {
    name: "Second",
    color: "bg-amber-500",
    description:
      "Supports the team effort by building on the Lead's work. Bowls second and helps establish position.",
  },
  {
    name: "Lead",
    color: "bg-[#1B5E20]",
    description:
      "Sets the head by placing the jack and bowling first. Establishes the foundation for each end.",
  },
];

const FORMATS = [
  { name: "Fours (Rinks)", players: "4 per team", desc: "The classic format — Skip, Vice, Second, Lead. Most common in club and international play." },
  { name: "Triples", players: "3 per team", desc: "Skip, Vice, Lead — fast-paced with more individual responsibility." },
  { name: "Pairs", players: "2 per team", desc: "Skip and Lead — requires versatility. Each player bowls more ends." },
  { name: "Singles", players: "1 vs 1", desc: "Head-to-head competition. The purest test of individual skill." },
];

const HISTORY_FACTS = [
  "Lawn bowls has been played for over 800 years, with the oldest surviving bowling green at Southampton, England (est. 1299).",
  "Sir Francis Drake famously finished his game of bowls before engaging the Spanish Armada in 1588.",
  "The sport is played in over 40 countries across six continents.",
  "Bowls was included in the inaugural Commonwealth Games in 1930 and has been featured at every Games since.",
  "The bias (curve) of a bowl is created by its asymmetric shape — one side is slightly larger than the other.",
];

export default function BowlsAboutPage() {
  return (
    <div className="min-h-screen bg-zinc-50 pb-20 lg:pb-0">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-green-800">
        <div className="absolute inset-0 bg-[url('/images/bowls-pattern.svg')] opacity-10" />
        <div className="relative mx-auto max-w-3xl px-4 py-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-6xl">🎳</span>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white">
              Lawn Bowls
            </h1>
            <p className="mt-2 text-lg text-[#1B5E20]/10">
              The gentleman's game with 800 years of tradition
            </p>
          </motion.div>
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-4 py-8 space-y-10">
        {/* What is Lawn Bowls */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-2xl font-black text-zinc-900">
            What is Lawn Bowls?
          </h2>
          <p className="mt-3 text-zinc-600 leading-relaxed">
            Lawn bowls is a precision sport where players roll biased balls
            (called <strong>bowls</strong>) toward a smaller white ball (the{" "}
            <strong>jack</strong>). The goal is simple: get your bowls closer to
            the jack than your opponent. But the curved path of each bowl — its{" "}
            <strong>bias</strong> — makes every delivery a challenge of skill,
            strategy, and touch.
          </p>
          <p className="mt-3 text-zinc-600 leading-relaxed">
            Played on a flat, manicured green divided into <strong>rinks</strong>,
            lawn bowls is a sport for all ages and fitness levels. Whether you're
            a competitive tournament player or enjoying a social roll-up at the
            club, the game rewards patience, precision, and tactical thinking.
          </p>

          {/* Photo placeholder - bowling green */}
          <div className="mt-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[#1B5E20]/10 to-green-50 border border-[#1B5E20]/20">
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <span className="text-5xl">🟢</span>
                <p className="mt-2 text-sm text-[#1B5E20] font-medium">
                  The Bowling Green
                </p>
                <p className="mt-1 text-xs text-[#1B5E20]">
                  A flat, square playing surface typically 34-40 meters per side
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Key Equipment */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h2 className="text-2xl font-black text-zinc-900">Key Equipment</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: "⚫",
                name: "Bowls",
                desc: "Weighted, asymmetric balls that curve as they slow. Each player uses a set of 4 (or 2 in singles/pairs).",
              },
              {
                icon: "⚪",
                name: "Jack (Kitty)",
                desc: "The small white target ball. The Lead places it at the start of each end.",
              },
              {
                icon: "📏",
                name: "Mat",
                desc: "The delivery mat — players must have one foot on it when bowling.",
              },
              {
                icon: "👟",
                name: "Flat-soled Shoes",
                desc: "Required to protect the green. No heels, studs, or treaded soles.",
              },
            ].map((item) => (
              <div
                key={item.name}
                className="rounded-xl bg-white border border-zinc-200 p-4"
              >
                <span className="text-2xl">{item.icon}</span>
                <h3 className="mt-2 font-bold text-zinc-900">{item.name}</h3>
                <p className="mt-1 text-sm text-zinc-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Positions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-black text-zinc-900">
            Team Positions
          </h2>
          <p className="mt-2 text-zinc-500 text-sm">
            In team formats, each player has a specific role and bowling order
          </p>
          <div className="mt-4 space-y-3">
            {POSITIONS.map((pos, i) => (
              <div
                key={pos.name}
                className="flex gap-4 rounded-xl bg-white border border-zinc-200 p-4"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white font-bold text-sm ${pos.color}`}
                >
                  {4 - i}
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900">{pos.name}</h3>
                  <p className="mt-0.5 text-sm text-zinc-500">
                    {pos.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Game Formats */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h2 className="text-2xl font-black text-zinc-900">Game Formats</h2>
          <div className="mt-4 space-y-3">
            {FORMATS.map((f) => (
              <div
                key={f.name}
                className="rounded-xl bg-white border border-zinc-200 p-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-zinc-900">{f.name}</h3>
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-[#2E7D32]">
                    {f.players}
                  </span>
                </div>
                <p className="mt-1 text-sm text-zinc-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* How a Game Works */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-black text-zinc-900">
            How a Game Works
          </h2>
          <div className="mt-4 space-y-4">
            {[
              {
                step: "1",
                title: "Place the Jack",
                desc: "The Lead rolls the jack to set the target distance for the end.",
              },
              {
                step: "2",
                title: "Bowl in Turn",
                desc: "Players alternate deliveries, reading the bias to navigate around other bowls.",
              },
              {
                step: "3",
                title: "Count the Shots",
                desc: "When all bowls are delivered, the team with the bowl closest to the jack scores. They get one point for each bowl closer than the opponent's nearest.",
              },
              {
                step: "4",
                title: "Play Ends",
                desc: "A game is typically played over a set number of ends (14-21) or to a target score.",
              },
            ].map((s) => (
              <div key={s.step} className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1B5E20]/10 text-sm font-black text-[#2E7D32]">
                  {s.step}
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900">{s.title}</h3>
                  <p className="mt-0.5 text-sm text-zinc-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* History */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <h2 className="text-2xl font-black text-zinc-900">
            A Brief History
          </h2>
          <div className="mt-4 space-y-3">
            {HISTORY_FACTS.map((fact, i) => (
              <div
                key={i}
                className="flex gap-3 rounded-xl bg-white border border-zinc-200 p-4"
              >
                <span className="shrink-0 text-lg">📜</span>
                <p className="text-sm text-zinc-600">{fact}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-gradient-to-br from-[#1B5E20] to-green-700 p-8 text-center"
        >
          <h2 className="text-2xl font-black text-white">
            Ready to Roll?
          </h2>
          <p className="mt-2 text-[#1B5E20]/10">
            Check in for today's tournament and get matched with your team
          </p>
          <Link
            href="/bowls"
            className="mt-4 inline-block rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#2E7D32] transition-colors hover:bg-[#1B5E20]/5"
          >
            View Tournaments
          </Link>
        </motion.section>
      </main>

      <BottomNav />
    </div>
  );
}
