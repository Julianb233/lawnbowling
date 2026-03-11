import { CircleDot, Zap, Circle, Wind, Target, Flag, type LucideIcon } from "lucide-react";
import type { Sport } from "@/lib/types";

const SPORT_ICON_MAP: Record<Sport, LucideIcon> = {
  pickleball: Zap,
  lawn_bowling: CircleDot,
  tennis: Circle,
  badminton: Wind,
  racquetball: Target,
  flag_football: Flag,
};

interface SportIconProps {
  sport: Sport;
  className?: string;
  strokeWidth?: number;
}

export function SportIcon({ sport, className = "w-4 h-4", strokeWidth = 1.5 }: SportIconProps) {
  const Icon = SPORT_ICON_MAP[sport] ?? CircleDot;
  return <Icon className={className} strokeWidth={strokeWidth} />;
}

export function getSportIcon(sport: Sport): LucideIcon {
  return SPORT_ICON_MAP[sport] ?? CircleDot;
}
