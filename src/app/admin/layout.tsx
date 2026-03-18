import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminShell } from "./AdminShell";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/venues", label: "Venues" },
  { href: "/admin/venue", label: "Venue Settings" },
  { href: "/admin/courts", label: "Rinks" },
  { href: "/admin/players", label: "Players" },
  { href: "/admin/matches", label: "Games" },
  { href: "/admin/waivers", label: "Waivers" },
  { href: "/admin/waiver-templates", label: "Templates" },
  { href: "/admin/claims", label: "Claims" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/insurance", label: "Insurance" },
  { href: "/admin/branding", label: "Branding" },
  { href: "/admin/kiosk-settings", label: "Kiosk" },
  { href: "/admin/venue-qr", label: "QR Codes" },
  { href: "/admin/monitoring", label: "Monitoring" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0A2E12]/[0.03]">
      {/* Mobile: horizontal scrollable nav */}
      <nav
        className="flex lg:hidden overflow-x-auto gap-1 p-2 border-b border-[#0A2E12]/10 bg-white scrollbar-hide"
        aria-label="Admin navigation"
      >
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-lg px-3 py-2 text-sm text-[#3D5A3E] hover:bg-white hover:text-[#0A2E12] transition-colors min-h-[44px] flex items-center"
          >
            {item.label}
          </Link>
        ))}
        <Link
          href="/"
          className="shrink-0 rounded-lg px-3 py-2 text-xs text-[#3D5A3E] hover:text-[#2D4A30] transition-colors min-h-[44px] flex items-center ml-auto"
        >
          Back to App
        </Link>
      </nav>

      {/* Desktop: sidebar */}
      <aside className="hidden lg:block w-56 shrink-0 border-r border-[#0A2E12]/10 bg-white">
        <div className="p-4 border-b border-[#0A2E12]/10">
          <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-wider">
            Admin Panel
          </h2>
        </div>
        <nav className="p-2 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm text-[#3D5A3E] hover:bg-white hover:text-[#0A2E12] transition-colors min-h-[44px] flex items-center"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 mt-auto border-t border-[#0A2E12]/10">
          <Link
            href="/"
            className="block text-xs text-[#3D5A3E] hover:text-[#2D4A30] transition-colors"
          >
            Back to App
          </Link>
        </div>
      </aside>

      {/* Main content with venue context */}
      <main className="flex-1 p-4 lg:p-8">
        <AdminShell>{children}</AdminShell>
      </main>
    </div>
  );
}
