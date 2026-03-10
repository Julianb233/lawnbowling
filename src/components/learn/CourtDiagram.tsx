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

function BadmintonCourt() {
  const colors = getSportColor("badminton");
  return (
    <div className="relative mx-auto w-full max-w-md">
      <svg viewBox="0 0 240 520" className="w-full" aria-label="Badminton court diagram">
        {/* Court outline (doubles) */}
        <rect x="10" y="10" width="220" height="500" fill="none" stroke="#52525b" strokeWidth="2" rx="2" />

        {/* Singles sidelines */}
        <line x1="30" y1="10" x2="30" y2="510" stroke="#52525b" strokeWidth="1" strokeDasharray="6 3" />
        <line x1="210" y1="10" x2="210" y2="510" stroke="#52525b" strokeWidth="1" strokeDasharray="6 3" />

        {/* Doubles alley labels */}
        <text x="20" y="260" textAnchor="middle" fill="#71717a" fontSize="6" transform="rotate(-90 20 260)">Doubles alley</text>
        <text x="220" y="260" textAnchor="middle" fill="#71717a" fontSize="6" transform="rotate(90 220 260)">Doubles alley</text>

        {/* Net */}
        <line x1="10" y1="260" x2="230" y2="260" stroke={colors.primary} strokeWidth="3" />
        <text x="120" y="256" textAnchor="middle" fill={colors.primary} fontSize="10" fontWeight="bold">NET</text>

        {/* Short service lines */}
        <line x1="30" y1="180" x2="210" y2="180" stroke="#52525b" strokeWidth="1.5" />
        <line x1="30" y1="340" x2="210" y2="340" stroke="#52525b" strokeWidth="1.5" />

        {/* Short service line labels */}
        <text x="213" y="178" fill="#71717a" fontSize="6">Short Service</text>
        <text x="213" y="338" fill="#71717a" fontSize="6">Short Service</text>

        {/* Long service line (doubles) */}
        <line x1="10" y1="40" x2="230" y2="40" stroke="#52525b" strokeWidth="1" strokeDasharray="4 3" />
        <line x1="10" y1="480" x2="230" y2="480" stroke="#52525b" strokeWidth="1" strokeDasharray="4 3" />

        {/* Long service line labels */}
        <text x="120" y="36" textAnchor="middle" fill="#71717a" fontSize="6">Long Service (doubles)</text>
        <text x="120" y="476" textAnchor="middle" fill="#71717a" fontSize="6">Long Service (doubles)</text>

        {/* Center line - top half */}
        <line x1="120" y1="180" x2="120" y2="260" stroke="#52525b" strokeWidth="1" />

        {/* Center line - bottom half */}
        <line x1="120" y1="260" x2="120" y2="340" stroke="#52525b" strokeWidth="1" />

        {/* Service court labels - top */}
        <text x="75" y="218" textAnchor="middle" fill="#71717a" fontSize="8">Right</text>
        <text x="75" y="229" textAnchor="middle" fill="#71717a" fontSize="8">Service</text>
        <text x="165" y="218" textAnchor="middle" fill="#71717a" fontSize="8">Left</text>
        <text x="165" y="229" textAnchor="middle" fill="#71717a" fontSize="8">Service</text>

        {/* Service court labels - bottom */}
        <text x="75" y="295" textAnchor="middle" fill="#71717a" fontSize="8">Left</text>
        <text x="75" y="306" textAnchor="middle" fill="#71717a" fontSize="8">Service</text>
        <text x="165" y="295" textAnchor="middle" fill="#71717a" fontSize="8">Right</text>
        <text x="165" y="306" textAnchor="middle" fill="#71717a" fontSize="8">Service</text>

        {/* Back boundary labels */}
        <text x="120" y="24" textAnchor="middle" fill="#a1a1aa" fontSize="8">BACK BOUNDARY</text>
        <text x="120" y="500" textAnchor="middle" fill="#a1a1aa" fontSize="8">BACK BOUNDARY</text>

        {/* Dimensions */}
        <text x="120" y="518" textAnchor="middle" fill="#71717a" fontSize="7">20 ft (doubles) / 17 ft (singles)</text>
        <text x="235" y="260" textAnchor="start" fill="#71717a" fontSize="7" transform="rotate(90 235 260)">44 ft</text>

        {/* Net height annotation */}
        <text x="120" y="270" textAnchor="middle" fill={colors.primary} fontSize="6">5 ft 1 in high</text>
      </svg>
    </div>
  );
}

function RacquetballCourt() {
  const colors = getSportColor("racquetball");
  return (
    <div className="relative mx-auto w-full max-w-md">
      <svg viewBox="0 0 220 440" className="w-full" aria-label="Racquetball court diagram">
        {/* Court outline (enclosed box) */}
        <rect x="10" y="10" width="200" height="420" fill="none" stroke="#52525b" strokeWidth="3" rx="2" />

        {/* Front wall label */}
        <rect x="10" y="10" width="200" height="4" fill={colors.primary} />
        <text x="110" y="28" textAnchor="middle" fill={colors.primary} fontSize="10" fontWeight="bold">FRONT WALL</text>

        {/* Back wall label */}
        <rect x="10" y="426" width="200" height="4" fill="#71717a" />
        <text x="110" y="420" textAnchor="middle" fill="#71717a" fontSize="9">BACK WALL</text>

        {/* Side wall labels */}
        <text x="16" y="220" fill="#71717a" fontSize="7" transform="rotate(-90 16 220)">SIDE WALL</text>
        <text x="204" y="220" fill="#71717a" fontSize="7" transform="rotate(90 204 220)">SIDE WALL</text>

        {/* Short line */}
        <line x1="10" y1="220" x2="210" y2="220" stroke="#52525b" strokeWidth="2" />
        <text x="110" y="216" textAnchor="middle" fill="#52525b" fontSize="9" fontWeight="bold">SHORT LINE</text>

        {/* Service line */}
        <line x1="10" y1="180" x2="210" y2="180" stroke="#52525b" strokeWidth="1.5" />
        <text x="110" y="176" textAnchor="middle" fill="#71717a" fontSize="8">SERVICE LINE</text>

        {/* Service zone highlight */}
        <rect x="11" y="181" width="198" height="38" fill={`${colors.primary}10`} />
        <text x="110" y="204" textAnchor="middle" fill={colors.primary} fontSize="9" fontWeight="bold">SERVICE ZONE</text>

        {/* Service boxes */}
        <rect x="10" y="180" width="40" height="40" fill="none" stroke="#52525b" strokeWidth="1" strokeDasharray="4 3" />
        <rect x="170" y="180" width="40" height="40" fill="none" stroke="#52525b" strokeWidth="1" strokeDasharray="4 3" />
        <text x="30" y="203" textAnchor="middle" fill="#71717a" fontSize="6">Service</text>
        <text x="30" y="211" textAnchor="middle" fill="#71717a" fontSize="6">Box</text>
        <text x="190" y="203" textAnchor="middle" fill="#71717a" fontSize="6">Service</text>
        <text x="190" y="211" textAnchor="middle" fill="#71717a" fontSize="6">Box</text>

        {/* Receiving line */}
        <line x1="10" y1="260" x2="210" y2="260" stroke="#52525b" strokeWidth="1" strokeDasharray="6 3" />
        <text x="110" y="275" textAnchor="middle" fill="#71717a" fontSize="8">RECEIVING LINE</text>

        {/* Play area labels */}
        <text x="110" y="100" textAnchor="middle" fill="#71717a" fontSize="9">Front Court</text>
        <text x="110" y="350" textAnchor="middle" fill="#71717a" fontSize="9">Back Court</text>

        {/* Ball trajectory illustration */}
        <path d="M 110 200 L 110 14" fill="none" stroke={colors.primary} strokeWidth="1.5" strokeDasharray="4 3" />
        <path d="M 110 14 L 160 300" fill="none" stroke={colors.primary} strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
        <circle cx="160" cy="300" r="4" fill={colors.primary} opacity="0.4" />
        <text x="165" y="298" fill={colors.primary} fontSize="6">Ball path</text>

        {/* Dimensions */}
        <text x="110" y="440" textAnchor="middle" fill="#71717a" fontSize="7">20 ft wide x 40 ft long x 20 ft high</text>

        {/* Ceiling label */}
        <text x="110" y="50" textAnchor="middle" fill="#71717a" fontSize="7">(Ceiling is in play)</text>
      </svg>
    </div>
  );
}

function FlagFootballField() {
  const colors = getSportColor("flag_football");
  return (
    <div className="relative mx-auto w-full max-w-lg">
      <svg viewBox="0 0 320 480" className="w-full" aria-label="Flag football field diagram">
        {/* Field outline */}
        <rect x="10" y="10" width="300" height="460" fill="none" stroke="#52525b" strokeWidth="2" rx="2" />

        {/* Field green fill */}
        <rect x="11" y="11" width="298" height="458" fill="#16a34a10" rx="1" />

        {/* End zone - top */}
        <rect x="10" y="10" width="300" height="60" fill={`${colors.primary}15`} stroke={colors.primary} strokeWidth="1.5" />
        <text x="160" y="45" textAnchor="middle" fill={colors.primary} fontSize="12" fontWeight="bold">END ZONE</text>

        {/* End zone - bottom */}
        <rect x="10" y="410" width="300" height="60" fill={`${colors.primary}15`} stroke={colors.primary} strokeWidth="1.5" />
        <text x="160" y="445" textAnchor="middle" fill={colors.primary} fontSize="12" fontWeight="bold">END ZONE</text>

        {/* Goal lines */}
        <line x1="10" y1="70" x2="310" y2="70" stroke={colors.primary} strokeWidth="2" />
        <line x1="10" y1="410" x2="310" y2="410" stroke={colors.primary} strokeWidth="2" />

        {/* Midfield line */}
        <line x1="10" y1="240" x2="310" y2="240" stroke="#52525b" strokeWidth="2" />
        <text x="160" y="236" textAnchor="middle" fill="#52525b" fontSize="10" fontWeight="bold">MIDFIELD</text>
        <text x="160" y="252" textAnchor="middle" fill="#71717a" fontSize="7">(First down line)</text>

        {/* No-run zone near midfield */}
        <rect x="11" y="225" width="298" height="30" fill="#ef444410" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="4 3" />
        <text x="275" y="243" textAnchor="end" fill="#ef4444" fontSize="6">No-Run Zone</text>

        {/* No-run zone near top end zone */}
        <rect x="11" y="70" width="298" height="25" fill="#ef444410" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="4 3" />
        <text x="275" y="86" textAnchor="end" fill="#ef4444" fontSize="6">No-Run Zone</text>

        {/* No-run zone near bottom end zone */}
        <rect x="11" y="385" width="298" height="25" fill="#ef444410" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="4 3" />
        <text x="275" y="401" textAnchor="end" fill="#ef4444" fontSize="6">No-Run Zone</text>

        {/* Yard markers */}
        <line x1="30" y1="155" x2="290" y2="155" stroke="#52525b40" strokeWidth="0.5" strokeDasharray="3 3" />
        <line x1="30" y1="325" x2="290" y2="325" stroke="#52525b40" strokeWidth="0.5" strokeDasharray="3 3" />

        {/* Field position labels */}
        <text x="160" y="160" textAnchor="middle" fill="#71717a" fontSize="7">~ 25 yd line</text>
        <text x="160" y="330" textAnchor="middle" fill="#71717a" fontSize="7">~ 25 yd line</text>

        {/* Player positions illustration - offense */}
        <circle cx="160" cy="290" r="5" fill={colors.primary} opacity="0.6" />
        <text x="160" y="304" textAnchor="middle" fill={colors.primary} fontSize="6">QB</text>

        <circle cx="160" cy="275" r="4" fill="#71717a" opacity="0.4" />
        <text x="160" y="270" textAnchor="middle" fill="#71717a" fontSize="6">C</text>

        <circle cx="100" cy="275" r="4" fill={colors.primary} opacity="0.4" />
        <text x="100" y="270" textAnchor="middle" fill={colors.primary} fontSize="6">WR</text>

        <circle cx="220" cy="275" r="4" fill={colors.primary} opacity="0.4" />
        <text x="220" y="270" textAnchor="middle" fill={colors.primary} fontSize="6">WR</text>

        {/* 5yd and 10yd conversion marks */}
        <line x1="140" y1="75" x2="180" y2="75" stroke="#71717a" strokeWidth="1" />
        <text x="185" y="78" fill="#71717a" fontSize="6">5 yd (1 pt)</text>
        <line x1="140" y1="80" x2="180" y2="80" stroke="#71717a" strokeWidth="1" />
        <text x="185" y="83" fill="#71717a" fontSize="6">10 yd (2 pts)</text>

        {/* Dimensions */}
        <text x="160" y="478" textAnchor="middle" fill="#71717a" fontSize="7">~30 yd wide x ~70 yd long (5v5) | Varies by league</text>

        {/* Hash marks */}
        {[100, 130, 160, 190, 220, 250, 280, 310, 340, 370].map((y) => (
          <g key={y}>
            <line x1="10" y1={y} x2="18" y2={y} stroke="#52525b" strokeWidth="0.5" />
            <line x1="302" y1={y} x2="310" y2={y} stroke="#52525b" strokeWidth="0.5" />
          </g>
        ))}
      </svg>
    </div>
  );
}

export function CourtDiagram({ sport }: { sport: Sport }) {
  const titles: Record<Sport, string> = {
    pickleball: "The Court",
    lawn_bowling: "The Rink",
    tennis: "The Court",
    badminton: "The Court",
    racquetball: "The Court",
    flag_football: "The Field",
  };

  return (
    <section id="court">
      <h2 className="mb-4 text-2xl font-bold text-zinc-900">{titles[sport]}</h2>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 sm:p-6"
      >
        {sport === "pickleball" && <PickleballCourt />}
        {sport === "lawn_bowling" && <LawnBowlingRink />}
        {sport === "tennis" && <TennisCourt />}
        {sport === "badminton" && <BadmintonCourt />}
        {sport === "racquetball" && <RacquetballCourt />}
        {sport === "flag_football" && <FlagFootballField />}
      </motion.div>
    </section>
  );
}
