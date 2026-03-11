"use client";

import { motion } from "framer-motion";
import { Lightbulb, Target, Star, Flame, Dumbbell, Brain, ThumbsUp, type LucideIcon } from "lucide-react";

const tipIcons: LucideIcon[] = [Lightbulb, Target, Star, Flame, Dumbbell, Brain, ThumbsUp];

export function TipsList({ tips }: { tips: string[] }) {
  return (
    <section id="tips">
      <h2 className="mb-4 text-2xl font-bold text-zinc-900">
        Tips for Beginners
      </h2>
      <div className="space-y-2">
        {tips.map((tip, i) => {
          const Icon = tipIcons[i % tipIcons.length];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4"
            >
              <Icon className="w-5 h-5 mt-0.5 shrink-0 text-zinc-500" strokeWidth={1.5} />
              <p className="text-sm leading-relaxed text-zinc-600">{tip}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
