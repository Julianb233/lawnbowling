"use client";

interface GuestPlayerBadgeProps {
  className?: string;
}

export function GuestPlayerBadge({ className = "" }: GuestPlayerBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-dashed border-amber-400 bg-amber-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-700 ${className}`}
    >
      Guest
    </span>
  );
}
