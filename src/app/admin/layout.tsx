import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/venue", label: "Venue" },
  { href: "/admin/courts", label: "Courts" },
  { href: "/admin/players", label: "Players" },
  { href: "/admin/waivers", label: "Waivers" },
  { href: "/admin/waiver-templates", label: "Templates" },
  { href: "/admin/matches", label: "Matches" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-zinc-950">
      {/* Mobile: horizontal scrollable nav */}
      <nav
        className="flex lg:hidden overflow-x-auto gap-1 p-2 border-b border-zinc-800 bg-zinc-900 scrollbar-hide"
        aria-label="Admin navigation"
      >
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors min-h-[44px] flex items-center"
          >
            {item.label}
          </Link>
        ))}
        <Link
          href="/"
          className="shrink-0 rounded-lg px-3 py-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors min-h-[44px] flex items-center ml-auto"
        >
          Back to App
        </Link>
      </nav>

      {/* Desktop: sidebar */}
      <aside className="hidden lg:block w-56 shrink-0 border-r border-zinc-800 bg-zinc-900">
        <div className="p-4 border-b border-zinc-800">
          <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
            Admin Panel
          </h2>
        </div>
        <nav className="p-2 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors min-h-[44px] flex items-center"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 mt-auto border-t border-zinc-800">
          <Link
            href="/"
            className="block text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Back to App
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 lg:p-8">{children}</main>
    </div>
  );
}
