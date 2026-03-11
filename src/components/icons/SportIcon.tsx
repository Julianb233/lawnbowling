import { CircleDot, type LucideIcon } from "lucide-react";

interface SportIconProps {
  sport?: string;
  className?: string;
  strokeWidth?: number;
}

export function SportIcon({ className = "w-4 h-4", strokeWidth = 1.5 }: SportIconProps) {
  return <CircleDot className={className} strokeWidth={strokeWidth} />;
}

export function getSportIcon(): LucideIcon {
  return CircleDot;
}
