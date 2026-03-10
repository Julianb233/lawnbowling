"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";

interface ReviewModalProps {
  reviewedId: string;
  reviewedName: string;
  matchId?: string;
  open: boolean;
  onClose: () => void;
}

export function ReviewModal({
  reviewedId,
  reviewedName,
  matchId,
  open,
  onClose,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!open) return null;

  function submit() {
    if (rating === 0) return;
    startTransition(async () => {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewed_id: reviewedId,
          match_id: matchId,
          rating,
          comment: comment || undefined,
        }),
      });
      if (res.ok) {
        setRating(0);
        setComment("");
        onClose();
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl glass p-6">
        <h2 className="text-lg font-bold text-zinc-100 mb-1">
          Rate {reviewedName}
        </h2>
        <p className="text-sm text-zinc-400 mb-4">
          How was your experience playing with them?
        </p>

        {/* Star rating */}
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="text-3xl transition-transform hover:scale-110"
            >
              <svg
                className={cn(
                  "h-8 w-8 transition-colors",
                  (hoverRating || rating) >= star
                    ? "fill-amber-400 text-amber-400"
                    : "fill-none text-zinc-600"
                )}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
          ))}
        </div>

        {/* Comment */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment (optional)"
          className="w-full rounded-xl bg-zinc-800/50 border border-zinc-700 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 resize-none h-20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        />

        <div className="mt-4 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-400 hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={rating === 0 || isPending}
            className={cn(
              "flex-1 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-all",
              rating > 0
                ? "bg-gradient-to-r from-emerald-500 to-green-600 hover:shadow-lg"
                : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
            )}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
