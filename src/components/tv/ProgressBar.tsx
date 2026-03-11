"use client";

interface ProgressBarProps {
  progress: number; // 0-1
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="h-1 w-full bg-white/5">
      <div
        className="h-full bg-emerald-500 transition-[width] duration-100 ease-linear"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}
