"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-zinc-900">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-rose-500/10">
              <span className="text-4xl">{"\uD83D\uDEA8"}</span>
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 mb-2">
              Critical Error
            </h2>
            <p className="text-zinc-600 mb-6">
              Something unexpected happened. Please try refreshing the page.
            </p>
            <button
              onClick={() => reset()}
              className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/15 hover:bg-emerald-500 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
