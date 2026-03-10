"use client";

export function CardSkeleton() {
  return (
    <div className="glass rounded-2xl p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 rounded-full skeleton" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-24 rounded skeleton" />
          <div className="h-3 w-16 rounded skeleton" />
          <div className="flex gap-1">
            <div className="h-6 w-6 rounded skeleton" />
            <div className="h-6 w-6 rounded skeleton" />
          </div>
        </div>
      </div>
      <div className="mt-3 h-3 w-20 rounded skeleton" />
      <div className="mt-3 h-10 w-full rounded-lg skeleton" />
    </div>
  );
}

export function BoardSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 6 }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="glass rounded-2xl p-6 animate-pulse">
      <div className="flex flex-col items-center gap-4">
        <div className="h-20 w-20 rounded-full skeleton" />
        <div className="h-5 w-32 rounded skeleton" />
        <div className="h-4 w-24 rounded skeleton" />
      </div>
    </div>
  );
}
