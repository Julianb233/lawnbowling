import type { Metadata } from "next";
import { LearnNav } from "@/components/learn/LearnNav";
import { LearnFooter } from "@/components/learn/LearnFooter";
import { GlossaryClient } from "./GlossaryClient";

export const metadata: Metadata = {
  title: "Lawn Bowling Glossary | 80+ Terms Defined | Lawnbowling",
  description:
    "Comprehensive lawn bowling glossary with over 80 terms defined. From bias and draw to toucher and pennant -- searchable and organized by category.",
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
