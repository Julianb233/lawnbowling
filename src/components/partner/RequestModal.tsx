"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Select from "@radix-ui/react-select";
import { X, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SPORT_LABELS, SKILL_LABELS } from "@/lib/types";
import type { Player, Sport } from "@/lib/types";

interface RequestModalProps {
  target: Player;
  currentPlayerSports: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (targetId: string, sport: string) => Promise<void>;
}

export function RequestModal({
  target,
  currentPlayerSports,
  open,
  onOpenChange,
  onSubmit,
}: RequestModalProps) {
  const commonSports = target.sports.filter((s) => currentPlayerSports.includes(s));
  const availableSports = commonSports.length > 0 ? commonSports : target.sports;
  const [selectedSport, setSelectedSport] = useState(availableSports[0] || "");
  const [submitting, setSubmitting] = useState(false);

  const initials = target.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleSubmit() {
    if (!selectedSport || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(target.id, selectedSport);
      onOpenChange(false);
    } catch {
      // Error handled by caller
    } finally {
      setSubmitting(false);
    }
  }

  const skillInfo = SKILL_LABELS[target.skill_level];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl">
          <Dialog.Close className="absolute right-4 top-4 rounded-full p-1 text-zinc-400 hover:text-zinc-600 transition-colors">
            <X className="h-5 w-5" />
          </Dialog.Close>

          <Dialog.Title className="text-center text-lg font-semibold text-zinc-900 mb-6">
            Pick {target.name} as your partner?
          </Dialog.Title>

          {/* Target player card */}
          <div className="flex flex-col items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-5 mb-6">
            {target.avatar_url ? (
              <img
                src={target.avatar_url}
                alt={target.name}
                className="h-16 w-16 rounded-full object-cover ring-2 ring-white shadow"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-lg font-bold text-white ring-2 ring-white shadow">
                {initials}
              </div>
            )}
            <h3 className="text-base font-semibold text-zinc-900">{target.name}</h3>
            {skillInfo && (
              <span className="inline-flex items-center gap-1 text-sm text-amber-500">
                {"★".repeat(skillInfo.stars)}{"☆".repeat(3 - skillInfo.stars)}{" "}
                <span className="text-zinc-500">{skillInfo.label}</span>
              </span>
            )}
          </div>

          {/* Sport selector */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-zinc-600">Sport</label>
            <Select.Root value={selectedSport} onValueChange={setSelectedSport}>
              <Select.Trigger className="inline-flex h-11 w-full items-center justify-between rounded-lg border border-zinc-300 bg-white px-4 text-sm text-zinc-900 hover:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]">
                <Select.Value />
                <Select.Icon>
                  <ChevronDown className="h-4 w-4 text-zinc-400" />
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content className="z-50 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-xl">
                  <Select.Viewport className="p-1">
                    {availableSports.map((sport) => {
                      const info = SPORT_LABELS[sport as Sport];
                      return (
                        <Select.Item
                          key={sport}
                          value={sport}
                          className="flex h-10 cursor-pointer items-center gap-2 rounded-md px-3 text-sm text-zinc-900 outline-none data-[highlighted]:bg-zinc-100 min-h-[44px]"
                        >
                          <Select.ItemText>
                            {info?.emoji || ""} {info?.label || sport}
                          </Select.ItemText>
                          <Select.ItemIndicator className="ml-auto">
                            <Check className="h-4 w-4 text-emerald-500" />
                          </Select.ItemIndicator>
                        </Select.Item>
                      );
                    })}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={submitting || !selectedSport}
              className="w-full text-base font-semibold"
            >
              {submitting ? "Sending..." : "\u{1F91D} PICK EM"}
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => onOpenChange(false)}
              className="w-full text-zinc-500"
            >
              Nevermind
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
