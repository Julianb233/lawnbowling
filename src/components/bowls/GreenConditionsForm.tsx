"use client";

import { useState } from "react";
import type { GreenConditions, GreenSpeed, SurfaceCondition, WindDirection, WindStrength } from "@/lib/types";
import {
  GREEN_SPEED_LABELS,
  SURFACE_CONDITION_LABELS,
  WIND_STRENGTH_LABELS,
} from "@/lib/types";
import { cn } from "@/lib/utils";

interface GreenConditionsFormProps {
  tournamentId: string;
  existing?: GreenConditions | null;
  onSaved: (conditions: GreenConditions) => void;
  onCancel: () => void;
}

const SPEEDS: GreenSpeed[] = ["slow", "medium", "fast"];
const SURFACES: SurfaceCondition[] = ["dry", "damp", "wet"];
const STRENGTHS: WindStrength[] = ["calm", "light", "moderate", "strong"];

// 3x3 grid: top-left=NW, top-center=N, top-right=NE, etc.
const COMPASS_GRID: (WindDirection | null)[][] = [
  ["NW", "N", "NE"],
  ["W", "calm", "E"],
  ["SW", "S", "SE"],
];

const COMPASS_LABELS: Record<string, string> = {
  N: "N", NE: "NE", E: "E", SE: "SE", S: "S", SW: "SW", W: "W", NW: "NW", calm: "--",
};

export function GreenConditionsForm({ tournamentId, existing, onSaved, onCancel }: GreenConditionsFormProps) {
  const [speed, setSpeed] = useState<GreenSpeed>(existing?.green_speed ?? "medium");
  const [surface, setSurface] = useState<SurfaceCondition>(existing?.surface_condition ?? "dry");
  const [windDir, setWindDir] = useState<WindDirection>(existing?.wind_direction ?? "calm");
  const [windStr, setWindStr] = useState<WindStrength>(existing?.wind_strength ?? "calm");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/bowls/green-conditions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournament_id: tournamentId,
          green_speed: speed,
          surface_condition: surface,
          wind_direction: windDir,
          wind_strength: windStr,
          notes: notes || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      const saved = await res.json();
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save conditions");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h3 className="text-lg font-black text-[#0A2E12]">Log Green Conditions</h3>

      {/* Green Speed */}
      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3D5A3E]">
          Green Speed
        </label>
        <div className="grid grid-cols-3 gap-2">
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeed(s)}
              className={cn(
                "rounded-xl border px-3 py-3 text-sm font-semibold transition-all",
                speed === s
                  ? "border-[#1B5E20] bg-[#1B5E20]/10 text-[#1B5E20]"
                  : "border-[#0A2E12]/10 bg-white text-[#3D5A3E] hover:border-[#0A2E12]/10"
              )}
            >
              {GREEN_SPEED_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Surface Condition */}
      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3D5A3E]">
          Surface
        </label>
        <div className="grid grid-cols-3 gap-2">
          {SURFACES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSurface(s)}
              className={cn(
                "rounded-xl border px-3 py-3 text-sm font-semibold transition-all",
                surface === s
                  ? "border-[#1B5E20] bg-[#1B5E20]/10 text-[#1B5E20]"
                  : "border-[#0A2E12]/10 bg-white text-[#3D5A3E] hover:border-[#0A2E12]/10"
              )}
            >
              {SURFACE_CONDITION_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Wind Direction - Compass Rose (3x3 grid) */}
      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3D5A3E]">
          Wind Direction
        </label>
        <div className="mx-auto w-fit">
          <div className="grid grid-cols-3 gap-1.5">
            {COMPASS_GRID.flat().map((dir) => {
              if (!dir) return <div key="empty" />;
              return (
                <button
                  key={dir}
                  type="button"
                  onClick={() => setWindDir(dir)}
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl border text-sm font-bold transition-all",
                    windDir === dir
                      ? "border-[#1B5E20] bg-[#1B5E20] text-white"
                      : "border-[#0A2E12]/10 bg-white text-[#3D5A3E] hover:border-[#0A2E12]/10"
                  )}
                >
                  {COMPASS_LABELS[dir]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Wind Strength */}
      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3D5A3E]">
          Wind Strength
        </label>
        <div className="grid grid-cols-4 gap-2">
          {STRENGTHS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setWindStr(s)}
              className={cn(
                "rounded-xl border px-2 py-3 text-xs font-semibold transition-all",
                windStr === s
                  ? "border-[#1B5E20] bg-[#1B5E20]/10 text-[#1B5E20]"
                  : "border-[#0A2E12]/10 bg-white text-[#3D5A3E] hover:border-[#0A2E12]/10"
              )}
            >
              {WIND_STRENGTH_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3D5A3E]">
          Notes <span className="font-normal text-[#3D5A3E]">(optional)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={280}
          rows={2}
          placeholder="e.g. Heavy on the backhand side..."
          className="w-full rounded-xl border border-[#0A2E12]/10 bg-white px-4 py-3 text-sm text-[#0A2E12] placeholder:text-[#3D5A3E] focus:border-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 resize-none"
        />
        <p className="mt-1 text-right text-[11px] text-[#3D5A3E]">{notes.length}/280</p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-[#0A2E12]/10 bg-[#0A2E12]/[0.03] py-3 text-sm font-semibold text-[#3D5A3E] hover:bg-[#0A2E12]/5 min-h-[48px] touch-manipulation"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-xl bg-[#1B5E20] py-3 text-sm font-bold text-white hover:bg-[#145218] disabled:opacity-50 min-h-[48px] touch-manipulation"
        >
          {saving ? "Saving..." : "Save Conditions"}
        </button>
      </div>
    </form>
  );
}
