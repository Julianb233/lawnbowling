import type { Metadata } from "next";
import { LearnNav } from "@/components/learn/LearnNav";
import { LearnFooter } from "@/components/learn/LearnFooter";
import { GlossaryClient } from "./GlossaryClient";

export const metadata: Metadata = {
  title: "Lawn Bowling Glossary | 85+ Terms Defined | Lawnbowling",
  description:
    "Searchable glossary of over 85 lawn bowling terms. From bias and draw to toucher and pennant -- every term explained with definitions and usage examples. Perfect for beginners.",
  keywords: [
    "lawn bowling glossary",
    "lawn bowls terms",
    "bowling terminology",
    "lawn bowls definitions",
    "what is bias in lawn bowls",
    "lawn bowling vocabulary",
    "bowls jargon",
    "lawn bowls for beginners",
  ],
};

export default function GlossaryPage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <LearnNav />
      <GlossaryClient />
      <LearnFooter />
    </div>
  );
}
