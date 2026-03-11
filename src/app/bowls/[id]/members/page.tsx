"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { ClubRosterMember } from "@/lib/types";

// ─── Constants ──────────────────────────────────────────────────────

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const BRAND = "#1B5E20";
const TWO_YEARS_MS = 2 * 365.25 * 24 * 60 * 60 * 1000;

type ModalMode = "add" | "edit" | "bulk" | null;

// ─── Helper: check if member is eligible for expert ─────────────────

function isEligibleForExpert(member: ClubRosterMember): boolean {
  if (member.skill_level === "expert") return false;
  if (!member.member_since) return false;
  const memberDate = new Date(member.member_since);
  const now = new Date();
  return now.getTime() - memberDate.getTime() >= TWO_YEARS_MS;
}

// ─── Page Component ─────────────────────────────────────────────────

export default function MembersPage() {
  const params = useParams();
  const tournamentId = params.id as string;

  // Data
  const [members, setMembers] = useState<ClubRosterMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [tournamentName, setTournamentName] = useState("Club Roster");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [skillFilter, setSkillFilter] = useState<"all" | "novice" | "expert">("all");

  // Modal
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingMember, setEditingMember] = useState<ClubRosterMember | null>(null);

  // Form fields
  const [formFirstName, setFormFirstName] = useState("");
  const [formLastName, setFormLastName] = useState("");
  const [formSkill, setFormSkill] = useState<"novice" | "expert">("novice");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formMemberSince, setFormMemberSince] = useState("");
  const [formNotes, setFormNotes] = useState("");

  // Bulk import
  const [bulkText, setBulkText] = useState("");
  const [bulkImporting, setBulkImporting] = useState(false);

  // Saving
  const [saving, setSaving] = useState(false);

  // ─── Load data ────────────────────────────────────────────────────

  const loadMembers = useCallback(async () => {
    try {
      const res = await fetch(`/api/bowls/members?tournament_id=${tournamentId}`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      }
    } catch {
      // retry on next load
    }
    setLoading(false);
  }, [tournamentId]);

  useEffect(() => {
    loadMembers();

    // Load tournament name
    async function loadTournament() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data } = await supabase
          .from("tournaments")
          .select("name")
          .eq("id", tournamentId)
          .single();
        if (data?.name) setTournamentName(data.name);
      } catch {
        // non-critical
      }
    }
    loadTournament();
  }, [loadMembers, tournamentId]);

  // ─── Filter logic ─────────────────────────────────────────────────

  const filteredMembers = members.filter((m) => {
    // Active only
    if (!m.is_active) return false;

    // Skill filter
    if (skillFilter !== "all" && m.skill_level !== skillFilter) return false;

    // Letter filter (by last name)
    if (activeLetter) {
      const lastName = m.last_name || m.display_name.split(" ").pop() || "";
      if (!lastName.toUpperCase().startsWith(activeLetter)) return false;
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return m.display_name.toLowerCase().includes(q);
    }

    return true;
  });

  const availableLetters = new Set(
    members
      .filter((m) => m.is_active)
      .map((m) => {
        const lastName = m.last_name || m.display_name.split(" ").pop() || "";
        return lastName[0]?.toUpperCase() || "";
      })
  );

  const totalActive = members.filter((m) => m.is_active).length;
  const noviceCount = members.filter((m) => m.is_active && m.skill_level === "novice").length;
  const expertCount = members.filter((m) => m.is_active && m.skill_level === "expert").length;
  const eligibleForExpert = members.filter((m) => m.is_active && isEligibleForExpert(m));

  // ─── Modal handlers ───────────────────────────────────────────────

  function openAddModal() {
    setFormFirstName("");
    setFormLastName("");
    setFormSkill("novice");
    setFormPhone("");
    setFormEmail("");
    setFormMemberSince("");
    setFormNotes("");
    setEditingMember(null);
    setModalMode("add");
  }

  function openEditModal(member: ClubRosterMember) {
    setFormFirstName(member.first_name || "");
    setFormLastName(member.last_name || "");
    setFormSkill(member.skill_level);
    setFormPhone(member.phone || "");
    setFormEmail(member.email || "");
    setFormMemberSince(member.member_since || "");
    setFormNotes(member.notes || "");
    setEditingMember(member);
    setModalMode("edit");
  }

  function openBulkModal() {
    setBulkText("");
    setModalMode("bulk");
  }

  function closeModal() {
    setModalMode(null);
    setEditingMember(null);
  }

  // ─── Save member ──────────────────────────────────────────────────

  async function handleSaveMember() {
    if (!formFirstName.trim() && !formLastName.trim()) return;
    setSaving(true);

    const displayName = [formFirstName.trim(), formLastName.trim()].filter(Boolean).join(" ");

    try {
      if (modalMode === "edit" && editingMember) {
        await fetch("/api/bowls/members", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingMember.id,
            display_name: displayName,
            first_name: formFirstName.trim() || null,
            last_name: formLastName.trim() || null,
            skill_level: formSkill,
            phone: formPhone.trim() || null,
            email: formEmail.trim() || null,
            member_since: formMemberSince || null,
            notes: formNotes.trim() || null,
          }),
        });
      } else {
        await fetch("/api/bowls/members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tournament_id: tournamentId,
            display_name: displayName,
            first_name: formFirstName.trim() || null,
            last_name: formLastName.trim() || null,
            skill_level: formSkill,
            phone: formPhone.trim() || null,
            email: formEmail.trim() || null,
            member_since: formMemberSince || null,
            notes: formNotes.trim() || null,
          }),
        });
      }
      await loadMembers();
      closeModal();
    } catch {
      // handle error
    }
    setSaving(false);
  }

  // ─── Bulk import ──────────────────────────────────────────────────

  async function handleBulkImport() {
    const names = bulkText
      .split("\n")
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (names.length === 0) return;
    setBulkImporting(true);

    try {
      await fetch("/api/bowls/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournament_id: tournamentId,
          bulk: names,
        }),
      });
      await loadMembers();
      closeModal();
    } catch {
      // handle error
    }
    setBulkImporting(false);
  }

  // ─── Delete member ────────────────────────────────────────────────

  async function handleDeleteMember(memberId: string) {
    if (!confirm("Remove this member from the roster?")) return;

    try {
      await fetch("/api/bowls/members", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: memberId }),
      });
      await loadMembers();
      if (editingMember?.id === memberId) closeModal();
    } catch {
      // handle error
    }
  }

  // ─── Toggle skill level ──────────────────────────────────────────

  async function handleToggleSkill(member: ClubRosterMember) {
    const newSkill = member.skill_level === "novice" ? "expert" : "novice";
    try {
      await fetch("/api/bowls/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: member.id, skill_level: newSkill }),
      });
      await loadMembers();
    } catch {
      // handle error
    }
  }

  // ─── Loading state ────────────────────────────────────────────────

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: "#FAFAF5" }}
      >
        <div
          className="h-16 w-16 animate-spin rounded-full border-4 border-t-transparent"
          style={{ borderColor: BRAND, borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen pb-8"
      style={{
        backgroundColor: "#FAFAF5",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b-2 px-4 py-4 sm:px-8"
        style={{ borderColor: "#E0E0E0", backgroundColor: "#FFFFFF" }}
      >
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 mb-1">
                <Link
                  href={`/bowls/${tournamentId}`}
                  className="touch-manipulation rounded-xl flex items-center justify-center"
                  style={{
                    minHeight: "48px",
                    minWidth: "48px",
                    backgroundColor: "#F0F0F0",
                    color: "#1A1A1A",
                    fontSize: "20px",
                  }}
                  aria-label="Back to tournament"
                >
                  &#8592;
                </Link>
                <h1
                  className="truncate font-black"
                  style={{ fontSize: "28px", lineHeight: "1.2", color: "#1A1A1A" }}
                >
                  {tournamentName}
                </h1>
              </div>
              <p style={{ fontSize: "18px", color: "#4A4A4A", marginLeft: "60px" }}>
                Club Member Roster &middot; {totalActive} members
              </p>
            </div>

            <div className="flex gap-2 shrink-0">
              <button
                onClick={openBulkModal}
                className="touch-manipulation rounded-xl font-bold transition-all active:scale-[0.97]"
                style={{
                  minHeight: "56px",
                  padding: "12px 20px",
                  fontSize: "18px",
                  backgroundColor: "#F0F0F0",
                  color: "#1A1A1A",
                  border: "2px solid #E0E0E0",
                }}
              >
                Bulk Import
              </button>
              <button
                onClick={openAddModal}
                className="touch-manipulation rounded-xl font-bold transition-all active:scale-[0.97]"
                style={{
                  minHeight: "56px",
                  padding: "12px 24px",
                  fontSize: "18px",
                  backgroundColor: BRAND,
                  color: "#FFFFFF",
                }}
              >
                + Add Member
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-8">
        {/* Stats cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div
            className="rounded-2xl p-4 text-center"
            style={{ backgroundColor: "#FFFFFF", border: "2px solid #E0E0E0" }}
          >
            <p className="font-black" style={{ fontSize: "32px", color: BRAND }}>{totalActive}</p>
            <p className="font-medium" style={{ fontSize: "16px", color: "#4A4A4A" }}>Total Members</p>
          </div>
          <div
            className="rounded-2xl p-4 text-center"
            style={{ backgroundColor: "#FFFFFF", border: "2px solid #E0E0E0" }}
          >
            <p className="font-black" style={{ fontSize: "32px", color: "#2E7D32" }}>{noviceCount}</p>
            <p className="font-medium" style={{ fontSize: "16px", color: "#4A4A4A" }}>Novice</p>
          </div>
          <div
            className="rounded-2xl p-4 text-center"
            style={{ backgroundColor: "#FFFFFF", border: "2px solid #E0E0E0" }}
          >
            <p className="font-black" style={{ fontSize: "32px", color: "#B8860B" }}>{expertCount}</p>
            <p className="font-medium" style={{ fontSize: "16px", color: "#4A4A4A" }}>Expert</p>
          </div>
          <div
            className="rounded-2xl p-4 text-center"
            style={{
              backgroundColor: eligibleForExpert.length > 0 ? "#FFF8E1" : "#FFFFFF",
              border: eligibleForExpert.length > 0 ? "2px solid #F9A825" : "2px solid #E0E0E0",
            }}
          >
            <p className="font-black" style={{ fontSize: "32px", color: "#F57F17" }}>
              {eligibleForExpert.length}
            </p>
            <p className="font-medium" style={{ fontSize: "16px", color: "#4A4A4A" }}>
              Expert Eligible
            </p>
          </div>
        </div>

        {/* Expert eligible callout */}
        {eligibleForExpert.length > 0 && (
          <div
            className="mb-6 rounded-2xl p-4"
            style={{ backgroundColor: "#FFF8E1", border: "2px solid #F9A825" }}
          >
            <p className="font-bold mb-2" style={{ fontSize: "18px", color: "#E65100" }}>
              Members eligible for Expert status (2+ years):
            </p>
            <div className="flex flex-wrap gap-2">
              {eligibleForExpert.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleToggleSkill(m)}
                  className="touch-manipulation rounded-xl font-semibold transition-all active:scale-[0.97]"
                  style={{
                    minHeight: "48px",
                    padding: "8px 16px",
                    fontSize: "16px",
                    backgroundColor: "#FFFFFF",
                    color: "#E65100",
                    border: "2px solid #F9A825",
                  }}
                  aria-label={`Promote ${m.display_name} to expert`}
                >
                  {m.display_name} &rarr; Expert
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search bar */}
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search members by name..."
            className="w-full rounded-2xl touch-manipulation"
            style={{
              minHeight: "56px",
              padding: "12px 24px",
              fontSize: "20px",
              backgroundColor: "#FFFFFF",
              border: "2px solid #E0E0E0",
              color: "#1A1A1A",
              outline: "none",
            }}
            aria-label="Search members"
          />
        </div>

        {/* Skill filter */}
        <div className="mb-4 flex gap-2">
          {(["all", "novice", "expert"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSkillFilter(s)}
              className="touch-manipulation rounded-xl font-bold transition-colors"
              style={{
                minHeight: "48px",
                padding: "8px 20px",
                fontSize: "18px",
                backgroundColor: skillFilter === s ? BRAND : "#F0F0F0",
                color: skillFilter === s ? "#FFFFFF" : "#1A1A1A",
              }}
              aria-pressed={skillFilter === s}
            >
              {s === "all" ? "All" : s === "novice" ? "Novice" : "Expert"}
            </button>
          ))}
        </div>

        {/* Alphabet filter */}
        <nav
          className="mb-6 flex flex-wrap gap-1.5 justify-center"
          role="navigation"
          aria-label="Filter by surname letter"
        >
          <button
            onClick={() => setActiveLetter(null)}
            className="rounded-lg font-bold touch-manipulation transition-colors"
            style={{
              minHeight: "44px",
              minWidth: "48px",
              fontSize: "16px",
              padding: "6px 14px",
              backgroundColor: activeLetter === null ? BRAND : "#F0F0F0",
              color: activeLetter === null ? "#FFFFFF" : "#1A1A1A",
            }}
            aria-label="Show all members"
            aria-pressed={activeLetter === null}
          >
            All
          </button>
          {ALPHABET.map((letter) => {
            const hasMembers = availableLetters.has(letter);
            const isActive = activeLetter === letter;
            return (
              <button
                key={letter}
                onClick={() => hasMembers && setActiveLetter(letter)}
                disabled={!hasMembers}
                className="rounded-lg font-bold touch-manipulation transition-colors"
                style={{
                  minHeight: "44px",
                  minWidth: "40px",
                  fontSize: "16px",
                  backgroundColor: isActive ? BRAND : hasMembers ? "#F0F0F0" : "transparent",
                  color: isActive ? "#FFFFFF" : hasMembers ? "#1A1A1A" : "#CCCCCC",
                  cursor: hasMembers ? "pointer" : "default",
                }}
                aria-label={`Filter by letter ${letter}`}
                aria-pressed={isActive}
              >
                {letter}
              </button>
            );
          })}
        </nav>

        {/* Member list */}
        <ul role="list" className="flex flex-col gap-2">
          {filteredMembers.map((member) => {
            const eligible = isEligibleForExpert(member);
            return (
              <li key={member.id}>
                <div
                  className="rounded-2xl flex items-center gap-4 transition-all"
                  style={{
                    minHeight: "72px",
                    padding: "12px 20px",
                    backgroundColor: "#FFFFFF",
                    border: eligible ? "2px solid #F9A825" : "2px solid #E0E0E0",
                  }}
                >
                  {/* Skill badge */}
                  <span
                    className="shrink-0 rounded-full font-bold flex items-center justify-center"
                    style={{
                      minWidth: "48px",
                      height: "48px",
                      padding: "0 12px",
                      fontSize: "14px",
                      backgroundColor: member.skill_level === "expert" ? "#B8860B" : "#2E7D32",
                      color: "#FFFFFF",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                    aria-label={`Skill level: ${member.skill_level}`}
                  >
                    {member.skill_level === "expert" ? "EXP" : "NOV"}
                  </span>

                  {/* Name and details */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-semibold truncate"
                      style={{ fontSize: "20px", color: "#1A1A1A", lineHeight: "1.3" }}
                    >
                      {member.display_name}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      {member.member_since && (
                        <span style={{ fontSize: "14px", color: "#888" }}>
                          Since {new Date(member.member_since).getFullYear()}
                        </span>
                      )}
                      {eligible && (
                        <span
                          className="rounded-full font-bold"
                          style={{
                            padding: "2px 10px",
                            fontSize: "12px",
                            backgroundColor: "#FFF8E1",
                            color: "#E65100",
                            border: "1px solid #F9A825",
                          }}
                        >
                          2yr+ eligible
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => openEditModal(member)}
                      className="touch-manipulation rounded-xl font-semibold transition-all active:scale-[0.97]"
                      style={{
                        minHeight: "48px",
                        padding: "8px 16px",
                        fontSize: "16px",
                        backgroundColor: "#F0F0F0",
                        color: "#1A1A1A",
                        border: "2px solid #E0E0E0",
                      }}
                      aria-label={`Edit ${member.display_name}`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteMember(member.id)}
                      className="touch-manipulation rounded-xl font-semibold transition-all active:scale-[0.97]"
                      style={{
                        minHeight: "48px",
                        padding: "8px 16px",
                        fontSize: "16px",
                        backgroundColor: "#FFF0F0",
                        color: "#9B1B1B",
                        border: "2px solid #FFCCCC",
                      }}
                      aria-label={`Remove ${member.display_name}`}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {filteredMembers.length === 0 && !loading && (
          <div className="py-16 text-center">
            <p style={{ fontSize: "22px", color: "#888", marginBottom: "8px" }}>
              {members.length === 0 ? "No members yet" : "No members match your filters"}
            </p>
            {members.length === 0 && (
              <p style={{ fontSize: "18px", color: "#AAA" }}>
                Add members individually or use Bulk Import to paste a list of names.
              </p>
            )}
          </div>
        )}
      </main>

      {/* ===== Add/Edit Modal ===== */}
      {(modalMode === "add" || modalMode === "edit") && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            className="mx-4 w-full max-w-lg rounded-3xl overflow-y-auto"
            style={{
              backgroundColor: "#FFFFFF",
              padding: "32px",
              maxHeight: "90vh",
            }}
          >
            <h2 className="font-black mb-6" style={{ fontSize: "28px", color: "#1A1A1A" }}>
              {modalMode === "edit" ? "Edit Member" : "Add Member"}
            </h2>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block font-semibold mb-1"
                    style={{ fontSize: "16px", color: "#4A4A4A" }}
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formFirstName}
                    onChange={(e) => setFormFirstName(e.target.value)}
                    className="w-full rounded-xl"
                    style={{
                      minHeight: "56px",
                      padding: "12px 16px",
                      fontSize: "20px",
                      border: "2px solid #E0E0E0",
                      color: "#1A1A1A",
                      outline: "none",
                    }}
                    placeholder="John"
                    autoFocus
                  />
                </div>
                <div>
                  <label
                    className="block font-semibold mb-1"
                    style={{ fontSize: "16px", color: "#4A4A4A" }}
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formLastName}
                    onChange={(e) => setFormLastName(e.target.value)}
                    className="w-full rounded-xl"
                    style={{
                      minHeight: "56px",
                      padding: "12px 16px",
                      fontSize: "20px",
                      border: "2px solid #E0E0E0",
                      color: "#1A1A1A",
                      outline: "none",
                    }}
                    placeholder="Smith"
                  />
                </div>
              </div>

              {/* Skill level */}
              <div>
                <label
                  className="block font-semibold mb-2"
                  style={{ fontSize: "16px", color: "#4A4A4A" }}
                >
                  Skill Level
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormSkill("novice")}
                    className="flex-1 rounded-xl font-bold touch-manipulation transition-colors"
                    style={{
                      minHeight: "56px",
                      fontSize: "18px",
                      backgroundColor: formSkill === "novice" ? "#2E7D32" : "#F0F0F0",
                      color: formSkill === "novice" ? "#FFFFFF" : "#1A1A1A",
                      border: formSkill === "novice" ? "3px solid #1B5E20" : "3px solid transparent",
                    }}
                  >
                    Novice
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormSkill("expert")}
                    className="flex-1 rounded-xl font-bold touch-manipulation transition-colors"
                    style={{
                      minHeight: "56px",
                      fontSize: "18px",
                      backgroundColor: formSkill === "expert" ? "#B8860B" : "#F0F0F0",
                      color: formSkill === "expert" ? "#FFFFFF" : "#1A1A1A",
                      border: formSkill === "expert" ? "3px solid #8B6914" : "3px solid transparent",
                    }}
                  >
                    Expert
                  </button>
                </div>
              </div>

              {/* Member since */}
              <div>
                <label
                  className="block font-semibold mb-1"
                  style={{ fontSize: "16px", color: "#4A4A4A" }}
                >
                  Member Since
                </label>
                <input
                  type="date"
                  value={formMemberSince}
                  onChange={(e) => setFormMemberSince(e.target.value)}
                  className="w-full rounded-xl"
                  style={{
                    minHeight: "56px",
                    padding: "12px 16px",
                    fontSize: "18px",
                    border: "2px solid #E0E0E0",
                    color: "#1A1A1A",
                    outline: "none",
                  }}
                />
              </div>

              {/* Contact info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block font-semibold mb-1"
                    style={{ fontSize: "16px", color: "#4A4A4A" }}
                  >
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full rounded-xl"
                    style={{
                      minHeight: "56px",
                      padding: "12px 16px",
                      fontSize: "18px",
                      border: "2px solid #E0E0E0",
                      color: "#1A1A1A",
                      outline: "none",
                    }}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label
                    className="block font-semibold mb-1"
                    style={{ fontSize: "16px", color: "#4A4A4A" }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full rounded-xl"
                    style={{
                      minHeight: "56px",
                      padding: "12px 16px",
                      fontSize: "18px",
                      border: "2px solid #E0E0E0",
                      color: "#1A1A1A",
                      outline: "none",
                    }}
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label
                  className="block font-semibold mb-1"
                  style={{ fontSize: "16px", color: "#4A4A4A" }}
                >
                  Notes
                </label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl resize-none"
                  style={{
                    padding: "12px 16px",
                    fontSize: "18px",
                    border: "2px solid #E0E0E0",
                    color: "#1A1A1A",
                    outline: "none",
                  }}
                  placeholder="Optional notes..."
                />
              </div>
            </div>

            {/* Modal actions */}
            <div className="mt-6 flex gap-3">
              {modalMode === "edit" && editingMember && (
                <button
                  onClick={() => handleDeleteMember(editingMember.id)}
                  className="touch-manipulation rounded-xl font-bold transition-all active:scale-[0.97]"
                  style={{
                    minHeight: "56px",
                    padding: "12px 20px",
                    fontSize: "18px",
                    backgroundColor: "#9B1B1B",
                    color: "#FFFFFF",
                  }}
                >
                  Delete
                </button>
              )}
              <div className="flex-1" />
              <button
                onClick={closeModal}
                className="touch-manipulation rounded-xl font-bold transition-all active:scale-[0.97]"
                style={{
                  minHeight: "56px",
                  padding: "12px 24px",
                  fontSize: "18px",
                  backgroundColor: "#F0F0F0",
                  color: "#1A1A1A",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMember}
                disabled={saving || (!formFirstName.trim() && !formLastName.trim())}
                className="touch-manipulation rounded-xl font-bold transition-all active:scale-[0.97]"
                style={{
                  minHeight: "56px",
                  padding: "12px 32px",
                  fontSize: "18px",
                  backgroundColor: BRAND,
                  color: "#FFFFFF",
                  opacity: saving || (!formFirstName.trim() && !formLastName.trim()) ? 0.5 : 1,
                }}
              >
                {saving ? "Saving..." : modalMode === "edit" ? "Save Changes" : "Add Member"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Bulk Import Modal ===== */}
      {modalMode === "bulk" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            className="mx-4 w-full max-w-lg rounded-3xl"
            style={{ backgroundColor: "#FFFFFF", padding: "32px" }}
          >
            <h2 className="font-black mb-2" style={{ fontSize: "28px", color: "#1A1A1A" }}>
              Bulk Import Members
            </h2>
            <p className="mb-4" style={{ fontSize: "18px", color: "#4A4A4A" }}>
              Paste one name per line. All imported members will be set to Novice skill level.
            </p>

            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              rows={10}
              className="w-full rounded-xl resize-none mb-2"
              style={{
                padding: "16px",
                fontSize: "18px",
                border: "2px solid #E0E0E0",
                color: "#1A1A1A",
                outline: "none",
                lineHeight: "1.6",
              }}
              placeholder={"John Smith\nJane Doe\nBob Wilson\n..."}
              autoFocus
            />

            <p style={{ fontSize: "16px", color: "#888", marginBottom: "16px" }}>
              {bulkText.split("\n").filter((l) => l.trim().length > 0).length} names detected
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={closeModal}
                className="touch-manipulation rounded-xl font-bold transition-all active:scale-[0.97]"
                style={{
                  minHeight: "56px",
                  padding: "12px 24px",
                  fontSize: "18px",
                  backgroundColor: "#F0F0F0",
                  color: "#1A1A1A",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkImport}
                disabled={bulkImporting || bulkText.trim().length === 0}
                className="touch-manipulation rounded-xl font-bold transition-all active:scale-[0.97]"
                style={{
                  minHeight: "56px",
                  padding: "12px 32px",
                  fontSize: "18px",
                  backgroundColor: BRAND,
                  color: "#FFFFFF",
                  opacity: bulkImporting || bulkText.trim().length === 0 ? 0.5 : 1,
                }}
              >
                {bulkImporting ? "Importing..." : "Import All"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
