export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FEFCF9] pb-20 lg:pb-0">
      {/* Hero banner placeholder */}
      <div className="relative h-40 w-full animate-pulse bg-[#0A2E12]/10" />

      <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
        {/* Activity items */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex gap-3 rounded-2xl border border-[#0A2E12]/10 bg-white p-4"
          >
            <div className="h-10 w-10 flex-shrink-0 animate-pulse rounded-full bg-[#0A2E12]/5" />
            <div className="flex-1">
              <div className="h-4 w-3/4 animate-pulse rounded bg-[#0A2E12]/5" />
              <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-[#0A2E12]/5" />
              <div className="mt-3 h-16 w-full animate-pulse rounded-xl bg-[#0A2E12]/5" />
            </div>
            <div className="h-3 w-12 animate-pulse rounded bg-[#0A2E12]/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
