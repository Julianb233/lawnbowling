export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FEFCF9] pb-20 lg:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-[#0A2E12]/10 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="h-7 w-36 animate-pulse rounded-lg bg-[#0A2E12]/5" />
          <div className="mt-1 h-4 w-48 animate-pulse rounded bg-[#0A2E12]/5" />
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6">
        {/* Calendar date strip */}
        <div className="mb-6 flex gap-2 overflow-hidden">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className="flex h-16 w-12 flex-shrink-0 flex-col items-center justify-center rounded-xl border border-[#0A2E12]/10 bg-white"
            >
              <div className="h-3 w-6 animate-pulse rounded bg-[#0A2E12]/5" />
              <div className="mt-1 h-5 w-5 animate-pulse rounded bg-[#0A2E12]/5" />
            </div>
          ))}
        </div>

        {/* Event cards */}
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-[#0A2E12]/5">
                  <div className="h-3 w-6 animate-pulse rounded bg-[#0A2E12]/5" />
                  <div className="h-4 w-4 animate-pulse rounded bg-[#0A2E12]/5" />
                </div>
                <div className="flex-1">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-[#0A2E12]/5" />
                  <div className="mt-2 flex gap-3">
                    <div className="h-4 w-20 animate-pulse rounded bg-[#0A2E12]/5" />
                    <div className="h-4 w-16 animate-pulse rounded bg-[#0A2E12]/5" />
                  </div>
                  <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-[#0A2E12]/5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
