"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  Users,
} from "lucide-react";

type Step = "venue" | "courts" | "invites" | "review";

const STEPS: { key: Step; label: string }[] = [
  { key: "venue", label: "Venue Details" },
  { key: "courts", label: "Courts & Greens" },
  { key: "invites", label: "Invite Staff" },
  { key: "review", label: "Review & Launch" },
];

interface CourtEntry {
  name: string;
  sport: string;
}

interface InviteEntry {
  email: string;
  role: "admin" | "staff";
}

export default function VenueOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("venue");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Venue details
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [timezone, setTimezone] = useState("America/Los_Angeles");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [tagline, setTagline] = useState("");
  const [sports, setSports] = useState<string[]>(["lawn_bowling"]);

  // Courts
  const [courts, setCourts] = useState<CourtEntry[]>([
    { name: "Green 1", sport: "lawn_bowling" },
  ]);

  // Invitations
  const [invites, setInvites] = useState<InviteEntry[]>([]);

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  function canProceed(): boolean {
    if (step === "venue") return name.trim().length > 0;
    return true;
  }

  function goNext() {
    const nextStep = STEPS[stepIndex + 1];
    if (nextStep) setStep(nextStep.key);
  }

  function goBack() {
    const prevStep = STEPS[stepIndex - 1];
    if (prevStep) setStep(prevStep.key);
  }

  function addCourt() {
    setCourts((prev) => [
      ...prev,
      { name: `Green ${prev.length + 1}`, sport: "lawn_bowling" },
    ]);
  }

  function removeCourt(index: number) {
    setCourts((prev) => prev.filter((_, i) => i !== index));
  }

  function updateCourt(index: number, field: keyof CourtEntry, value: string) {
    setCourts((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  }

  function addInvite() {
    setInvites((prev) => [...prev, { email: "", role: "staff" }]);
  }

  function removeInvite(index: number) {
    setInvites((prev) => prev.filter((_, i) => i !== index));
  }

  function updateInvite(
    index: number,
    field: keyof InviteEntry,
    value: string
  ) {
    setInvites((prev) =>
      prev.map((inv, i) => (i === index ? { ...inv, [field]: value } : inv))
    );
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venue: {
            name: name.trim(),
            address: address.trim() || undefined,
            timezone,
            sports,
            contact_email: contactEmail.trim() || undefined,
            contact_phone: contactPhone.trim() || undefined,
            website_url: websiteUrl.trim() || undefined,
            tagline: tagline.trim() || undefined,
          },
          courts: courts.filter((c) => c.name.trim()),
          invitations: invites.filter((inv) => inv.email.trim()),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create venue");
      }

      setSuccess(true);
      setTimeout(() => router.push("/admin"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FEFCF9] px-6">
        <CheckCircle2 className="h-16 w-16 text-[#1B5E20] mb-4" />
        <h1
          className="text-2xl font-bold text-[#0A2E12] mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Venue Created!
        </h1>
        <p className="text-[#3D5A3E]">
          Redirecting to your admin dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FEFCF9]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#0A2E12]/10 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo/bowls-icon.png"
              alt="Lawnbowling"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span
              className="text-lg font-bold text-[#0A2E12]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Set Up Your Venue
            </span>
          </div>
          <span className="text-xs text-[#3D5A3E]">
            Step {stepIndex + 1} of {STEPS.length}
          </span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="mx-auto max-w-2xl px-4 pt-4">
        <div className="flex gap-1.5">
          {STEPS.map((s, i) => (
            <div
              key={s.key}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= stepIndex ? "bg-[#1B5E20]" : "bg-[#0A2E12]/10"
              }`}
            />
          ))}
        </div>
        <p className="mt-2 text-xs font-medium text-[#3D5A3E]">
          {STEPS[stepIndex].label}
        </p>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-2xl px-4 py-6">
        {step === "venue" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5">
              <label className="mb-1 block text-sm font-medium text-[#0A2E12]">
                <Building2 className="mr-1.5 inline h-4 w-4" />
                Venue Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Balboa Park Lawn Bowling Club"
                className="w-full rounded-lg border border-[#0A2E12]/10 bg-[#0A2E12]/5 px-3 py-2.5 text-[#0A2E12] placeholder:text-[#3D5A3E]/50 focus:border-[#1B5E20] focus:outline-none"
              />
            </div>

            <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5">
              <label className="mb-1 block text-sm font-medium text-[#0A2E12]">
                <MapPin className="mr-1.5 inline h-4 w-4" />
                Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St, San Diego, CA"
                className="w-full rounded-lg border border-[#0A2E12]/10 bg-[#0A2E12]/5 px-3 py-2.5 text-[#0A2E12] placeholder:text-[#3D5A3E]/50 focus:border-[#1B5E20] focus:outline-none"
              />
            </div>

            <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5">
              <label className="mb-1 block text-sm font-medium text-[#0A2E12]">
                Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="A welcoming place to roll"
                className="w-full rounded-lg border border-[#0A2E12]/10 bg-[#0A2E12]/5 px-3 py-2.5 text-[#0A2E12] placeholder:text-[#3D5A3E]/50 focus:border-[#1B5E20] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5">
                <label className="mb-1 block text-sm font-medium text-[#0A2E12]">
                  <Mail className="mr-1.5 inline h-4 w-4" />
                  Contact Email
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="info@yourclub.com"
                  className="w-full rounded-lg border border-[#0A2E12]/10 bg-[#0A2E12]/5 px-3 py-2.5 text-[#0A2E12] placeholder:text-[#3D5A3E]/50 focus:border-[#1B5E20] focus:outline-none"
                />
              </div>

              <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5">
                <label className="mb-1 block text-sm font-medium text-[#0A2E12]">
                  <Phone className="mr-1.5 inline h-4 w-4" />
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="(858) 555-0100"
                  className="w-full rounded-lg border border-[#0A2E12]/10 bg-[#0A2E12]/5 px-3 py-2.5 text-[#0A2E12] placeholder:text-[#3D5A3E]/50 focus:border-[#1B5E20] focus:outline-none"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5">
              <label className="mb-1 block text-sm font-medium text-[#0A2E12]">
                <Globe className="mr-1.5 inline h-4 w-4" />
                Website
              </label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://yourclub.com"
                className="w-full rounded-lg border border-[#0A2E12]/10 bg-[#0A2E12]/5 px-3 py-2.5 text-[#0A2E12] placeholder:text-[#3D5A3E]/50 focus:border-[#1B5E20] focus:outline-none"
              />
            </div>

            <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5">
              <label className="mb-1 block text-sm font-medium text-[#0A2E12]">
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full rounded-lg border border-[#0A2E12]/10 bg-[#0A2E12]/5 px-3 py-2.5 text-[#0A2E12] focus:border-[#1B5E20] focus:outline-none"
              >
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Phoenix">Arizona (no DST)</option>
                <option value="Pacific/Honolulu">Hawaii</option>
                <option value="Australia/Sydney">Australia/Sydney</option>
                <option value="Australia/Melbourne">Australia/Melbourne</option>
                <option value="Australia/Brisbane">Australia/Brisbane</option>
                <option value="Australia/Perth">Australia/Perth</option>
                <option value="Pacific/Auckland">New Zealand</option>
                <option value="Europe/London">London</option>
              </select>
            </div>
          </div>
        )}

        {step === "courts" && (
          <div className="space-y-4">
            <p className="text-sm text-[#3D5A3E]">
              Add the greens and courts at your venue. You can always add more
              later from the admin dashboard.
            </p>

            {courts.map((court, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-2xl border border-[#0A2E12]/10 bg-white p-4"
              >
                <div className="flex-1">
                  <input
                    type="text"
                    value={court.name}
                    onChange={(e) => updateCourt(i, "name", e.target.value)}
                    placeholder="Court name"
                    className="w-full rounded-lg border border-[#0A2E12]/10 bg-[#0A2E12]/5 px-3 py-2 text-[#0A2E12] placeholder:text-[#3D5A3E]/50 focus:border-[#1B5E20] focus:outline-none"
                  />
                </div>
                <select
                  value={court.sport}
                  onChange={(e) => updateCourt(i, "sport", e.target.value)}
                  className="rounded-lg border border-[#0A2E12]/10 bg-[#0A2E12]/5 px-3 py-2 text-sm text-[#0A2E12] focus:border-[#1B5E20] focus:outline-none"
                >
                  <option value="lawn_bowling">Lawn Bowling</option>
                </select>
                {courts.length > 1 && (
                  <button
                    onClick={() => removeCourt(i)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 min-h-[44px] min-w-[44px]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}

            <button
              onClick={addCourt}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#0A2E12]/20 px-4 py-3 text-sm font-medium text-[#3D5A3E] transition hover:border-[#1B5E20] hover:text-[#1B5E20] min-h-[44px]"
            >
              <Plus className="h-4 w-4" />
              Add Another Court
            </button>
          </div>
        )}

        {step === "invites" && (
          <div className="space-y-4">
            <p className="text-sm text-[#3D5A3E]">
              Invite staff members to help manage your venue. They&apos;ll
              receive an email with instructions to join. You can skip this step
              and invite people later.
            </p>

            {invites.map((inv, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-2xl border border-[#0A2E12]/10 bg-white p-4"
              >
                <div className="flex-1">
                  <input
                    type="email"
                    value={inv.email}
                    onChange={(e) => updateInvite(i, "email", e.target.value)}
                    placeholder="staff@email.com"
                    className="w-full rounded-lg border border-[#0A2E12]/10 bg-[#0A2E12]/5 px-3 py-2 text-[#0A2E12] placeholder:text-[#3D5A3E]/50 focus:border-[#1B5E20] focus:outline-none"
                  />
                </div>
                <select
                  value={inv.role}
                  onChange={(e) => updateInvite(i, "role", e.target.value)}
                  className="rounded-lg border border-[#0A2E12]/10 bg-[#0A2E12]/5 px-3 py-2 text-sm text-[#0A2E12] focus:border-[#1B5E20] focus:outline-none"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  onClick={() => removeInvite(i)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 min-h-[44px] min-w-[44px]"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}

            <button
              onClick={addInvite}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#0A2E12]/20 px-4 py-3 text-sm font-medium text-[#3D5A3E] transition hover:border-[#1B5E20] hover:text-[#1B5E20] min-h-[44px]"
            >
              <Users className="h-4 w-4" />
              Add Staff Member
            </button>

            {invites.length === 0 && (
              <div className="rounded-2xl border border-[#0A2E12]/10 bg-[#0A2E12]/5 p-5 text-center">
                <p className="text-sm text-[#3D5A3E]">
                  No staff invitations yet. You can always invite people later
                  from the admin dashboard.
                </p>
              </div>
            )}
          </div>
        )}

        {step === "review" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5">
              <h3
                className="text-sm font-semibold text-[#0A2E12] mb-3"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Venue
              </h3>
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[#3D5A3E]">Name</dt>
                  <dd className="font-medium text-[#0A2E12]">{name}</dd>
                </div>
                {address && (
                  <div className="flex justify-between">
                    <dt className="text-[#3D5A3E]">Address</dt>
                    <dd className="font-medium text-[#0A2E12]">{address}</dd>
                  </div>
                )}
                {tagline && (
                  <div className="flex justify-between">
                    <dt className="text-[#3D5A3E]">Tagline</dt>
                    <dd className="font-medium text-[#0A2E12]">{tagline}</dd>
                  </div>
                )}
                {contactEmail && (
                  <div className="flex justify-between">
                    <dt className="text-[#3D5A3E]">Email</dt>
                    <dd className="font-medium text-[#0A2E12]">
                      {contactEmail}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5">
              <h3
                className="text-sm font-semibold text-[#0A2E12] mb-3"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Courts ({courts.filter((c) => c.name.trim()).length})
              </h3>
              <ul className="space-y-1 text-sm">
                {courts
                  .filter((c) => c.name.trim())
                  .map((c, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-[#0A2E12]"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#1B5E20]" />
                      {c.name}{" "}
                      <span className="text-xs text-[#3D5A3E]">
                        ({c.sport.replace("_", " ")})
                      </span>
                    </li>
                  ))}
              </ul>
            </div>

            {invites.filter((inv) => inv.email.trim()).length > 0 && (
              <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5">
                <h3
                  className="text-sm font-semibold text-[#0A2E12] mb-3"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Staff Invitations (
                  {invites.filter((inv) => inv.email.trim()).length})
                </h3>
                <ul className="space-y-1 text-sm">
                  {invites
                    .filter((inv) => inv.email.trim())
                    .map((inv, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between text-[#0A2E12]"
                      >
                        <span>{inv.email}</span>
                        <span className="rounded-full bg-[#0A2E12]/10 px-2 py-0.5 text-xs capitalize">
                          {inv.role}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="mt-8 flex items-center justify-between">
          {stepIndex > 0 ? (
            <button
              onClick={goBack}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium text-[#3D5A3E] transition hover:bg-[#0A2E12]/5 min-h-[44px]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step === "review" ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-[#1B5E20] px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[#145218] disabled:opacity-50 min-h-[44px]"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Launch Venue
                  <CheckCircle2 className="h-4 w-4" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={goNext}
              disabled={!canProceed()}
              className="flex items-center gap-1.5 rounded-xl bg-[#1B5E20] px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[#145218] disabled:opacity-50 min-h-[44px]"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
