import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import PricingPageClient from "./PricingPageClient";

export const metadata: Metadata = {
  title: "Pricing — Simple, Fair Plans | LawnBowl",
  description:
    "Free for small clubs. Club plan $29/mo for full features. Pro plan $79/mo for multi-club management. No hidden fees.",
  openGraph: {
    title: "Pricing — Simple, Fair Plans | LawnBowl",
    description:
      "Free for small clubs. Club plan $29/mo for full features. Pro plan $79/mo for multi-club management. No hidden fees.",
    url: "https://www.lawnbowling.app/pricing",
  },
};

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
          <span className="text-sm font-medium text-green-700">Loading…</span>
        </div>
      }
    >
      <PricingPageClient />
    </Suspense>
  );
}
