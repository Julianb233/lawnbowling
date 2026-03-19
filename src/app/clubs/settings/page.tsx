"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Save,
  Image,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Loader2,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { STORAGE_BUCKETS } from "@/lib/storage";

interface ClubSettings {
  id: string;
  name: string;
  city: string;
  stateCode: string;
  slug: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  rinks: number;
  plan: string;
  logoUrl: string | null;
}

export default function ClubSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [club, setClub] = useState<ClubSettings | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [rinks, setRinks] = useState("2");

  // Logo upload
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Danger zone
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancellingSubscription, setCancellingSubscription] = useState(false);

  useEffect(() => {
    async function loadClub() {
      try {
        const [clubsRes, profileRes] = await Promise.all([
          fetch("/api/clubs/managed"),
          fetch("/api/profile"),
        ]);

        const clubsData = await clubsRes.json();
        const profileData = profileRes.ok ? await profileRes.json() : null;

        const c = clubsData.clubs?.[0];
        if (c) {
          const settings: ClubSettings = {
            id: c.id,
            name: c.name,
            city: c.city,
            stateCode: c.state_code,
            slug: c.slug,
            address: c.address || "",
            phone: c.phone || "",
            email: c.email || "",
            website: c.website || "",
            rinks: c.rinks || 2,
            plan: profileData?.subscription?.plan || "free",
            logoUrl: c.logo_url || null,
          };
          if (settings.logoUrl) setLogoPreview(settings.logoUrl);
          setClub(settings);
          setName(settings.name);
          setCity(settings.city);
          setAddress(settings.address);
          setPhone(settings.phone);
          setEmail(settings.email);
          setWebsite(settings.website);
          setRinks(settings.rinks.toString());
        }
      } catch {
        setError("Failed to load club settings");
      } finally {
        setLoading(false);
      }
    }
    loadClub();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!club) return;
    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const res = await fetch("/api/clubs/managed", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: club.id,
          name,
          address: address || null,
          phone: phone || null,
          email: email || null,
          website: website || null,
          rinks: rinks ? parseInt(rinks) : 2,
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

  async function handleManageBilling() {
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setError("Failed to open billing portal");
    }
  }

  async function handleCancelSubscription() {
    setCancellingSubscription(true);
    try {
      // Redirect to Stripe portal for cancellation
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setError("Failed to process cancellation");
    } finally {
      setCancellingSubscription(false);
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !club) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Please select a JPG, PNG, or WebP image.");
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setError("Logo must be under 2MB.");
      return;
    }

    setUploadingLogo(true);
    setError("");

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "png";
      const path = `club-logos/${club.id}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKETS.GAME_GALLERY)
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKETS.GAME_GALLERY)
        .getPublicUrl(path);

      const logoUrl = urlData.publicUrl;

      // Update the club record with the new logo URL
      const res = await fetch("/api/clubs/managed", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: club.id, logo_url: logoUrl }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update club logo");
      }

      setLogoPreview(logoUrl);
      setClub({ ...club, logoUrl });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to upload logo. Please try again."
      );
    } finally {
      setUploadingLogo(false);
      // Reset the input so the same file can be re-selected
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A2E12]/[0.03] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B5E20]" />
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-[#0A2E12]/[0.03] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-[#0A2E12]/10 bg-white p-8 text-center">
          <h1 className="text-xl font-bold text-[#0A2E12]">No Club Found</h1>
          <p className="mt-2 text-sm text-[#3D5A3E]">
            Register or claim a club first.
          </p>
          <Link
            href="/clubs/onboard"
            className="mt-4 inline-flex rounded-xl bg-[#1B5E20] px-6 py-3 text-sm font-bold text-white hover:bg-[#2E7D32] transition-colors"
          >
            Register Club
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A2E12]/[0.03] pb-20 lg:pb-8">
      <header className="sticky top-0 z-40 border-b border-[#0A2E12]/10 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <Link
            href="/clubs/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-[#3D5A3E] hover:text-[#2D4A30] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            My Club
          </Link>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-[#0A2E12]">
            Club Preferences
          </h1>
          <p className="text-sm text-[#3D5A3E]">
            Manage your club profile and billing
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Club Info */}
          <section className="rounded-2xl border border-[#0A2E12]/10 bg-white p-6">
            <h2 className="text-lg font-bold text-[#0A2E12] mb-4">
              Club Information
            </h2>
            <div className="space-y-4">
              <FieldGroup
                label="Club Name"
                icon={<Building2 className="h-4 w-4" />}
              >
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#0A2E12]/10 py-3 px-4 text-sm text-[#0A2E12] focus:border-[#1B5E20]/50 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
                />
              </FieldGroup>

              <FieldGroup
                label="Location"
                icon={<MapPin className="h-4 w-4" />}
              >
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="w-full rounded-xl border border-[#0A2E12]/10 py-3 px-4 text-sm text-[#0A2E12] placeholder:text-[#3D5A3E] focus:border-[#1B5E20]/50 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
                />
              </FieldGroup>

              <FieldGroup label="Street Address">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Green Lane"
                  className="w-full rounded-xl border border-[#0A2E12]/10 py-3 px-4 text-sm text-[#0A2E12] placeholder:text-[#3D5A3E] focus:border-[#1B5E20]/50 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
                />
              </FieldGroup>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldGroup
                  label="Phone"
                  icon={<Phone className="h-4 w-4" />}
                >
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full rounded-xl border border-[#0A2E12]/10 py-3 px-4 text-sm text-[#0A2E12] placeholder:text-[#3D5A3E] focus:border-[#1B5E20]/50 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
                  />
                </FieldGroup>
                <FieldGroup
                  label="Email"
                  icon={<Mail className="h-4 w-4" />}
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="info@yourclub.com"
                    className="w-full rounded-xl border border-[#0A2E12]/10 py-3 px-4 text-sm text-[#0A2E12] placeholder:text-[#3D5A3E] focus:border-[#1B5E20]/50 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
                  />
                </FieldGroup>
              </div>

              <FieldGroup
                label="Website"
                icon={<Globe className="h-4 w-4" />}
              >
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourclub.com"
                  className="w-full rounded-xl border border-[#0A2E12]/10 py-3 px-4 text-sm text-[#0A2E12] placeholder:text-[#3D5A3E] focus:border-[#1B5E20]/50 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
                />
              </FieldGroup>
            </div>
          </section>

          {/* Facilities */}
          <section className="rounded-2xl border border-[#0A2E12]/10 bg-white p-6">
            <h2 className="text-lg font-bold text-[#0A2E12] mb-4">
              Facilities
            </h2>
            <FieldGroup label="Number of Rinks">
              <select
                value={rinks}
                onChange={(e) => setRinks(e.target.value)}
                className="w-full rounded-xl border border-[#0A2E12]/10 py-3 px-4 text-sm text-[#0A2E12] focus:border-[#1B5E20]/50 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
              >
                <option value="2">2 rinks</option>
                <option value="3">3 rinks</option>
                <option value="4">4 rinks</option>
              </select>
            </FieldGroup>
          </section>

          {/* Club Logo Upload */}
          <section className="rounded-2xl border border-[#0A2E12]/10 bg-white p-6">
            <h2 className="text-lg font-bold text-[#0A2E12] mb-4">Club Logo</h2>
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-dashed border-[#0A2E12]/10 bg-[#0A2E12]/[0.03] overflow-hidden">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Club logo"
                    className="h-full w-full rounded-2xl object-cover"
                  />
                ) : (
                  <Image className="h-8 w-8 text-[#3D5A3E]" />
                )}
              </div>
              <div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                <button
                  type="button"
                  disabled={uploadingLogo}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#0A2E12]/10 px-4 py-2 text-sm font-medium text-[#2D4A30] hover:bg-[#0A2E12]/[0.03] disabled:opacity-50 transition-colors"
                  onClick={() => logoInputRef.current?.click()}
                >
                  {uploadingLogo ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload Logo
                    </>
                  )}
                </button>
                <p className="mt-1 text-xs text-[#3D5A3E]">
                  JPG, PNG, or WebP, max 2MB. Recommended: 200x200px
                </p>
              </div>
            </div>
          </section>

          {/* Billing Management */}
          <section className="rounded-2xl border border-[#0A2E12]/10 bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#0A2E12]">Billing</h2>
              <CreditCard className="h-5 w-5 text-[#3D5A3E]" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#0A2E12]">
                    Current Plan:{" "}
                    <span className="text-[#1B5E20]">
                      {club.plan === "pro"
                        ? "Pro"
                        : club.plan === "club"
                          ? "Club"
                          : "Free"}
                    </span>
                  </p>
                  <p className="text-xs text-[#3D5A3E]">
                    {club.plan === "free"
                      ? "Upgrade for full features"
                      : "Manage your payment method and invoices"}
                  </p>
                </div>
                {club.plan !== "free" ? (
                  <button
                    type="button"
                    onClick={handleManageBilling}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1B5E20] hover:text-[#2E7D32]"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Stripe Portal
                  </button>
                ) : (
                  <Link
                    href="/pricing"
                    className="text-sm font-medium text-[#1B5E20] hover:text-[#2E7D32]"
                  >
                    Upgrade
                  </Link>
                )}
              </div>
            </div>
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
            className="w-full rounded-xl bg-[#1B5E20] py-3.5 text-sm font-bold text-white hover:bg-[#2E7D32] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>

        {/* Danger Zone */}
        {club.plan !== "free" && (
          <section className="mt-8 rounded-2xl border border-red-200 bg-white p-6">
            <h2 className="text-lg font-bold text-red-700 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </h2>
            <p className="text-sm text-[#3D5A3E] mb-4">
              Cancelling your subscription will downgrade your club to the Free
              plan. Your data will be preserved for 90 days.
            </p>

            {!showCancelConfirm ? (
              <button
                type="button"
                onClick={() => setShowCancelConfirm(true)}
                className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
              >
                Cancel Subscription
              </button>
            ) : (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-700 mb-3">
                  Are you sure? You will be redirected to Stripe to confirm
                  cancellation.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleCancelSubscription}
                    disabled={cancellingSubscription}
                    className={cn(
                      "rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-colors",
                      cancellingSubscription && "opacity-50"
                    )}
                  >
                    {cancellingSubscription
                      ? "Processing..."
                      : "Yes, Cancel Subscription"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCancelConfirm(false)}
                    className="rounded-xl border border-[#0A2E12]/10 px-4 py-2.5 text-sm font-medium text-[#2D4A30] hover:bg-[#0A2E12]/[0.03] transition-colors"
                  >
                    Never Mind
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function FieldGroup({
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
