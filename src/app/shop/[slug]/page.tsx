import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getAllSlugs } from "@/lib/shop/products";
import { getProductCatalog } from "@/lib/shop/sync";
import { ProductDetail } from "./ProductDetail";

// ---------------------------------------------------------------------------
// Static params — generates all product pages at build time
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

// ---------------------------------------------------------------------------
// Dynamic metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const catalog = await getProductCatalog();
  const product = catalog.find((p) => p.slug === slug) ?? getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: `${product.name} | Lawn Bowls Shop`,
      description: product.description,
    },
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const catalog = await getProductCatalog();
  const product = catalog.find((p) => p.slug === slug) ?? getProductBySlug(slug);
  if (!product) notFound();

  return <ProductDetail product={product} />;
}
