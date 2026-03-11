"use client";

import { useState, useRef } from "react";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check, FileText } from "lucide-react";

const DEFAULT_WAIVER_TEXT = `LIABILITY WAIVER AND RELEASE OF CLAIMS

By signing this waiver, I acknowledge and agree to the following:

1. ASSUMPTION OF RISK: I understand that participating in recreational sports activities including but not limited to pickleball, lawn bowling, tennis, badminton, and table tennis involves inherent risks of physical injury. I voluntarily assume all risks associated with my participation.

2. RELEASE OF LIABILITY: I hereby release, discharge, and hold harmless the venue, its owners, operators, employees, and agents from any and all claims, demands, or causes of action arising from my participation in activities at this venue.

3. MEDICAL ACKNOWLEDGMENT: I confirm that I am physically fit to participate in recreational sports activities. I understand that the venue does not provide medical personnel on-site.

4. RULES AND CONDUCT: I agree to follow all posted rules, guidelines, and instructions provided by venue staff. I understand that failure to comply may result in removal from the premises.

5. PERSONAL PROPERTY: I understand that the venue is not responsible for lost, stolen, or damaged personal property.

6. PHOTO/VIDEO CONSENT: I consent to being photographed or recorded during activities for venue promotional purposes.

This waiver is valid for the duration of my membership/participation at this venue.`;

interface WaiverFormProps {
  waiverText?: string;
  onSubmit: () => Promise<void>;
  venueName?: string;
}

export function WaiverForm({ waiverText = DEFAULT_WAIVER_TEXT, onSubmit, venueName = "this venue" }: WaiverFormProps) {
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accepted) return;

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit waiver");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
        <FileText className="h-5 w-5" />
        <h3 className="text-sm font-medium uppercase tracking-wide">Liability Waiver</h3>
      </div>

      <div
        ref={scrollRef}
        className="max-h-64 overflow-y-auto rounded-lg border border-zinc-200 bg-black/30 p-4 text-sm leading-relaxed text-white/70"
      >
        <pre className="whitespace-pre-wrap font-sans">{waiverText}</pre>
      </div>

      <div className="flex items-start gap-3">
        <Checkbox.Root
          checked={accepted}
          onCheckedChange={(checked) => setAccepted(checked === true)}
          className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border border-white/30 bg-zinc-50 transition-colors data-[state=checked]:border-[#1B5E20] data-[state=checked]:bg-[#1B5E20] min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0"
          id="waiver-accept"
        >
          <Checkbox.Indicator>
            <Check className="h-4 w-4 text-white" />
          </Checkbox.Indicator>
        </Checkbox.Root>
        <label htmlFor="waiver-accept" className="text-sm text-zinc-700 cursor-pointer">
          I accept the liability waiver and terms for activities at {venueName}. I understand and acknowledge the risks
          involved in recreational sports participation.
        </label>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={!accepted || submitting}
        className="w-full rounded-lg bg-[#1B5E20] px-4 py-3 font-medium text-white transition-colors hover:bg-[#1B5E20] disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px]"
      >
        {submitting ? "Submitting..." : "Sign Waiver"}
      </button>
    </form>
  );
}
