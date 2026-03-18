export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FEFCF9]">
      {/* Header */}
      <div className="border-b border-[#0A2E12]/10 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="h-7 w-24 animate-pulse rounded-lg bg-[#0A2E12]/5" />
          <div className="mt-1 h-4 w-64 animate-pulse rounded bg-[#0A2E12]/5" />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Category chips */}
        <div className="mb-8 flex flex-wrap gap-2">
          {["All", "T-Shirts", "Hats", "Mugs", "Accessories"].map((label) => (
            <div
              key={label}
              className="h-9 w-24 animate-pulse rounded-full bg-[#0A2E12]/5"
            />
          ))}
        </div>

        {/* Product grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-[#0A2E12]/10 bg-white"
            >
              <div className="aspect-square w-full animate-pulse bg-[#0A2E12]/5" />
              <div className="p-4">
                <div className="h-5 w-3/4 animate-pulse rounded bg-[#0A2E12]/5" />
                <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-[#0A2E12]/5" />
                <div className="mt-3 h-10 w-full animate-pulse rounded-lg bg-[#0A2E12]/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
