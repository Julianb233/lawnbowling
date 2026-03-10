"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Users } from "lucide-react";
import { getAllGuides } from "@/lib/sport-guides";
import { getSportColor } from "@/lib/design";
import { BottomNav } from "@/components/board/BottomNav";

export default function LearnPage() {
  const guides = getAllGuides();

  return (
    <div className="min-h-screen bg-white pb-24 lg:pb-8">
      <header className="sticky top-0 z-40 glass border-b border-zinc-200">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Link
            href="/board"
            className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-700 min-h-[44px]"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-zinc-900">
              Learn to Play
            </h1>
            <p className="text-sm text-zinc-500">
              Pick a sport to learn the rules, scoring, and tips
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide, i) => {
            const colors = getSportColor(guide.sport);
            return (
              <motion.div
                key={guide.sport}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  href={`/learn/${guide.sport}`}
                  className="group block rounded-2xl border border-zinc-200 bg-white/80 p-6 transition-all hover:border-zinc-400 hover:bg-zinc-100"
                  style={{
                    boxShadow: `0 0 0 0 ${colors.glow}`,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${colors.glow}`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 0 ${colors.glow}`;
                  }}
                >
                  <div className="mb-4 text-5xl">{guide.emoji}</div>
                  <h2 className="mb-1 text-xl font-bold text-zinc-900">
                    {guide.name}
                  </h2>
                  <p className="mb-4 text-sm text-zinc-400 line-clamp-2">
                    {guide.tagline}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
                      style={{
                        backgroundColor: `${colors.primary}20`,
                        color: colors.primary,
                      }}
                    >
                      {guide.difficulty}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-400">
                      <Clock className="h-3 w-3" />
                      {guide.typicalDuration}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-400">
                      <Users className="h-3 w-3" />
                      {guide.playersNeeded}
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
