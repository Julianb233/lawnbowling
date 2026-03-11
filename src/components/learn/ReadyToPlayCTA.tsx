"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { getSportColor } from "@/lib/design";
import type { Sport } from "@/lib/types";
import { SPORT_LABELS } from "@/lib/types";
import { SportIcon } from "@/components/icons/SportIcon";

export function ReadyToPlayCTA({ sport }: { sport: Sport }) {
  const colors = getSportColor(sport);
  const label = SPORT_LABELS[sport];

  return (
    <section className="mt-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl border border-zinc-200 p-6 text-center sm:p-8"
        style={{
          background: `linear-gradient(135deg, ${colors.primary}10, transparent 60%)`,
          borderColor: `${colors.primary}30`,
        }}
      >
        <div className="mb-3 flex justify-center"><SportIcon sport={sport} className="w-10 h-10" /></div>
        <h2 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Ready to Play {label.label}?
        </h2>
        <p className="mb-5 text-zinc-400">
          Find a partner and get on the court. Check who&apos;s available right now.
        </p>
        <Link
          href={`/board?sport=${sport}`}
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white transition-all hover:scale-105 min-h-[44px]"
          style={{
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.primary}cc)`,
            boxShadow: `0 0 20px ${colors.glow}`,
          }}
        >
          Find a Partner
        </Link>
      </motion.div>
    </section>
  );
}
