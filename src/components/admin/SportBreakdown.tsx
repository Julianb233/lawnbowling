"use client";

interface SportBreakdownProps {
  breakdown: Record<string, number>;
}

export function SportBreakdown({ breakdown }: SportBreakdownProps) {
  const total = breakdown["lawn_bowling"] ?? Object.values(breakdown).reduce((a, b) => a + b, 0);

  if (total === 0) {
    return <p className="text-sm text-[#3D5A3E]">No match data yet</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex h-4 rounded-full overflow-hidden bg-[#0A2E12]/5">
        <div
          className="bg-[#1B5E20] transition-all"
          style={{ width: "100%" }}
        />
      </div>

      <div className="flex items-center gap-1.5">
        <div className="h-3 w-3 rounded-full bg-[#1B5E20]" />
        <span className="text-xs text-[#3D5A3E]">
          Lawn Bowling ({total} matches)
        </span>
      </div>
    </div>
  );
}
