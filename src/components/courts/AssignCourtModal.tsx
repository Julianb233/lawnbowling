"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Court {
  id: string;
  name: string;
  sport: string;
  is_available: boolean;
}

interface AssignCourtModalProps {
  matchId: string;
  sport: string;
  courts: Court[];
  open: boolean;
  onClose: () => void;
  onAssigned: () => void;
}

export function AssignCourtModal({
  matchId,
  sport,
  courts,
  open,
  onClose,
  onAssigned,
}: AssignCourtModalProps) {
  const [assigning, setAssigning] = useState<string | null>(null);

  if (!open) return null;

  const availableCourts = courts.filter(
    (c) => c.sport === sport && c.is_available
  );

  const handleAssign = async (courtId: string) => {
    setAssigning(courtId);
    const res = await fetch("/api/matches/assign-court", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, courtId }),
    });
    setAssigning(null);
    if (res.ok) {
      onAssigned();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-xl border border-[#0A2E12]/10 bg-white p-6">
        <h2 className="text-lg font-semibold text-[#0A2E12] mb-4">
          Assign Court
        </h2>
        <p className="text-sm text-[#3D5A3E] mb-4">
          Select an available{" "}
          <span className="capitalize">{sport.replace("_", " ")}</span> court:
        </p>

        {availableCourts.length === 0 ? (
          <p className="text-sm text-[#3D5A3E] italic">
            No available courts for this sport.
          </p>
        ) : (
          <div className="space-y-2">
            {availableCourts.map((court) => (
              <button
                key={court.id}
                className="flex w-full items-center justify-between rounded-lg border border-[#0A2E12]/10 bg-[#0A2E12]/5 px-4 py-3 text-left hover:border-[#1B5E20] transition-colors"
                disabled={assigning !== null}
                onClick={() => handleAssign(court.id)}
              >
                <span className="font-medium text-[#0A2E12]">{court.name}</span>
                {assigning === court.id ? (
                  <span className="text-xs text-[#3D5A3E]">Assigning...</span>
                ) : (
                  <span className="text-xs text-[#1B5E20]">Available</span>
                )}
              </button>
            ))}
          </div>
        )}

        <Button variant="ghost" className="w-full mt-4" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
