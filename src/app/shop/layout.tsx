import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { CartDrawer } from "@/components/shop/CartDrawer";

export const metadata: Metadata = {
  title: {
    default: "Shop | Lawnbowling",
    template: "%s | Shop | Lawnbowling",
  },
  description:
    "Official Lawn Bowling merchandise — tees, hats, mugs and more. Plus recommended equipment and gear for bowlers.",
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FEFCF9]">
      {/* Shop header */}
      <header className="sticky top-0 z-30 border-b border-[#0A2E12]/10 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1 text-sm text-[#3D5A3E] hover:text-[#1B5E20]"
            >
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <div className="h-5 w-px bg-[#0A2E12]/10" />
            <Link
              href="/shop"
              className="flex items-center gap-2 font-bold text-[#1B5E20]"
            >
              <ShoppingBag className="size-5" />
              <span>Lawn Bowls Shop</span>
            </Link>
          </div>
          <nav className="flex items-center gap-4 text-sm font-medium text-[#3D5A3E]">
            <Link href="/shop" className="hover:text-[#1B5E20]">
              Merch
            </Link>
            <Link href="/shop/equipment" className="hover:text-[#1B5E20]">
              Equipment
            </Link>
            <Link href="/shop/custom-merch" className="hover:text-[#1B5E20]">
              Club Merch
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        {children}
      </main>

      {/* Cart drawer */}
      <CartDrawer />

      {/* Footer */}
      <footer className="border-t border-[#0A2E12]/10 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-center gap-2 text-center text-sm text-[#3D5A3E]">
            <p>Lawn Bowls Shop by Lawnbowling</p>
            <p>All merchandise printed on demand. Ships worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
