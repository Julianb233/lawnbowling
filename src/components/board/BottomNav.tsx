"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Home, Trophy, CircleDot, Calendar, User, Shield, type LucideIcon } from "lucide-react";
import { NotificationBellNav } from "@/components/notifications/NotificationBellNav";

const NAV_ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/board", label: "Home", icon: Home },
  { href: "/tournament", label: "Tourney", icon: Trophy },
  { href: "/bowls", label: "Bowls", icon: CircleDot },
  { href: "/pennant", label: "Pennant", icon: Shield },
  { href: "/schedule", label: "Schedule", icon: Calendar },
  { href: "/profile", label: "Me", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t lg:hidden"
      style={{
        backgroundColor: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(12px)",
        borderColor: "rgba(10,46,18,0.08)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around py-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href
            || (item.href !== "/board" && (pathname?.startsWith(item.href + "/") ?? false));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 px-3 py-2 text-[11px] transition-colors min-h-[44px]",
                active ? "font-semibold" : ""
              )}
              style={{ color: active ? "#1B5E20" : "#3D5A3E" }}
            >
              <item.icon className="w-5 h-5" strokeWidth={1.5} />
              <span>{item.label}</span>
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-0.5 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full"
                  style={{ backgroundColor: "#1B5E20" }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
        <NotificationBellNav />
      </div>
    </nav>
  );
}
