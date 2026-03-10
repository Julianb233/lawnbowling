"use client";

import { useState, useEffect, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";

export default function BrandingPage() {
  const [venue, setVenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.from("venues").select("*").limit(1).single().then(({ data }) => {
      setVenue(data);
      setLoading(false);
    });
  }, [supabase]);

  function save() {
    if (!venue) return;
    startTransition(async () => {
      await supabase.from("venues").update({
        logo_url: venue.logo_url,
        primary_color: venue.primary_color,
        secondary_color: venue.secondary_color,
        tagline: venue.tagline,
        contact_email: venue.contact_email,
        contact_phone: venue.contact_phone,
        website_url: venue.website_url,
      }).eq("id", venue.id);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  if (loading) return <div className="skeleton h-64 rounded-xl" />;
  if (!venue) return <p className="text-zinc-500">No venue configured</p>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-zinc-800">Venue Branding</h1>
        <p className="text-sm text-zinc-500">Customize how your venue appears to players</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-zinc-500 mb-1">Logo URL</label>
          <input
            value={venue.logo_url || ""}
            onChange={(e) => setVenue({ ...venue, logo_url: e.target.value })}
            placeholder="https://..."
            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-500 mb-1">Tagline</label>
          <input
            value={venue.tagline || ""}
            onChange={(e) => setVenue({ ...venue, tagline: e.target.value })}
            placeholder="Your awesome tagline"
            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-zinc-500 mb-1">Primary Color</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={venue.primary_color || "#22c55e"}
                onChange={(e) => setVenue({ ...venue, primary_color: e.target.value })}
                className="h-10 w-10 rounded cursor-pointer border-0"
              />
              <input
                value={venue.primary_color || "#22c55e"}
                onChange={(e) => setVenue({ ...venue, primary_color: e.target.value })}
                className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-zinc-500 mb-1">Secondary Color</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={venue.secondary_color || "#0f172a"}
                onChange={(e) => setVenue({ ...venue, secondary_color: e.target.value })}
                className="h-10 w-10 rounded cursor-pointer border-0"
              />
              <input
                value={venue.secondary_color || "#0f172a"}
                onChange={(e) => setVenue({ ...venue, secondary_color: e.target.value })}
                className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 font-mono"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm text-zinc-500 mb-1">Contact Email</label>
          <input
            value={venue.contact_email || ""}
            onChange={(e) => setVenue({ ...venue, contact_email: e.target.value })}
            placeholder="info@venue.com"
            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-500 mb-1">Contact Phone</label>
          <input
            value={venue.contact_phone || ""}
            onChange={(e) => setVenue({ ...venue, contact_phone: e.target.value })}
            placeholder="(555) 123-4567"
            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-500 mb-1">Website</label>
          <input
            value={venue.website_url || ""}
            onChange={(e) => setVenue({ ...venue, website_url: e.target.value })}
            placeholder="https://yourvenue.com"
            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-xl border border-zinc-200 p-6" style={{ backgroundColor: venue.secondary_color || "#0f172a" }}>
        <p className="text-xs text-zinc-500 mb-2">Preview</p>
        <div className="flex items-center gap-3">
          {venue.logo_url ? (
            <img src={venue.logo_url} alt="Logo" className="h-12 w-12 rounded-lg object-cover" />
          ) : (
            <div className="h-12 w-12 rounded-lg flex items-center justify-center text-zinc-900 font-bold" style={{ backgroundColor: venue.primary_color || "#22c55e" }}>
              {venue.name?.charAt(0) || "V"}
            </div>
          )}
          <div>
            <h3 className="font-bold text-zinc-800">{venue.name}</h3>
            {venue.tagline && <p className="text-sm" style={{ color: venue.primary_color || "#22c55e" }}>{venue.tagline}</p>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={isPending}
          className="rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-bold text-zinc-900 hover:bg-emerald-400 transition-colors"
        >
          {isPending ? "Saving..." : "Save Changes"}
        </button>
        {saved && <span className="text-sm text-emerald-600">Saved!</span>}
      </div>
    </div>
  );
}
