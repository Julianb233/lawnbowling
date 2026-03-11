"use client";

import { Plus, Trash2 } from "lucide-react";

interface Green {
  name: string;
  rinkCount: number;
}

interface GreensSetupStepProps {
  greens: Green[];
  onChange: (greens: Green[]) => void;
  errors: Record<string, string>;
}

export function GreensSetupStep({ greens, onChange, errors }: GreensSetupStepProps) {
  function addGreen() {
    onChange([...greens, { name: `Green ${greens.length + 1}`, rinkCount: 6 }]);
  }

  function removeGreen(index: number) {
    onChange(greens.filter((_, i) => i !== index));
  }

  function updateGreen(index: number, field: keyof Green, value: string | number) {
    const updated = [...greens];
    if (field === "rinkCount") {
      updated[index] = { ...updated[index], rinkCount: Number(value) || 1 };
    } else {
      updated[index] = { ...updated[index], name: String(value) };
    }
    onChange(updated);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-zinc-900 dark:text-foreground">Greens Setup</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Add your bowling greens and how many rinks each has.</p>
      </div>

      {errors.greens && <p className="text-xs text-red-500">{errors.greens}</p>}

      <div className="space-y-3">
        {greens.map((green, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 p-4">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">Green Name</label>
              <input
                type="text"
                value={green.name}
                onChange={(e) => updateGreen(i, "name", e.target.value)}
                className="w-full rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-background px-3 py-2 text-sm text-zinc-900 dark:text-foreground outline-none focus:border-green-500/50 min-h-[44px]"
              />
            </div>
            <div className="w-24">
              <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">Rinks</label>
              <input
                type="number"
                min="1"
                max="20"
                value={green.rinkCount}
                onChange={(e) => updateGreen(i, "rinkCount", e.target.value)}
                className="w-full rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-background px-3 py-2 text-sm text-zinc-900 dark:text-foreground outline-none focus:border-green-500/50 min-h-[44px]"
              />
            </div>
            {greens.length > 1 && (
              <button
                onClick={() => removeGreen(i)}
                className="mt-5 rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-colors min-h-[44px]"
                aria-label={`Remove ${green.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addGreen}
        className="flex items-center gap-2 rounded-xl border border-dashed border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-500 dark:text-muted-foreground hover:border-green-400 hover:text-green-600 transition-colors w-full justify-center min-h-[44px]"
      >
        <Plus className="h-4 w-4" /> Add Another Green
      </button>
    </div>
  );
}
