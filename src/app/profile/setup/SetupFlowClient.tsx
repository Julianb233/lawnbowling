"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { WaiverForm } from "@/components/waiver/WaiverForm";
import { InsuranceOffer } from "@/components/insurance/InsuranceOffer";
import type { SkillLevel, Sport } from "@/lib/db/players";
import { CheckCircle2 } from "lucide-react";

type Step = "profile" | "waiver" | "insurance" | "complete";

export function SetupFlowClient({ userId }: { userId: string }) {
  const [step, setStep] = useState<Step>("profile");
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [waiverText, setWaiverText] = useState<string | undefined>(undefined);
  const [venueName, setVenueName] = useState<string | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/waiver/template")
      .then((r) => r.json())
      .then((data) => {
        if (data.template?.body) {
          setWaiverText(data.template.body);
        }
        if (data.venue_name) {
          setVenueName(data.venue_name);
        }
      })
      .catch(() => {
        // Fall back to default waiver text in WaiverForm
      });
  }, []);

  async function handleProfileSubmit(data: {
    display_name: string;
    skill_level: SkillLevel;
    sports: Sport[];
    avatar_url: string | null;
  }) {
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create profile");
    }

    const player = await res.json();
    setPlayerId(player.id);
    setStep("waiver");
  }

  async function handleAvatarUpload(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/profile/avatar", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Failed to upload avatar");
    const { url } = await res.json();
    return url;
  }

  async function handleWaiverSubmit() {
    if (!playerId) return;

    const res = await fetch("/api/waiver/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player_id: playerId }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to sign waiver");
    }

    setStep("insurance");
  }

  function handleInsuranceDismiss() {
    setStep("complete");
    setTimeout(() => router.push("/"), 2000);
  }

  if (step === "complete") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FEFCF9] px-4">
        <div className="text-center">
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-600" />
          <h1 className="text-2xl font-bold text-[#0A2E12]">You&apos;re All Set!</h1>
          <p className="mt-2 text-[#3D5A3E]">Redirecting to the board...</p>
        </div>
      </div>
    );
  }

  const steps = [
    { key: "profile", label: "Profile" },
    { key: "waiver", label: "Waiver" },
    { key: "insurance", label: "Insurance" },
  ];

  const currentIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="min-h-screen bg-[#FEFCF9] px-4 py-8">
      <div className="mx-auto max-w-md">
        <h1 className="mb-2 text-2xl font-bold text-[#0A2E12]">Welcome!</h1>
        <p className="mb-6 text-[#3D5A3E]">Let&apos;s get you set up to play.</p>

        {/* Step indicator */}
        <div className="mb-8 flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s.key} className="flex flex-1 items-center gap-2">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  i <= currentIndex
                    ? "bg-[#1B5E20] text-white"
                    : "bg-[#0A2E12]/5 text-[#3D5A3E]"
                }`}
              >
                {i + 1}
              </div>
              <span className={`text-xs ${i <= currentIndex ? "text-[#0A2E12]" : "text-[#3D5A3E]"}`}>
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <div className={`h-px flex-1 ${i < currentIndex ? "bg-[#1B5E20]" : "bg-[#0A2E12]/5"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="rounded-xl glass p-6 shadow-sm">
          {step === "profile" && (
            <ProfileForm
              onSubmit={handleProfileSubmit}
              onAvatarUpload={handleAvatarUpload}
              submitLabel="Continue"
            />
          )}

          {step === "waiver" && (
            <WaiverForm
              onSubmit={handleWaiverSubmit}
              waiverText={waiverText}
              venueName={venueName}
            />
          )}

          {step === "insurance" && (
            <InsuranceOffer
              onDismiss={handleInsuranceDismiss}
              onStatusUpdate={async (status) => {
                await fetch("/api/insurance/status", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status }),
                });
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
