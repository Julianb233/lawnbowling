"use client";

import Image from "next/image";

export function SportsSlideshow() {
  return (
    <section
      className="relative w-full overflow-hidden rounded-2xl"
      aria-label="Lawn bowling hero"
    >
      {/* Aspect ratio container: 16:9 desktop, 4:3 mobile */}
      <div className="relative aspect-[4/3] md:aspect-[16/9]">
        <div className="absolute inset-0">
          {/* Background image */}
          <Image
            src="/images/sports/lawn-bowling/hero.webp"
            alt="Lawn bowling action shot"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />

          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

          {/* Text overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 lg:p-14">
            <h3 className="text-3xl font-extrabold text-white drop-shadow-lg md:text-5xl lg:text-6xl">
              Lawn Bowling
            </h3>
            <p className="mt-2 text-base font-medium text-white/90 drop-shadow md:text-lg lg:text-xl">
              Relaxed play, real connections
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
