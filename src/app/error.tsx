"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FEFCF9] px-4">
      <div className="text-center max-w-sm">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#B8860B]/10">
          <span className="text-4xl">{"\uD83D\uDE35"}</span>
        </div>
        <h2 className="text-2xl font-bold text-[#0A2E12] mb-2" style={{ fontFamily: "var(--font-display)" }}>
          Something went wrong
        </h2>
        <p className="text-[#3D5A3E] mb-6">
          Don&apos;t worry, it happens to the best of us. Let&apos;s get you
          back on the green.
        </p>
        <button
          onClick={() => reset()}
          className="rounded-full bg-[#1B5E20] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#1B5E20]/20 transition-all hover:bg-[#2E7D32] hover:shadow-xl hover:shadow-[#1B5E20]/25 active:scale-[0.97]"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
