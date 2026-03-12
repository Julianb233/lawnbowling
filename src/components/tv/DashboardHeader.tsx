"use client";

import { useState, useEffect } from "react";
import WeatherWidget from "@/app/tv/WeatherWidget";

interface DashboardHeaderProps {
  tournamentName: string;
  status: string;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  slideProgress: number;
  reconnecting?: boolean;
  greenConditions?: unknown;
}

export function DashboardHeader({
  tournamentName,
  status,
  isFullscreen,
  onToggleFullscreen,
  slideProgress,
  reconnecting,
}: DashboardHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="relative border-b border-white/10 bg-[#0A2E12]/80">
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-2xl font-black">
            B
          </div>
          <div>
            <h1
              className="font-black tracking-tight"
              style={{ fontSize: "clamp(1.25rem, 2.5vw, 2rem)" }}
            >
              {tournamentName}
            </h1>
            <p className="text-sm text-[#3D5A3E]">
              {status === "in_progress"
                ? "In Progress"
                : status === "registration"
                  ? "Registration Open"
                  : "No Active Tournament"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {status === "in_progress" && (
            <div className="flex items-center gap-2">
              <div className="live-dot" />
              <span className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
                Live
              </span>
            </div>
          )}

          {reconnecting && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-500/20 px-3 py-1.5">
              <div className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
              <span className="text-xs font-semibold text-amber-400">
                Reconnecting...
              </span>
            </div>
          )}

          <WeatherWidget />

          <div className="text-right">
            <p
              className="font-black tabular-nums"
              style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}
            >
              {currentTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p className="text-xs text-[#3D5A3E]">
              {currentTime.toLocaleDateString([], {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>

          <button
            onClick={onToggleFullscreen}
            className="rounded-lg border border-white/10 p-2 text-[#3D5A3E] hover:bg-white/5 hover:text-white transition-colors"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3v3a2 2 0 0 1-2 2H3" />
                <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
                <path d="M3 16h3a2 2 0 0 1 2 2v3" />
                <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* REQ-LD-13: Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
        <div
          className="h-full bg-emerald-500 transition-all duration-300 ease-linear"
          style={{ width: `${slideProgress * 100}%` }}
        />
      </div>
    </header>
  );
}
