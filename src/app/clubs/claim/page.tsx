"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search, CheckCircle, Clock, Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ClubOption {
  id: string;
  name: string;
  city: string;
  state_code: string;
  claimed_by: string | null;
}

export default function ClaimClubPage() {
  const [clubs, setClubs] = useState<ClubOption[]>([]);
  const [search, setSearch] = useState("");
  const [selectedClub, setSelectedClub] = useState<ClubOption | null>(null);
  const [roleAtClub, setRoleAtClub] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
    });
  }, []);

  useEffect(() => {
    if (search.length < 2) {
      setClubs([]);
      return;
    }
    const controller = new AbortController();
    fetch(`/api/clubs?q=${encodeURIComponent(search)}&limit=10`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data) => setClubs(data.clubs ?? []))
      .catch(() => {});
    return () => controller.abort();
  }, [search]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClub) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/clubs/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          club_id: selectedClub.id,
          role_at_club: roleAtClub || undefined,
          message: message || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit claim");
        return;
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
      <div className="min-h-screen bg-[#0A2E12]/[0.03] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-[#0A2E12]/10 bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1B5E20]/10">
            <CheckCircle className="h-8 w-8 text-[#1B5E20]" />
          </div>
          <h1 className="text-xl font-bold text-[#0A2E12]">Claim Submitted!</h1>
          <p className="mt-2 text-sm text-[#3D5A3E]">
            Your claim for <strong>{selectedClub?.name}</strong> has been submitted.
            An admin will review it shortly.
          </p>
          <Link
            href="/clubs"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0A2E12] px-6 py-3 text-sm font-bold text-white hover:bg-[#0A2E12] transition-colors"
          >
            Back to Club Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A2E12]/[0.03]">
      <header className="sticky top-0 z-40 border-b border-[#0A2E12]/10 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <Link
            href="/clubs"
            className="inline-flex items-center gap-1.5 text-sm text-[#3D5A3E] hover:text-[#2D4A30] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Club Directory
          </Link>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-[#0A2E12]">
            Claim Your Club
          </h1>
          <p className="text-sm text-[#3D5A3E]">
            Verify that you&apos;re an official of a lawn bowling club to manage its listing
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {isLoggedIn === false && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
            <p className="text-sm font-medium text-amber-800">
              You need to be logged in to claim a club.
            </p>
            <Link
              href="/login"
              className="mt-3 inline-flex rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-700 transition-colors"
            >
              Log In
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Club search */}
          <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-6">
            <label className="block text-sm font-bold text-[#0A2E12] mb-3">
              1. Find Your Club
            </label>
            {selectedClub ? (
              <div className="flex items-center justify-between rounded-xl border border-[#1B5E20]/15 bg-[#1B5E20]/5 p-4">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-[#1B5E20]" />
                  <div>
                    <p className="font-bold text-[#0A2E12]">{selectedClub.name}</p>
                    <p className="text-sm text-[#3D5A3E]">
                      {selectedClub.city}, {selectedClub.state_code}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedClub(null)}
                  className="text-sm text-[#3D5A3E] hover:text-[#2D4A30]"
                >
                  Change
                </button>
              </div>
            ) : (
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3D5A3E]" />
                  <input
                    type="text"
                    placeholder="Search by club name or city..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-xl border border-[#0A2E12]/10 py-3 pl-10 pr-4 text-sm text-[#0A2E12] placeholder:text-[#3D5A3E] focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
                  />
                </div>
                {clubs.length > 0 && (
                  <div className="mt-2 rounded-xl border border-[#0A2E12]/10 bg-white divide-y divide-[#0A2E12]/10 max-h-60 overflow-y-auto">
                    {clubs.map((club) => (
                      <button
                        key={club.id}
                        type="button"
                        disabled={!!club.claimed_by}
                        onClick={() => {
                          setSelectedClub(club);
                          setSearch("");
                          setClubs([]);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                          club.claimed_by
                            ? "text-[#3D5A3E] cursor-not-allowed"
                            : "hover:bg-[#0A2E12]/[0.03] text-[#0A2E12]"
                        }`}
                      >
                        <span className="font-medium">{club.name}</span>
                        <span className="text-[#3D5A3E]">
                          {" "}&mdash; {club.city}, {club.state_code}
                        </span>
                        {club.claimed_by && (
                          <span className="ml-2 text-xs text-amber-600 font-medium">
                            Already claimed
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Role */}
          <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-6">
            <label
              htmlFor="role"
              className="block text-sm font-bold text-[#0A2E12] mb-3"
            >
              2. Your Role at the Club
            </label>
            <select
              id="role"
              value={roleAtClub}
              onChange={(e) => setRoleAtClub(e.target.value)}
              className="w-full rounded-xl border border-[#0A2E12]/10 py-3 px-4 text-sm text-[#0A2E12] focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
            >
              <option value="">Select your role...</option>
              <option value="President">President</option>
              <option value="Vice President">Vice President</option>
              <option value="Secretary">Secretary</option>
              <option value="Treasurer">Treasurer</option>
              <option value="Board Member">Board Member</option>
              <option value="Club Manager">Club Manager</option>
              <option value="Head Coach">Head Coach</option>
              <option value="Other Official">Other Official</option>
            </select>
          </div>

          {/* Message */}
          <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-6">
            <label
              htmlFor="message"
              className="block text-sm font-bold text-[#0A2E12] mb-3"
            >
              3. Tell Us About Your Connection (Optional)
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="How are you connected to this club? Any links to verify your role..."
              className="w-full rounded-xl border border-[#0A2E12]/10 py-3 px-4 text-sm text-[#0A2E12] placeholder:text-[#3D5A3E] focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 resize-none"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!selectedClub || submitting || isLoggedIn === false}
            className="w-full rounded-xl bg-[#1B5E20] py-3.5 text-sm font-bold text-white hover:bg-[#1B5E20] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Clock className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Claim Request"
            )}
          </button>

          <p className="text-center text-xs text-[#3D5A3E]">
            Claims are reviewed by our team, typically within 1-2 business days.
          </p>
        </form>
      </main>
    </div>
  );
}
