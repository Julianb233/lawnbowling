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
                    !isComplete && !isCurrent && "bg-[#0A2E12]/5 text-[#3D5A3E]"
                  )}
                >
                  {isComplete ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium whitespace-nowrap",
                    isCurrent ? "text-[#0A2E12]" : isComplete ? "text-[#3D5A3E]" : "text-[#3D5A3E]"
                  )}
                >
                  {step}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-px flex-1 min-w-4",
                    i < currentIndex ? "bg-[#1B5E20]" : "bg-[#0A2E12]/5"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: compact "Step N of M" */}
      <div className="flex sm:hidden items-center justify-between">
        <span className="text-sm font-semibold text-[#0A2E12]">
          Step {currentIndex + 1} of {steps.length}
        </span>
        <span className="text-sm font-medium text-[#3D5A3E]">
          {steps[currentIndex]}
        </span>
      </div>
    </>
  );
}
