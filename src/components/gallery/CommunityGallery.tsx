"use client";

import { useState, useEffect } from "react";
import { Camera, Plus, Heart } from "lucide-react";
import { SubmitPhotoForm } from "./SubmitPhotoForm";
import Link from "next/link";

interface CommunityPhoto {
  id: string;
  title: string;
  description: string | null;
  category: string;
  image_url: string;
  created_at: string;
  player?: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
}

interface CommunityGalleryProps {
  isAuthenticated: boolean;
}

export function CommunityGallery({ isAuthenticated }: CommunityGalleryProps) {
  const [photos, setPhotos] = useState<CommunityPhoto[]>([]);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [loading, setLoading] = useState(true);

  async function fetchPhotos() {
    try {
      const res = await fetch("/api/gallery");
      if (res.ok) {
        const data = await res.json();
        setPhotos(data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPhotos();
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-6 pb-20">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 md:text-3xl">
            Community Submissions
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Photos shared by lawn bowling enthusiasts
          </p>
        </div>
        {isAuthenticated && (
          <button
            onClick={() => setShowSubmitForm(!showSubmitForm)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1B5E20] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2E7D32] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Submit Photo
          </button>
        )}
      </div>

      {showSubmitForm && (
        <div className="mb-8 max-w-lg mx-auto">
          <SubmitPhotoForm
            onClose={() => setShowSubmitForm(false)}
            onSubmitted={fetchPhotos}
          />
        </div>
      )}

      {loading && (
        <div className="py-12 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#1B5E20] border-t-transparent" />
        </div>
      )}

      {!loading && photos.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-zinc-200 py-16 text-center">
          <Camera className="mx-auto mb-3 h-10 w-10 text-zinc-300" />
          <p className="text-lg font-medium text-zinc-500">
            No community photos yet
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            Be the first to share your bowling moments!
          </p>
          {!isAuthenticated && (
            <Link
              href="/signup"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#1B5E20] hover:underline"
            >
              Sign up to submit photos
            </Link>
          )}
        </div>
      )}

      {!loading && photos.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-sm border border-zinc-100 hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={photo.image_url}
                  alt={photo.title}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-zinc-900 truncate">
                  {photo.title}
                </h3>
                {photo.description && (
                  <p className="mt-1 text-sm text-zinc-600 line-clamp-2">
                    {photo.description}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <span className="rounded-full bg-[#1B5E20]/10 px-2.5 py-0.5 text-xs font-medium text-[#1B5E20]">
                    {photo.category}
                  </span>
                  {photo.player && (
                    <Link
                      href={`/profile/${photo.player.id}`}
                      className="text-xs text-zinc-500 hover:text-[#1B5E20]"
                    >
                      by {photo.player.display_name}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
