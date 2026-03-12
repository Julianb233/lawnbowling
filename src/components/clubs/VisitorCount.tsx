"use client";

import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface VisitorCountProps {
  clubId: string;
}

export function VisitorCount({ clubId }: VisitorCountProps) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCount() {
      const supabase = createClient();
      const season = new Date().getFullYear().toString();
      const startOfYear = `${season}-01-01`;

      const { count: visitorCount, error } = await supabase
        .from("visit_requests")
        .select("*", { count: "exact", head: true })
        .eq("club_id", clubId)
        .eq("status", "accepted")
        .gte("requested_date", startOfYear);

      if (!error && visitorCount !== null && visitorCount > 0) {
        setCount(visitorCount);
      }
    }
    fetchCount();
  }, [clubId]);

  if (count === null || count === 0) return null;

  return (
    <div className="flex items-center gap-1.5 text-sm text-[#3D5A3E]">
      <Users className="h-3.5 w-3.5" />
      <span>
        {count} visitor{count !== 1 ? "s" : ""} this season
      </span>
    </div>
  );
}
