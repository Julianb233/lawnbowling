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
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const AVAILABLE_SPORTS = [
  { id: "lawn_bowling", label: "Lawn Bowling" },
];

const STEPS = [
  { title: "Club Details", description: "Tell us about your club" },
  { title: "Sport", description: "Confirm your sport" },
  { title: "Rinks", description: "Set up your rinks" },
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
  const [showOptionalFields, setShowOptionalFields] = useState(false);

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
        setError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Could not connect to the server. Please check your internet and try again.");
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
    "block h-14 w-full rounded-xl border border-[#0A2E12]/10 bg-white py-4 px-4 text-lg shadow-sm transition focus:border-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20";

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FEFCF9" }}>
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="mb-8 text-center">
            <div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl shadow-md"
              style={{ backgroundColor: "#1B5E20" }}
            >
              <Building2 className="h-7 w-7 text-white" />
            </div>
            <h1
              className="text-3xl font-bold"
              style={{ fontFamily: "var(--font-display)", color: "#0A2E12" }}
            >
              Set Up Your Club
            </h1>
            <p className="mt-2 text-base" style={{ color: "#3D5A3E" }}>
              Get your club on Lawnbowling in just a few minutes
            </p>
          </div>

          {/* Step indicators */}
          <div className="mb-8 flex items-center justify-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s.title} className="flex items-center gap-2">
                <button
                  onClick={() => i < step && setStep(i)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-base font-bold transition ${
                    i < step
                      ? "text-white cursor-pointer"
                      : i === step
                        ? "text-white"
                        : "text-gray-500"
                  }`}
                  style={{
                    backgroundColor: i <= step ? "#1B5E20" : undefined,
                  }}
                  disabled={i >= step}
                >
                  {i < step ? <Check className="h-5 w-5" /> : i + 1}
                </button>
                {i < STEPS.length - 1 && (
                  <div
                    className="h-0.5 w-8"
                    style={{ backgroundColor: i < step ? "#1B5E20" : "#e5e7eb" }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step content */}
          <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-8 shadow-sm">
            <h2
              className="text-2xl font-bold mb-1"
              style={{ fontFamily: "var(--font-display)", color: "#0A2E12" }}
            >
              Step {step + 1}: {STEPS[step].title}
            </h2>
            <p className="text-base mb-6" style={{ color: "#3D5A3E" }}>
              {STEPS[step].description}
            </p>

            {/* Step 1: Venue Details */}
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <label
                    className="mb-2 block text-base font-medium"
                    style={{ color: "#0A2E12" }}
                  >
                    Club Name *
                  </label>
                  <div className="relative">
                    <Building2 className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: "#3D5A3E" }} />
                    <input
                      type="text"
                      value={venueName}
                      onChange={(e) => setVenueName(e.target.value)}
                      className={`${inputClass} pl-11`}
                      style={{ color: "#0A2E12" }}
                      placeholder="e.g. Sunset Lawn Bowling Club"
                      required
                    />
                  </div>
                </div>

                <p className="text-base italic" style={{ color: "#3D5A3E" }}>
                  You can always change this later.
                </p>

                {/* Optional fields - collapsible */}
                <button
                  type="button"
                  onClick={() => setShowOptionalFields(!showOptionalFields)}
                  className="flex w-full items-center justify-between rounded-xl border border-[#0A2E12]/10 bg-[#F0FFF4] px-4 py-4 text-base font-medium transition hover:bg-[#e8f5e9]"
                  style={{ color: "#1B5E20" }}
                >
                  <span>Add address, contact info, and more (optional)</span>
                  {showOptionalFields ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>

                {showOptionalFields && (
                  <div className="space-y-5 rounded-xl border border-[#0A2E12]/10 bg-[#FEFCF9] p-5">
                    <div>
                      <label
                        className="mb-2 block text-base font-medium"
                        style={{ color: "#0A2E12" }}
                      >
                        Address
                      </label>
                      <div className="relative">
                        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: "#3D5A3E" }} />
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className={`${inputClass} pl-11`}
                          style={{ color: "#0A2E12" }}
                          placeholder="123 Main St, Los Angeles, CA"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        className="mb-2 block text-base font-medium"
                        style={{ color: "#0A2E12" }}
                      >
                        Tagline
                      </label>
                      <input
                        type="text"
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        className={inputClass}
                        style={{ color: "#0A2E12" }}
                        placeholder="A short motto for your club"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <label
                          className="mb-2 block text-base font-medium"
                          style={{ color: "#0A2E12" }}
                        >
                          Contact Email
                        </label>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: "#3D5A3E" }} />
                          <input
                            type="email"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            className={`${inputClass} pl-11`}
                            style={{ color: "#0A2E12" }}
                            placeholder="info@club.com"
                          />
                        </div>
                      </div>
                      <div>
                        <label
                          className="mb-2 block text-base font-medium"
                          style={{ color: "#0A2E12" }}
                        >
                          Phone
                        </label>
                        <div className="relative">
                          <Phone className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: "#3D5A3E" }} />
                          <input
                            type="tel"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            className={`${inputClass} pl-11`}
                            style={{ color: "#0A2E12" }}
                            placeholder="(555) 555-5555"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label
                        className="mb-2 block text-base font-medium"
                        style={{ color: "#0A2E12" }}
                      >
                        Website
                      </label>
                      <div className="relative">
                        <Globe className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: "#3D5A3E" }} />
                        <input
                          type="url"
                          value={websiteUrl}
                          onChange={(e) => setWebsiteUrl(e.target.value)}
                          className={`${inputClass} pl-11`}
                          style={{ color: "#0A2E12" }}
                          placeholder="https://yourclub.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        className="mb-2 block text-base font-medium"
                        style={{ color: "#0A2E12" }}
                      >
                        Timezone
                      </label>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className={inputClass}
                        style={{ color: "#0A2E12" }}
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
              </div>
            )}

            {/* Step 2: Sports */}
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-base" style={{ color: "#3D5A3E" }}>
                  Select the sports available at your club.
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {AVAILABLE_SPORTS.map((sport) => (
                    <button
                      key={sport.id}
                      type="button"
                      onClick={() => toggleSport(sport.id)}
                      className={`flex items-center gap-3 rounded-xl border-2 p-5 text-left transition ${
                        selectedSports.includes(sport.id)
                          ? "border-[#1B5E20] bg-[#F0FFF4]"
                          : "border-[#0A2E12]/10 bg-white hover:border-[#0A2E12]/20"
                      }`}
                    >
                      <Trophy
                        className="h-6 w-6"
                        style={{ color: selectedSports.includes(sport.id) ? "#1B5E20" : "#3D5A3E" }}
                      />
                      <span
                        className="text-lg font-medium"
                        style={{ color: selectedSports.includes(sport.id) ? "#0A2E12" : "#3D5A3E" }}
                      >
                        {sport.label}
                      </span>
                      {selectedSports.includes(sport.id) && (
                        <Check className="ml-auto h-6 w-6" style={{ color: "#1B5E20" }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Courts */}
            {step === 2 && (
              <div className="space-y-5">
                <p className="text-base" style={{ color: "#3D5A3E" }}>
                  Add rinks for your club. You can always add more later.
                </p>

                {courts.length > 0 && (
                  <div className="space-y-2">
                    {courts.map((court, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-xl border border-[#0A2E12]/10 bg-white px-4 py-3"
                      >
                        <div>
                          <span className="text-base font-medium" style={{ color: "#0A2E12" }}>
                            {court.name}
                          </span>
                          <span className="ml-2 text-sm capitalize" style={{ color: "#3D5A3E" }}>
                            {court.sport.replace("_", " ")}
                          </span>
                        </div>
                        <button
                          onClick={() => removeCourt(i)}
                          className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                          <X className="h-5 w-5" />
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
                    style={{ color: "#0A2E12" }}
                    placeholder="Rink name (e.g., Rink 1)"
                    onKeyDown={(e) => e.key === "Enter" && addCourt()}
                  />
                  <select
                    value={newCourtSport}
                    onChange={(e) => setNewCourtSport(e.target.value)}
                    className={`${inputClass} w-44`}
                    style={{ color: "#0A2E12" }}
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
                    className="h-14 w-14 shrink-0 rounded-xl text-white"
                    style={{ backgroundColor: "#1B5E20" }}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>

                {courts.length === 0 && (
                  <p className="text-base italic" style={{ color: "#3D5A3E" }}>
                    No rinks added yet. You can skip this step and add rinks later from the admin panel.
                  </p>
                )}
              </div>
            )}

            {/* Step 4: Invite Staff */}
            {step === 3 && (
              <div className="space-y-5">
                <p className="text-base" style={{ color: "#3D5A3E" }}>
                  Invite staff members to help manage your club. They will
                  receive an email with instructions.
                </p>

                {invitations.length > 0 && (
                  <div className="space-y-2">
                    {invitations.map((inv, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-xl border border-[#0A2E12]/10 bg-white px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5" style={{ color: "#3D5A3E" }} />
                          <span className="text-base" style={{ color: "#0A2E12" }}>
                            {inv.email}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-medium ${
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
                          className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: "#3D5A3E" }} />
                    <input
                      type="email"
                      value={newInviteEmail}
                      onChange={(e) => setNewInviteEmail(e.target.value)}
                      className={`${inputClass} pl-11`}
                      style={{ color: "#0A2E12" }}
                      placeholder="staff@club.com"
                      onKeyDown={(e) => e.key === "Enter" && addInvite()}
                    />
                  </div>
                  <select
                    value={newInviteRole}
                    onChange={(e) =>
                      setNewInviteRole(e.target.value as "admin" | "staff")
                    }
                    className={`${inputClass} w-32`}
                    style={{ color: "#0A2E12" }}
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                  <Button
                    onClick={addInvite}
                    disabled={!newInviteEmail.trim()}
                    size="icon"
                    className="h-14 w-14 shrink-0 rounded-xl text-white"
                    style={{ backgroundColor: "#1B5E20" }}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>

                {invitations.length === 0 && (
                  <p className="text-base italic" style={{ color: "#3D5A3E" }}>
                    No invitations yet. You can skip this and invite staff later.
                  </p>
                )}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-4 rounded-xl bg-red-50 px-4 py-4 text-base text-red-700">
                {error}
              </div>
            )}

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={prev}
                disabled={step === 0}
                className="flex items-center gap-1 rounded-xl px-5 py-4 text-base font-medium transition disabled:opacity-30"
                style={{ color: "#3D5A3E" }}
              >
                <ChevronLeft className="h-5 w-5" />
                Back
              </button>

              <button
                onClick={next}
                disabled={!canProceed() || submitting}
                className="flex items-center gap-1 rounded-xl px-8 py-4 text-lg font-semibold text-white shadow-md transition hover:brightness-110 disabled:opacity-50 active:scale-[0.98]"
                style={{ backgroundColor: "#1B5E20" }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating club...
                  </>
                ) : step === STEPS.length - 1 ? (
                  <>
                    Create Club
                    <Check className="ml-1 h-5 w-5" />
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight className="ml-1 h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Skip link */}
          {(step === 2 || step === 3) && (
            <p className="mt-4 text-center text-base" style={{ color: "#3D5A3E" }}>
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
