export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FEFCF9] pb-20 lg:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-[#0A2E12]/10 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="h-7 w-36 animate-pulse rounded-lg bg-[#0A2E12]/5" />
          <div className="mt-1 h-4 w-72 animate-pulse rounded bg-[#0A2E12]/5" />
        </div>
      </div>

      {/* Tournament cards */}
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-[#0A2E12]/10 bg-white p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="h-5 w-48 animate-pulse rounded bg-[#0A2E12]/5" />
                <div className="mt-2 flex gap-2">
                  <div className="h-6 w-20 animate-pulse rounded-full bg-[#0A2E12]/5" />
                  <div className="h-6 w-24 animate-pulse rounded-full bg-[#0A2E12]/5" />
                </div>
              </div>
              <div className="h-10 w-10 animate-pulse rounded-lg bg-[#0A2E12]/5" />
            </div>
            <div className="mt-3 flex gap-4">
              <div className="h-4 w-28 animate-pulse rounded bg-[#0A2E12]/5" />
              <div className="h-4 w-20 animate-pulse rounded bg-[#0A2E12]/5" />
            </div>
            <div className="mt-3 h-2 w-full animate-pulse rounded-full bg-[#0A2E12]/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
