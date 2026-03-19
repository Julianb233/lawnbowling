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
          <div className="mb-8 h-8 w-28 animate-pulse rounded-full bg-[#0A2E12]/5" />
          <div className="h-14 w-80 max-w-full animate-pulse rounded-lg bg-[#0A2E12]/5" />
          <div className="mt-6 h-5 w-72 max-w-full animate-pulse rounded bg-[#0A2E12]/5" />
        </div>
      </section>

      {/* Filter bar */}
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-10 w-28 animate-pulse rounded-full bg-[#0A2E12]/5"
            />
          ))}
        </div>
      </section>

      {/* Image grid 3x3 */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div
              key={i}
              className="aspect-[4/3] w-full animate-pulse rounded-2xl border border-[#0A2E12]/10 bg-[#0A2E12]/5"
            />
          ))}
        </div>
      </section>
    </div>
  );
}
