"use client";

import { useState } from "react";
import { Camera, Upload, Loader2, Check, X } from "lucide-react";
import { galleryCategories } from "@/lib/gallery-data";

interface SubmitPhotoFormProps {
  onClose: () => void;
  onSubmitted: () => void;
}

export function SubmitPhotoForm({ onClose, onSubmitted }: SubmitPhotoFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleImageUpload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      setImageUrl(url);
    } catch {
      setError("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !category || !imageUrl) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          category,
          image_url: imageUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Submission failed");
      }

      setSuccess(true);
      setTimeout(() => {
        onSubmitted();
        onClose();
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit photo"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl bg-white border border-[#0A2E12]/10 p-8 text-center shadow-lg">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <Check className="h-7 w-7 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-[#0A2E12]">
          Photo Submitted!
        </h3>
        <p className="mt-1 text-sm text-[#3D5A3E]">
          Your photo will appear in the gallery once approved.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-[#0A2E12]/10 p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#0A2E12] flex items-center gap-2">
          <Camera className="h-5 w-5 text-[#1B5E20]" />
          Submit a Photo
        </h3>
        <button
          onClick={onClose}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#3D5A3E] hover:bg-[#F0FFF4]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Image upload */}
        <div>
          <label className="mb-1 block text-sm font-medium text-[#3D5A3E]">
            Photo
          </label>
          {imageUrl ? (
            <div className="relative rounded-xl overflow-hidden">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-48 object-cover"
              />
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#0A2E12]/20 bg-[#F0FFF4]/50 px-4 py-8 hover:border-[#1B5E20] hover:bg-[#F0FFF4] transition-colors">
              {uploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-[#1B5E20]" />
              ) : (
                <>
                  <Upload className="h-8 w-8 text-[#3D5A3E]/40 mb-2" />
                  <span className="text-sm text-[#3D5A3E]">
                    Click to upload a photo
                  </span>
                  <span className="mt-0.5 text-xs text-[#3D5A3E]/60">
                    JPG, PNG up to 5MB
                  </span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
              />
            </label>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="mb-1 block text-sm font-medium text-[#3D5A3E]">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your photo a title"
            maxLength={200}
            required
            className="w-full rounded-xl border border-[#0A2E12]/10 bg-[#FEFCF9] px-4 py-3 text-sm text-[#0A2E12] placeholder:text-[#3D5A3E]/40 focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20]"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-1 block text-sm font-medium text-[#3D5A3E]">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell us about this photo"
            maxLength={1000}
            rows={3}
            className="w-full rounded-xl border border-[#0A2E12]/10 bg-[#FEFCF9] px-4 py-3 text-sm text-[#0A2E12] placeholder:text-[#3D5A3E]/40 focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20] resize-none"
          />
        </div>

        {/* Category */}
        <div>
          <label className="mb-1 block text-sm font-medium text-[#3D5A3E]">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {galleryCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  category === cat
                    ? "border-[#1B5E20] bg-[#1B5E20]/10 text-[#1B5E20]"
                    : "border-[#0A2E12]/10 bg-white text-[#3D5A3E] hover:border-[#1B5E20]/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={!title.trim() || !category || !imageUrl || submitting}
          className="w-full rounded-xl bg-[#1B5E20] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2E7D32] disabled:opacity-40 min-h-[44px]"
        >
          {submitting ? (
            <Loader2 className="mx-auto h-4 w-4 animate-spin" />
          ) : (
            "Submit for Review"
          )}
        </button>
      </form>
    </div>
  );
}
