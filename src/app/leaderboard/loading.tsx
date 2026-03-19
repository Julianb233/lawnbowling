export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FEFCF9] pb-20 lg:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#0A2E12]/10 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 animate-pulse rounded bg-[#0A2E12]/5" />
            <div className="h-7 w-32 animate-pulse rounded-lg bg-[#0A2E12]/5" />
          </div>
          <div className="mt-1 h-4 w-72 animate-pulse rounded bg-[#0A2E12]/5" />
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6">
        {/* Filter tabs */}
        <div className="mb-6 flex gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-9 w-24 animate-pulse rounded-full bg-[#0A2E12]/5"
            />
          ))}
        </div>

        {/* Podium */}
        <div className="mb-8 flex items-end justify-center gap-4">
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 animate-pulse rounded-full bg-[#0A2E12]/5" />
            <div className="mt-2 h-3 w-16 animate-pulse rounded bg-[#0A2E12]/5" />
            <div className="mt-1 h-16 w-20 animate-pulse rounded-t-lg bg-[#0A2E12]/5" />
          </div>
          <div className="flex flex-col items-center">
            <div className="h-14 w-14 animate-pulse rounded-full bg-[#0A2E12]/5" />
            <div className="mt-2 h-3 w-16 animate-pulse rounded bg-[#0A2E12]/5" />
            <div className="mt-1 h-24 w-20 animate-pulse rounded-t-lg bg-[#0A2E12]/5" />
          </div>
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 animate-pulse rounded-full bg-[#0A2E12]/5" />
            <div className="mt-2 h-3 w-16 animate-pulse rounded bg-[#0A2E12]/5" />
            <div className="mt-1 h-12 w-20 animate-pulse rounded-t-lg bg-[#0A2E12]/5" />
          </div>
        </div>

        {/* Table rows */}
        <div className="rounded-2xl border border-[#0A2E12]/10 bg-white">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 border-b border-[#0A2E12]/5 px-4 py-3 last:border-0"
            >
              <div className="h-5 w-6 animate-pulse rounded bg-[#0A2E12]/5" />
              <div className="h-9 w-9 animate-pulse rounded-full bg-[#0A2E12]/5" />
              <div className="flex-1">
                <div className="h-4 w-28 animate-pulse rounded bg-[#0A2E12]/5" />
              </div>
              <div className="h-4 w-12 animate-pulse rounded bg-[#0A2E12]/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
