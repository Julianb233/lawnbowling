"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { ALL_SPORTS, SPORT_LABELS, type Sport } from "@/lib/types";

interface CreateGameModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export function CreateGameModal({ open, onClose, onCreated }: CreateGameModalProps) {
  const [title, setTitle] = useState("");
  const [sport, setSport] = useState<string>("pickleball");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [description, setDescription] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!open) return null;

  function submit() {
    if (!title || !date || !time) return;
    startTransition(async () => {
      const scheduledAt = new Date(`${date}T${time}`).toISOString();
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          sport,
          scheduled_at: scheduledAt,
          max_players: maxPlayers,
          description: description || undefined,
          is_recurring: isRecurring,
          recurrence_rule: isRecurring ? recurrenceRule : undefined,
        }),
      });
      if (res.ok) {
        onCreated?.();
        onClose();
        setTitle("");
        setDescription("");
        setDate("");
        setTime("");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl glass p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-zinc-900 mb-4">
          Schedule a Game
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Friday Night Pickleball"
              className="w-full rounded-xl bg-zinc-100 border border-zinc-200 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/50"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Sport</label>
            <div className="flex gap-2 flex-wrap">
              {ALL_SPORTS.map((s) => {
                const info = SPORT_LABELS[s as Sport];
                return (
                  <button
                    key={s}
                    onClick={() => setSport(s)}
                    className={cn(
                      "rounded-xl px-3 py-2 text-sm border transition-all",
                      sport === s
                        ? "border-[#1B5E20]/50 bg-[#1B5E20]/10 text-[#1B5E20]"
                        : "border-zinc-200 text-zinc-400 hover:bg-zinc-100"
                    )}
                  >
                    {info?.emoji} {info?.label || s}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl bg-zinc-100 border border-zinc-200 px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/50"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-xl bg-zinc-100 border border-zinc-200 px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              Max Players
            </label>
            <input
              type="number"
              min={2}
              max={20}
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value))}
              className="w-full rounded-xl bg-zinc-100 border border-zinc-200 px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/50"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="All skill levels welcome!"
              className="w-full rounded-xl bg-zinc-100 border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-500 resize-none h-16 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/50"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRecurring(!isRecurring)}
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors",
                isRecurring ? "bg-[#1B5E20]" : "bg-zinc-700"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                  isRecurring && "translate-x-5"
                )}
              />
            </button>
            <span className="text-sm text-zinc-600">Recurring</span>
          </div>

          {isRecurring && (
            <div>
              <label className="block text-sm text-zinc-400 mb-1">
                Recurrence
              </label>
              <select
                value={recurrenceRule}
                onChange={(e) => setRecurrenceRule(e.target.value)}
                className="w-full rounded-xl bg-zinc-100 border border-zinc-200 px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/50"
              >
                <option value="">Select...</option>
                <option value="weekly:monday">Weekly - Monday</option>
                <option value="weekly:tuesday">Weekly - Tuesday</option>
                <option value="weekly:wednesday">Weekly - Wednesday</option>
                <option value="weekly:thursday">Weekly - Thursday</option>
                <option value="weekly:friday">Weekly - Friday</option>
                <option value="weekly:saturday">Weekly - Saturday</option>
                <option value="weekly:sunday">Weekly - Sunday</option>
                <option value="biweekly:monday">Biweekly - Monday</option>
                <option value="biweekly:friday">Biweekly - Friday</option>
              </select>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-400 hover:bg-zinc-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!title || !date || !time || isPending}
            className={cn(
              "flex-1 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-all",
              title && date && time
                ? "bg-gradient-to-r from-[#1B5E20] to-green-600 hover:shadow-lg"
                : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
            )}
          >
            Create Game
          </button>
        </div>
      </div>
    </div>
  );
}
