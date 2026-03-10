"use client";

import { motion } from "framer-motion";
import { Clock, Users } from "lucide-react";
import type { SportGuide } from "@/lib/sport-guides";
import { getSportColor } from "@/lib/design";

export function SportGuideHero({ guide }: { guide: SportGuide }) {
  const colors = getSportColor(guide.sport);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-zinc-800 p-6 sm:p-8">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `linear-gradient(135deg, ${colors.primary}40, transparent 60%)`,
        }}
      />
      <div className="relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 text-6xl"
        >
          {guide.emoji}
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-2 text-3xl font-black text-zinc-100 sm:text-4xl"
        >
          {guide.name}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-4 text-lg text-zinc-400"
        >
          {guide.tagline}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-3"
        >
          <span
            className="inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold"
            style={{
              backgroundColor: `${colors.primary}25`,
              color: colors.primary,
            }}
          >
            {guide.difficulty}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300">
            <Clock className="h-3.5 w-3.5" />
            {guide.typicalDuration}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300">
            <Users className="h-3.5 w-3.5" />
            {guide.playersNeeded}
          </span>
        </motion.div>
      </div>
    </section>
  );
}
