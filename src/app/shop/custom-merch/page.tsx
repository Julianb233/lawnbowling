import type { Metadata } from "next";
import { CustomMerchForm } from "./CustomMerchForm";

export const metadata: Metadata = {
  title: "Custom Club Merch",
  description:
    "Order custom branded merchandise for your lawn bowling club. T-shirts, hats, and more with your club logo and colors.",
};

export default function CustomMerchPage() {
  return <CustomMerchForm />;
}
