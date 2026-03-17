"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Camera, Users, ChevronRight, ImageIcon } from "lucide-react";
import { galleryImages, galleryCategories, type GalleryCategory } from "@/lib/gallery-data";
import { ImageGrid } from "@/components/gallery/ImageGrid";
import { ImageLightbox } from "@/components/gallery/ImageLightbox";
import { CommunityGallery } from "@/components/gallery/CommunityGallery";
import { PublicNav } from "@/components/PublicNav";

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<GalleryCategory | "All">(
    "All",
  );
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredImages =
    activeCategory === "All"
      ? galleryImages
      : galleryImages.filter((img) => img.category === activeCategory);

  const handleImageClick = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

  const handlePrev = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null ? (prev === 0 ? filteredImages.length - 1 : prev - 1) : null,
    );
  }, [filteredImages.length]);

  const handleNext = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null ? (prev === filteredImages.length - 1 ? 0 : prev + 1) : null,
    );
  }, [filteredImages.length]);

  const handleClose = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  return (
    <div className="min-h-screen bg-[#FEFCF9]">
      {/* Navigation */}

      <PublicNav />

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pt-20 pb-12 md:pt-28 md:pb-16">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#1B5E20]/20 bg-[#1B5E20]/10 px-4 py-1.5">
            <Camera className="h-4 w-4 text-[#1B5E20]" />
            <span className="text-sm font-medium text-[#1B5E20]">Gallery</span>
          </div>
          <h1 className="max-w-4xl text-5xl font-extrabold leading-[1.1] tracking-tight text-zinc-900 md:text-7xl">
            Lawn Bowling{" "}
            <span className="text-[#1B5E20]">Gallery</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 md:text-xl">
            Art, photography, and imagery celebrating the sport. From action
            shots on the green to vintage heritage and original artwork.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="flex items-center gap-1.5 text-sm font-medium text-zinc-500">
            <ImageIcon className="h-4 w-4" />
            Filter:
          </span>
          <button
            type="button"
            onClick={() => setActiveCategory("All")}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              activeCategory === "All"
                ? "border-[#1B5E20] bg-[#1B5E20]/10 text-[#1B5E20]"
                : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-[#1B5E20]/30 hover:bg-[#1B5E20]/5 hover:text-[#1B5E20]"
            }`}
          >
            All ({galleryImages.length})
          </button>
          {galleryCategories.map((category) => {
            const count = galleryImages.filter(
              (img) => img.category === category,
            ).length;
            return (
              <button
                type="button"
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                  activeCategory === category
                    ? "border-[#1B5E20] bg-[#1B5E20]/10 text-[#1B5E20]"
                    : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-[#1B5E20]/30 hover:bg-[#1B5E20]/5 hover:text-[#1B5E20]"
                }`}
              >
                {category} ({count})
              </button>
            );
          })}
        </div>
      </section>

      {/* Image Grid */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <ImageGrid images={filteredImages} onImageClick={handleImageClick} />
      </section>

      {/* Community Submissions */}
      <CommunityGallery isAuthenticated={false} />

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-3xl bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] p-8 text-center shadow-2xl shadow-green-900/15 md:p-16">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Inspired to Play?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-green-100/80">
            Find a lawn bowling club near you and experience the sport that has
            captivated players for centuries.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/clubs"
              className="group inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-semibold text-[#1B5E20] shadow-lg transition hover:bg-zinc-100 active:scale-[0.98]"
            >
              Find a Club
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/signup"
              className="rounded-2xl border-2 border-white/30 px-8 py-4 text-lg font-semibold text-white transition hover:border-white/60 hover:bg-white/10 active:scale-[0.98]"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#0A2E12]/10 bg-[#0A2E12]/[0.03]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#1B5E20] to-[#2E7D32]">
              <Users className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-[#0A2E12]">Lawnbowling</span>
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[#3D5A3E]">
            <Link href="/learn" className="transition hover:text-[#1B5E20]">
              Learning Hub
            </Link>
            <Link href="/blog" className="transition hover:text-[#1B5E20]">
              Blog
            </Link>
            <Link href="/gallery" className="transition hover:text-[#1B5E20]">
              Gallery
            </Link>
            <Link href="/clubs" className="transition hover:text-[#1B5E20]">
              Find a Club
            </Link>
          </div>
          <span className="text-sm text-[#3D5A3E]">
            &copy; {new Date().getFullYear()} Lawnbowling
          </span>
        </div>
      </footer>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <ImageLightbox
          images={filteredImages}
          currentIndex={lightboxIndex}
          onClose={handleClose}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}
    </div>
  );
}
