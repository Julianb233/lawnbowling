"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, X } from "lucide-react";
import { OnboardingStep } from "./OnboardingStep";

const STEPS = [
  {
    icon: "\u{1F3D3}",
    title: "Welcome to Pick a Partner!",
    description: "The easiest way to find your perfect sports partner at any venue. Let's show you around.",
    color: "text-green-400",
  },
  {
    icon: "\u{1F4F2}",
    title: "Check In",
    description: "When you arrive at a venue, tap the check-in button to let others know you're available to play.",
    color: "text-blue-400",
  },
  {
    icon: "\u{1F91D}",
    title: "Pick a Partner",
    description: "Browse available players and tap their card to send a partner request. They'll get an instant notification!",
    color: "text-amber-400",
  },
  {
    icon: "\u{1F3AF}",
    title: "Get Matched",
    description: "Once your request is accepted, you'll be matched and assigned to an available court automatically.",
    color: "text-purple-400",
  },
  {
    icon: "\u{1F3C6}",
    title: "Play & Track Stats!",
    description: "Play your match, report scores, and climb the leaderboard. Your stats and ELO rating update automatically!",
    color: "text-green-400",
  },
];

interface OnboardingWizardProps {
  onComplete: () => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);

  function handleComplete() {
    localStorage.setItem("onboarding_complete", "true");
    onComplete();
  }

  const isLast = step === STEPS.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex flex-col bg-white"
    >
      {/* Skip button */}
      <div className="flex justify-end p-4">
        <button
          onClick={handleComplete}
          className="flex items-center gap-1 rounded-full px-4 py-2 text-sm text-zinc-500 hover:text-zinc-600 min-h-[44px]"
        >
          Skip <X className="h-4 w-4" />
        </button>
      </div>

      {/* Step content */}
      <div className="flex flex-1 items-center justify-center">
        <AnimatePresence mode="wait">
          <OnboardingStep key={step} {...STEPS[step]} />
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="p-6 pb-12">
        {/* Progress dots */}
        <div className="mb-6 flex justify-center gap-2">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`h-2 rounded-full transition-all ${
                i === step ? "w-8 bg-green-500" : "w-2 bg-zinc-700"
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="flex items-center gap-1 rounded-xl px-6 py-3 text-sm font-medium text-zinc-400 hover:text-zinc-700 disabled:invisible min-h-[48px]"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>

          <button
            onClick={() => isLast ? handleComplete() : setStep(step + 1)}
            className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-3 text-sm font-bold text-white hover:shadow-lg hover:shadow-green-500/25 min-h-[48px]"
          >
            {isLast ? "Get Started" : "Next"} <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
