"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface VenueData {
  id: string;
  name: string;
  address: string | null;
  timezone: string;
}

export default function VenueSettingsPage() {
  const [venue, setVenue] = useState<VenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/venue")
      .then((r) => r.json())
      .then((data) => {
        setVenue(data.venue);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    if (!venue) return;
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/admin/venue", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(venue),
    });
    setSaving(false);
    if (res.ok) {
      setMessage("Saved successfully");
    } else {
      setMessage("Failed to save");
    }
  };

  if (loading) {
    return (
      <div className="text-zinc-400">Loading venue settings...</div>
    );
  }

  if (!venue) {
    return (
      <div className="text-zinc-400">
        No venue configured. Create one in Supabase first.
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-100 mb-6">Venue Settings</h1>
      <div className="max-w-lg space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">
            Venue Name
          </label>
          <input
            type="text"
            value={venue.name}
            onChange={(e) => setVenue({ ...venue, name: e.target.value })}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100 focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">
            Address
          </label>
          <input
            type="text"
            value={venue.address ?? ""}
            onChange={(e) =>
              setVenue({ ...venue, address: e.target.value || null })
            }
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100 focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">
            Timezone
          </label>
          <input
            type="text"
            value={venue.timezone}
            onChange={(e) => setVenue({ ...venue, timezone: e.target.value })}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100 focus:border-emerald-500 focus:outline-none"
            placeholder="America/Los_Angeles"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          {message && (
            <span
              className={`text-sm ${message.includes("success") ? "text-emerald-400" : "text-red-400"}`}
            >
              {message}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
