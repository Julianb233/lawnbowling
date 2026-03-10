"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface VenueData {
  id: string;
  name: string;
  address: string | null;
  timezone: string;
  contact_email: string | null;
  contact_phone: string | null;
  website_url: string | null;
  tagline: string | null;
  sports: string[];
}

const AVAILABLE_SPORTS = [
  "pickleball",
  "lawn_bowling",
  "tennis",
  "badminton",
  "table_tennis",
  "volleyball",
  "basketball",
  "racquetball",
];

export default function VenueSettingsPage() {
  const [venue, setVenue] = useState<VenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [newSport, setNewSport] = useState("");

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

  const addSport = (sport: string) => {
    if (!venue || !sport || venue.sports.includes(sport)) return;
    setVenue({ ...venue, sports: [...venue.sports, sport] });
  };

  const removeSport = (sport: string) => {
    if (!venue) return;
    setVenue({ ...venue, sports: venue.sports.filter((s) => s !== sport) });
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

  const unusedSports = AVAILABLE_SPORTS.filter(
    (s) => !venue.sports.includes(s)
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-100 mb-6">Venue Settings</h1>
      <div className="max-w-lg space-y-6">
        {/* Basic Info */}
        <section>
          <h2 className="text-lg font-semibold text-zinc-200 mb-3">Basic Info</h2>
          <div className="space-y-4">
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
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Tagline
              </label>
              <input
                type="text"
                value={venue.tagline ?? ""}
                onChange={(e) =>
                  setVenue({ ...venue, tagline: e.target.value || null })
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100 focus:border-emerald-500 focus:outline-none"
                placeholder="Find your perfect partner"
              />
            </div>
          </div>
        </section>

        {/* Sports Management (ADMIN-03) */}
        <section>
          <h2 className="text-lg font-semibold text-zinc-200 mb-3">
            Available Sports
          </h2>
          <p className="text-sm text-zinc-500 mb-3">
            Manage which sports are offered at this venue. Players will only see
            these sports when checking in.
          </p>

          {/* Current sports */}
          <div className="flex flex-wrap gap-2 mb-3">
            {venue.sports.length === 0 ? (
              <p className="text-sm text-zinc-500 italic">
                No sports configured yet.
              </p>
            ) : (
              venue.sports.map((sport) => (
                <span
                  key={sport}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-sm text-emerald-400"
                >
                  <span className="capitalize">{sport.replace("_", " ")}</span>
                  <button
                    onClick={() => removeSport(sport)}
                    className="ml-1 text-emerald-400/60 hover:text-red-400 transition-colors"
                    title={`Remove ${sport}`}
                  >
                    x
                  </button>
                </span>
              ))
            )}
          </div>

          {/* Add sport */}
          <div className="flex gap-2">
            <select
              value={newSport}
              onChange={(e) => setNewSport(e.target.value)}
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100 flex-1"
            >
              <option value="">Select a sport to add...</option>
              {unusedSports.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
            <Button
              onClick={() => {
                addSport(newSport);
                setNewSport("");
              }}
              disabled={!newSport}
            >
              Add Sport
            </Button>
          </div>

          {/* Custom sport input */}
          <div className="mt-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Or type a custom sport..."
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const val = (e.target as HTMLInputElement).value.trim().toLowerCase().replace(/\s+/g, "_");
                    if (val) {
                      addSport(val);
                      (e.target as HTMLInputElement).value = "";
                    }
                  }
                }}
              />
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section>
          <h2 className="text-lg font-semibold text-zinc-200 mb-3">
            Contact Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={venue.contact_email ?? ""}
                onChange={(e) =>
                  setVenue({ ...venue, contact_email: e.target.value || null })
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100 focus:border-emerald-500 focus:outline-none"
                placeholder="info@venue.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                value={venue.contact_phone ?? ""}
                onChange={(e) =>
                  setVenue({ ...venue, contact_phone: e.target.value || null })
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100 focus:border-emerald-500 focus:outline-none"
                placeholder="(555) 555-5555"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Website URL
              </label>
              <input
                type="url"
                value={venue.website_url ?? ""}
                onChange={(e) =>
                  setVenue({ ...venue, website_url: e.target.value || null })
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100 focus:border-emerald-500 focus:outline-none"
                placeholder="https://venue.com"
              />
            </div>
          </div>
        </section>

        {/* Save */}
        <div className="flex items-center gap-3 pt-2">
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
