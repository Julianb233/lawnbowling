"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface WizardStepRailProps {
  steps: string[];
  currentIndex: number;
}

export function WizardStepRail({ steps, currentIndex }: WizardStepRailProps) {
  return (
    <>
      {/* Desktop: full horizontal rail */}
      <div className="hidden sm:flex items-center gap-1">
        {steps.map((step, i) => {
          const isComplete = i < currentIndex;
          const isCurrent = i === currentIndex;

          return (
            <div key={step} className="flex items-center gap-1 flex-1 last:flex-initial">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                    isComplete && "bg-[#1B5E20] text-white",
                    isCurrent && "bg-[#1B5E20] text-white ring-4 ring-[#1B5E20]/20",
                    !isComplete && !isCurrent && "bg-zinc-100 text-zinc-400"
                  )}
                >
                  {isComplete ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium whitespace-nowrap",
                    isCurrent ? "text-zinc-900" : isComplete ? "text-zinc-600 dark:text-zinc-400" : "text-zinc-400"
                  )}
                >
                  {step}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-px flex-1 min-w-4",
                    i < currentIndex ? "bg-[#1B5E20]" : "bg-zinc-200"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: compact "Step N of M" */}
      <div className="flex sm:hidden items-center justify-between">
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Step {currentIndex + 1} of {steps.length}
        </span>
        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {steps[currentIndex]}
        </span>
      </div>
    </>
  );
}
