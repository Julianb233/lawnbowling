import type { Metadata } from "next";
import { FaqPage } from "./FaqPage";

export const metadata: Metadata = {
  title: "FAQ | Lawnbowling",
  description:
    "Frequently asked questions about Lawnbowling — the real-time player board for recreational sports. Get answers about playing, insurance, venues, and more.",
};

export default function Page() {
  return <FaqPage />;
}
