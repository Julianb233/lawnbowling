export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FEFCF9] pb-20 lg:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#0A2E12]/10 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="h-7 w-28 animate-pulse rounded-lg bg-[#0A2E12]/5" />
          <div className="mt-1 h-4 w-48 animate-pulse rounded bg-[#0A2E12]/5" />
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        {/* Stats overview cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-[#0A2E12]/10 bg-white p-4 text-center"
            >
              <div className="mx-auto h-8 w-12 animate-pulse rounded bg-[#0A2E12]/5" />
              <div className="mx-auto mt-2 h-3 w-16 animate-pulse rounded bg-[#0A2E12]/5" />
            </div>
          ))}
        </div>

        {/* Ratings card */}
        <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5">
          <div className="h-5 w-24 animate-pulse rounded bg-[#0A2E12]/5" />
          <div className="mt-4 h-32 w-full animate-pulse rounded-xl bg-[#0A2E12]/5" />
        </div>

        {/* Chart placeholder */}
        <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5">
          <div className="h-5 w-36 animate-pulse rounded bg-[#0A2E12]/5" />
          <div className="mt-4 h-48 w-full animate-pulse rounded-xl bg-[#0A2E12]/5" />
        </div>

        {/* Match history */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="h-4 w-28 animate-pulse rounded bg-[#0A2E12]/5" />
            <div className="h-4 w-16 animate-pulse rounded bg-[#0A2E12]/5" />
          </div>
          <div className="rounded-2xl border border-[#0A2E12]/10 bg-white">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 border-b border-[#0A2E12]/5 px-4 py-3 last:border-0"
              >
                <div className="h-4 w-16 animate-pulse rounded bg-[#0A2E12]/5" />
                <div className="flex-1 h-4 w-full animate-pulse rounded bg-[#0A2E12]/5" />
                <div className="h-6 w-14 animate-pulse rounded-full bg-[#0A2E12]/5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
