export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FEFCF9] pb-20 lg:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-[#0A2E12]/10 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 animate-pulse rounded-lg bg-[#0A2E12]/5" />
            <div className="h-7 w-28 animate-pulse rounded-lg bg-[#0A2E12]/5" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-5 px-4 py-6">
        {/* Profile settings card */}
        <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5">
          <div className="h-5 w-28 animate-pulse rounded bg-[#0A2E12]/5" />
          <div className="mt-4 space-y-4">
            <div>
              <div className="h-3 w-24 animate-pulse rounded bg-[#0A2E12]/5" />
              <div className="mt-2 h-10 w-full animate-pulse rounded-lg bg-[#0A2E12]/5" />
            </div>
            <div>
              <div className="h-3 w-20 animate-pulse rounded bg-[#0A2E12]/5" />
              <div className="mt-2 h-10 w-full animate-pulse rounded-lg bg-[#0A2E12]/5" />
            </div>
          </div>
        </div>

        {/* Notifications card */}
        <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5">
          <div className="h-5 w-32 animate-pulse rounded bg-[#0A2E12]/5" />
          <div className="mt-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 w-40 animate-pulse rounded bg-[#0A2E12]/5" />
                <div className="h-6 w-10 animate-pulse rounded-full bg-[#0A2E12]/5" />
              </div>
            ))}
          </div>
        </div>

        {/* Danger zone card */}
        <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5">
          <div className="h-5 w-24 animate-pulse rounded bg-[#0A2E12]/5" />
          <div className="mt-4 h-10 w-32 animate-pulse rounded-lg bg-[#0A2E12]/5" />
        </div>
      </div>
    </div>
  );
}
