"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

const SLIDES = [
  {
    sport: "Pickleball",
    tagline: "America's fastest-growing sport",
    image: "/images/sports/pickleball/hero.webp",
    color: "emerald",
  },
  {
    sport: "Tennis",
    tagline: "Classic competition, modern matching",
    image: "/images/sports/tennis/hero.webp",
    color: "amber",
  },
  {
    sport: "Lawn Bowling",
    tagline: "Relaxed play, real connections",
    image: "/images/sports/lawn-bowling/hero.webp",
    color: "blue",
  },
  {
    sport: "Badminton",
    tagline: "Fast rallies, friendly matches",
    image: "/images/sports/badminton/hero.webp",
    color: "purple",
  },
  {
    sport: "Racquetball",
    tagline: "Indoor intensity, instant partners",
    image: "/images/sports/racquetball/hero.webp",
    color: "rose",
  },
  {
    sport: "Flag Football",
    tagline: "Team up, no tackle required",
    image: "/images/sports/flag-football/hero.webp",
    color: "orange",
  },
] as const;

const AUTOPLAY_MS = 4500;

export function HeroSlideshow() {
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
      {/* Full-bleed hero with background slideshow */}
      <div className="relative min-h-[85vh] md:min-h-[90vh] flex items-center justify-center">
        {/* Background images */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={slide.image}
              alt={`${slide.sport} action shot`}
              fill
              className="object-cover"
              sizes="100vw"
              priority={index === 0}
            />
          </motion.div>
        </AnimatePresence>

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

        {/* Hero content */}
        <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 md:py-28 text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-3 py-1.5 sm:mb-8 sm:px-4">
            <span className="inline-flex h-2 w-2 rounded-full bg-[#1B5E20] animate-pulse" />
            <span className="text-xs font-medium text-white/90 sm:text-sm">
              Live at venues now
            </span>
          </div>

          {/* Headline */}
          <h1 className="max-w-4xl mx-auto text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-7xl drop-shadow-lg">
            Find Your{" "}
            <span className="text-[#1B5E20]">Perfect Partner</span>
            <br />
            Hit the Court
          </h1>

          <p className="mt-4 mx-auto max-w-2xl text-base leading-relaxed text-white/80 sm:mt-6 sm:text-lg md:text-xl drop-shadow">
            The real-time player board for recreational sports. Check in, pick a
            partner, and get matched to a court — all from your phone or the
            venue kiosk.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              href="/signup"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1B5E20] to-[#1B5E20] px-6 py-3.5 text-base font-semibold text-white shadow-2xl shadow-[#1B5E20]/25 transition-all hover:shadow-[#1B5E20]/40 hover:scale-[1.02] active:scale-[0.98] sm:w-auto sm:rounded-2xl sm:px-8 sm:py-4 sm:text-lg"
            >
              Start Playing
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm px-6 py-3.5 text-base font-semibold text-white transition-all hover:border-white/50 hover:bg-white/20 active:scale-[0.98] sm:w-auto sm:rounded-2xl sm:px-8 sm:py-4 sm:text-lg"
            >
              See How It Works
            </Link>
          </div>

          {/* Sport name cycling */}
          <div className="mt-8 sm:mt-12">
            <AnimatePresence mode="wait">
              <motion.p
                key={slide.sport}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-base font-semibold text-white/70 sm:text-xl md:text-2xl"
              >
                {slide.tagline}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Dot indicators */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {SLIDES.map((s, i) => (
              <button
                key={s.sport}
                onClick={() => setIndex(i)}
                aria-label={`Go to ${s.sport}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === index
                    ? "w-8 bg-[#1B5E20]"
                    : "w-2 bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
