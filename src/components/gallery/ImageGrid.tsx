"use client";

import type { GalleryImage } from "@/lib/gallery-data";
import { ImageCard } from "./ImageCard";

interface ImageGridProps {
  images: GalleryImage[];
  onImageClick: (index: number) => void;
}

export function ImageGrid({ images, onImageClick }: ImageGridProps) {
  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
          <span className="text-2xl">🎨</span>
        </div>
        <h3 className="mt-4 text-lg font-bold text-zinc-900">
          No images found
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Try selecting a different category.
        </p>
      </div>
    );
  }

  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
      {images.map((image, index) => (
        <ImageCard
          key={image.id}
          image={image}
          onClick={() => onImageClick(index)}
        />
      ))}
    </div>
  );
}
