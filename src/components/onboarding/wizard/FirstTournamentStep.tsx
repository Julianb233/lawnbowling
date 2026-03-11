"use client";

interface TournamentData {
  name: string;
  date: string;
}

interface FirstTournamentStepProps {
  data: TournamentData;
  onChange: (data: TournamentData) => void;
  skippable: boolean;
  onSkip: () => void;
}

export function FirstTournamentStep({ data, onChange, skippable, onSkip }: FirstTournamentStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-zinc-900 dark:text-foreground">First Tournament</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-muted-foreground">
          Set up your first tournament to get started. This step is optional.
        </p>
      </div>

      <div>
        <label htmlFor="tournament-name" className="mb-1.5 block text-sm font-medium text-zinc-700">
          Tournament Name
        </label>
        <input
          id="tournament-name"
          type="text"
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 min-h-[44px]"
          placeholder="e.g., Saturday Social Bowls"
        />
      </div>

      <div>
        <label htmlFor="tournament-date" className="mb-1.5 block text-sm font-medium text-zinc-700">
          Date
        </label>
        <input
          id="tournament-date"
          type="date"
          value={data.date}
          onChange={(e) => onChange({ ...data, date: e.target.value })}
          className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 min-h-[44px]"
        />
      </div>

      {skippable && (
        <button
          onClick={onSkip}
          className="text-sm text-zinc-400 hover:text-zinc-600 underline underline-offset-2 transition-colors"
        >
          Skip this step - I'll create one later
        </button>
      )}
    </div>
  );
}
