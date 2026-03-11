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
      <body style={{ backgroundColor: "#FEFCF9", color: "#0A2E12" }}>
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <div
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl"
              style={{ backgroundColor: "rgba(27, 94, 32, 0.1)" }}
            >
              <span className="text-4xl">{"\uD83D\uDEA8"}</span>
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: "#0A2E12" }}>
              Critical Error
            </h2>
            <p className="mb-6" style={{ color: "#3D5A3E" }}>
              Something unexpected happened. Please try refreshing the page.
            </p>
            <button
              onClick={() => reset()}
              className="rounded-full px-6 py-3 text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: "#1B5E20" }}
            >
              Refresh
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
