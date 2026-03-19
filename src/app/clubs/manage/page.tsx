"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Save,
  MapPin,
  Globe,
  Phone,
  Mail,
  Users,
  Leaf,
  Plus,
  X,
  Search,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ClubMembershipManager } from "@/components/clubs/ClubMembershipManager";
import type { ClubRole } from "@/lib/types";
import type { Club } from "@/lib/db/clubs";

interface LinkedVenue {
  id: string;
  venue_id: string;
  is_primary: boolean;
  venue: { id: string; name: string; address: string | null };
}

interface VenueOption {
  id: string;
  name: string;
  address: string | null;
}

export default function ClubManagerDashboard() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [userClubRole, setUserClubRole] = useState<ClubRole>("owner");

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [memberCount, setMemberCount] = useState("");
  const [greens, setGreens] = useState("");
  const [rinks, setRinks] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");

  // Venue linking
  const [linkedVenues, setLinkedVenues] = useState<LinkedVenue[]>([]);
  const [venueSearch, setVenueSearch] = useState("");
  const [venueOptions, setVenueOptions] = useState<VenueOption[]>([]);
  const [showVenueSearch, setShowVenueSearch] = useState(false);

  useEffect(() => {
    fetchManagedClubs();
  }, []);

  async function fetchManagedClubs() {
    setLoading(true);
    try {
      const res = await fetch("/api/clubs/managed");
      const data = await res.json();
      if (data.clubs?.length > 0) {
        setClubs(data.clubs);
        selectClub(data.clubs[0]);
      }
    } catch {
      setError("Failed to load your clubs");
    } finally {
      setLoading(false);
    }
  }

  function selectClub(club: Club) {
    setSelectedClub(club);
    setName(club.name);
    setDescription(club.description || "");
    setPhone(club.phone || "");
    setEmail(club.email || "");
    setWebsite(club.website || "");
    setAddress(club.address || "");
    setMemberCount(club.member_count?.toString() || "");
    setGreens(club.greens?.toString() || "");
    setRinks(club.rinks?.toString() || "");
    setFacebookUrl(club.facebook_url || "");
    setInstagramUrl(club.instagram_url || "");
    fetchLinkedVenues(club.id);
  }

  async function fetchLinkedVenues(clubId: string) {
    try {
      const res = await fetch(`/api/clubs/venues?club_id=${clubId}`);
      const data = await res.json();
      setLinkedVenues(data.club_venues ?? []);
    } catch {
      // ignore
    }
  }

  const searchVenues = useCallback(async (q: string) => {
    if (q.length < 2) {
      setVenueOptions([]);
      return;
    }
    const supabase = createClient();
    const { data } = await supabase
      .from("venues")
      .select("id, name, address")
      .ilike("name", `%${q}%`)
      .limit(10);
    setVenueOptions(data ?? []);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => searchVenues(venueSearch), 300);
    return () => clearTimeout(timer);
  }, [venueSearch, searchVenues]);

  async function handleLinkVenue(venue: VenueOption) {
    if (!selectedClub) return;
    try {
      const res = await fetch("/api/clubs/venues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          club_id: selectedClub.id,
          venue_id: venue.id,
          is_primary: linkedVenues.length === 0,
        }),
      });
      if (res.ok) {
        fetchLinkedVenues(selectedClub.id);
        setVenueSearch("");
        setVenueOptions([]);
        setShowVenueSearch(false);
      }
    } catch {
      // ignore
    }
  }

  async function handleUnlinkVenue(venueId: string) {
    if (!selectedClub) return;
    try {
      await fetch("/api/clubs/venues", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          club_id: selectedClub.id,
          venue_id: venueId,
        }),
      });
      fetchLinkedVenues(selectedClub.id);
    } catch {
      // ignore
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClub) return;
    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const res = await fetch("/api/clubs/managed", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedClub.id,
          name,
          description: description || null,
          phone: phone || null,
          email: email || null,
          website: website || null,
          address: address || null,
          member_count: memberCount ? parseInt(memberCount) : null,
          greens: greens ? parseInt(greens) : null,
          rinks: rinks ? parseInt(rinks) : null,
          facebook_url: facebookUrl || null,
          instagram_url: instagramUrl || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A2E12]/[0.03] flex items-center justify-center">
        <p className="text-[#3D5A3E]">Loading your clubs...</p>
      </div>
    );
  }

  if (clubs.length === 0) {
    return (
      <div className="min-h-screen bg-[#0A2E12]/[0.03] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-[#0A2E12]/10 bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#0A2E12]/5">
            <Building2 className="h-8 w-8 text-[#3D5A3E]" />
          </div>
          <h1 className="text-xl font-bold text-[#0A2E12]">No Clubs to Manage</h1>
          <p className="mt-2 text-sm text-[#3D5A3E]">
            You haven&apos;t claimed any clubs yet. Claim your club to manage its listing.
          </p>
          <Link
            href="/clubs/claim"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1B5E20] px-6 py-3 text-sm font-bold text-white hover:bg-[#1B5E20] transition-colors"
          >
            Claim a Club
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A2E12]/[0.03]">
      <header className="sticky top-0 z-40 border-b border-[#0A2E12]/10 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <Link
            href="/clubs"
            className="inline-flex items-center gap-1.5 text-sm text-[#3D5A3E] hover:text-[#2D4A30] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Club Directory
          </Link>
          <div className="mt-2 flex items-center justify-between">
            <h1 className="text-2xl font-black tracking-tight text-[#0A2E12]">
              My Club
            </h1>
            {selectedClub && (
              <Link
                href={`/clubs/${selectedClub.state_code.toLowerCase()}/${selectedClub.slug}`}
                className="text-sm text-[#1B5E20] hover:text-[#1B5E20] inline-flex items-center gap-1"
              >
                View Public Page <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
          {/* Club selector for multi-club managers */}
          {clubs.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {clubs.map((club) => (
                <button
                  key={club.id}
                  onClick={() => selectClub(club)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedClub?.id === club.id
                      ? "bg-[#1B5E20] text-white"
                      : "bg-[#0A2E12]/5 text-[#3D5A3E] hover:bg-[#0A2E12]/5"
                  }`}
                >
                  {club.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic Info */}
          <section className="rounded-2xl border border-[#0A2E12]/10 bg-white p-6">
            <h2 className="text-lg font-bold text-[#0A2E12] mb-4">
              Club Information
            </h2>
            <div className="space-y-4">
              <Field label="Club Name" icon={<Building2 className="h-4 w-4" />}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="input-field"
                />
              </Field>
              <Field label="Description">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Tell people about your club..."
                  className="input-field resize-none"
                />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Phone" icon={<Phone className="h-4 w-4" />}>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="input-field"
                  />
                </Field>
                <Field label="Email" icon={<Mail className="h-4 w-4" />}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="info@yourclub.com"
                    className="input-field"
                  />
                </Field>
              </div>
              <Field label="Website" icon={<Globe className="h-4 w-4" />}>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourclub.com"
                  className="input-field"
                />
              </Field>
              <Field label="Address" icon={<MapPin className="h-4 w-4" />}>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Green Lane, City, ST 12345"
                  className="input-field"
                />
              </Field>
            </div>
          </section>

          {/* Facilities */}
          <section className="rounded-2xl border border-[#0A2E12]/10 bg-white p-6">
            <h2 className="text-lg font-bold text-[#0A2E12] mb-4">
              Facilities
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Members" icon={<Users className="h-4 w-4" />}>
                <input
                  type="number"
                  value={memberCount}
                  onChange={(e) => setMemberCount(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="input-field"
                />
              </Field>
              <Field label="Greens" icon={<Leaf className="h-4 w-4" />}>
                <input
                  type="number"
                  value={greens}
                  onChange={(e) => setGreens(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="input-field"
                />
              </Field>
              <Field label="Rinks">
                <input
                  type="number"
                  value={rinks}
                  onChange={(e) => setRinks(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="input-field"
                />
              </Field>
            </div>
          </section>

          {/* Social Media */}
          <section className="rounded-2xl border border-[#0A2E12]/10 bg-white p-6">
            <h2 className="text-lg font-bold text-[#0A2E12] mb-4">
              Social Media
            </h2>
            <div className="space-y-4">
              <Field label="Facebook URL">
                <input
                  type="url"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder="https://facebook.com/yourclub"
                  className="input-field"
                />
              </Field>
              <Field label="Instagram URL">
                <input
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/yourclub"
                  className="input-field"
                />
              </Field>
            </div>
          </section>

          {/* Venue Linking */}
          <section className="rounded-2xl border border-[#0A2E12]/10 bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#0A2E12]">
                Linked Venues
              </h2>
              <button
                type="button"
                onClick={() => setShowVenueSearch(!showVenueSearch)}
                className="inline-flex items-center gap-1 rounded-lg bg-[#0A2E12]/5 px-3 py-1.5 text-xs font-medium text-[#2D4A30] hover:bg-[#0A2E12]/5 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Link Venue
              </button>
            </div>

            {showVenueSearch && (
              <div className="mb-4 rounded-xl border border-[#0A2E12]/10 bg-[#0A2E12]/[0.03] p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3D5A3E]" />
                  <input
                    type="text"
                    value={venueSearch}
                    onChange={(e) => setVenueSearch(e.target.value)}
                    placeholder="Search venues..."
                    className="w-full rounded-lg border border-[#0A2E12]/10 py-2.5 pl-10 pr-4 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
                  />
                </div>
                {venueOptions.length > 0 && (
                  <div className="mt-2 rounded-lg border border-[#0A2E12]/10 bg-white divide-y divide-[#0A2E12]/10 max-h-40 overflow-y-auto">
                    {venueOptions
                      .filter(
                        (v) => !linkedVenues.some((lv) => lv.venue_id === v.id)
                      )
                      .map((venue) => (
                        <button
                          key={venue.id}
                          type="button"
                          onClick={() => handleLinkVenue(venue)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-[#0A2E12]/[0.03] transition-colors"
                        >
                          <span className="font-medium">{venue.name}</span>
                          {venue.address && (
                            <span className="text-[#3D5A3E] text-xs block">
                              {venue.address}
                            </span>
                          )}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            )}

            {linkedVenues.length === 0 ? (
              <p className="text-sm text-[#3D5A3E]">
                No venues linked yet. Link a venue to connect your club.
              </p>
            ) : (
              <div className="space-y-2">
                {linkedVenues.map((lv) => (
                  <div
                    key={lv.id}
                    className="flex items-center justify-between rounded-xl border border-[#0A2E12]/10 bg-[#0A2E12]/[0.03] p-3"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#3D5A3E]" />
                      <div>
                        <p className="text-sm font-medium text-[#0A2E12]">
                          {lv.venue?.name ?? "Unknown Venue"}
                        </p>
                        {lv.venue?.address && (
                          <p className="text-xs text-[#3D5A3E]">
                            {lv.venue.address}
                          </p>
                        )}
                      </div>
                      {lv.is_primary && (
                        <span className="rounded-full bg-[#1B5E20]/10 px-2 py-0.5 text-xs font-bold text-[#2E7D32]">
                          PRIMARY
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUnlinkVenue(lv.venue_id)}
                      className="rounded-lg p-1.5 text-[#3D5A3E] hover:bg-[#0A2E12]/5 hover:text-[#3D5A3E] transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {saved && (
            <div className="rounded-xl border border-[#1B5E20]/15 bg-[#1B5E20]/5 p-4 text-sm text-[#2E7D32] flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Changes saved successfully!
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-[#1B5E20] py-3.5 text-sm font-bold text-white hover:bg-[#1B5E20] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>

        {/* Membership Management */}
        {selectedClub && (
          <section className="mt-8 rounded-2xl border border-[#0A2E12]/10 bg-white p-6">
            <ClubMembershipManager
              clubId={selectedClub.id}
              currentUserRole={userClubRole}
            />
          </section>
        )}
      </main>

      <style jsx>{`
        .input-field {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid #e4e4e7;
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          color: #18181b;
        }
        .input-field:focus {
          border-color: #93c5fd;
          outline: none;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }
        .input-field::placeholder {
          color: #a1a1aa;
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-medium text-[#2D4A30] mb-1.5">
        {icon && <span className="text-[#3D5A3E]">{icon}</span>}
        {label}
      </label>
      {children}
    </div>
  );
}
