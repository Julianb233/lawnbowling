"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronRight, ChevronLeft, X } from "lucide-react";
import { useOnboarding } from "@/hooks/useOnboarding";
import { usePathname } from "next/navigation";

// Inline SVG illustrations for each screen
function WelcomeIllustration() {
  return (
    <svg viewBox="0 0 200 200" className="h-40 w-40" aria-hidden="true">
      <circle cx="100" cy="100" r="90" fill="none" stroke="#22c55e" strokeWidth="2" opacity="0.3" />
      <circle cx="100" cy="100" r="70" fill="none" stroke="#22c55e" strokeWidth="2" opacity="0.2" />
      {/* Bowl */}
      <circle cx="100" cy="95" r="35" fill="#1B5E20" />
      <circle cx="100" cy="95" r="32" fill="none" stroke="#22c55e" strokeWidth="1.5" />
      {/* Bias mark */}
      <circle cx="112" cy="88" r="5" fill="#fbbf24" opacity="0.9" />
      {/* Jack */}
      <circle cx="100" cy="155" r="8" fill="#fff" opacity="0.9" />
      <circle cx="100" cy="155" r="6" fill="none" stroke="#d4d4d8" strokeWidth="1" />
    </svg>
  );
}

function CheckInIllustration() {
  return (
    <svg viewBox="0 0 200 200" className="h-40 w-40" aria-hidden="true">
      {/* Phone outline */}
      <rect x="55" y="20" width="90" height="160" rx="16" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
      <rect x="62" y="35" width="76" height="125" rx="4" fill="#09090b" />
      {/* Check-in button on phone */}
      <rect x="72" y="75" width="56" height="28" rx="8" fill="#22c55e" />
      <text x="100" y="93" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">Check In</text>
      {/* Status indicator */}
      <circle cx="100" cy="55" r="4" fill="#22c55e" />
      <text x="100" y="125" textAnchor="middle" fill="#71717a" fontSize="8">Available to play</text>
      {/* Home indicator */}
      <rect x="67" y="155" width="66" height="4" rx="2" fill="#3f3f46" />
    </svg>
  );
}

function ScoresIllustration() {
  return (
    <svg viewBox="0 0 200 200" className="h-40 w-40" aria-hidden="true">
      {/* Scoreboard background */}
      <rect x="20" y="30" width="160" height="140" rx="12" fill="#18181b" stroke="#3f3f46" strokeWidth="1.5" />
      {/* Header */}
      <rect x="20" y="30" width="160" height="30" rx="12" fill="#1B5E20" />
      <text x="100" y="50" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">RINK 1</text>
      {/* Team A */}
      <text x="50" y="82" textAnchor="middle" fill="#22c55e" fontSize="9" fontWeight="bold">Team A</text>
      <text x="50" y="110" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">12</text>
      {/* VS */}
      <text x="100" y="100" textAnchor="middle" fill="#52525b" fontSize="10" fontWeight="bold">vs</text>
      {/* Team B */}
      <text x="150" y="82" textAnchor="middle" fill="#3b82f6" fontSize="9" fontWeight="bold">Team B</text>
      <text x="150" y="110" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">9</text>
      {/* End scores */}
      {[1, 2, 3, 4, 5].map((end, i) => (
        <g key={end}>
          <rect x={35 + i * 28} y="130" width="22" height="28" rx="4" fill="#27272a" />
          <text x={46 + i * 28} y="141" textAnchor="middle" fill="#71717a" fontSize="7">{end}</text>
          <text x={46 + i * 28} y="154" textAnchor="middle" fill="#a1a1aa" fontSize="9">
            {[3, 2, 4, 1, 2][i]}
          </text>
        </g>
      ))}
    </svg>
  );
}

interface OnboardingScreen {
  title: string;
  description: string;
  illustration: React.FC;
}

const SCREENS: OnboardingScreen[] = [
  {
    title: "Welcome to Lawnbowling!",
    description: "Your complete companion for tournament days. Check in, find your rink, and follow live scores all from your phone.",
    illustration: WelcomeIllustration,
  },
  {
    title: "Check In at the Club",
    description: "When you arrive, tap Check In to register for the tournament. The drawmaster will see you're ready to play.",
    illustration: CheckInIllustration,
  },
  {
    title: "Find Your Rink & Track Scores",
    description: "See your rink assignment after the draw, then follow live end-by-end scores as they happen. No more walking to the board!",
    illustration: ScoresIllustration,
  },
];

export function PlayerOnboarding() {
  const { shouldShow, markComplete, dismiss, loading } = useOnboarding("player");
  const pathname = usePathname();
  const [currentScreen, setCurrentScreen] = useState(0);
  const [visible, setVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);

  // Only show on bowls routes
  const isBowlsRoute = pathname?.startsWith("/bowls");

  useEffect(() => {
    if (shouldShow && isBowlsRoute) {
      setVisible(true);
    }
  }, [shouldShow, isBowlsRoute]);

  // Focus trap
  useEffect(() => {
    if (visible && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [visible]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleDismiss();
    } else if (e.key === "ArrowRight" || e.key === "Tab") {
      if (currentScreen < SCREENS.length - 1) {
        e.preventDefault();
        setCurrentScreen((s) => s + 1);
      }
    } else if (e.key === "ArrowLeft") {
      if (currentScreen > 0) {
        setCurrentScreen((s) => s - 1);
      }
    }
  }, [currentScreen]);

  function handleDismiss() {
    setVisible(false);
    dismiss();
  }

  function handleComplete() {
    setVisible(false);
    markComplete();
  }

  function handleNext() {
    if (currentScreen === SCREENS.length - 1) {
      handleComplete();
    } else {
      setCurrentScreen((s) => s + 1);
    }
  }

  function handleBack() {
    if (currentScreen > 0) {
      setCurrentScreen((s) => s - 1);
    }
  }

  if (loading || !visible) return null;

  const screen = SCREENS[currentScreen];
  const Illustration = screen.illustration;
  const isLast = currentScreen === SCREENS.length - 1;

  const slideVariants = prefersReducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { opacity: 0, x: 80 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -80 },
      };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-labelledby="player-onboarding-title"
          aria-modal="true"
          ref={dialogRef}
          tabIndex={-1}
          onKeyDown={handleKeyDown}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="relative mx-4 w-full max-w-md rounded-3xl bg-zinc-950 border border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Skip button */}
            <button
              onClick={handleDismiss}
              className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-full px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors min-h-[44px]"
              aria-label="Skip onboarding"
            >
              Skip <X className="h-3.5 w-3.5" />
            </button>

            {/* Content */}
            <div className="px-8 pt-14 pb-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentScreen}
                  variants={slideVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="mb-6">
                    <Illustration />
                  </div>
                  <h2
                    id="player-onboarding-title"
                    className="mb-3 text-2xl font-black text-white"
                  >
                    {screen.title}
                  </h2>
                  <p className="max-w-sm text-base text-zinc-400 leading-relaxed">
                    {screen.description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="px-8 pb-8">
              {/* Dot indicator */}
              <div className="mb-6 flex justify-center gap-2">
                {SCREENS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentScreen(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === currentScreen ? "w-8 bg-green-500" : "w-2 bg-zinc-700"
                    }`}
                    aria-label={`Go to screen ${i + 1}`}
                  />
                ))}
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={handleBack}
                  disabled={currentScreen === 0}
                  className="flex items-center gap-1 rounded-xl px-5 py-3 text-sm font-medium text-zinc-400 hover:text-white disabled:invisible transition-colors min-h-[48px]"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>

                <button
                  onClick={handleNext}
                  className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-green-500 to-emerald-700 px-8 py-3 text-sm font-bold text-white hover:shadow-lg hover:shadow-green-500/25 transition-all min-h-[48px]"
                >
                  {isLast ? "Let's Go!" : "Next"} <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
