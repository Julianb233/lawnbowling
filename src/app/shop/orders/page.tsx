import type { Metadata } from "next";
import Link from "next/link";
import { Package, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Order History",
  description: "View your lawn bowling merchandise order history.",
};

export default function OrdersPage() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <Package className="mb-4 size-12 text-[#3D5A3E]/40" />
      <h1 className="mb-2 text-2xl font-bold text-[#1B5E20]">Order History</h1>
      <p className="mb-6 max-w-md text-[#3D5A3E]">
        Order tracking is coming soon. For questions about an existing order,
        please contact us.
      </p>
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 rounded-lg bg-[#1B5E20] px-6 py-3 text-sm font-medium text-white hover:bg-[#2E7D32]"
      >
        <ArrowLeft className="size-4" />
        Back to Shop
      </Link>
    </div>
  );
}
