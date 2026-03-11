import type { Sport } from "./types";

export const SPORT_COLORS: Partial<Record<Sport, { primary: string; glow: string; gradient: string; bg: string; ring: string }>> = {
  lawn_bowling: {
    primary: "#3b82f6",
    glow: "rgba(59, 130, 246, 0.3)",
    gradient: "from-blue-500 to-indigo-600",
    bg: "bg-blue-500/10",
    ring: "ring-blue-500/50",
  },
};

export const ANIMATIONS = {
  cardHover: { scale: 1.03, transition: { type: "spring" as const, stiffness: 300 } },
  fadeInUp: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } },
  staggerChildren: { transition: { staggerChildren: 0.08 } },
  pulse: { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 2 } },
};

export function getSportColor(sport: string) {
  return SPORT_COLORS[sport as Sport] ?? SPORT_COLORS.lawn_bowling!;
}
