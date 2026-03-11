"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { getSportColor } from "@/lib/design";
import type { Sport } from "@/lib/types";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "equipment", label: "Equipment" },
  { id: "court", label: "Court" },
  { id: "how-to-play", label: "How to Play" },
  { id: "scoring", label: "Scoring" },
  { id: "rules", label: "Rules" },
  { id: "tips", label: "Tips" },
  { id: "etiquette", label: "Etiquette" },
  { id: "fun-facts", label: "Fun Facts" },
];

export function GuideNav({ sport }: { sport: Sport }) {
  const [activeSection, setActiveSection] = useState("overview");
  const colors = getSportColor(sport);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <nav className="sticky top-[57px] z-30 -mx-4 overflow-x-auto border-b border-zinc-200 dark:border-white/10 bg-white/95 dark:bg-[#1a3d28]/95 backdrop-blur px-4 py-2 scrollbar-hide">
      <div className="flex gap-1 min-w-max">
        {SECTIONS.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
            }}
            className={cn(
              "rounded-full px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap min-h-[44px] flex items-center",
              activeSection === id
                ? "text-white"
                : "text-zinc-500 hover:text-zinc-600 hover:bg-zinc-100"
            )}
            style={
              activeSection === id
                ? {
                    backgroundColor: `${colors.primary}25`,
                    color: colors.primary,
                  }
                : undefined
            }
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}
