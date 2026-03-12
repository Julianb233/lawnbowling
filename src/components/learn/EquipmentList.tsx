"use client";

import { motion } from "framer-motion";
import {
  CircleDot,
  Target,
  Ruler,
  Footprints,
  Package,
  Gauge,
  type LucideIcon,
} from "lucide-react";
import type { SportGuide } from "@/lib/sport-guides";

const EQUIPMENT_ICON_MAP: Record<string, LucideIcon> = {
  "bowls": CircleDot,
  "jack": Target,
  "mat": Ruler,
  "shoe": Footprints,
  "bag": Package,
  "measure": Gauge,
};

function getEquipmentIcon(name: string): LucideIcon {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(EQUIPMENT_ICON_MAP)) {
    if (lower.includes(key)) return icon;
  }
  return Package;
}

export function EquipmentList({ equipment }: { equipment: SportGuide["equipment"] }) {
  return (
    <section id="equipment">
      <h2 className="mb-4 text-2xl font-bold text-[#0A2E12]">
        What You&apos;ll Need
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {equipment.map((item, i) => {
          const Icon = getEquipmentIcon(item.name);
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl border border-[#0A2E12]/10 bg-[#0A2E12]/[0.03] p-4"
            >
              <div className="mb-2 flex items-center gap-3">
                <Icon className="w-6 h-6 text-[#3D5A3E] shrink-0" strokeWidth={1.5} />
                <h3 className="font-semibold text-[#0A2E12]">{item.name}</h3>
              </div>
              <p className="text-sm leading-relaxed text-[#3D5A3E]">
                {item.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
