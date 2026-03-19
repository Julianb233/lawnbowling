"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAdminVenue } from "@/components/admin/AdminVenueContext";
import type { Venue } from "@/lib/types";

export default function VenuesAdminPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [creating, setCreating] = useState(false);
  const { selectedVenueId, selectVenue } = useAdminVenue();

  const fetchVenues = async () => {
    const res = await fetch("/api/admin/venues");
    const data = await res.json();
    setVenues(data.venues ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    const res = await fetch("/api/admin/venues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), address: newAddress.trim() || undefined }),
    });
    if (res.ok) {
      setNewName("");
      setNewAddress("");
      fetchVenues();
    }
    setCreating(false);
  };

  if (loading) {
    return <div className="text-[#3D5A3E]">Loading venues...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0A2E12] mb-6" style={{ fontFamily: "var(--font-display)" }}>Venue Management</h1>

      {/* Create venue */}
      <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5 sm:p-6 mb-6">
        <h2 className="text-sm font-semibold text-[#0A2E12] mb-3" style={{ fontFamily: "var(--font-display)" }}>Add New Venue</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Venue name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="rounded-lg border border-[#0A2E12]/10 bg-[#0A2E12]/5 px-3 py-2 text-[#0A2E12] focus:border-[#1B5E20] focus:outline-none flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <input
            type="text"
            placeholder="Address (optional)"
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
            className="rounded-lg border border-[#0A2E12]/10 bg-[#0A2E12]/5 px-3 py-2 text-[#0A2E12] focus:border-[#1B5E20] focus:outline-none flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <Button onClick={handleCreate} disabled={creating || !newName.trim()}>
            {creating ? "Creating..." : "Add Venue"}
          </Button>
        </div>
      </div>

      {/* Venue list */}
      <div className="space-y-2">
        {venues.map((venue) => (
          <div
            key={venue.id}
            className={`flex items-center justify-between rounded-lg border px-4 py-3 transition-colors ${
              venue.id === selectedVenueId
                ? "border-[#1B5E20] bg-[#1B5E20]/10"
                : "border-[#0A2E12]/10 bg-white"
            }`}
          >
            <div>
              <span className="font-medium text-[#0A2E12]">{venue.name}</span>
              {venue.address && (
                <span className="ml-2 text-xs text-[#3D5A3E]">{venue.address}</span>
              )}
              {venue.sports?.length > 0 && (
                <span className="ml-2 text-xs text-[#3D5A3E]">
                  {venue.sports.map((s) => s.replace("_", " ")).join(", ")}
                </span>
              )}
              {venue.id === selectedVenueId && (
                <span className="ml-2 inline-block rounded-full bg-[#1B5E20]/20 px-2 py-0.5 text-xs font-medium text-[#1B5E20]">
                  Active
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {venue.id !== selectedVenueId && (
                <Button size="sm" variant="outline" onClick={() => selectVenue(venue.id)}>
                  Select
                </Button>
              )}
              <a href="/admin/venue" className="inline-flex items-center justify-center rounded-md text-sm font-medium text-[#3D5A3E] hover:text-[#0A2E12]:text-[#3D5A3E] hover:bg-[#0A2E12]/5 h-8 px-3 transition-colors">
                Settings
              </a>
            </div>
          </div>
        ))}
        {venues.length === 0 && (
          <p className="text-sm text-[#3D5A3E] italic">
            No venues yet. Create one above to get started.
          </p>
        )}
      </div>
    </div>
  );
}
