export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FEFCF9] pb-20 lg:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-[#0A2E12]/10 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <div className="h-7 w-40 animate-pulse rounded-lg bg-[#0A2E12]/5" />
          <div className="mt-1 h-4 w-64 animate-pulse rounded bg-[#0A2E12]/5" />
        </div>
      </div>

      {/* Stats row */}
      <div className="mx-auto max-w-5xl px-4 pt-4">
        <div className="flex gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-1 rounded-xl border border-[#0A2E12]/10 bg-white p-3 text-center"
            >
              <div className="mx-auto h-6 w-12 animate-pulse rounded bg-[#0A2E12]/5" />
              <div className="mx-auto mt-1 h-3 w-16 animate-pulse rounded bg-[#0A2E12]/5" />
            </div>
          ))}
        </div>
      </div>

      {/* Search bar */}
      <div className="mx-auto max-w-5xl px-4 pt-4">
        <div className="h-11 w-full animate-pulse rounded-xl bg-[#0A2E12]/5" />
      </div>

      {/* Filter chips */}
      <div className="mx-auto max-w-5xl px-4 pt-3">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-8 w-20 animate-pulse rounded-full bg-[#0A2E12]/5"
            />
          ))}
        </div>
      </div>

      {/* Club cards */}
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-[#0A2E12]/10 bg-white"
          >
            <div className="h-32 w-full animate-pulse bg-[#0A2E12]/5" />
            <div className="p-4">
              <div className="h-5 w-2/3 animate-pulse rounded bg-[#0A2E12]/5" />
              <div className="mt-2 flex gap-2">
                <div className="h-4 w-24 animate-pulse rounded bg-[#0A2E12]/5" />
                <div className="h-4 w-16 animate-pulse rounded bg-[#0A2E12]/5" />
              </div>
              <div className="mt-3 h-4 w-full animate-pulse rounded bg-[#0A2E12]/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
