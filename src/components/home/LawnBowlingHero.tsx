"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, MapPin, CircleDot } from "lucide-react";

const SLIDES = [
  {
    headline: "Where friendships",
    accent: "roll.",
    subtitle:
      "Tournament management, live scoring, and club tools — all from the clubhouse iPad.",
    bgGradient: "from-[#0A2E12] via-[#1B5E20] to-[#2E7D32]",
    illustration: "tournament",
  },
  {
    headline: "Every club.",
    accent: "One green.",
    subtitle:
      "Browse 100+ lawn bowling clubs across the USA. Find your nearest green and start playing.",
    bgGradient: "from-[#1a3a2a] via-[#1B5E20] to-[#0A2E12]",
    illustration: "directory",
  },
  {
    headline: "Check in.",
    accent: "Bowl out.",
    subtitle:
      "QR code check-in, automatic draw generation, and live scoring. No paper, no headaches.",
    bgGradient: "from-[#0A2E12] via-[#1a4a2a] to-[#1B5E20]",
    illustration: "checkin",
  },
] as const;

const AUTOPLAY_MS = 5000;

function BowlIllustration({ type }: { type: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-[0.12]">
      {/* Scattered lawn bowls */}
      {type === "tournament" && (
        <>
          <div className="absolute right-[10%] top-[15%] h-28 w-28 rounded-full border-[6px] border-white sm:h-40 sm:w-40 sm:border-8" />
          <div className="absolute right-[10%] top-[15%] h-28 w-28 sm:h-40 sm:w-40">
            <div className="absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white sm:h-4 sm:w-4" />
          </div>
          <div className="absolute bottom-[20%] right-[25%] h-20 w-20 rounded-full border-[5px] border-white sm:h-28 sm:w-28 sm:border-[6px]" />
          <div className="absolute bottom-[20%] right-[25%] h-20 w-20 sm:h-28 sm:w-28">
            <div className="absolute right-1.5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-white sm:h-3 sm:w-3" />
          </div>
          <div className="absolute right-[5%] bottom-[10%] h-5 w-5 rounded-full bg-white sm:h-7 sm:w-7" />
          {/* Rink lines */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-white/30" />
          <div className="absolute bottom-[30%] left-[5%] right-[60%] h-px bg-white/20" />
        </>
      )}
      {type === "directory" && (
        <>
          {/* Map pin patterns */}
          <div className="absolute right-[8%] top-[12%] h-32 w-32 sm:h-44 sm:w-44">
            <div className="h-full w-full rounded-full border-[6px] border-white/60 sm:border-8" style={{ borderStyle: "dashed" }} />
          </div>
          <div className="absolute right-[20%] top-[20%] flex flex-col items-center">
            <div className="h-8 w-8 rounded-full border-4 border-white bg-white/20 sm:h-10 sm:w-10" />
            <div className="h-4 w-1 bg-white sm:h-5" />
          </div>
          <div className="absolute bottom-[25%] right-[12%] flex flex-col items-center">
            <div className="h-6 w-6 rounded-full border-3 border-white bg-white/20 sm:h-8 sm:w-8" />
            <div className="h-3 w-0.5 bg-white sm:h-4" />
          </div>
          <div className="absolute right-[35%] top-[40%] flex flex-col items-center">
            <div className="h-5 w-5 rounded-full border-2 border-white bg-white/20 sm:h-7 sm:w-7" />
            <div className="h-2.5 w-0.5 bg-white sm:h-3" />
          </div>
        </>
      )}
      {type === "checkin" && (
        <>
          {/* QR code pattern */}
          <div className="absolute right-[8%] top-[12%] grid grid-cols-5 gap-1.5 sm:gap-2">
            {Array.from({ length: 25 }).map((_, i) => (
              <div
                key={i}
                className={`h-4 w-4 rounded-sm sm:h-6 sm:w-6 ${
                  [0, 1, 2, 4, 5, 6, 10, 12, 14, 15, 16, 18, 19, 20, 22, 23, 24].includes(i)
                    ? "bg-white"
                    : "bg-transparent"
                }`}
              />
            ))}
          </div>
          {/* Clipboard */}
          <div className="absolute bottom-[15%] right-[20%] h-28 w-20 rounded-lg border-4 border-white sm:h-36 sm:w-24">
            <div className="mx-auto -mt-2 h-3 w-10 rounded-b-md bg-white sm:w-12" />
            <div className="mt-4 space-y-2 px-2 sm:mt-6 sm:px-3">
              <div className="h-1.5 w-full rounded bg-white/60" />
              <div className="h-1.5 w-3/4 rounded bg-white/40" />
              <div className="h-1.5 w-full rounded bg-white/60" />
              <div className="h-1.5 w-1/2 rounded bg-white/40" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function LawnBowlingHero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(() => {
    setIndex((prev) => (prev + 1) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, next]);

  const slide = SLIDES[index];

  return (
    <section
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative min-h-[75vh] sm:min-h-[80vh] flex items-center">
        {/* Animated gradient background */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className={`absolute inset-0 bg-gradient-to-br ${slide.bgGradient}`}
          >
            <BowlIllustration type={slide.illustration} />
            {/* Subtle texture overlay */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)",
                backgroundSize: "48px 48px",
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Content */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#A8D5BA] sm:mb-4 sm:text-base"
            >
              The #1 Lawn Bowling Platform
            </motion.p>

            <AnimatePresence mode="wait">
              <motion.div
                key={slide.headline}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <h1
                  className="text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {slide.headline}{" "}
                  <span className="italic text-[#A8D5BA]">{slide.accent}</span>
                </h1>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-white/75 sm:mt-6 sm:text-lg md:text-xl">
                  {slide.subtitle}
                </p>
              </motion.div>
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-4"
            >
              <Link
                href="/signup"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-base font-semibold text-[#1B5E20] shadow-2xl transition-all hover:bg-[#F0FFF4] hover:shadow-3xl active:scale-[0.97]"
              >
                Start Free{" "}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/clubs"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/30 px-7 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-white/60 hover:bg-white/10 active:scale-[0.97]"
              >
                <MapPin className="h-4 w-4" /> Find a Club
              </Link>
            </motion.div>
          </div>

          {/* Dot indicators */}
          <div className="mt-12 flex items-center gap-2.5 sm:mt-16">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === index
                    ? "w-10 bg-[#A8D5BA]"
                    : "w-2 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
