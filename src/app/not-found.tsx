import Link from "next/link";
import { CircleDot, Home, MapPin, BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#1B5E20] via-[#2E7D32] to-[#0A2E12] px-4">
      <div className="text-center">
        {/* Bowling ball icon */}
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
          <CircleDot className="w-12 h-12 text-white" strokeWidth={1.5} />
        </div>

        <h1
          className="text-7xl font-black text-white mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          404
        </h1>
        <h2 className="text-2xl font-semibold text-[#A8D5BA] mb-4">
          This page has rolled into the ditch!
        </h2>
        <p className="text-white/70 mb-10 max-w-md mx-auto text-lg leading-relaxed">
          Let&apos;s get you back on the green. The page you&apos;re looking for
          doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-[#1B5E20] shadow-lg shadow-black/20 transition-all hover:bg-[#F0FFF4] hover:shadow-xl active:scale-[0.97]"
          >
            <Home className="h-4 w-4" />
            Back Home
          </Link>
          <Link
            href="/clubs"
            className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 px-7 py-3.5 text-base font-medium text-white backdrop-blur-sm transition-all hover:border-white/60 hover:bg-white/10 active:scale-[0.97]"
          >
            <MapPin className="h-4 w-4" />
            Find a Club
          </Link>
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 px-7 py-3.5 text-base font-medium text-white backdrop-blur-sm transition-all hover:border-white/60 hover:bg-white/10 active:scale-[0.97]"
          >
            <BookOpen className="h-4 w-4" />
            Learn to Bowl
          </Link>
        </div>

        {/* Decorative bowling green lines */}
        <div className="mt-16 flex justify-center gap-2 opacity-30">
          <div className="h-1 w-16 rounded-full bg-white" />
          <div className="h-1 w-8 rounded-full bg-white" />
          <div className="h-1 w-4 rounded-full bg-white" />
        </div>
      </div>
    </div>
  );
}
