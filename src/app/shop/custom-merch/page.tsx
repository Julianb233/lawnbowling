import type { Metadata } from "next";
import { CustomMerchForm } from "./CustomMerchForm";

export const metadata: Metadata = {
  title: "Custom Club Merchandise | Lawn Bowls Shop",
  description:
    "Order custom-branded merchandise for your lawn bowling club. Polos, t-shirts, hats, and more with your club logo and colors. No minimum order quantity.",
};

export default function CustomMerchPage() {
  return <CustomMerchForm />;
}
