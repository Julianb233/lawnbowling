"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-animated-gradient px-4">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-4">{"\uD83D\uDE35"}</div>
        <h2 className="text-2xl font-bold text-zinc-100 mb-2">
          Something went wrong
        </h2>
        <p className="text-zinc-400 mb-6">
          Don&apos;t worry, it happens to the best of us. Let&apos;s get you
          back in the game.
        </p>
        <button
          onClick={() => reset()}
          className="rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
