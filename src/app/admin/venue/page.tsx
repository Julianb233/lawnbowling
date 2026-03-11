"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { VenueQRCode } from "@/components/venue/VenueQRCode";

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

interface WaiverTemplateData {
  id?: string;
  title: string;
  body: string;
  is_active: boolean;
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
  const [waiverTemplate, setWaiverTemplate] = useState<WaiverTemplateData>({
    title: "Liability Waiver",
    body: "",
    is_active: true,
  });
  const [waiverLoading, setWaiverLoading] = useState(true);
  const [waiverSaving, setWaiverSaving] = useState(false);
  const [waiverMessage, setWaiverMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/venue")
      .then((r) => r.json())
      .then((data) => {
        setVenue(data.venue);
        setLoading(false);
      });
    fetch("/api/admin/waiver-template")
      .then((r) => r.json())
      .then((data) => {
        if (data.template) {
          setWaiverTemplate(data.template);
        }
        setWaiverLoading(false);
      })
      .catch(() => setWaiverLoading(false));
  }, []);

  const handleWaiverSave = async () => {
    if (!venue) return;
    setWaiverSaving(true);
    setWaiverMessage("");
    const res = await fetch("/api/admin/waiver-template", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        venue_id: venue.id,
        ...waiverTemplate,
      }),
    });
    setWaiverSaving(false);
    if (res.ok) {
      const data = await res.json();
      setWaiverTemplate(data.template);
      setWaiverMessage("Waiver text saved successfully");
    } else {
      setWaiverMessage("Failed to save waiver text");
    }
  };

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
      <div className="text-zinc-500">Loading venue settings...</div>
    );
  }

  if (!venue) {
    return (
      <div className="text-zinc-500">
        No venue configured. Create one in Supabase first.
      </div>
    );
  }

  const unusedSports = AVAILABLE_SPORTS.filter(
    (s) => !venue.sports.includes(s)
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-800 mb-6">Venue Settings</h1>
      <div className="max-w-lg space-y-6">
        {/* Basic Info */}
        <section>
          <h2 className="text-lg font-semibold text-zinc-700 mb-3">Basic Info</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-500 mb-1">
                Venue Name
              </label>
              <input
                type="text"
                value={venue.name}
                onChange={(e) => setVenue({ ...venue, name: e.target.value })}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-800 focus:border-[#1B5E20] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-500 mb-1">
                Address
              </label>
              <input
                type="text"
                value={venue.address ?? ""}
                onChange={(e) =>
                  setVenue({ ...venue, address: e.target.value || null })
                }
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-800 focus:border-[#1B5E20] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-500 mb-1">
                Timezone
              </label>
              <input
                type="text"
                value={venue.timezone}
                onChange={(e) => setVenue({ ...venue, timezone: e.target.value })}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-800 focus:border-[#1B5E20] focus:outline-none"
                placeholder="America/Los_Angeles"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-500 mb-1">
                Tagline
              </label>
              <input
                type="text"
                value={venue.tagline ?? ""}
                onChange={(e) =>
                  setVenue({ ...venue, tagline: e.target.value || null })
                }
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-800 focus:border-[#1B5E20] focus:outline-none"
                placeholder="Find your perfect partner"
              />
            </div>
          </div>
        </section>

        {/* Sports Management (ADMIN-03) */}
        <section>
          <h2 className="text-lg font-semibold text-zinc-700 mb-3">
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
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#1B5E20]/5 px-3 py-1 text-sm text-[#1B5E20]"
                >
                  <span className="capitalize">{sport.replace("_", " ")}</span>
                  <button
                    onClick={() => removeSport(sport)}
                    className="ml-1 text-[#1B5E20]/60 hover:text-red-600 transition-colors"
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
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-800 flex-1"
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
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 focus:border-[#1B5E20] focus:outline-none flex-1"
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
          <h2 className="text-lg font-semibold text-zinc-700 mb-3">
            Contact Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-500 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={venue.contact_email ?? ""}
                onChange={(e) =>
                  setVenue({ ...venue, contact_email: e.target.value || null })
                }
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-800 focus:border-[#1B5E20] focus:outline-none"
                placeholder="info@venue.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-500 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                value={venue.contact_phone ?? ""}
                onChange={(e) =>
                  setVenue({ ...venue, contact_phone: e.target.value || null })
                }
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-800 focus:border-[#1B5E20] focus:outline-none"
                placeholder="(555) 555-5555"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-500 mb-1">
                Website URL
              </label>
              <input
                type="url"
                value={venue.website_url ?? ""}
                onChange={(e) =>
                  setVenue({ ...venue, website_url: e.target.value || null })
                }
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-800 focus:border-[#1B5E20] focus:outline-none"
                placeholder="https://venue.com"
              />
            </div>
          </div>
        </section>

        {/* Waiver Text Configuration (WAIV-05) */}
        <section>
          <h2 className="text-lg font-semibold text-zinc-700 mb-3">
            Waiver Text
          </h2>
          <p className="text-sm text-zinc-500 mb-3">
            Customize the liability waiver text that players must accept before
            playing. Leave blank to use the default waiver.
          </p>
          {waiverLoading ? (
            <p className="text-sm text-zinc-500">Loading waiver template...</p>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-500 mb-1">
                  Waiver Title
                </label>
                <input
                  type="text"
                  value={waiverTemplate.title}
                  onChange={(e) =>
                    setWaiverTemplate({ ...waiverTemplate, title: e.target.value })
                  }
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-800 focus:border-[#1B5E20] focus:outline-none"
                  placeholder="Liability Waiver"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-500 mb-1">
                  Waiver Body
                </label>
                <textarea
                  value={waiverTemplate.body}
                  onChange={(e) =>
                    setWaiverTemplate({ ...waiverTemplate, body: e.target.value })
                  }
                  rows={12}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-800 focus:border-[#1B5E20] focus:outline-none resize-y"
                  placeholder="Enter your custom waiver text here..."
                />
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={handleWaiverSave} disabled={waiverSaving}>
                  {waiverSaving ? "Saving..." : "Save Waiver Text"}
                </Button>
                {waiverMessage && (
                  <span
                    className={`text-sm ${waiverMessage.includes("success") ? "text-[#1B5E20]" : "text-red-600"}`}
                  >
                    {waiverMessage}
                  </span>
                )}
              </div>
            </div>
          )}
        </section>

        {/* QR Code Check-in (VENUE-02) */}
        <section>
          <h2 className="text-lg font-semibold text-zinc-700 mb-3">
            Check-in QR Code
          </h2>
          <p className="text-sm text-zinc-500 mb-4">
            Print or display this QR code at your venue. Players scan it to
            check in automatically.
          </p>
          <VenueQRCode venueId={venue.id} venueName={venue.name} />
        </section>

        {/* Save */}
        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Venue Settings"}
          </Button>
          {message && (
            <span
              className={`text-sm ${message.includes("success") ? "text-[#1B5E20]" : "text-red-600"}`}
            >
              {message}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
