"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export type SlideType = "scores" | "standings" | "draw" | "announcements";

interface UseCarouselOptions {
  /** Available slide types in rotation order */
  slides: SlideType[];
  /** Seconds per slide (default 12) */
  interval: number;
  /** Lock to a single slide type */
  lockedSlide?: SlideType | null;
}

interface CarouselState {
  currentSlide: SlideType;
  slideIndex: number;
  progress: number; // 0-1 fraction of interval elapsed
  isPaused: boolean;
  goToSlide: (index: number) => void;
}

export function useCarousel({
  slides,
  interval,
  lockedSlide,
}: UseCarouselOptions): CarouselState {
  const [slideIndex, setSlideIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const startTimeRef = useRef(Date.now());
  const rafRef = useRef<number>(0);
  const intervalMs = interval * 1000;

  // If locked to a single slide, just return that
  const effectiveSlides = lockedSlide ? [lockedSlide] : slides;
  const currentSlide = effectiveSlides[slideIndex % effectiveSlides.length];

  const advance = useCallback(() => {
    if (effectiveSlides.length <= 1) return;
    setSlideIndex((prev) => (prev + 1) % effectiveSlides.length);
    startTimeRef.current = Date.now();
    setProgress(0);
  }, [effectiveSlides.length]);

  const goToSlide = useCallback((index: number) => {
    setSlideIndex(index);
    startTimeRef.current = Date.now();
    setProgress(0);
  }, []);

  // Page Visibility API - pause when tab is hidden
  useEffect(() => {
    function handleVisibility() {
      if (document.hidden) {
        setIsPaused(true);
      } else {
        setIsPaused(false);
        startTimeRef.current = Date.now();
        setProgress(0);
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Animation loop for progress + auto-advance
  useEffect(() => {
    if (isPaused || effectiveSlides.length <= 1) return;

    function tick() {
      const elapsed = Date.now() - startTimeRef.current;
      const frac = Math.min(elapsed / intervalMs, 1);
      setProgress(frac);

      if (frac >= 1) {
        advance();
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPaused, intervalMs, advance, effectiveSlides.length, slideIndex]);

  return {
    currentSlide,
    slideIndex,
    progress,
    isPaused,
    goToSlide,
  };
}
