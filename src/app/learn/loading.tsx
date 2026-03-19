export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FEFCF9]">
      {/* Nav placeholder */}
      <div className="border-b border-[#0A2E12]/10 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="h-6 w-32 animate-pulse rounded bg-[#0A2E12]/5" />
        </div>
      </div>

      {/* Hero */}
      <div className="mx-auto max-w-6xl px-6 pt-20 pb-12">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 h-8 w-40 animate-pulse rounded-full bg-[#0A2E12]/5" />
          <div className="h-12 w-96 max-w-full animate-pulse rounded-lg bg-[#0A2E12]/5" />
          <div className="mt-4 h-5 w-80 max-w-full animate-pulse rounded bg-[#0A2E12]/5" />
        </div>
      </div>

      {/* Topic cards grid */}
      <div className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-[#0A2E12]/10 bg-white p-6"
            >
              <div className="mb-4 h-10 w-10 animate-pulse rounded-xl bg-[#0A2E12]/5" />
              <div className="h-5 w-3/4 animate-pulse rounded bg-[#0A2E12]/5" />
              <div className="mt-3 space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-[#0A2E12]/5" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-[#0A2E12]/5" />
              </div>
              <div className="mt-4 h-4 w-24 animate-pulse rounded bg-[#0A2E12]/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
