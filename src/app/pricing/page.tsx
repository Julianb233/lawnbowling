import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import PricingPageClient from "./PricingPageClient";

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-950">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
        </div>
      }
    >
      <PricingPageClient />
    </Suspense>
  );
}
