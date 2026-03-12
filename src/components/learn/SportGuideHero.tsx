"use client";

import { motion } from "framer-motion";
import { Clock, Users } from "lucide-react";
import type { SportGuide } from "@/lib/sport-guides";
import { getSportColor } from "@/lib/design";
import { SportIcon } from "@/components/icons/SportIcon";
import type { Sport } from "@/lib/types";

export function SportGuideHero({ guide }: { guide: SportGuide }) {
  const colors = getSportColor(guide.sport);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#0A2E12]/10 p-6 sm:p-8">
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
          className="mb-4"
        >
          <SportIcon sport={guide.sport as Sport} className="w-12 h-12" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-2 text-3xl font-black text-[#0A2E12] sm:text-4xl"
        >
          {guide.name}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-4 text-lg text-[#3D5A3E]"
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
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0A2E12]/5 px-3 py-1.5 text-sm text-[#3D5A3E]">
            <Clock className="h-3.5 w-3.5" />
            {guide.typicalDuration}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0A2E12]/5 px-3 py-1.5 text-sm text-[#3D5A3E]">
            <Users className="h-3.5 w-3.5" />
            {guide.playersNeeded}
          </span>
        </motion.div>
      </div>
    </section>
  );
}
