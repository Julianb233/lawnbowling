"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  MapPin,
  Globe,
  Phone,
  Mail,
  Users,
  Leaf,
  CheckCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Step = "info" | "location" | "facilities" | "review";

const STEPS: { key: Step; label: string }[] = [
  { key: "info", label: "Club Info" },
  { key: "location", label: "Location" },
  { key: "facilities", label: "Facilities" },
  { key: "review", label: "Review" },
];

const SURFACE_OPTIONS = [
  { value: "natural_grass", label: "Natural Grass" },
  { value: "synthetic", label: "Synthetic" },
  { value: "hybrid", label: "Hybrid" },
  { value: "unknown", label: "Not Sure" },
];

const ACTIVITY_OPTIONS = [
  "Social Bowls",
  "League/Pennant",
  "Tournaments",
  "Barefoot Bowls",
  "Corporate Events",
  "Coaching/Lessons",
  "Junior Programs",
  "Open Days",
];

const US_STATES = [
  { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" }, { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" }, { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" }, { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" }, { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" }, { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" }, { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" }, { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" }, { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" }, { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" }, { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" }, { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" }, { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" }, { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" }, { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" }, { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" }, { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" }, { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" }, { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" }, { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" }, { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" }, { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" }, { code: "WY", name: "Wyoming" },
  { code: "DC", name: "Washington DC" },
];

function getRegion(stateCode: string): string {
  const west = ["AK", "AZ", "CA", "CO", "HI", "ID", "MT", "NM", "NV", "OR", "UT", "WA", "WY"];
  const south = ["AL", "AR", "FL", "GA", "KY", "LA", "MS", "NC", "OK", "SC", "TN", "TX"];
  const midwest = ["IA", "IL", "IN", "KS", "MI", "MN", "MO", "ND", "NE", "OH", "SD", "WI"];
  if (west.includes(stateCode)) return "west";
  if (south.includes(stateCode)) return "south";
  if (midwest.includes(stateCode)) return "midwest";
  return "east";
}

export default function ClubOnboardPage() {
  const [step, setStep] = useState<Step>("info");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [city, setCity] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [address, setAddress] = useState("");
  const [memberCount, setMemberCount] = useState("");
  const [greens, setGreens] = useState("");
  const [rinks, setRinks] = useState("");
  const [surfaceType, setSurfaceType] = useState("unknown");
  const [activities, setActivities] = useState<string[]>([]);
  const [roleAtClub, setRoleAtClub] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
    });
  }, []);

  const currentIndex = STEPS.findIndex((s) => s.key === step);

  function goNext() {
    if (currentIndex < STEPS.length - 1) {
      setStep(STEPS[currentIndex + 1].key);
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      setStep(STEPS[currentIndex - 1].key);
    }
  }

  function toggleActivity(activity: string) {
    setActivities((prev) =>
      prev.includes(activity)
        ? prev.filter((a) => a !== activity)
        : [...prev, activity]
    );
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");

    const state = US_STATES.find((s) => s.code === stateCode);

    try {
      const res = await fetch("/api/clubs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || null,
          phone: phone || null,
          email: email || null,
          website: website || null,
          city,
          state: state?.name || "",
          state_code: stateCode,
          region: getRegion(stateCode),
          address: address || null,
          member_count: memberCount ? parseInt(memberCount) : null,
          greens: greens ? parseInt(greens) : null,
          rinks: rinks ? parseInt(rinks) : null,
          surface_type: surfaceType,
          activities,
          status: "unverified",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to register club");
        return;
      }

      // Also submit a claim for this new club
      if (data.club?.id) {
        await fetch("/api/clubs/claims", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            club_id: data.club.id,
            role_at_club: roleAtClub || "Club Manager",
            message: "Registered this club through the onboarding flow.",
          }),
        });
      }

      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-zinc-200 bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-xl font-bold text-zinc-900">Club Registered!</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Your club <strong>{name}</strong> has been registered and a management
            claim has been submitted. An admin will review and verify your listing.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/clubs"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-bold text-white hover:bg-zinc-800 transition-colors"
            >
              View Club Directory
            </Link>
            <Link
              href="/clubs/manage"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-6 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              Go to Club Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <Link
            href="/clubs"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Club Directory
          </Link>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-zinc-900">
            Register Your Club
          </h1>
          <p className="text-sm text-zinc-500">
            Add your lawn bowling club to the directory
          </p>

          {/* Step indicator */}
          <div className="mt-4 flex gap-2">
            {STEPS.map((s, i) => (
              <button
                key={s.key}
                onClick={() => setStep(s.key)}
                className={`flex-1 rounded-full py-1.5 text-xs font-medium transition-colors ${
                  i <= currentIndex
                    ? "bg-emerald-500 text-white"
                    : "bg-zinc-100 text-zinc-400"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {isLoggedIn === false && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
            <p className="text-sm font-medium text-amber-800">
              You need to be logged in to register a club.
            </p>
            <Link
              href="/login"
              className="mt-3 inline-flex rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-700 transition-colors"
            >
              Log In
            </Link>
          </div>
        )}

        {/* Step 1: Club Info */}
        {step === "info" && (
          <div className="space-y-6">
            <section className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="text-lg font-bold text-zinc-900 mb-4">
                Basic Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 mb-1.5">
                    <Building2 className="h-4 w-4 text-zinc-400" />
                    Club Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Springfield Lawn Bowling Club"
                    required
                    className="w-full rounded-xl border border-zinc-200 py-3 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-700 mb-1.5 block">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Tell people about your club..."
                    className="w-full rounded-xl border border-zinc-200 py-3 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-700 mb-1.5 block">
                    Your Role at the Club
                  </label>
                  <select
                    value={roleAtClub}
                    onChange={(e) => setRoleAtClub(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 py-3 px-4 text-sm text-zinc-900 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Select your role...</option>
                    <option value="President">President</option>
                    <option value="Vice President">Vice President</option>
                    <option value="Secretary">Secretary</option>
                    <option value="Treasurer">Treasurer</option>
                    <option value="Board Member">Board Member</option>
                    <option value="Club Manager">Club Manager</option>
                    <option value="Head Coach">Head Coach</option>
                    <option value="Member">Member</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="text-lg font-bold text-zinc-900 mb-4">Contact</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 mb-1.5">
                      <Phone className="h-4 w-4 text-zinc-400" />
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                      className="w-full rounded-xl border border-zinc-200 py-3 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 mb-1.5">
                      <Mail className="h-4 w-4 text-zinc-400" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="info@yourclub.com"
                      className="w-full rounded-xl border border-zinc-200 py-3 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 mb-1.5">
                    <Globe className="h-4 w-4 text-zinc-400" />
                    Website
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yourclub.com"
                    className="w-full rounded-xl border border-zinc-200 py-3 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </section>

            <div className="flex justify-end">
              <button
                onClick={goNext}
                disabled={!name}
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-bold text-white hover:bg-zinc-800 disabled:opacity-50 transition-colors"
              >
                Next: Location
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {step === "location" && (
          <div className="space-y-6">
            <section className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="text-lg font-bold text-zinc-900 mb-4">
                Location
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-zinc-700 mb-1.5 block">
                      City *
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. San Francisco"
                      required
                      className="w-full rounded-xl border border-zinc-200 py-3 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-zinc-700 mb-1.5 block">
                      State *
                    </label>
                    <select
                      value={stateCode}
                      onChange={(e) => setStateCode(e.target.value)}
                      required
                      className="w-full rounded-xl border border-zinc-200 py-3 px-4 text-sm text-zinc-900 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="">Select state...</option>
                      {US_STATES.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 mb-1.5">
                    <MapPin className="h-4 w-4 text-zinc-400" />
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Green Lane"
                    className="w-full rounded-xl border border-zinc-200 py-3 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </section>

            <div className="flex justify-between">
              <button
                onClick={goPrev}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-6 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                onClick={goNext}
                disabled={!city || !stateCode}
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-bold text-white hover:bg-zinc-800 disabled:opacity-50 transition-colors"
              >
                Next: Facilities
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Facilities */}
        {step === "facilities" && (
          <div className="space-y-6">
            <section className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="text-lg font-bold text-zinc-900 mb-4">
                Facilities
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 mb-1.5">
                    <Users className="h-4 w-4 text-zinc-400" />
                    Members
                  </label>
                  <input
                    type="number"
                    value={memberCount}
                    onChange={(e) => setMemberCount(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full rounded-xl border border-zinc-200 py-3 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 mb-1.5">
                    <Leaf className="h-4 w-4 text-zinc-400" />
                    Greens
                  </label>
                  <input
                    type="number"
                    value={greens}
                    onChange={(e) => setGreens(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full rounded-xl border border-zinc-200 py-3 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-700 mb-1.5 block">
                    Rinks
                  </label>
                  <input
                    type="number"
                    value={rinks}
                    onChange={(e) => setRinks(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full rounded-xl border border-zinc-200 py-3 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="text-lg font-bold text-zinc-900 mb-4">
                Surface Type
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SURFACE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSurfaceType(opt.value)}
                    className={`rounded-xl border py-2.5 px-3 text-sm font-medium transition-colors ${
                      surfaceType === opt.value
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="text-lg font-bold text-zinc-900 mb-4">
                Activities Offered
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {ACTIVITY_OPTIONS.map((activity) => (
                  <button
                    key={activity}
                    type="button"
                    onClick={() => toggleActivity(activity)}
                    className={`rounded-xl border py-2.5 px-3 text-sm font-medium text-left transition-colors ${
                      activities.includes(activity)
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                    }`}
                  >
                    {activity}
                  </button>
                ))}
              </div>
            </section>

            <div className="flex justify-between">
              <button
                onClick={goPrev}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-6 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                onClick={goNext}
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-bold text-white hover:bg-zinc-800 transition-colors"
              >
                Review
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === "review" && (
          <div className="space-y-6">
            <section className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="text-lg font-bold text-zinc-900 mb-4">
                Review Your Club
              </h2>

              <div className="space-y-4 divide-y divide-zinc-100">
                <div className="pb-4">
                  <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">
                    Club Name
                  </p>
                  <p className="text-sm font-bold text-zinc-900">{name}</p>
                </div>

                {description && (
                  <div className="pt-4 pb-4">
                    <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">
                      Description
                    </p>
                    <p className="text-sm text-zinc-700">{description}</p>
                  </div>
                )}

                <div className="pt-4 pb-4">
                  <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">
                    Location
                  </p>
                  <p className="text-sm text-zinc-700">
                    {city},{" "}
                    {US_STATES.find((s) => s.code === stateCode)?.name || stateCode}
                    {address && <span className="block text-zinc-500">{address}</span>}
                  </p>
                </div>

                {(phone || email || website) && (
                  <div className="pt-4 pb-4">
                    <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">
                      Contact
                    </p>
                    <div className="text-sm text-zinc-700 space-y-1">
                      {phone && <p>{phone}</p>}
                      {email && <p>{email}</p>}
                      {website && <p>{website}</p>}
                    </div>
                  </div>
                )}

                {(memberCount || greens || rinks) && (
                  <div className="pt-4 pb-4">
                    <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">
                      Facilities
                    </p>
                    <div className="flex gap-4 text-sm text-zinc-700">
                      {memberCount && <span>{memberCount} members</span>}
                      {greens && <span>{greens} greens</span>}
                      {rinks && <span>{rinks} rinks</span>}
                    </div>
                    <p className="text-sm text-zinc-500 mt-1">
                      Surface:{" "}
                      {SURFACE_OPTIONS.find((s) => s.value === surfaceType)?.label}
                    </p>
                  </div>
                )}

                {activities.length > 0 && (
                  <div className="pt-4">
                    <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                      Activities
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {activities.map((a) => (
                        <span
                          key={a}
                          className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={goPrev}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-6 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={
                  submitting || !name || !city || !stateCode || isLoggedIn === false
                }
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-3 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors"
              >
                {submitting ? "Registering..." : "Register Club"}
              </button>
            </div>

            <p className="text-center text-xs text-zinc-400">
              New clubs are listed as &quot;unverified&quot; until reviewed by
              our team.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
