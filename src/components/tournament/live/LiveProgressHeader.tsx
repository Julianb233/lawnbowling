"use client";

interface LiveProgressHeaderProps {
  completed: number;
  total: number;
  progress: number; // 0-1
}

export function LiveProgressHeader({ completed, total, progress }: LiveProgressHeaderProps) {
  const pct = Math.round(progress * 100);

  return (
    <div className="flex items-center gap-[clamp(0.5rem,1vw,1rem)]">
      <div className="w-[clamp(4rem,8vw,8rem)]">
        <div className="flex items-center justify-between mb-0.5">
          <span
            className="font-semibold text-emerald-400 tabular-nums"
            style={{ fontSize: "clamp(0.5rem, 0.8vw, 0.7rem)" }}
          >
            {completed}/{total}
          </span>
          <span
            className="text-[#3D5A3E] tabular-nums"
            style={{ fontSize: "clamp(0.5rem, 0.8vw, 0.7rem)" }}
          >
            {pct}%
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
