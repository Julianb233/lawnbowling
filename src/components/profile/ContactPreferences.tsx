"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Mail, Phone, MessageSquare } from "lucide-react";
import type { ContactPreferences as ContactPrefsType } from "@/lib/db/contact-preferences";

const CONTACT_METHODS = [
  { value: "in_app", label: "In-App Messages", icon: MessageSquare },
  { value: "email", label: "Email", icon: Mail },
  { value: "phone", label: "Phone", icon: Phone },
  { value: "none", label: "No Contact", icon: null },
] as const;

const MESSAGE_OPTIONS = [
  { value: "everyone", label: "Everyone" },
  { value: "friends", label: "Friends Only" },
  { value: "none", label: "No One" },
] as const;

export function ContactPreferencesEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState<ContactPrefsType | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/profile/contact-preferences");
        if (res.ok) {
          setPrefs(await res.json());
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSave() {
    if (!prefs) return;
    setSaving(true);
    setSuccess(false);
    try {
      const res = await fetch("/api/profile/contact-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          show_email: prefs.show_email,
          show_phone: prefs.show_phone,
          preferred_contact: prefs.preferred_contact,
          email: prefs.email,
          phone: prefs.phone,
          allow_messages_from: prefs.allow_messages_from,
        }),
      });
      if (res.ok) {
        setPrefs(await res.json());
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!prefs) return null;

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Contact Preferences</h2>

      {/* Preferred Contact Method */}
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Preferred Contact Method
        </label>
        <div className="grid grid-cols-2 gap-2">
          {CONTACT_METHODS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setPrefs({ ...prefs, preferred_contact: value })}
              className={`flex items-center gap-2 rounded-lg border px-3 py-3 text-sm font-medium transition-colors min-h-[44px] ${
                prefs.preferred_contact === value
                  ? "border-[#1B5E20] bg-[#1B5E20]/10 text-[#1B5E20]"
                  : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 dark:bg-white/5"
              }`}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="contact-email" className="mb-2 block text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Email Address
        </label>
        <input
          id="contact-email"
          type="email"
          value={prefs.email ?? ""}
          onChange={(e) => setPrefs({ ...prefs, email: e.target.value || null })}
          placeholder="your@email.com"
          className="w-full rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-zinc-900 placeholder-zinc-400 outline-none focus:border-[#1B5E20]/50 focus:ring-1 focus:ring-[#1B5E20]/50 min-h-[44px]"
        />
        <label className="mt-2 flex items-center gap-2">
          <input
            type="checkbox"
            checked={prefs.show_email}
            onChange={(e) => setPrefs({ ...prefs, show_email: e.target.checked })}
            className="h-4 w-4 rounded border-zinc-300 text-[#1B5E20] focus:ring-[#1B5E20]"
          />
          <span className="text-sm text-zinc-600 dark:text-zinc-400">Show email on profile</span>
        </label>
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="contact-phone" className="mb-2 block text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Phone Number
        </label>
        <input
          id="contact-phone"
          type="tel"
          value={prefs.phone ?? ""}
          onChange={(e) => setPrefs({ ...prefs, phone: e.target.value || null })}
          placeholder="+1 (555) 000-0000"
          className="w-full rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-zinc-900 placeholder-zinc-400 outline-none focus:border-[#1B5E20]/50 focus:ring-1 focus:ring-[#1B5E20]/50 min-h-[44px]"
        />
        <label className="mt-2 flex items-center gap-2">
          <input
            type="checkbox"
            checked={prefs.show_phone}
            onChange={(e) => setPrefs({ ...prefs, show_phone: e.target.checked })}
            className="h-4 w-4 rounded border-zinc-300 text-[#1B5E20] focus:ring-[#1B5E20]"
          />
          <span className="text-sm text-zinc-600 dark:text-zinc-400">Show phone on profile</span>
        </label>
      </div>

      {/* Who Can Message Me */}
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Who Can Message Me
        </label>
        <div className="flex gap-2">
          {MESSAGE_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setPrefs({ ...prefs, allow_messages_from: value })}
              className={`flex-1 rounded-lg border px-3 py-3 text-sm font-medium transition-colors min-h-[44px] ${
                prefs.allow_messages_from === value
                  ? "border-[#1B5E20] bg-[#1B5E20]/10 text-[#1B5E20]"
                  : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 dark:bg-white/5"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1B5E20] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1B5E20]/90 disabled:opacity-50 min-h-[44px] transition-colors"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {saving ? "Saving..." : "Save Contact Preferences"}
      </button>

      {success && (
        <p className="text-center text-sm text-[#1B5E20]">Preferences saved</p>
      )}
    </div>
  );
}

/** Read-only contact info shown on public profiles */
export function ContactInfo({
  prefs,
}: {
  prefs: ContactPrefsType;
}) {
  const hasVisibleInfo =
    (prefs.show_email && prefs.email) ||
    (prefs.show_phone && prefs.phone) ||
    prefs.preferred_contact !== "none";

  if (!hasVisibleInfo) return null;

  return (
    <div>
      <h2 className="mb-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">Contact</h2>
      <div className="space-y-2">
        {prefs.preferred_contact !== "none" && (
          <div className="flex items-center gap-2 text-sm text-zinc-700">
            <MessageSquare className="h-4 w-4 text-zinc-400" />
            <span>
              Prefers{" "}
              {prefs.preferred_contact === "in_app"
                ? "in-app messages"
                : prefs.preferred_contact}
            </span>
          </div>
        )}
        {prefs.show_email && prefs.email && (
          <div className="flex items-center gap-2 text-sm text-zinc-700">
            <Mail className="h-4 w-4 text-zinc-400" />
            <span>{prefs.email}</span>
          </div>
        )}
        {prefs.show_phone && prefs.phone && (
          <div className="flex items-center gap-2 text-sm text-zinc-700">
            <Phone className="h-4 w-4 text-zinc-400" />
            <span>{prefs.phone}</span>
          </div>
        )}
      </div>
    </div>
  );
}
