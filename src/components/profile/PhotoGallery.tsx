"use client";

import { useState, useRef } from "react";
import { Plus, X, ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import type { PlayerPhoto } from "@/lib/db/gallery";

interface PhotoGalleryProps {
  photos: PlayerPhoto[];
  editable?: boolean;
  onPhotosChange?: () => void;
}

export function PhotoGallery({ photos, editable = false, onPhotosChange }: PhotoGalleryProps) {
  const [uploading, setUploading] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<PlayerPhoto | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/profile/gallery", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      onPhotosChange?.();
    } catch (error) {
      console.error("Photo upload error:", error);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDelete(photoId: string) {
    try {
      const res = await fetch(`/api/profile/gallery?id=${photoId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");
      setLightboxPhoto(null);
      onPhotosChange?.();
    } catch (error) {
      console.error("Photo delete error:", error);
    }
  }

  if (photos.length === 0 && !editable) return null;

  return (
    <div>
      <h2 className="mb-3 text-sm font-medium text-zinc-600">Photos</h2>

      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo) => (
          <button
            key={photo.id}
            onClick={() => setLightboxPhoto(photo)}
            className="group relative aspect-square overflow-hidden rounded-lg bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#1B5E20] focus:ring-offset-2"
          >
            <Image
              src={photo.url}
              alt={photo.caption || "Gallery photo"}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 448px) 33vw, 140px"
            />
          </button>
        ))}

        {editable && photos.length < 12 && (
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 text-zinc-400 transition-colors hover:border-[#1B5E20] hover:text-[#1B5E20] min-h-[44px]"
          >
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Plus className="h-6 w-6" />
            )}
          </button>
        )}
      </div>

      {editable && (
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
      )}

      {/* Lightbox */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <div
            className="relative max-h-[80vh] max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-zinc-900">
              <Image
                src={lightboxPhoto.url}
                alt={lightboxPhoto.caption || "Gallery photo"}
                fill
                className="object-contain"
                sizes="(max-width: 512px) 100vw, 512px"
              />
            </div>

            {lightboxPhoto.caption && (
              <p className="mt-3 text-center text-sm text-white/80">
                {lightboxPhoto.caption}
              </p>
            )}

            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-zinc-900 shadow-lg hover:bg-zinc-100 min-h-[44px] min-w-[44px]"
            >
              <X className="h-4 w-4" />
            </button>

            {editable && (
              <button
                onClick={() => handleDelete(lightboxPhoto.id)}
                className="mt-3 w-full rounded-lg border border-red-400/30 px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 min-h-[44px]"
              >
                Delete Photo
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function PhotoGalleryReadonly({ photos }: { photos: PlayerPhoto[] }) {
  return <PhotoGallery photos={photos} editable={false} />;
}
