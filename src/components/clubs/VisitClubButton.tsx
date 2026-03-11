"use client";

import { useState, useEffect } from "react";
import { Plane } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { VisitRequestModal } from "@/components/bowls/VisitRequestModal";

interface VisitClubButtonProps {
  clubId: string;
  clubName: string;
}

export function VisitClubButton({ clubId, clubName }: VisitClubButtonProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    }
    checkAuth();
  }, []);

  if (!isAuthenticated) return null;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#1B5E20] bg-[#1B5E20]/5 px-4 py-3 text-sm font-bold text-[#1B5E20] transition-colors hover:bg-[#1B5E20]/10"
      >
        <Plane className="h-4 w-4" />
        I&apos;m Visiting
      </button>

      <VisitRequestModal
        clubId={clubId}
        clubName={clubName}
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}
