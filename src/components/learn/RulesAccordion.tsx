"use client";

import { motion } from "framer-motion";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import type { SportGuide } from "@/lib/sport-guides";

export function RulesAccordion({ rules }: { rules: SportGuide["rules"] }) {
  return (
    <section id="rules">
      <h2 className="mb-4 text-2xl font-bold text-zinc-900">Key Rules</h2>
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
              className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50"
            >
              <Accordion.Trigger className="flex w-full items-center justify-between px-4 py-3 text-left text-zinc-900 hover:bg-zinc-100 transition-colors min-h-[44px] group">
                <span className="font-medium">{rule.rule}</span>
                <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </Accordion.Trigger>
              <Accordion.Content className="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
                <div className="border-t border-zinc-200 px-4 py-3">
                  <p className="text-sm leading-relaxed text-zinc-400">
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
