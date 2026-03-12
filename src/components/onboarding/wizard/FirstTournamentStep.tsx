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
        <h2 className="text-2xl font-black text-[#0A2E12]">First Tournament</h2>
        <p className="mt-1 text-sm text-[#3D5A3E]">
          Set up your first tournament to get started. This step is optional.
        </p>
      </div>

      <div>
        <label htmlFor="tournament-name" className="mb-1.5 block text-sm font-medium text-[#2D4A30]">
          Tournament Name
        </label>
        <input
          id="tournament-name"
          type="text"
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          className="w-full rounded-lg border border-[#0A2E12]/10 bg-white px-4 py-3 text-[#0A2E12] placeholder-[#3D5A3E] outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 min-h-[44px]"
          placeholder="e.g., Saturday Social Bowls"
        />
      </div>

      <div>
        <label htmlFor="tournament-date" className="mb-1.5 block text-sm font-medium text-[#2D4A30]">
          Date
        </label>
        <input
          id="tournament-date"
          type="date"
          value={data.date}
          onChange={(e) => onChange({ ...data, date: e.target.value })}
          className="w-full rounded-lg border border-[#0A2E12]/10 bg-white px-4 py-3 text-[#0A2E12] placeholder-[#3D5A3E] outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 min-h-[44px]"
        />
      </div>

      {skippable && (
        <button
          onClick={onSkip}
          className="text-sm text-[#3D5A3E] hover:text-[#3D5A3E] underline underline-offset-2 transition-colors"
        >
          Skip this step - I'll create one later
        </button>
      )}
    </div>
  );
}
