import Link from "next/link";
import { CircleDot } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FEFCF9] px-4">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#1B5E20]/10">
          <CircleDot className="w-10 h-10 text-[#1B5E20]" strokeWidth={1.5} />
        </div>
        <h1 className="text-6xl font-black text-[#0A2E12] mb-2" style={{ fontFamily: "var(--font-display)" }}>404</h1>
        <h2 className="text-xl font-semibold text-[#3D5A3E] mb-4">
          Out of Bounds!
        </h2>
        <p className="text-[#3D5A3E]/70 mb-8 max-w-sm mx-auto">
          Looks like this bowl went wide. The page you&apos;re looking for
          doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-[#1B5E20] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#1B5E20]/20 transition-all hover:bg-[#2E7D32] hover:shadow-xl hover:shadow-[#1B5E20]/25 active:scale-[0.97]"
          >
            Back Home
          </Link>
          <Link
            href="/clubs"
            className="rounded-full border border-[#0A2E12]/10 px-6 py-3 text-sm font-medium text-[#0A2E12] transition-all hover:border-[#1B5E20]/20 hover:bg-[#1B5E20]/5"
          >
            Find a Club
          </Link>
        </div>
      </div>
    </div>
  );
}
