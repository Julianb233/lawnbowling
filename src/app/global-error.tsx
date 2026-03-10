"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <div className="text-6xl mb-4">{"\uD83D\uDEA8"}</div>
            <h2 className="text-2xl font-bold text-zinc-100 mb-2">
              Critical Error
            </h2>
            <p className="text-zinc-400 mb-6">
              Something unexpected happened. Please try refreshing the page.
            </p>
            <button
              onClick={() => reset()}
              className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-400 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
