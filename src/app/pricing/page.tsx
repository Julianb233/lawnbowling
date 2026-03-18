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
        <div className="flex min-h-screen items-center justify-center bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
        </div>
      }
    >
      <PricingPageClient />
    </Suspense>
  );
}
