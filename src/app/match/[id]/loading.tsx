export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FEFCF9] pb-20 lg:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-[#0A2E12]/10 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 animate-pulse rounded-lg bg-[#0A2E12]/5" />
            <div className="h-7 w-36 animate-pulse rounded-lg bg-[#0A2E12]/5" />
            <div className="ml-auto h-6 w-20 animate-pulse rounded-full bg-[#0A2E12]/5" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-5 px-4 py-6">
        {/* Team headers */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-[#0A2E12]/5" />
            <div className="h-5 w-24 animate-pulse rounded bg-[#0A2E12]/5" />
          </div>
          <div className="h-8 w-12 animate-pulse rounded-lg bg-[#0A2E12]/5" />
          <div className="flex items-center gap-3">
            <div className="h-5 w-24 animate-pulse rounded bg-[#0A2E12]/5" />
            <div className="h-10 w-10 animate-pulse rounded-full bg-[#0A2E12]/5" />
          </div>
        </div>

        {/* Scorecard table */}
        <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-4">
          {/* Table header */}
          <div className="mb-3 flex gap-4 border-b border-[#0A2E12]/5 pb-2">
            <div className="h-4 w-12 animate-pulse rounded bg-[#0A2E12]/5" />
            <div className="h-4 w-16 animate-pulse rounded bg-[#0A2E12]/5" />
            <div className="ml-auto h-4 w-16 animate-pulse rounded bg-[#0A2E12]/5" />
          </div>
          {/* Score rows */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center gap-4 py-2">
              <div className="h-4 w-8 animate-pulse rounded bg-[#0A2E12]/5" />
              <div className="h-4 w-10 animate-pulse rounded bg-[#0A2E12]/5" />
              <div className="ml-auto h-4 w-10 animate-pulse rounded bg-[#0A2E12]/5" />
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <div className="h-11 flex-1 animate-pulse rounded-xl bg-[#0A2E12]/5" />
          <div className="h-11 flex-1 animate-pulse rounded-xl bg-[#0A2E12]/5" />
        </div>
      </div>
    </div>
  );
}
