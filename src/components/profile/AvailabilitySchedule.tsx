"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar, Clock } from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TIME_SLOTS = [
  { label: "Morning", start: "06:00", end: "12:00" },
  { label: "Afternoon", start: "12:00", end: "17:00" },
  { label: "Evening", start: "17:00", end: "21:00" },
];

interface AvailabilitySlot {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

interface AvailabilityScheduleProps {
  playerId: string;
  editable?: boolean;
}

export function AvailabilitySchedule({ playerId, editable = false }: AvailabilityScheduleProps) {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [pendingSlots, setPendingSlots] = useState<Set<string>>(new Set());

  const loadSlots = useCallback(async () => {
    try {
      const url = editable
        ? "/api/profile/availability"
        : `/api/profile/availability?player_id=${playerId}`;
      const res = await fetch(url);
      if (res.ok) {
        const data: AvailabilitySlot[] = await res.json();
        setSlots(data);
        // Build set of active slot keys
        const active = new Set<string>();
        for (const s of data) {
          if (s.is_active) {
            active.add(`${s.day_of_week}-${s.start_time}`);
          }
        }
        setPendingSlots(active);
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, [playerId, editable]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  function toggleSlot(day: number, timeSlot: typeof TIME_SLOTS[number]) {
    const key = `${day}-${timeSlot.start}`;
    setPendingSlots((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const newSlots = Array.from(pendingSlots).map((key) => {
        const [dayStr, startTime] = key.split("-");
        const day = parseInt(dayStr, 10);
        const timeSlot = TIME_SLOTS.find((t) => t.start === startTime)!;
        return {
          day_of_week: day,
          start_time: timeSlot.start,
          end_time: timeSlot.end,
        };
      });

      const res = await fetch("/api/profile/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots: newSlots }),
      });

      if (res.ok) {
        const data = await res.json();
        setSlots(data);
        setEditing(false);
      }
    } catch {
      // silent fail
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div>
        <h2 className="mb-2 text-sm font-medium text-zinc-600">Availability</h2>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-center">
          <div className="h-5 w-5 mx-auto animate-spin rounded-full border-2 border-[#1B5E20] border-t-transparent" />
        </div>
      </div>
    );
  }

  const hasSlots = slots.length > 0 || pendingSlots.size > 0;

  if (!hasSlots && !editable) {
    return (
      <div>
        <h2 className="mb-2 text-sm font-medium text-zinc-600">Availability</h2>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-center">
          <Calendar className="mx-auto mb-1 h-8 w-8 text-zinc-300" />
          <p className="text-sm text-zinc-500">No availability set</p>
        </div>
      </div>
    );
  }

  const isEditing = editable && editing;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium text-zinc-600">
          Availability
        </h2>
        {editable && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-xs font-medium text-[#1B5E20] hover:underline"
          >
            Edit
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 overflow-x-auto">
        <div className="grid grid-cols-[auto_repeat(7,1fr)] gap-1 min-w-[320px]">
          {/* Header row */}
          <div className="flex items-center justify-center p-1">
            <Clock className="h-3 w-3 text-zinc-400" />
          </div>
          {DAYS.map((day, i) => (
            <div
              key={i}
              className="text-center text-[11px] font-semibold text-zinc-500 p-1"
            >
              {day}
            </div>
          ))}

          {/* Time slot rows */}
          {TIME_SLOTS.map((timeSlot) => (
            <>
              <div
                key={`label-${timeSlot.start}`}
                className="flex items-center text-[11px] text-zinc-400 pr-1 whitespace-nowrap"
              >
                {timeSlot.label}
              </div>
              {DAYS.map((_, dayIndex) => {
                const key = `${dayIndex}-${timeSlot.start}`;
                const isActive = pendingSlots.has(key);

                return (
                  <button
                    key={`${dayIndex}-${timeSlot.start}`}
                    onClick={() => isEditing && toggleSlot(dayIndex, timeSlot)}
                    disabled={!isEditing}
                    className={`rounded-md h-8 transition-colors ${
                      isActive
                        ? "bg-[#1B5E20]/20 border border-[#1B5E20]/30"
                        : "bg-zinc-100 border border-zinc-200"
                    } ${
                      isEditing
                        ? "cursor-pointer hover:border-[#1B5E20]/50"
                        : "cursor-default"
                    }`}
                    title={`${DAYS[dayIndex]} ${timeSlot.label}`}
                  />
                );
              })}
            </>
          ))}
        </div>

        {isEditing && (
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 rounded-lg bg-[#1B5E20] px-3 py-2 text-sm font-medium text-white hover:bg-[#1B5E20]/90 disabled:opacity-50 min-h-[36px]"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                // Reset to saved state
                const active = new Set<string>();
                for (const s of slots) {
                  if (s.is_active) {
                    active.add(`${s.day_of_week}-${s.start_time}`);
                  }
                }
                setPendingSlots(active);
              }}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-50 min-h-[36px]"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
