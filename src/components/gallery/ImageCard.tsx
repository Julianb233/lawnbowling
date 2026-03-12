"use client";

import Image from "next/image";
import type { GalleryImage } from "@/lib/gallery-data";

interface ImageCardProps {
  image: GalleryImage;
  onClick: () => void;
}

export function ImageCard({ image, onClick }: ImageCardProps) {
  const heightClass =
    image.aspectRatio === "portrait"
      ? "aspect-[3/4]"
      : image.aspectRatio === "square"
        ? "aspect-square"
        : "aspect-[4/3]";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-lg hover:border-[#1B5E20]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E20] break-inside-avoid mb-4"
    >
      <div className={`relative w-full ${heightClass}`}>
        <Image
          src={image.url}
          alt={image.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          unoptimized
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute inset-x-0 bottom-0 translate-y-2 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <h3 className="text-left text-sm font-bold text-white md:text-base">
            {image.title}
          </h3>
          <p className="mt-1 text-left text-xs text-white/70 line-clamp-2">
            {image.description}
          </p>
        </div>
      </div>
      {/* Category badge */}
      <div className="absolute top-3 left-3">
        <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#1B5E20] shadow-sm backdrop-blur-sm">
          {image.category}
        </span>
      </div>
    </button>
  );
}
