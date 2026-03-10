import type { Sport } from "./types";

export const SPORT_COLORS: Record<Sport, { primary: string; glow: string; gradient: string; bg: string; ring: string }> = {
  pickleball: {
    primary: "#22c55e",
    glow: "rgba(34, 197, 94, 0.3)",
    gradient: "from-green-500 to-emerald-600",
    bg: "bg-green-500/10",
    ring: "ring-green-500/50",
  },
  lawn_bowling: {
    primary: "#3b82f6",
    glow: "rgba(59, 130, 246, 0.3)",
    gradient: "from-blue-500 to-indigo-600",
    bg: "bg-blue-500/10",
    ring: "ring-blue-500/50",
  },
  tennis: {
    primary: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.3)",
    gradient: "from-amber-500 to-orange-600",
    bg: "bg-amber-500/10",
    ring: "ring-amber-500/50",
  },
  badminton: {
    primary: "#a855f7",
    glow: "rgba(168, 85, 247, 0.3)",
    gradient: "from-purple-500 to-violet-600",
    bg: "bg-purple-500/10",
    ring: "ring-purple-500/50",
  },
  racquetball: {
    primary: "#f43f5e",
    glow: "rgba(244, 63, 94, 0.3)",
    gradient: "from-rose-500 to-pink-600",
    bg: "bg-rose-500/10",
    ring: "ring-rose-500/50",
  },
  flag_football: {
    primary: "#f97316",
    glow: "rgba(249, 115, 22, 0.3)",
    gradient: "from-orange-500 to-amber-600",
    bg: "bg-orange-500/10",
    ring: "ring-orange-500/50",
  },
};

export const ANIMATIONS = {
  cardHover: { scale: 1.03, transition: { type: "spring" as const, stiffness: 300 } },
  fadeInUp: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } },
  staggerChildren: { transition: { staggerChildren: 0.08 } },
  pulse: { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 2 } },
};

export function getSportColor(sport: string) {
  return SPORT_COLORS[sport as Sport] ?? SPORT_COLORS.pickleball;
}
