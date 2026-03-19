export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FEFCF9] pb-20 lg:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-[#0A2E12]/10 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="h-7 w-28 animate-pulse rounded-lg bg-[#0A2E12]/5" />
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        {/* Avatar + name */}
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 animate-pulse rounded-full bg-[#0A2E12]/5" />
          <div>
            <div className="h-6 w-40 animate-pulse rounded bg-[#0A2E12]/5" />
            <div className="mt-2 h-4 w-28 animate-pulse rounded bg-[#0A2E12]/5" />
            <div className="mt-1 h-4 w-32 animate-pulse rounded bg-[#0A2E12]/5" />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-[#0A2E12]/10 bg-white p-4 text-center"
            >
              <div className="mx-auto h-7 w-10 animate-pulse rounded bg-[#0A2E12]/5" />
              <div className="mx-auto mt-2 h-3 w-14 animate-pulse rounded bg-[#0A2E12]/5" />
            </div>
          ))}
        </div>

        {/* Section: Recent matches */}
        <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5">
          <div className="h-5 w-32 animate-pulse rounded bg-[#0A2E12]/5" />
          <div className="mt-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 animate-pulse rounded-full bg-[#0A2E12]/5" />
                <div className="flex-1">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-[#0A2E12]/5" />
                  <div className="mt-1 h-3 w-1/2 animate-pulse rounded bg-[#0A2E12]/5" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Favorite partners */}
        <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5">
          <div className="h-5 w-40 animate-pulse rounded bg-[#0A2E12]/5" />
          <div className="mt-4 flex gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="h-12 w-12 animate-pulse rounded-full bg-[#0A2E12]/5" />
                <div className="h-3 w-16 animate-pulse rounded bg-[#0A2E12]/5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
