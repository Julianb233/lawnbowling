"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { getGuide } from "@/lib/sport-guides";
import type { Sport } from "@/lib/types";
import { SportIcon } from "@/components/icons/SportIcon";
import { SportGuideHero } from "@/components/learn/SportGuideHero";
import { EquipmentList } from "@/components/learn/EquipmentList";
import { CourtDiagram } from "@/components/learn/CourtDiagram";
import { ScoringGuide } from "@/components/learn/ScoringGuide";
import { RulesAccordion } from "@/components/learn/RulesAccordion";
import { TipsList } from "@/components/learn/TipsList";
import { EtiquetteCard } from "@/components/learn/EtiquetteCard";
import { GuideNav } from "@/components/learn/GuideNav";
import { ReadyToPlayCTA } from "@/components/learn/ReadyToPlayCTA";
import { BottomNav } from "@/components/board/BottomNav";

export default function SportGuidePage() {
  const params = useParams();
  const sport = (params?.sport ?? "") as string;
  const guide = getGuide(sport);

  if (!guide) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <p className="mb-4 text-6xl">404</p>
          <p className="mb-4 text-zinc-400">Sport guide not found</p>
          <Link href="/learn" className="text-[#1B5E20] hover:underline">
            Back to guides
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FEFCF9] pb-24 lg:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-zinc-200 dark:border-white/10">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Link
            href="/learn"
            className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-700 min-h-[44px]"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              <span className="inline-flex items-center gap-2"><SportIcon sport={sport as Sport} className="w-5 h-5" />{guide.name} Guide</span>
            </h1>
          </div>
        </div>
      </header>

      {/* Sticky section nav */}
      <div className="mx-auto max-w-3xl px-4">
        <GuideNav sport={sport as Sport} />
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="space-y-10">
          {/* Hero */}
          <SportGuideHero guide={guide} />

          {/* Overview */}
          <section id="overview">
            <h2 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-100">Overview</h2>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 sm:p-5"
            >
              {guide.overview.split("\n\n").map((para, i) => (
                <p
                  key={i}
                  className={`text-zinc-600 leading-relaxed ${i > 0 ? "mt-4" : ""}`}
                >
                  {para}
                </p>
              ))}
            </motion.div>
          </section>

          {/* Equipment */}
          <EquipmentList equipment={guide.equipment} />

          {/* Court/Rink Diagram */}
          <CourtDiagram />

          {/* How to Play */}
          <section id="how-to-play">
            <h2 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              How to Play
            </h2>
            <div className="space-y-3">
              {guide.howToPlay.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1B5E20]/20 text-sm font-bold text-[#1B5E20]">
                    {step.step}
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-100">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-zinc-400">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Scoring */}
          <ScoringGuide scoring={guide.scoring} sport={sport as Sport} />

          {/* Rules */}
          <RulesAccordion rules={guide.rules} />

          {/* Tips */}
          <TipsList tips={guide.beginnerTips} />

          {/* Etiquette */}
          <EtiquetteCard items={guide.etiquette} />

          {/* Fun Facts */}
          <section id="fun-facts">
            <h2 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Fun Facts
            </h2>
            <div className="space-y-2">
              {guide.funFacts.map((fact, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4"
                >
                  <span className="mt-0.5 text-zinc-400 shrink-0">&bull;</span>
                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {fact}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <ReadyToPlayCTA sport={sport as Sport} />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
