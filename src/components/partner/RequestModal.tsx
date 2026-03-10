"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import * as Select from "@radix-ui/react-select";
import { X, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { SPORT_LABELS, SKILL_LABELS } from "@/lib/types";
import { getSportColor } from "@/lib/design";
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
  const [success, setSuccess] = useState(false);

  const initials = target.display_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const sportColor = getSportColor(selectedSport || "pickleball");

  async function handleSubmit() {
    if (!selectedSport || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(target.id, selectedSport);
      setSuccess(true);
      setTimeout(() => {
        onOpenChange(false);
        setSuccess(false);
      }, 1200);
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
        <Dialog.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
        </Dialog.Overlay>
        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed z-50 w-full glass p-6 shadow-2xl bottom-0 left-0 right-0 rounded-t-2xl sm:rounded-2xl sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-w-sm sm:-translate-x-1/2 sm:-translate-y-1/2"
            style={{ boxShadow: `0 0 40px ${sportColor.glow}, 0 20px 60px rgba(0,0,0,0.5)` }}
          >
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20"
                  >
                    <Check className="h-8 w-8 text-emerald-400" />
                  </motion.div>
                  <p className="mt-4 text-lg font-semibold text-zinc-100">Request Sent!</p>
                </motion.div>
              ) : (
                <motion.div key="form">
                  <Dialog.Close className="absolute right-4 top-4 rounded-full p-1 text-zinc-500 hover:text-zinc-300 transition-colors">
                    <X className="h-5 w-5" />
                  </Dialog.Close>

                  <Dialog.Title className="text-center text-lg font-semibold text-zinc-100 mb-6">
                    Pick {target.display_name} as your partner?
                  </Dialog.Title>

                  {/* Target player card */}
                  <div className="flex flex-col items-center gap-3 rounded-xl glass-light p-5 mb-6">
                    <div className="relative">
                      {target.avatar_url ? (
                        <img
                          src={target.avatar_url}
                          alt={target.display_name}
                          className={cn("h-16 w-16 rounded-full object-cover ring-2 shadow-lg", sportColor.ring)}
                        />
                      ) : (
                        <div className={cn(
                          "flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold text-white ring-2 shadow-lg",
                          `bg-gradient-to-br ${sportColor.gradient}`,
                          sportColor.ring
                        )}>
                          {initials}
                        </div>
                      )}
                      <div
                        className="absolute -inset-1 rounded-full opacity-30 blur-md -z-10"
                        style={{ backgroundColor: sportColor.primary }}
                      />
                    </div>
                    <h3 className="text-base font-semibold text-zinc-100">{target.display_name}</h3>
                    {skillInfo && (
                      <span className="inline-flex items-center gap-1 text-sm text-amber-400">
                        {"\u2605".repeat(skillInfo.stars)}{"\u2606".repeat(3 - skillInfo.stars)}{" "}
                        <span className="text-zinc-400">{skillInfo.label}</span>
                      </span>
                    )}
                  </div>

                  {/* Sport selector */}
                  <div className="mb-6">
                    <label className="mb-2 block text-sm font-medium text-zinc-400">Sport</label>
                    <Select.Root value={selectedSport} onValueChange={setSelectedSport}>
                      <Select.Trigger className="inline-flex h-11 w-full items-center justify-between rounded-xl border border-zinc-700/50 bg-zinc-800/60 px-4 text-sm text-zinc-200 hover:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 min-h-[44px]">
                        <Select.Value />
                        <Select.Icon>
                          <ChevronDown className="h-4 w-4 text-zinc-500" />
                        </Select.Icon>
                      </Select.Trigger>
                      <Select.Portal>
                        <Select.Content className="z-50 overflow-hidden rounded-xl border border-zinc-700/50 bg-zinc-800 shadow-xl backdrop-blur">
                          <Select.Viewport className="p-1">
                            {availableSports.map((sport) => {
                              const info = SPORT_LABELS[sport as Sport];
                              return (
                                <Select.Item
                                  key={sport}
                                  value={sport}
                                  className="flex h-10 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm text-zinc-200 outline-none data-[highlighted]:bg-zinc-700/60 min-h-[44px]"
                                >
                                  <Select.ItemText>
                                    {info?.emoji || ""} {info?.label || sport}
                                  </Select.ItemText>
                                  <Select.ItemIndicator className="ml-auto">
                                    <Check className="h-4 w-4 text-emerald-400" />
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
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSubmit}
                      disabled={submitting || !selectedSport}
                      className={cn(
                        "w-full rounded-xl px-4 py-3 text-base font-bold text-white shadow-lg btn-press min-h-[44px]",
                        `bg-gradient-to-r ${sportColor.gradient}`,
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                      style={{ boxShadow: `0 0 20px ${sportColor.glow}` }}
                    >
                      {submitting ? "Sending..." : "\u{1F91D} PICK EM"}
                    </motion.button>
                    <button
                      onClick={() => onOpenChange(false)}
                      className="w-full rounded-xl px-4 py-3 text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors min-h-[44px]"
                    >
                      Nevermind
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
