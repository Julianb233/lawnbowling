import Link from "next/link";
import { Users } from "lucide-react";

export function LearnFooter() {
  return (
    <footer className="border-t border-[#0A2E12]/10 bg-[#0A2E12]/[0.03]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#1B5E20] to-[#2E7D32]">
            <Users className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-[#0A2E12]">Lawnbowling</span>
        </Link>
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[#3D5A3E]">
          <Link href="/learn" className="hover:text-[#1B5E20] transition">
            Learning Hub
          </Link>
          <Link href="/learn/rules" className="hover:text-[#1B5E20] transition">
            Rules
          </Link>
          <Link href="/learn/positions" className="hover:text-[#1B5E20] transition">
            Positions
          </Link>
          <Link href="/learn/formats" className="hover:text-[#1B5E20] transition">
            Formats
          </Link>
          <Link href="/learn/glossary" className="hover:text-[#1B5E20] transition">
            Glossary
          </Link>
          <Link href="/gallery" className="hover:text-[#1B5E20] transition">
            Gallery
          </Link>
        </div>
        <span className="text-sm text-[#3D5A3E]">
          &copy; {new Date().getFullYear()} Lawnbowling
        </span>
      </div>
    </footer>
  );
}
