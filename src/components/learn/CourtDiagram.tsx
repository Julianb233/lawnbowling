"use client";

import { motion } from "framer-motion";

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

export function CourtDiagram() {
  return (
    <section id="court">
      <h2 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-100">The Rink</h2>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 sm:p-6"
      >
        <LawnBowlingRink />
      </motion.div>
    </section>
  );
}
