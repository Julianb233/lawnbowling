import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutPlaceholder } from "./CheckoutPlaceholder";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your Lawn Bowls Shop purchase.",
};

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg py-20 text-center text-gray-400">
          Loading checkout...
        </div>
      }
    >
      <CheckoutPlaceholder />
    </Suspense>
  );
}
