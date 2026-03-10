"use client";

import { motion } from "framer-motion";
import type { Sport } from "@/lib/types";
import { getSportColor } from "@/lib/design";

function PickleballCourt() {
  const colors = getSportColor("pickleball");
  return (
    <div className="relative mx-auto w-full max-w-md">
      <svg viewBox="0 0 220 440" className="w-full" aria-label="Pickleball court diagram">
        {/* Court outline */}
        <rect x="10" y="10" width="200" height="420" fill="none" stroke="#52525b" strokeWidth="2" rx="2" />

        {/* Center line (net) */}
        <line x1="10" y1="220" x2="210" y2="220" stroke="#a1a1aa" strokeWidth="3" />
        <text x="110" y="218" textAnchor="middle" fill="#a1a1aa" fontSize="10" fontWeight="bold">NET</text>

        {/* Kitchen / NVZ - top */}
        <rect x="10" y="150" width="200" height="70" fill={`${colors.primary}15`} stroke={colors.primary} strokeWidth="1.5" strokeDasharray="6 3" />
        <text x="110" y="190" textAnchor="middle" fill={colors.primary} fontSize="9" fontWeight="bold">NO VOLLEY ZONE</text>
        <text x="110" y="200" textAnchor="middle" fill={colors.primary} fontSize="8">(Kitchen)</text>

        {/* Kitchen / NVZ - bottom */}
        <rect x="10" y="220" width="200" height="70" fill={`${colors.primary}15`} stroke={colors.primary} strokeWidth="1.5" strokeDasharray="6 3" />
        <text x="110" y="255" textAnchor="middle" fill={colors.primary} fontSize="9" fontWeight="bold">NO VOLLEY ZONE</text>
        <text x="110" y="265" textAnchor="middle" fill={colors.primary} fontSize="8">(Kitchen)</text>

        {/* Center line dividing service areas */}
        <line x1="110" y1="10" x2="110" y2="150" stroke="#52525b" strokeWidth="1" />
        <line x1="110" y1="290" x2="110" y2="430" stroke="#52525b" strokeWidth="1" />

        {/* Service areas labels */}
        <text x="60" y="80" textAnchor="middle" fill="#71717a" fontSize="9">Right</text>
        <text x="60" y="92" textAnchor="middle" fill="#71717a" fontSize="9">Service</text>
        <text x="160" y="80" textAnchor="middle" fill="#71717a" fontSize="9">Left</text>
        <text x="160" y="92" textAnchor="middle" fill="#71717a" fontSize="9">Service</text>

        <text x="60" y="360" textAnchor="middle" fill="#71717a" fontSize="9">Left</text>
        <text x="60" y="372" textAnchor="middle" fill="#71717a" fontSize="9">Service</text>
        <text x="160" y="360" textAnchor="middle" fill="#71717a" fontSize="9">Right</text>
        <text x="160" y="372" textAnchor="middle" fill="#71717a" fontSize="9">Service</text>

        {/* Baseline labels */}
        <text x="110" y="28" textAnchor="middle" fill="#a1a1aa" fontSize="8">BASELINE</text>
        <text x="110" y="424" textAnchor="middle" fill="#a1a1aa" fontSize="8">BASELINE</text>

        {/* Dimensions */}
        <text x="215" y="220" textAnchor="start" fill="#71717a" fontSize="7" transform="rotate(90 215 220)">44 ft</text>
        <text x="110" y="440" textAnchor="middle" fill="#71717a" fontSize="7">20 ft</text>

        {/* 7ft annotation */}
        <line x1="215" y1="150" x2="215" y2="220" stroke="#71717a" strokeWidth="0.5" />
        <text x="220" y="185" fill="#71717a" fontSize="6" transform="rotate(90 220 185)">7 ft</text>
      </svg>
    </div>
  );
}

function LawnBowlingRink() {
  return (
    <div className="relative mx-auto w-full max-w-lg">
      <svg viewBox="0 0 120 400" className="mx-auto w-full max-w-[200px]" aria-label="Lawn bowling rink diagram">
        {/* Rink outline */}
        <rect x="10" y="10" width="100" height="380" fill="none" stroke="#52525b" strokeWidth="2" rx="2" />

        {/* Green fill */}
        <rect x="11" y="11" width="98" height="378" fill="#16a34a10" rx="1" />

        {/* Ditch at top */}
        <rect x="10" y="10" width="100" height="15" fill="#27272a" stroke="#52525b" strokeWidth="1" />
        <text x="60" y="22" textAnchor="middle" fill="#71717a" fontSize="7">DITCH</text>

        {/* Ditch at bottom */}
        <rect x="10" y="375" width="100" height="15" fill="#27272a" stroke="#52525b" strokeWidth="1" />
        <text x="60" y="386" textAnchor="middle" fill="#71717a" fontSize="7">DITCH</text>

        {/* Mat at bottom */}
        <rect x="45" y="340" width="30" height="12" fill="#3b82f6" stroke="#60a5fa" strokeWidth="1" rx="2" />
        <text x="60" y="349" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">MAT</text>

        {/* Jack */}
        <circle cx="65" cy="180" r="5" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
        <text x="80" y="183" fill="#fbbf24" fontSize="7">Jack</text>

        {/* Bias curve illustration */}
        <path d="M 60 340 Q 30 280 55 180" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="4 3" />
        <circle cx="55" cy="185" r="6" fill="#3b82f650" stroke="#3b82f6" strokeWidth="1" />

        {/* Another bias curve */}
        <path d="M 60 340 Q 90 260 68 190" fill="none" stroke="#ef444450" strokeWidth="1.5" strokeDasharray="4 3" />
        <circle cx="68" cy="193" r="6" fill="#ef444430" stroke="#ef4444" strokeWidth="1" />

        {/* Labels */}
        <text x="25" y="260" fill="#60a5fa" fontSize="6" transform="rotate(-70 25 260)">Bias curve</text>
        <text x="60" y="370" textAnchor="middle" fill="#71717a" fontSize="7">Delivery end</text>

        {/* Boundary markers */}
        <line x1="10" y1="25" x2="110" y2="25" stroke="#71717a" strokeWidth="0.5" strokeDasharray="3 3" />
        <line x1="10" y1="375" x2="110" y2="375" stroke="#71717a" strokeWidth="0.5" strokeDasharray="3 3" />

        {/* Center line */}
        <line x1="60" y1="25" x2="60" y2="375" stroke="#52525b40" strokeWidth="0.5" strokeDasharray="2 4" />
      </svg>
    </div>
  );
}

function TennisCourt() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <svg viewBox="0 0 280 520" className="w-full" aria-label="Tennis court diagram">
        {/* Doubles court outline */}
        <rect x="10" y="10" width="260" height="500" fill="none" stroke="#52525b" strokeWidth="2" rx="2" />

        {/* Singles sidelines */}
        <line x1="35" y1="10" x2="35" y2="510" stroke="#52525b" strokeWidth="1" strokeDasharray="6 3" />
        <line x1="245" y1="10" x2="245" y2="510" stroke="#52525b" strokeWidth="1" strokeDasharray="6 3" />

        {/* Doubles alley labels */}
        <text x="22" y="260" textAnchor="middle" fill="#71717a" fontSize="6" transform="rotate(-90 22 260)">Doubles alley</text>
        <text x="258" y="260" textAnchor="middle" fill="#71717a" fontSize="6" transform="rotate(90 258 260)">Doubles alley</text>

        {/* Net */}
        <line x1="10" y1="260" x2="270" y2="260" stroke="#f59e0b" strokeWidth="3" />
        <text x="140" y="256" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">NET</text>

        {/* Service line top */}
        <line x1="35" y1="170" x2="245" y2="170" stroke="#52525b" strokeWidth="1.5" />

        {/* Service line bottom */}
        <line x1="35" y1="350" x2="245" y2="350" stroke="#52525b" strokeWidth="1.5" />

        {/* Center service line top */}
        <line x1="140" y1="170" x2="140" y2="260" stroke="#52525b" strokeWidth="1" />

        {/* Center service line bottom */}
        <line x1="140" y1="260" x2="140" y2="350" stroke="#52525b" strokeWidth="1" />

        {/* Center marks on baselines */}
        <line x1="140" y1="10" x2="140" y2="22" stroke="#52525b" strokeWidth="1" />
        <line x1="140" y1="498" x2="140" y2="510" stroke="#52525b" strokeWidth="1" />

        {/* Service box labels */}
        <text x="87" y="215" textAnchor="middle" fill="#71717a" fontSize="8">Deuce</text>
        <text x="87" y="226" textAnchor="middle" fill="#71717a" fontSize="8">Service Box</text>
        <text x="193" y="215" textAnchor="middle" fill="#71717a" fontSize="8">Ad</text>
        <text x="193" y="226" textAnchor="middle" fill="#71717a" fontSize="8">Service Box</text>

        <text x="87" y="300" textAnchor="middle" fill="#71717a" fontSize="8">Ad</text>
        <text x="87" y="311" textAnchor="middle" fill="#71717a" fontSize="8">Service Box</text>
        <text x="193" y="300" textAnchor="middle" fill="#71717a" fontSize="8">Deuce</text>
        <text x="193" y="311" textAnchor="middle" fill="#71717a" fontSize="8">Service Box</text>

        {/* Baseline labels */}
        <text x="140" y="28" textAnchor="middle" fill="#a1a1aa" fontSize="9">BASELINE</text>
        <text x="140" y="504" textAnchor="middle" fill="#a1a1aa" fontSize="9">BASELINE</text>

        {/* Service line labels */}
        <text x="248" y="168" fill="#71717a" fontSize="7">Service Line</text>
        <text x="248" y="348" fill="#71717a" fontSize="7">Service Line</text>

        {/* Dimensions */}
        <text x="140" y="524" textAnchor="middle" fill="#71717a" fontSize="7">36 ft (doubles) / 27 ft (singles)</text>
      </svg>
    </div>
  );
}

export function CourtDiagram({ sport }: { sport: Sport }) {
  const titles: Record<Sport, string> = {
    pickleball: "The Court",
    lawn_bowling: "The Rink",
    tennis: "The Court",
  };

  return (
    <section id="court">
      <h2 className="mb-4 text-2xl font-bold text-zinc-100">{titles[sport]}</h2>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-6"
      >
        {sport === "pickleball" && <PickleballCourt />}
        {sport === "lawn_bowling" && <LawnBowlingRink />}
        {sport === "tennis" && <TennisCourt />}
      </motion.div>
    </section>
  );
}
