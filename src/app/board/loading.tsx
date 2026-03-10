import { BoardSkeleton } from "@/components/ui/Skeleton";

export default function BoardLoading() {
  return (
    <div className="min-h-screen bg-animated-gradient pb-20 lg:pb-0">
      {/* Header skeleton */}
      <header className="sticky top-0 z-40 glass border-b border-zinc-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
          <div>
            <div className="h-6 w-40 rounded skeleton" />
            <div className="mt-1 h-4 w-28 rounded skeleton" />
          </div>
          <div className="h-8 w-24 rounded-full skeleton" />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-4 lg:px-8">
        {/* Check-in skeleton */}
        <div className="mb-4 h-16 rounded-2xl skeleton" />

        {/* Filter skeleton */}
        <div className="mb-4 h-14 rounded-2xl skeleton" />

        {/* Board skeleton */}
        <div className="mb-3 h-4 w-36 rounded skeleton" />
        <BoardSkeleton />
      </div>
    </div>
  );
}
