"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function HeroSlideshow() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Full-bleed hero */}
      <div className="relative min-h-[85vh] md:min-h-[90vh] flex items-center justify-center">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/images/sports/lawn-bowling/hero.webp"
            alt="Lawn bowling action shot"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

        {/* Hero content */}
        <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 md:py-28 text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-3 py-1.5 sm:mb-8 sm:px-4">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-white/90 sm:text-sm">
              Live at clubs now
            </span>
          </div>

          {/* Headline */}
          <h1 className="max-w-4xl mx-auto text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-7xl drop-shadow-lg">
            Find Your{" "}
            <span className="text-emerald-400">Perfect Partner</span>
            <br />
            Hit the Green
          </h1>

          <p className="mt-4 mx-auto max-w-2xl text-base leading-relaxed text-white/80 sm:mt-6 sm:text-lg md:text-xl drop-shadow">
            The digital platform for lawn bowling clubs. Tournament draws, live
            scoring, club directory, and learning resources — all in one place.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              href="/signup"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-3.5 text-base font-semibold text-white shadow-2xl shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] sm:w-auto sm:rounded-2xl sm:px-8 sm:py-4 sm:text-lg"
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

          {/* Tagline */}
          <div className="mt-8 sm:mt-12">
            <p className="text-base font-semibold text-white/70 sm:text-xl md:text-2xl">
              Relaxed play, real connections
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
