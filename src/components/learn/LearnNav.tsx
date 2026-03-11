import Link from "next/link";
import { Users } from "lucide-react";

export function LearnNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] shadow-lg shadow-green-900/15">
            <Users className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-zinc-900">Lawnbowling</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/learn"
            className="hidden sm:block rounded-lg px-4 py-2 text-sm font-medium text-[#1B5E20] transition hover:bg-green-50"
          >
            Learning Hub
          </Link>
          <Link
            href="/signup"
            className="rounded-xl bg-[#1B5E20] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-900/15 transition hover:bg-[#2E7D32] hover:shadow-green-900/25"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
