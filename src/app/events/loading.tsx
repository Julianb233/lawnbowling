export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FEFCF9] pb-20 lg:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-[#0A2E12]/10 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 animate-pulse rounded bg-[#0A2E12]/5" />
            <div className="h-7 w-28 animate-pulse rounded-lg bg-[#0A2E12]/5" />
          </div>
          <div className="mt-1 h-4 w-56 animate-pulse rounded bg-[#0A2E12]/5" />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6">
        {/* Filter chips */}
        <div className="mb-6 flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-9 w-24 animate-pulse rounded-full bg-[#0A2E12]/5"
            />
          ))}
        </div>

        {/* Featured event card */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-[#0A2E12]/10 bg-white">
          <div className="h-48 w-full animate-pulse bg-[#0A2E12]/5" />
          <div className="p-5">
            <div className="flex gap-2">
              <div className="h-6 w-24 animate-pulse rounded-full bg-[#0A2E12]/5" />
              <div className="h-6 w-20 animate-pulse rounded-full bg-[#0A2E12]/5" />
            </div>
            <div className="mt-3 h-6 w-3/4 animate-pulse rounded bg-[#0A2E12]/5" />
            <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-[#0A2E12]/5" />
            <div className="mt-3 h-4 w-full animate-pulse rounded bg-[#0A2E12]/5" />
          </div>
        </div>

        {/* Event cards grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-[#0A2E12]/10 bg-white"
            >
              <div className="h-32 w-full animate-pulse bg-[#0A2E12]/5" />
              <div className="p-4">
                <div className="h-6 w-20 animate-pulse rounded-full bg-[#0A2E12]/5" />
                <div className="mt-2 h-5 w-3/4 animate-pulse rounded bg-[#0A2E12]/5" />
                <div className="mt-2 flex gap-2">
                  <div className="h-4 w-16 animate-pulse rounded bg-[#0A2E12]/5" />
                  <div className="h-4 w-20 animate-pulse rounded bg-[#0A2E12]/5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
