"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { VisitRequestModal } from "./VisitRequestModal";

interface VisitingButtonProps {
  clubId: string;
  clubName: string;
}

export function VisitingButton({ clubId, clubName }: VisitingButtonProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(!!user);
    });
  }, []);

  if (!isAuthenticated) return null;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full rounded-xl bg-[#1B5E20] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#145218]"
      >
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
