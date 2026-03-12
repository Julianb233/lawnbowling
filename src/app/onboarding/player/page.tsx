"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  User,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Star,
  Trophy,
  Medal,
  Globe,
  Target,
  Layers,
  Crown,
  MapPin,
  Search,
  Check,
  CircleDot,
} from "lucide-react";

/* ────────────────────────────── constants ────────────────────────────── */

const EXPERIENCE_OPTIONS = [
  {
    value: "brand_new",
    label: "Brand New",
    description: "I've never bowled before",
    icon: Sparkles,
  },
  {
    value: "learning",
    label: "Learning",
    description: "I've played a few times",
    icon: Star,
  },
  {
    value: "social",
    label: "Social Bowler",
    description: "I play regularly for fun",
    icon: Globe,
  },
  {
    value: "competitive",
    label: "Competitive",
    description: "I play in competitions",
    icon: Trophy,
  },
  {
    value: "representative",
    label: "Representative",
    description: "I represent my state/country",
    icon: Medal,
  },
] as const;

const POSITION_OPTIONS = [
  {
    value: "lead",
    label: "Lead",
    description: "First to bowl, sets the head",
    icon: Target,
  },
  {
    value: "second",
    label: "Second",
    description: "Builds on the lead's work",
    icon: Layers,
  },
  {
    value: "vice",
    label: "Vice (Third)",
    description: "Measures and strategises",
    icon: Search,
  },
  {
    value: "skip",
    label: "Skip",
    description: "Team captain, directs play",
    icon: Crown,
  },
  {
    value: "any",
    label: "No Preference",
    description: "I'm happy anywhere",
    icon: CircleDot,
  },
] as const;

const FORMAT_OPTIONS = [
  { value: "singles", label: "Singles" },
  { value: "pairs", label: "Pairs" },
  { value: "triples", label: "Triples" },
  { value: "fours", label: "Fours" },
  { value: "social_rollup", label: "Social Roll-Up" },
] as const;

const STEPS = [
  { number: 1, label: "About You" },
  { number: 2, label: "Experience" },
  { number: 3, label: "Your Club" },
];

/* ────────────────────────────── component ────────────────────────────── */

export default function PlayerOnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  // Step 1
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Step 2
  const [experienceLevel, setExperienceLevel] = useState<string>("brand_new");
  const [yearsPlaying, setYearsPlaying] = useState(0);
  const [preferredPosition, setPreferredPosition] = useState<string>("any");

  // Step 3
  const [clubSearch, setClubSearch] = useState("");
  const [clubResults, setClubResults] = useState<{ id: string; name: string; city: string; state_code: string }[]>([]);
  const [selectedClub, setSelectedClub] = useState<string | null>(null);
  const [noClub, setNoClub] = useState(false);
  const [bowlingFormats, setBowlingFormats] = useState<string[]>([]);

  // Load existing player data
  useEffect(() => {
    async function loadPlayer() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: player } = await supabase
        .from("players")
        .select("id, display_name, avatar_url, bio, onboarding_completed")
        .eq("user_id", user.id)
        .single();

      if (player) {
        setPlayerId(player.id);
        setDisplayName(player.display_name || "");
        setAvatarUrl(player.avatar_url);
        if (player.bio) setBio(player.bio);
        if (player.onboarding_completed) {
          router.push("/");
          return;
        }
      }
      setLoading(false);
    }
    loadPlayer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Club search
  const searchClubs = useCallback(
    async (query: string) => {
      if (query.length < 2) {
        setClubResults([]);
        return;
      }
      const { data } = await supabase
        .from("clubs")
        .select("id, name, city, state_code")
        .ilike("name", `%${query}%`)
        .limit(8);
      if (data) setClubResults(data);
    },
    [supabase]
  );

  useEffect(() => {
    const timer = setTimeout(() => searchClubs(clubSearch), 300);
    return () => clearTimeout(timer);
  }, [clubSearch, searchClubs]);

  // Avatar upload handler
  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarUrl(URL.createObjectURL(file));
  }

  function toggleFormat(value: string) {
    setBowlingFormats((prev) =>
      prev.includes(value) ? prev.filter((f) => f !== value) : [...prev, value]
    );
  }

  // Save all data
  async function handleComplete() {
    if (!playerId) return;
    setSaving(true);

    let finalAvatarUrl = avatarUrl;

    // Upload avatar if a new file was selected
    if (avatarFile && playerId) {
      const ext = avatarFile.name.split(".").pop();
      const path = `avatars/${playerId}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(path, avatarFile, { upsert: true });

      if (!uploadErr) {
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
        finalAvatarUrl = urlData.publicUrl;
      }
    }

    const clubName = selectedClub
      ? clubResults.find((c) => c.id === selectedClub)?.name ?? null
      : null;

    await supabase
      .from("players")
      .update({
        display_name: displayName,
        bio: bio || null,
        avatar_url: finalAvatarUrl,
        experience_level: experienceLevel,
        years_playing: yearsPlaying,
        preferred_position: preferredPosition,
        home_club_name: clubName,
        bowling_formats: bowlingFormats,
        onboarding_completed: true,
      })
      .eq("id", playerId);

    setSaving(false);
    setCompleted(true);
  }

  function nextStep() {
    if (step === 2) {
      handleComplete();
    } else {
      setStep((s) => s + 1);
    }
  }

  function prevStep() {
    if (step > 0) setStep((s) => s - 1);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "#FEFCF9" }}>
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1B5E20] border-t-transparent" />
      </div>
    );
  }

  // Celebration screen
  if (completed) {
    return (
      <div
        className="flex min-h-screen items-center justify-center px-4"
        style={{ background: "#FEFCF9" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full"
            style={{ background: "#1B5E20" }}
          >
            <Check className="h-12 w-12 text-white" strokeWidth={3} />
          </motion.div>

          <h1
            className="mb-4 text-4xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display)", color: "#0A2E12" }}
          >
            You&apos;re All Set!
          </h1>

          <p className="mb-2 text-lg" style={{ color: "#3D5A3E" }}>
            Welcome to the green, {displayName}!
          </p>
          <p className="mb-10 text-base" style={{ color: "#3D5A3E" }}>
            Your profile is ready. Time to find a game.
          </p>

          <button
            onClick={() => {
              router.push("/");
              router.refresh();
            }}
            className="inline-flex items-center gap-2 rounded-2xl px-10 py-4 text-lg font-semibold text-white transition-colors"
            style={{ background: "#1B5E20", minHeight: 56 }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#2E7D32")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#1B5E20")}
          >
            Let&apos;s Go <ChevronRight className="h-5 w-5" />
          </button>

          <p className="mt-6 text-sm" style={{ color: "#3D5A3E" }}>
            You can change any of this anytime in Settings.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#FEFCF9" }}>
      {/* Header */}
      <div className="mx-auto max-w-xl px-4 pt-8 pb-4">
        <div className="mb-2 flex items-center justify-center gap-2">
          <CircleDot className="h-6 w-6" style={{ color: "#1B5E20" }} />
          <span className="text-lg font-bold" style={{ color: "#0A2E12" }}>
            Lawnbowling
          </span>
        </div>
        <h1
          className="mb-1 text-center text-3xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-display)", color: "#0A2E12" }}
        >
          Welcome to the Green!
        </h1>
        <p className="text-center text-base" style={{ color: "#3D5A3E" }}>
          Let&apos;s set up your bowler profile. It only takes a minute.
        </p>
      </div>

      {/* Progress indicator */}
      <div className="mx-auto mb-8 flex max-w-xs items-center justify-center gap-2 px-4">
        {STEPS.map((s, i) => (
          <div key={s.number} className="flex items-center gap-2">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold transition-colors"
              style={{
                background: i <= step ? "#1B5E20" : "#E8E8E8",
                color: i <= step ? "#FFFFFF" : "#999999",
              }}
            >
              {i < step ? <Check className="h-5 w-5" /> : s.number}
            </div>
            <span
              className="hidden text-sm font-medium sm:inline"
              style={{ color: i <= step ? "#0A2E12" : "#999999" }}
            >
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className="h-0.5 w-8"
                style={{ background: i < step ? "#1B5E20" : "#E8E8E8" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="mx-auto max-w-xl px-4 pb-32">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h2
                className="text-2xl font-bold"
                style={{ fontFamily: "var(--font-display)", color: "#0A2E12" }}
              >
                Tell Us About You
              </h2>

              {/* Avatar upload */}
              <div className="flex flex-col items-center gap-3">
                <label
                  htmlFor="avatar-upload"
                  className="group relative flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed transition-colors"
                  style={{ borderColor: "#1B5E20" }}
                >
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt="Profile photo"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Camera className="h-10 w-10" style={{ color: "#1B5E20" }} />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <span className="text-sm" style={{ color: "#3D5A3E" }}>
                  Add a profile photo (optional)
                </span>
              </div>

              {/* Display name */}
              <div>
                <label
                  htmlFor="display-name"
                  className="mb-2 block text-base font-semibold"
                  style={{ color: "#0A2E12" }}
                >
                  <User className="mr-2 inline h-5 w-5" style={{ color: "#1B5E20" }} />
                  Your Name
                </label>
                <input
                  id="display-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="block w-full rounded-2xl border bg-white px-5 py-4 text-lg transition-colors focus:outline-none focus:ring-2"
                  style={{
                    borderColor: "rgba(10,46,18,0.1)",
                    color: "#0A2E12",
                    minHeight: 56,
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#1B5E20")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(10,46,18,0.1)")}
                  placeholder="Your display name"
                />
              </div>

              {/* Bio */}
              <div>
                <label
                  htmlFor="bio"
                  className="mb-2 block text-base font-semibold"
                  style={{ color: "#0A2E12" }}
                >
                  About Me (optional)
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="block w-full rounded-2xl border bg-white px-5 py-4 text-base transition-colors focus:outline-none focus:ring-2"
                  style={{
                    borderColor: "rgba(10,46,18,0.1)",
                    color: "#0A2E12",
                    resize: "none",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#1B5E20")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(10,46,18,0.1)")}
                  placeholder="I've been bowling for 20 years at Sunset Club..."
                />
                <p className="mt-1 text-sm" style={{ color: "#3D5A3E" }}>
                  You can change this anytime in Settings.
                </p>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Experience level */}
              <div>
                <h2
                  className="mb-2 text-2xl font-bold"
                  style={{ fontFamily: "var(--font-display)", color: "#0A2E12" }}
                >
                  Your Bowling Experience
                </h2>
                <p className="mb-5 text-base" style={{ color: "#3D5A3E" }}>
                  How would you describe your experience?
                </p>

                <div className="grid gap-3">
                  {EXPERIENCE_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const selected = experienceLevel === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setExperienceLevel(opt.value)}
                        className="flex items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition-all"
                        style={{
                          borderColor: selected ? "#1B5E20" : "rgba(10,46,18,0.1)",
                          background: selected ? "rgba(27,94,32,0.06)" : "#FFFFFF",
                          minHeight: 64,
                        }}
                      >
                        <div
                          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
                          style={{
                            background: selected ? "#1B5E20" : "rgba(10,46,18,0.06)",
                          }}
                        >
                          <Icon
                            className="h-6 w-6"
                            style={{ color: selected ? "#FFFFFF" : "#1B5E20" }}
                          />
                        </div>
                        <div>
                          <div
                            className="text-lg font-semibold"
                            style={{ color: "#0A2E12" }}
                          >
                            {opt.label}
                          </div>
                          <div className="text-sm" style={{ color: "#3D5A3E" }}>
                            {opt.description}
                          </div>
                        </div>
                        {selected && (
                          <Check
                            className="ml-auto h-6 w-6 flex-shrink-0"
                            style={{ color: "#1B5E20" }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Years playing */}
              <div>
                <label
                  htmlFor="years-playing"
                  className="mb-2 block text-lg font-semibold"
                  style={{ color: "#0A2E12" }}
                >
                  How many years have you been bowling?
                </label>
                <div className="flex items-center gap-4">
                  <input
                    id="years-playing"
                    type="number"
                    min={0}
                    max={80}
                    value={yearsPlaying}
                    onChange={(e) =>
                      setYearsPlaying(Math.max(0, Math.min(80, Number(e.target.value))))
                    }
                    className="w-28 rounded-2xl border bg-white px-5 py-4 text-center text-2xl font-bold focus:outline-none focus:ring-2"
                    style={{
                      borderColor: "rgba(10,46,18,0.1)",
                      color: "#0A2E12",
                      minHeight: 56,
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#1B5E20")}
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = "rgba(10,46,18,0.1)")
                    }
                  />
                  <span className="text-lg" style={{ color: "#3D5A3E" }}>
                    {yearsPlaying === 1 ? "year" : "years"}
                  </span>
                </div>
              </div>

              {/* Preferred position */}
              <div>
                <h3
                  className="mb-2 text-lg font-semibold"
                  style={{ color: "#0A2E12" }}
                >
                  What position do you prefer?
                </h3>
                <p className="mb-4 text-sm" style={{ color: "#3D5A3E" }}>
                  You can change this anytime in Settings.
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {POSITION_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const selected = preferredPosition === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setPreferredPosition(opt.value)}
                        className="flex items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left transition-all"
                        style={{
                          borderColor: selected ? "#1B5E20" : "rgba(10,46,18,0.1)",
                          background: selected ? "rgba(27,94,32,0.06)" : "#FFFFFF",
                          minHeight: 56,
                        }}
                      >
                        <div
                          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                          style={{
                            background: selected ? "#1B5E20" : "rgba(10,46,18,0.06)",
                          }}
                        >
                          <Icon
                            className="h-5 w-5"
                            style={{ color: selected ? "#FFFFFF" : "#1B5E20" }}
                          />
                        </div>
                        <div>
                          <div
                            className="text-base font-semibold"
                            style={{ color: "#0A2E12" }}
                          >
                            {opt.label}
                          </div>
                          <div className="text-sm" style={{ color: "#3D5A3E" }}>
                            {opt.description}
                          </div>
                        </div>
                        {selected && (
                          <Check
                            className="ml-auto h-5 w-5 flex-shrink-0"
                            style={{ color: "#1B5E20" }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div>
                <h2
                  className="mb-2 text-2xl font-bold"
                  style={{ fontFamily: "var(--font-display)", color: "#0A2E12" }}
                >
                  Find Your Club
                </h2>
                <p className="mb-5 text-base" style={{ color: "#3D5A3E" }}>
                  Search for your home club, or skip if you don&apos;t have one yet.
                </p>

                {/* No club toggle */}
                <button
                  onClick={() => {
                    setNoClub(!noClub);
                    if (!noClub) {
                      setSelectedClub(null);
                      setClubSearch("");
                    }
                  }}
                  className="mb-4 flex items-center gap-3 rounded-2xl border-2 px-5 py-4 text-left transition-all w-full"
                  style={{
                    borderColor: noClub ? "#1B5E20" : "rgba(10,46,18,0.1)",
                    background: noClub ? "rgba(27,94,32,0.06)" : "#FFFFFF",
                    minHeight: 56,
                  }}
                >
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                    style={{
                      background: noClub ? "#1B5E20" : "rgba(10,46,18,0.06)",
                    }}
                  >
                    <MapPin
                      className="h-5 w-5"
                      style={{ color: noClub ? "#FFFFFF" : "#1B5E20" }}
                    />
                  </div>
                  <div>
                    <div className="text-base font-semibold" style={{ color: "#0A2E12" }}>
                      I don&apos;t have a club yet
                    </div>
                    <div className="text-sm" style={{ color: "#3D5A3E" }}>
                      No worries — you can add one later
                    </div>
                  </div>
                  {noClub && (
                    <Check className="ml-auto h-5 w-5 flex-shrink-0" style={{ color: "#1B5E20" }} />
                  )}
                </button>

                {/* Club search */}
                {!noClub && (
                  <div>
                    <div className="relative">
                      <Search
                        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2"
                        style={{ color: "#3D5A3E" }}
                      />
                      <input
                        type="text"
                        value={clubSearch}
                        onChange={(e) => setClubSearch(e.target.value)}
                        className="block w-full rounded-2xl border bg-white py-4 pl-12 pr-5 text-base transition-colors focus:outline-none focus:ring-2"
                        style={{
                          borderColor: "rgba(10,46,18,0.1)",
                          color: "#0A2E12",
                          minHeight: 56,
                        }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "#1B5E20")}
                        onBlur={(e) =>
                          (e.currentTarget.style.borderColor = "rgba(10,46,18,0.1)")
                        }
                        placeholder="Search by club name..."
                      />
                    </div>

                    {clubResults.length > 0 && (
                      <div className="mt-2 max-h-64 overflow-y-auto rounded-2xl border bg-white" style={{ borderColor: "rgba(10,46,18,0.1)" }}>
                        {clubResults.map((club) => {
                          const isSelected = selectedClub === club.id;
                          return (
                            <button
                              key={club.id}
                              onClick={() => setSelectedClub(isSelected ? null : club.id)}
                              className="flex w-full items-center gap-3 border-b px-5 py-4 text-left transition-colors last:border-b-0"
                              style={{
                                borderColor: "rgba(10,46,18,0.05)",
                                background: isSelected ? "rgba(27,94,32,0.06)" : "transparent",
                                minHeight: 56,
                              }}
                            >
                              <MapPin className="h-5 w-5 flex-shrink-0" style={{ color: "#1B5E20" }} />
                              <div>
                                <div className="text-base font-semibold" style={{ color: "#0A2E12" }}>
                                  {club.name}
                                </div>
                                <div className="text-sm" style={{ color: "#3D5A3E" }}>
                                  {club.city}, {club.state_code}
                                </div>
                              </div>
                              {isSelected && (
                                <Check className="ml-auto h-5 w-5 flex-shrink-0" style={{ color: "#1B5E20" }} />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {clubSearch.length >= 2 && clubResults.length === 0 && (
                      <p className="mt-3 text-center text-base" style={{ color: "#3D5A3E" }}>
                        No clubs found. You can add your club later in Settings.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Bowling formats */}
              <div>
                <h3
                  className="mb-2 text-lg font-semibold"
                  style={{ color: "#0A2E12" }}
                >
                  What formats do you enjoy?
                </h3>
                <p className="mb-4 text-sm" style={{ color: "#3D5A3E" }}>
                  Select all that apply. You can change this anytime.
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {FORMAT_OPTIONS.map((fmt) => {
                    const selected = bowlingFormats.includes(fmt.value);
                    return (
                      <button
                        key={fmt.value}
                        onClick={() => toggleFormat(fmt.value)}
                        className="rounded-2xl border-2 px-4 py-4 text-center text-base font-semibold transition-all"
                        style={{
                          borderColor: selected ? "#1B5E20" : "rgba(10,46,18,0.1)",
                          background: selected ? "rgba(27,94,32,0.06)" : "#FFFFFF",
                          color: selected ? "#1B5E20" : "#0A2E12",
                          minHeight: 56,
                        }}
                      >
                        {selected && <Check className="mx-auto mb-1 h-5 w-5" style={{ color: "#1B5E20" }} />}
                        {fmt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom navigation */}
      <div
        className="fixed bottom-0 left-0 right-0 border-t px-4 py-4"
        style={{ background: "#FEFCF9", borderColor: "rgba(10,46,18,0.1)" }}
      >
        <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
          {step > 0 ? (
            <button
              onClick={prevStep}
              className="flex items-center gap-2 rounded-2xl px-6 py-4 text-base font-semibold transition-colors"
              style={{ color: "#3D5A3E", minHeight: 56 }}
            >
              <ChevronLeft className="h-5 w-5" /> Back
            </button>
          ) : (
            <button
              onClick={() => {
                // Skip onboarding entirely
                if (playerId) {
                  supabase
                    .from("players")
                    .update({ onboarding_completed: true })
                    .eq("id", playerId)
                    .then(() => {
                      router.push("/");
                      router.refresh();
                    });
                }
              }}
              className="rounded-2xl px-6 py-4 text-base font-medium transition-colors"
              style={{ color: "#3D5A3E", minHeight: 56 }}
            >
              Skip for now
            </button>
          )}

          <button
            onClick={nextStep}
            disabled={saving || (step === 0 && !displayName.trim())}
            className="flex items-center gap-2 rounded-2xl px-8 py-4 text-lg font-semibold text-white transition-colors disabled:opacity-50"
            style={{ background: "#1B5E20", minHeight: 56 }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) e.currentTarget.style.background = "#2E7D32";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#1B5E20";
            }}
          >
            {saving ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : step === 2 ? (
              <>
                Finish <Check className="h-5 w-5" />
              </>
            ) : (
              <>
                Continue <ChevronRight className="h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
