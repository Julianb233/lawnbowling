import type { Metadata } from "next";
import { FaqPage } from "./FaqPage";

export const metadata: Metadata = {
  title: "FAQ | Lawnbowling",
  description:
    "Frequently asked questions about Lawnbowling — the digital platform for lawn bowling clubs. Get answers about tournament draws, scoring, clubs, and more.",
};

export default function Page() {
  return <FaqPage />;
}
