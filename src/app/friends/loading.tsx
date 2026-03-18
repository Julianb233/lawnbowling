export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FEFCF9] pb-20 lg:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#0A2E12]/10 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 animate-pulse rounded-lg bg-[#0A2E12]/5" />
            <div className="h-7 w-24 animate-pulse rounded-lg bg-[#0A2E12]/5" />
          </div>
          <div className="ml-10 mt-1 h-4 w-36 animate-pulse rounded bg-[#0A2E12]/5" />
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
        {/* Search bar */}
        <div className="h-11 w-full animate-pulse rounded-xl bg-[#0A2E12]/5" />

        {/* Friend rows */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-2xl border border-[#0A2E12]/10 bg-white px-4 py-3"
          >
            <div className="h-11 w-11 animate-pulse rounded-full bg-[#0A2E12]/5" />
            <div className="flex-1">
              <div className="h-4 w-32 animate-pulse rounded bg-[#0A2E12]/5" />
              <div className="mt-1 h-3 w-20 animate-pulse rounded bg-[#0A2E12]/5" />
            </div>
            <div className="h-8 w-8 animate-pulse rounded-lg bg-[#0A2E12]/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
