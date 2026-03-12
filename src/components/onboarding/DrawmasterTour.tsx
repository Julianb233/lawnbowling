"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useOnboarding } from "@/hooks/useOnboarding";
import { usePathname } from "next/navigation";

interface TourStep {
  target: string; // data-onboarding-target value
  title: string;
  description: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    target: "create-tournament",
    title: "Create a Tournament",
    description: "Start here to set up a new tournament day. Give it a name and choose your date.",
  },
  {
    target: "configure-format",
    title: "Configure Format",
    description: "Choose your game format (fours, triples, pairs, singles), number of rounds, and scoring rules.",
  },
  {
    target: "add-players",
    title: "Add Players",
    description: "Players check in on their phones, or you can add them manually from the roster.",
  },
  {
    target: "generate-draw",
    title: "Generate the Draw",
    description: "Once players are checked in, generate the draw to assign teams and rinks automatically.",
  },
  {
    target: "publish-scores",
    title: "Publish & Score",
    description: "Publish the draw so players can see their rink assignments, then enter scores as ends are completed.",
  },
];

const SESSION_KEY = "drawmaster_tour_step";

export function DrawmasterTour() {
  const { shouldShow, markComplete, dismiss, loading } = useOnboarding("drawmaster");
  const pathname = usePathname();
  const [currentStep, setCurrentStep] = useState(0);
  const [active, setActive] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number; placement: "top" | "bottom" | "left" | "right" }>({
    top: 0,
    left: 0,
    placement: "bottom",
  });
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Check if on a drawmaster route (bowls pages, tournament pages)
  const isDrawmasterRoute =
    pathname?.startsWith("/bowls") || pathname?.startsWith("/tournament");

  // Resume from session if mid-tour
  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved !== null) {
      setCurrentStep(parseInt(saved, 10));
    }
  }, []);

  useEffect(() => {
    if (shouldShow && isDrawmasterRoute && !loading) {
      setActive(true);
    }
  }, [shouldShow, isDrawmasterRoute, loading]);

  // Position tooltip relative to target element
  const positionTooltip = useCallback(() => {
    const step = TOUR_STEPS[currentStep];
    if (!step) return;

    const target = document.querySelector(`[data-onboarding-target="${step.target}"]`);
    if (!target) return;

    const rect = target.getBoundingClientRect();
    setTargetRect(rect);

    const tooltipWidth = 320;
    const tooltipHeight = 160;
    const gap = 12;

    // Determine best placement
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const spaceRight = window.innerWidth - rect.right;
    const spaceLeft = rect.left;

    let placement: "top" | "bottom" | "left" | "right" = "bottom";
    let top = 0;
    let left = 0;

    if (spaceBelow >= tooltipHeight + gap) {
      placement = "bottom";
      top = rect.bottom + gap;
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
    } else if (spaceAbove >= tooltipHeight + gap) {
      placement = "top";
      top = rect.top - tooltipHeight - gap;
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
    } else if (spaceRight >= tooltipWidth + gap) {
      placement = "right";
      top = rect.top + rect.height / 2 - tooltipHeight / 2;
      left = rect.right + gap;
    } else if (spaceLeft >= tooltipWidth + gap) {
      placement = "left";
      top = rect.top + rect.height / 2 - tooltipHeight / 2;
      left = rect.left - tooltipWidth - gap;
    } else {
      // Fallback: center
      top = window.innerHeight / 2 - tooltipHeight / 2;
      left = window.innerWidth / 2 - tooltipWidth / 2;
    }

    // Clamp to viewport
    left = Math.max(8, Math.min(left, window.innerWidth - tooltipWidth - 8));
    top = Math.max(8, Math.min(top, window.innerHeight - tooltipHeight - 8));

    setTooltipPos({ top, left, placement });
  }, [currentStep]);

  useEffect(() => {
    if (!active) return;
    positionTooltip();
    window.addEventListener("resize", positionTooltip);
    window.addEventListener("scroll", positionTooltip, true);
    return () => {
      window.removeEventListener("resize", positionTooltip);
      window.removeEventListener("scroll", positionTooltip, true);
    };
  }, [active, positionTooltip]);

  function handleNext() {
    if (currentStep >= TOUR_STEPS.length - 1) {
      handleDone();
      return;
    }
    const next = currentStep + 1;
    setCurrentStep(next);
    sessionStorage.setItem(SESSION_KEY, String(next));
  }

  function handleDone() {
    setActive(false);
    sessionStorage.removeItem(SESSION_KEY);
    markComplete();
  }

  function handleDismiss() {
    setActive(false);
    sessionStorage.removeItem(SESSION_KEY);
    dismiss();
  }

  if (loading || !active) return null;

  const step = TOUR_STEPS[currentStep];
  const isLast = currentStep === TOUR_STEPS.length - 1;

  // Build clip-path for spotlight cutout
  const clipPath = targetRect
    ? `polygon(
        0% 0%, 0% 100%, 
        ${targetRect.left - 4}px 100%, 
        ${targetRect.left - 4}px ${targetRect.top - 4}px, 
        ${targetRect.right + 4}px ${targetRect.top - 4}px, 
        ${targetRect.right + 4}px ${targetRect.bottom + 4}px, 
        ${targetRect.left - 4}px ${targetRect.bottom + 4}px, 
        ${targetRect.left - 4}px 100%, 
        100% 100%, 100% 0%
      )`
    : undefined;

  return createPortal(
    <div className="fixed inset-0 z-[250]">
      {/* Overlay with cutout */}
      <div
        className="absolute inset-0 bg-black/50 transition-all duration-300"
        style={{ clipPath }}
        onClick={handleDismiss}
      />

      {/* Spotlight glow ring */}
      {targetRect && (
        <div
          className="absolute border-2 border-green-400 rounded-lg pointer-events-none shadow-[0_0_20px_rgba(34,197,94,0.4)]"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        role="tooltip"
        className="absolute z-[251] w-80 rounded-2xl bg-[#0A2E12] border border-white/10 p-5 shadow-2xl"
        style={{ top: tooltipPos.top, left: tooltipPos.left }}
      >
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs font-medium text-green-400">
            Step {currentStep + 1} of {TOUR_STEPS.length}
          </span>
          <button
            onClick={handleDismiss}
            className="text-[#3D5A3E] hover:text-[#3D5A3E] -mt-1 -mr-1 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Dismiss tour"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <h3 className="text-base font-bold text-white mb-1.5">{step.title}</h3>
        <p className="text-sm text-[#3D5A3E] leading-relaxed mb-4">{step.description}</p>
        <button
          onClick={handleNext}
          className="w-full rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-500 transition-colors min-h-[44px]"
        >
          {isLast ? "Done" : "Next"}
        </button>
      </div>
    </div>,
    document.body
  );
}
