"use client";

import { motion } from "framer-motion";

export function EtiquetteCard({ items }: { items: string[] }) {
  return (
    <section id="etiquette">
      <h2 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-100">Etiquette</h2>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 sm:p-5"
      >
        <p className="mb-4 text-sm text-zinc-400">
          Good sportsmanship matters. Follow these unwritten rules to be a great
          playing partner.
        </p>
        <ul className="space-y-3">
          {items.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400"
            >
              <span className="mt-0.5 shrink-0 text-[#1B5E20]">
                {"\u2713"}
              </span>
              {item}
            </li>
          ))}
        </ul>
      </motion.div>
    </section>
  );
}
