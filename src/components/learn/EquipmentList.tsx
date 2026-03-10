"use client";

import { motion } from "framer-motion";
import type { SportGuide } from "@/lib/sport-guides";

export function EquipmentList({ equipment }: { equipment: SportGuide["equipment"] }) {
  return (
    <section id="equipment">
      <h2 className="mb-4 text-2xl font-bold text-zinc-100">
        What You&apos;ll Need
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {equipment.map((item, i) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4"
          >
            <div className="mb-2 flex items-center gap-3">
              <span className="text-2xl">{item.icon}</span>
              <h3 className="font-semibold text-zinc-100">{item.name}</h3>
            </div>
            <p className="text-sm leading-relaxed text-zinc-400">
              {item.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
