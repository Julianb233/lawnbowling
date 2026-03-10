"use client";

import type { PlayerReview } from "@/lib/types";

interface ReviewsListProps {
  reviews: PlayerReview[];
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function ReviewsList({ reviews }: ReviewsListProps) {
  if (reviews.length === 0) {
    return (
      <p className="text-sm text-zinc-500 text-center py-4">
        No reviews yet
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <div key={review.id} className="rounded-xl glass p-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-200 text-xs font-bold text-zinc-600">
                {review.reviewer?.display_name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <span className="text-sm font-medium text-zinc-700">
                {review.reviewer?.display_name || "Anonymous"}
              </span>
            </div>
            <span className="text-xs text-zinc-500">
              {timeAgo(review.created_at)}
            </span>
          </div>
          <div className="flex items-center gap-0.5 mb-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`h-3.5 w-3.5 ${
                  review.rating >= star
                    ? "fill-amber-400 text-amber-400"
                    : "fill-none text-zinc-300"
                }`}
                viewBox="0 0 20 20"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          {review.comment && (
            <p className="text-sm text-zinc-600">{review.comment}</p>
          )}
        </div>
      ))}
    </div>
  );
}
