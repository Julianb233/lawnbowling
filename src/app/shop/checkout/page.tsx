import type { Metadata } from "next";
import { CheckoutPlaceholder } from "./CheckoutPlaceholder";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your Lawn Bowls Shop purchase.",
};

export default function CheckoutPage() {
  return <CheckoutPlaceholder />;
}
