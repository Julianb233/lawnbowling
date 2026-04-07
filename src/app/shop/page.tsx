import type { Metadata } from "next";
import { ShopCatalog } from "./ShopCatalog";
import { getProductCatalog } from "@/lib/shop/sync";

export const metadata: Metadata = {
  title: "Merch — Lawn Bowling Apparel & Gifts",
  description:
    "Shop lawn bowling t-shirts, hats, mugs and accessories. Unique designs for bowlers, printed on demand.",
};

export default async function ShopPage() {
  const products = await getProductCatalog();
  return <ShopCatalog products={products} />;
}
