"use client";

import { motion } from "framer-motion";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import type { SportGuide } from "@/lib/sport-guides";

export function RulesAccordion({ rules }: { rules: SportGuide["rules"] }) {
  return (
    <section id="rules">
      <h2 className="mb-4 text-2xl font-bold text-[#0A2E12]">Key Rules</h2>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <Accordion.Root type="multiple" className="space-y-2">
          {rules.map((rule, i) => (
            <Accordion.Item
              key={i}
              value={`rule-${i}`}
              className="overflow-hidden rounded-xl border border-[#0A2E12]/10 bg-[#0A2E12]/[0.03]"
            >
              <Accordion.Trigger className="flex w-full items-center justify-between px-4 py-3 text-left text-[#0A2E12] hover:bg-[#0A2E12]/5 transition-colors min-h-[44px] group">
                <span className="font-medium">{rule.rule}</span>
                <ChevronDown className="h-4 w-4 shrink-0 text-[#3D5A3E] transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </Accordion.Trigger>
              <Accordion.Content className="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
                <div className="border-t border-[#0A2E12]/10 px-4 py-3">
                  <p className="text-sm leading-relaxed text-[#3D5A3E]">
                    {rule.explanation}
                  </p>
                </div>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </motion.div>
    </section>
  );
}
