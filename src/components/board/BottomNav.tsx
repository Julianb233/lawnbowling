"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/board", label: "Home", icon: "\u{1F3E0}" },
  { href: "/queue", label: "Queue", icon: "\u{1F4CB}" },
  { href: "/profile", label: "Me", icon: "\u{1F464}" },
  { href: "/settings", label: "Settings", icon: "\u2699\uFE0F" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white/95 backdrop-blur lg:hidden pb-[env(safe-area-inset-bottom)]" aria-label="Main navigation">
      <div className="flex items-center justify-around py-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-4 py-1 text-xs transition-colors",
                active ? "text-emerald-600 font-semibold" : "text-zinc-500"
              )}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
