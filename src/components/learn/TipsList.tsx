"use client";

import { motion } from "framer-motion";

export function TipsList({ tips }: { tips: string[] }) {
  const tipEmojis = ["\u{1F4A1}", "\u{1F3AF}", "\u{2B50}", "\u{1F525}", "\u{1F4AA}", "\u{1F9E0}", "\u{1F44D}"];

  return (
    <section id="tips">
      <h2 className="mb-4 text-2xl font-bold text-zinc-900">
        Tips for Beginners
      </h2>
      <div className="space-y-2">
        {tips.map((tip, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4"
          >
            <span className="mt-0.5 text-lg shrink-0">
              {tipEmojis[i % tipEmojis.length]}
            </span>
            <p className="text-sm leading-relaxed text-zinc-600">{tip}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
