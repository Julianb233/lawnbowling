import type { Metadata } from "next";
import { ShopCatalog } from "./ShopCatalog";

export const metadata: Metadata = {
  title: "Merch — Lawn Bowling Apparel & Gifts",
  description:
    "Shop lawn bowling t-shirts, hats, mugs and accessories. Unique designs for bowlers, printed on demand.",
};

export default function ShopPage() {
  return <ShopCatalog />;
}
