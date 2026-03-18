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
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-12">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 h-8 w-24 animate-pulse rounded-full bg-[#0A2E12]/5" />
          <div className="h-14 w-96 max-w-full animate-pulse rounded-lg bg-[#0A2E12]/5" />
          <div className="mt-6 h-5 w-80 max-w-full animate-pulse rounded bg-[#0A2E12]/5" />
        </div>
      </section>

      {/* Category pills */}
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-8 w-24 animate-pulse rounded-full bg-[#0A2E12]/5"
            />
          ))}
        </div>
      </section>

      {/* Blog post cards */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-[#0A2E12]/10 bg-white"
            >
              <div className="h-48 w-full animate-pulse bg-[#0A2E12]/5" />
              <div className="p-5">
                <div className="flex gap-2">
                  <div className="h-5 w-16 animate-pulse rounded-full bg-[#0A2E12]/5" />
                  <div className="h-5 w-20 animate-pulse rounded-full bg-[#0A2E12]/5" />
                </div>
                <div className="mt-3 h-5 w-3/4 animate-pulse rounded bg-[#0A2E12]/5" />
                <div className="mt-2 space-y-2">
                  <div className="h-4 w-full animate-pulse rounded bg-[#0A2E12]/5" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-[#0A2E12]/5" />
                </div>
                <div className="mt-4 h-4 w-24 animate-pulse rounded bg-[#0A2E12]/5" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
