"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Building2,
  MapPin,
  Mail,
  Phone,
  Globe,
  ChevronRight,
  ChevronLeft,
  Plus,
  X,
  Trophy,
  Users,
  Check,
  Loader2,
} from "lucide-react";

const AVAILABLE_SPORTS = [
  { id: "lawn_bowling", label: "Lawn Bowling" },
];

const STEPS = [
  { title: "Club Details", description: "Tell us about your club" },
  { title: "Sport", description: "Confirm your sport" },
  { title: "Rinks", description: "Configure your rinks" },
  { title: "Invite Staff", description: "Add your team (optional)" },
];

interface CourtEntry {
  name: string;
  sport: string;
}

interface InviteEntry {
  email: string;
  role: "admin" | "staff";
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Venue details
  const [venueName, setVenueName] = useState("");
  const [address, setAddress] = useState("");
  const [timezone, setTimezone] = useState("America/Los_Angeles");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [tagline, setTagline] = useState("");

  // Step 2: Sports
  const [selectedSports, setSelectedSports] = useState<string[]>([]);

  // Step 3: Courts
  const [courts, setCourts] = useState<CourtEntry[]>([]);
  const [newCourtName, setNewCourtName] = useState("");
  const [newCourtSport, setNewCourtSport] = useState("");

  // Step 4: Invitations
  const [invitations, setInvitations] = useState<InviteEntry[]>([]);
  const [newInviteEmail, setNewInviteEmail] = useState("");
  const [newInviteRole, setNewInviteRole] = useState<"admin" | "staff">(
    "staff"
  );

  const toggleSport = (sportId: string) => {
    setSelectedSports((prev) =>
      prev.includes(sportId)
        ? prev.filter((s) => s !== sportId)
        : [...prev, sportId]
    );
  };

  const addCourt = () => {
    if (!newCourtName.trim() || !newCourtSport) return;
    setCourts((prev) => [
      ...prev,
      { name: newCourtName.trim(), sport: newCourtSport },
    ]);
    setNewCourtName("");
  };

  const removeCourt = (index: number) => {
    setCourts((prev) => prev.filter((_, i) => i !== index));
  };

  const addInvite = () => {
    if (!newInviteEmail.trim()) return;
    if (invitations.some((inv) => inv.email === newInviteEmail.trim().toLowerCase())) return;
    setInvitations((prev) => [
      ...prev,
      { email: newInviteEmail.trim().toLowerCase(), role: newInviteRole },
    ]);
    setNewInviteEmail("");
  };

  const removeInvite = (index: number) => {
    setInvitations((prev) => prev.filter((_, i) => i !== index));
  };

  const canProceed = () => {
    if (step === 0) return venueName.trim().length > 0;
    if (step === 1) return selectedSports.length > 0;
    return true; // Courts and invitations are optional
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venue: {
            name: venueName.trim(),
            address: address.trim() || undefined,
            timezone,
            sports: selectedSports,
            contact_email: contactEmail.trim() || undefined,
            contact_phone: contactPhone.trim() || undefined,
            website_url: websiteUrl.trim() || undefined,
            tagline: tagline.trim() || undefined,
          },
          courts: courts.length > 0 ? courts : undefined,
          invitations: invitations.length > 0 ? invitations : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong");
        setSubmitting(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else handleSubmit();
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  const inputClass =
    "block w-full rounded-xl border border-gray-200 bg-white/70 py-3 px-4 text-gray-900 placeholder-gray-400 shadow-sm backdrop-blur transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

  return (
    <div className="landing-gradient min-h-screen">
      {/* Decorative blurred circles */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 shadow-lg shadow-emerald-500/20">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Set Up Your Club
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Get your club on Lawnbowling in minutes
            </p>
          </div>

          {/* Step indicators */}
          <div className="mb-8 flex items-center justify-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s.title} className="flex items-center gap-2">
                <button
                  onClick={() => i < step && setStep(i)}
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                    i < step
                      ? "bg-emerald-500 text-white cursor-pointer"
                      : i === step
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-200 text-gray-500"
                  }`}
                  disabled={i >= step}
                >
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </button>
                {i < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 w-8 ${i < step ? "bg-emerald-500" : "bg-gray-200"}`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step content */}
          <div className="glass-card-light p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              {STEPS[step].title}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {STEPS[step].description}
            </p>

            {/* Step 1: Venue Details */}
            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Club Name *
                  </label>
                  <div className="relative">
                    <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={venueName}
                      onChange={(e) => setVenueName(e.target.value)}
                      className={`${inputClass} pl-10`}
                      placeholder="Sunset Lawn Bowling Club"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className={`${inputClass} pl-10`}
                      placeholder="123 Main St, Los Angeles, CA"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className={inputClass}
                    placeholder="Find your perfect partner"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Contact Email
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className={`${inputClass} pl-10`}
                        placeholder="info@venue.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className={`${inputClass} pl-10`}
                        placeholder="(555) 555-5555"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Website
                  </label>
                  <div className="relative">
                    <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      className={`${inputClass} pl-10`}
                      placeholder="https://venue.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Timezone
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className={inputClass}
                  >
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Anchorage">Alaska Time</option>
                    <option value="Pacific/Honolulu">Hawaii Time</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: Sports */}
            {step === 1 && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Select all sports available at your venue.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {AVAILABLE_SPORTS.map((sport) => (
                    <button
                      key={sport.id}
                      type="button"
                      onClick={() => toggleSport(sport.id)}
                      className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition ${
                        selectedSports.includes(sport.id)
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <Trophy
                        className={`h-5 w-5 ${selectedSports.includes(sport.id) ? "text-emerald-600" : "text-gray-400"}`}
                      />
                      <span
                        className={`text-sm font-medium ${selectedSports.includes(sport.id) ? "text-emerald-900" : "text-gray-700"}`}
                      >
                        {sport.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Courts */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Add rinks for your club. You can always add more
                  later.
                </p>

                {courts.length > 0 && (
                  <div className="space-y-2">
                    {courts.map((court, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-2"
                      >
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            {court.name}
                          </span>
                          <span className="ml-2 text-xs text-gray-500 capitalize">
                            {court.sport.replace("_", " ")}
                          </span>
                        </div>
                        <button
                          onClick={() => removeCourt(i)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCourtName}
                    onChange={(e) => setNewCourtName(e.target.value)}
                    className={`${inputClass} flex-1`}
                    placeholder="Rink name (e.g., Rink 1)"
                    onKeyDown={(e) => e.key === "Enter" && addCourt()}
                  />
                  <select
                    value={newCourtSport}
                    onChange={(e) => setNewCourtSport(e.target.value)}
                    className={`${inputClass} w-40`}
                  >
                    <option value="">Sport</option>
                    {selectedSports.map((s) => (
                      <option key={s} value={s}>
                        {AVAILABLE_SPORTS.find((sp) => sp.id === s)?.label || s}
                      </option>
                    ))}
                  </select>
                  <Button
                    onClick={addCourt}
                    disabled={!newCourtName.trim() || !newCourtSport}
                    size="icon"
                    className="shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {courts.length === 0 && (
                  <p className="text-xs text-gray-400 italic">
                    No rinks added yet. You can skip this and add rinks later
                    from the admin panel.
                  </p>
                )}
              </div>
            )}

            {/* Step 4: Invite Staff */}
            {step === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Invite staff members to help manage your venue. They&apos;ll
                  receive an email with instructions.
                </p>

                {invitations.length > 0 && (
                  <div className="space-y-2">
                    {invitations.map((inv, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {inv.email}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              inv.role === "admin"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {inv.role}
                          </span>
                        </div>
                        <button
                          onClick={() => removeInvite(i)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={newInviteEmail}
                      onChange={(e) => setNewInviteEmail(e.target.value)}
                      className={`${inputClass} pl-10`}
                      placeholder="staff@venue.com"
                      onKeyDown={(e) => e.key === "Enter" && addInvite()}
                    />
                  </div>
                  <select
                    value={newInviteRole}
                    onChange={(e) =>
                      setNewInviteRole(e.target.value as "admin" | "staff")
                    }
                    className={`${inputClass} w-28`}
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                  <Button
                    onClick={addInvite}
                    disabled={!newInviteEmail.trim()}
                    size="icon"
                    className="shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {invitations.length === 0 && (
                  <p className="text-xs text-gray-400 italic">
                    No invitations yet. You can skip this and invite staff later.
                  </p>
                )}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={prev}
                disabled={step === 0}
                className="text-gray-500"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </Button>

              <Button
                onClick={next}
                disabled={!canProceed() || submitting}
                className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:brightness-110"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating club...
                  </>
                ) : step === STEPS.length - 1 ? (
                  <>
                    Create Club
                    <Check className="ml-1 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Skip link */}
          {(step === 2 || step === 3) && (
            <p className="mt-4 text-center text-xs text-gray-400">
              {step === 2
                ? "You can add rinks later from the admin dashboard"
                : "You can invite staff later from the admin dashboard"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
