"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/board", label: "Home", icon: "\u{1F3E0}" },
  { href: "/schedule", label: "Schedule", icon: "\u{1F4C5}" },
  { href: "/teams", label: "Teams", icon: "\u{1F465}" },
  { href: "/stats", label: "Stats", icon: "\u{1F4CA}" },
  { href: "/profile", label: "Me", icon: "\u{1F464}" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-zinc-200 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around py-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 px-4 py-2 text-xs transition-colors min-h-[44px]",
                active ? "text-emerald-400 font-semibold" : "text-zinc-500"
              )}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-0.5 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-emerald-400"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
