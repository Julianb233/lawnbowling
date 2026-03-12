"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ErrorBoundary]", error.message, error.digest);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="text-center max-w-sm">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10">
          <span className="text-4xl">{"\uD83D\uDE35"}</span>
        </div>
        <h2 className="text-2xl font-bold text-[#0A2E12] mb-2">
          Something went wrong
        </h2>
        <p className="text-[#3D5A3E] mb-6">
          Don&apos;t worry, it happens to the best of us. Let&apos;s get you
          back in the game.
        </p>
        {error.digest && (
          <p className="text-xs text-[#3D5A3E] mb-4 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        <button
          onClick={() => reset()}
          className="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/15 hover:shadow-emerald-500/25 transition-all"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
