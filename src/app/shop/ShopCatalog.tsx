"use client";

import { useState } from "react";
import { PRODUCTS, CATEGORIES, type ProductCategory } from "@/lib/shop/products";
import { ProductCard } from "@/components/shop/ProductCard";
import { Shirt, Coffee, ShoppingBag, Star } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  Shirt: <Shirt className="size-4" />,
  HardHat: <Star className="size-4" />,
  Coffee: <Coffee className="size-4" />,
  ShoppingBag: <ShoppingBag className="size-4" />,
};

export function ShopCatalog() {
  const [activeCategory, setActiveCategory] = useState<
    ProductCategory | "all"
  >("all");

  const filtered =
    activeCategory === "all"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === activeCategory);

  return (
    <>
      {/* Hero */}
      <section className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-[#0A2E12] sm:text-4xl">
          Lawn Bowling Merch
        </h1>
        <p className="mt-2 text-[#3D5A3E]">
          Unique apparel and gifts for bowlers. Printed on demand, shipped
          worldwide.
        </p>
      </section>

      {/* Category filters */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => setActiveCategory("all")}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
            activeCategory === "all"
              ? "bg-[#1B5E20] text-white"
              : "bg-white text-[#3D5A3E] hover:bg-[#0A2E12]/5"
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
              activeCategory === cat.key
                ? "bg-[#1B5E20] text-white"
                : "bg-white text-[#3D5A3E] hover:bg-[#0A2E12]/5"
            }`}
          >
            {iconMap[cat.icon]}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-16 text-center text-[#3D5A3E]/70">
          No products in this category yet.
        </p>
      )}
    </>
  );
}
