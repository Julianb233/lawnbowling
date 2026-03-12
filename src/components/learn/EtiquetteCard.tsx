"use client";

import { motion } from "framer-motion";

export function EtiquetteCard({ items }: { items: string[] }) {
  return (
    <section id="etiquette">
      <h2 className="mb-4 text-2xl font-bold text-[#0A2E12]">Etiquette</h2>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-xl border border-[#0A2E12]/10 bg-[#0A2E12]/[0.03] p-4 sm:p-5"
      >
        <p className="mb-4 text-sm text-[#3D5A3E]">
          Good sportsmanship matters. Follow these unwritten rules to be a great
          playing partner.
        </p>
        <ul className="space-y-3">
          {items.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-sm text-[#3D5A3E]"
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
