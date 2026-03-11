"use client";

import { motion } from "framer-motion";
import type { SportGuide } from "@/lib/sport-guides";
import { getSportColor } from "@/lib/design";
import type { Sport } from "@/lib/types";

export function ScoringGuide({
  scoring,
  sport,
}: {
  scoring: SportGuide["scoring"];
  sport: Sport;
}) {
  const colors = getSportColor(sport);

  return (
    <section id="scoring">
      <h2 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-100">Scoring</h2>

      {/* Quick reference box */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-4 rounded-xl border p-4"
        style={{
          borderColor: `${colors.primary}40`,
          backgroundColor: `${colors.primary}08`,
        }}
      >
        <div className="mb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary }}>
          Quick Reference
        </div>
        <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{scoring.system}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4"
      >
        <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">{scoring.explanation}</p>
      </motion.div>

      {/* Examples */}
      <div className="mb-4 space-y-2">
        {scoring.examples.map((example, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="rounded-lg border border-zinc-200 bg-zinc-50 p-3"
          >
            <p className="mb-1 text-sm font-medium text-zinc-700">
              {example.scenario}
            </p>
            <p className="text-sm text-zinc-400">{example.score}</p>
          </motion.div>
        ))}
      </div>

      {/* Tips */}
      {scoring.tips.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          <h3 className="mb-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
            Scoring Tips
          </h3>
          <ul className="space-y-1.5">
            {scoring.tips.map((tip, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-zinc-400"
              >
                <span className="mt-0.5 text-xs" style={{ color: colors.primary }}>
                  {"\u25CF"}
                </span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
