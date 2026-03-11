"use client";

import { Check, ExternalLink } from "lucide-react";
import Link from "next/link";

interface CompletedItems {
  clubProfile: boolean;
  greens: boolean;
  members: boolean;
  tournament: boolean;
}

interface DoneStepProps {
  completedItems: CompletedItems;
  clubName: string;
}

export function DoneStep({ completedItems, clubName }: DoneStepProps) {
  const items = [
    { label: "Club profile configured", done: completedItems.clubProfile },
    { label: "Bowling greens added", done: completedItems.greens },
    { label: "Members imported", done: completedItems.members },
    { label: "First tournament created", done: completedItems.tournament },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-black text-zinc-900 dark:text-foreground">You're All Set!</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-muted-foreground">
          {clubName} is ready to go. Here's what you've configured:
        </p>
      </div>

      {/* Checklist */}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3"
          >
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full ${
                item.done
                  ? "bg-green-100 text-green-600"
                  : "bg-zinc-100 text-zinc-400"
              }`}
            >
              {item.done ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="text-xs">--</span>
              )}
            </div>
            <span
              className={`text-sm font-medium ${
                item.done ? "text-zinc-900 dark:text-foreground" : "text-zinc-400"
              }`}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Action links */}
      <div className="space-y-2 pt-2">
        <Link
          href="/bowls"
          className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 hover:bg-green-100 transition-colors min-h-[44px]"
        >
          Create a Tournament
          <ExternalLink className="h-4 w-4" />
        </Link>
        <Link
          href="/clubs"
          className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:bg-background transition-colors min-h-[44px]"
        >
          View Your Club Page
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
