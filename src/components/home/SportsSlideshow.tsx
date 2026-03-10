"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SLIDES = [
  {
    sport: "Pickleball",
    tagline: "America\u2019s fastest-growing sport",
    image: "/images/sports/pickleball/hero.webp",
  },
  {
    sport: "Tennis",
    tagline: "Classic competition, modern matching",
    image: "/images/sports/tennis/hero.webp",
  },
  {
    sport: "Lawn Bowling",
    tagline: "Relaxed play, real connections",
    image: "/images/sports/lawn-bowling/hero.webp",
  },
  {
    sport: "Badminton",
    tagline: "Fast rallies, friendly matches",
    image: "/images/sports/badminton/hero.webp",
  },
  {
    sport: "Racquetball",
    tagline: "Indoor intensity, instant partners",
    image: "/images/sports/racquetball/hero.webp",
  },
  {
    sport: "Flag Football",
    tagline: "Team up, no tackle required",
    image: "/images/sports/flag-football/hero.webp",
  },
] as const;

const AUTOPLAY_MS = 5000;
const SWIPE_THRESHOLD = 50;

const slideVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 60 : -60,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -60 : 60,
  }),
};

export function SportsSlideshow() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (next: number, dir?: number) => {
      const wrapped = ((next % SLIDES.length) + SLIDES.length) % SLIDES.length;
      setDirection(dir ?? (next > index ? 1 : -1));
      setIndex(wrapped);
    },
    [index],
  );

  const next = useCallback(() => goTo(index + 1, 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1, -1), [goTo, index]);

  // Auto-advance
  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, next]);

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  // Swipe handler
  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -SWIPE_THRESHOLD) next();
    else if (info.offset.x > SWIPE_THRESHOLD) prev();
  }

  const slide = SLIDES[index];

  return (
    <section
      className="relative w-full overflow-hidden rounded-2xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Sports slideshow"
    >
      {/* Aspect ratio container: 16:9 desktop, 4:3 mobile */}
      <div className="relative aspect-[4/3] md:aspect-[16/9]">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={index}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeInOut" }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={onDragEnd}
            className="absolute inset-0"
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${SLIDES.length}: ${slide.sport}`}
          >
            {/* Background image */}
            <Image
              src={slide.image}
              alt={`${slide.sport} action shot`}
              fill
              className="object-cover"
              sizes="100vw"
              priority={index === 0}
            />

            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

            {/* Text overlay */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 lg:p-14">
              <motion.h3
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.35 }}
                className="text-3xl font-extrabold text-white drop-shadow-lg md:text-5xl lg:text-6xl"
              >
                {slide.sport}
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.35 }}
                className="mt-2 text-base font-medium text-white/90 drop-shadow md:text-lg lg:text-xl"
              >
                {slide.tagline}
              </motion.p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        <button
          onClick={prev}
          className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 p-2 backdrop-blur-sm transition hover:bg-white/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:left-5 md:p-3"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5 text-white md:h-6 md:w-6" />
        </button>
        <button
          onClick={next}
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 p-2 backdrop-blur-sm transition hover:bg-white/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:right-5 md:p-3"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5 text-white md:h-6 md:w-6" />
        </button>

        {/* Dot indicators */}
        <div
          className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2"
          role="tablist"
          aria-label="Slide navigation"
        >
          {SLIDES.map((s, i) => (
            <button
              key={s.sport}
              onClick={() => goTo(i)}
              role="tab"
              aria-selected={i === index}
              aria-label={`Go to ${s.sport}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === index
                  ? "w-8 bg-white"
                  : "w-2 bg-zinc-500 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
