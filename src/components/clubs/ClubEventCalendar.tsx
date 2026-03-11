"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { ClubEvent, ClubEventType } from "@/lib/types";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  List,
  Plus,
  Upload,
  Clock,
  MapPin,
  Loader2,
} from "lucide-react";

const EVENT_TYPE_COLORS: Record<ClubEventType, string> = {
  social: "bg-blue-500",
  tournament: "bg-emerald-500",
  meeting: "bg-amber-500",
  practice: "bg-violet-500",
  other: "bg-zinc-400",
};

const EVENT_TYPE_LABELS: Record<ClubEventType, string> = {
  social: "Social",
  tournament: "Tournament",
  meeting: "Meeting",
  practice: "Practice",
  other: "Other",
};

interface ClubEventCalendarProps {
  clubId: string;
  isAdmin?: boolean;
}

export default function ClubEventCalendar({ clubId, isAdmin = false }: ClubEventCalendarProps) {
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("list");
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCsvImport, setShowCsvImport] = useState(false);

  const monthStr = `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, "0")}`;

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = viewMode === "calendar"
        ? `club_id=${clubId}&month=${monthStr}`
        : `club_id=${clubId}&limit=20`;
      const res = await fetch(`/api/clubs/events?${params}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events ?? []);
      }
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setLoading(false);
    }
  }, [clubId, monthStr, viewMode]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const prevMonth = () => {
    setCurrentMonth((prev) => {
      const m = prev.month - 1;
      return m < 0 ? { year: prev.year - 1, month: 11 } : { ...prev, month: m };
    });
  };

  const nextMonth = () => {
    setCurrentMonth((prev) => {
      const m = prev.month + 1;
      return m > 11 ? { year: prev.year + 1, month: 0 } : { ...prev, month: m };
    });
  };

  const monthName = new Date(currentMonth.year, currentMonth.month).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Events</h3>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
            <button
              onClick={() => setViewMode("calendar")}
              className={cn(
                "p-1.5 transition-colors",
                viewMode === "calendar"
                  ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                  : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              )}
              aria-label="Calendar view"
            >
              <CalendarDays className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5 transition-colors",
                viewMode === "list"
                  ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                  : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              )}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {isAdmin && (
            <>
              <button
                onClick={() => setShowCsvImport(!showCsvImport)}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                title="Import CSV"
              >
                <Upload className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Event
              </button>
            </>
          )}
        </div>
      </div>

      {/* Create form */}
      {showCreateForm && (
        <CreateEventForm
          clubId={clubId}
          onCreated={() => {
            setShowCreateForm(false);
            fetchEvents();
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* CSV Import */}
      {showCsvImport && (
        <CsvImportForm
          clubId={clubId}
          onImported={() => {
            setShowCsvImport(false);
            fetchEvents();
          }}
          onCancel={() => setShowCsvImport(false)}
        />
      )}

      {/* Calendar view */}
      {viewMode === "calendar" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <button onClick={prevMonth} className="p-1 rounded text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{monthName}</span>
            <button onClick={nextMonth} className="p-1 rounded text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <MonthGrid year={currentMonth.year} month={currentMonth.month} events={events} loading={loading} />
        </div>
      )}

      {/* List view */}
      {viewMode === "list" && (
        <div>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDays className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-600 mb-2" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No upcoming events</p>
            </div>
          ) : (
            <div className="space-y-2">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Month Grid ──────────────────────────────────────────────────────────────

function MonthGrid({ year, month, events, loading }: { year: number; month: number; events: ClubEvent[]; loading: boolean }) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const eventsByDate = new Map<number, ClubEvent[]>();
  for (const e of events) {
    const d = new Date(e.event_date).getDate();
    const existing = eventsByDate.get(d) ?? [];
    existing.push(e);
    eventsByDate.set(d, existing);
  }

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
      <div className="grid grid-cols-7 bg-zinc-50 dark:bg-zinc-800/50">
        {dayLabels.map((d) => (
          <div key={d} className="px-1 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="border-t border-zinc-100 dark:border-zinc-800 min-h-[3rem]" />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const dayEvents = eventsByDate.get(day) ?? [];
          const isToday = isCurrentMonth && today.getDate() === day;
          return (
            <div
              key={day}
              className={cn(
                "border-t border-zinc-100 dark:border-zinc-800 min-h-[3rem] p-1",
                isToday && "bg-emerald-50/50 dark:bg-emerald-950/20"
              )}
            >
              <span className={cn(
                "text-xs tabular-nums",
                isToday ? "font-bold text-emerald-600 dark:text-emerald-400" : "text-zinc-600 dark:text-zinc-400"
              )}>
                {day}
              </span>
              <div className="flex flex-wrap gap-0.5 mt-0.5">
                {dayEvents.slice(0, 3).map((e) => (
                  <div
                    key={e.id}
                    className={cn("w-1.5 h-1.5 rounded-full", EVENT_TYPE_COLORS[e.event_type])}
                    title={e.title}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {loading && (
        <div className="flex justify-center py-2 border-t border-zinc-100 dark:border-zinc-800">
          <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
        </div>
      )}
    </div>
  );
}

// ─── Event Card ──────────────────────────────────────────────────────────────

function EventCard({ event }: { event: ClubEvent }) {
  const date = new Date(event.event_date + "T00:00:00");
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex gap-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3">
      <div className={cn("w-1 rounded-full shrink-0", EVENT_TYPE_COLORS[event.event_type])} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
            {event.title}
          </h4>
          <span className={cn(
            "shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide",
            "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
          )}>
            {EVENT_TYPE_LABELS[event.event_type]}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          <span>{formattedDate}</span>
          {event.start_time && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {event.start_time.slice(0, 5)}
              {event.end_time && ` - ${event.end_time.slice(0, 5)}`}
            </span>
          )}
          {event.location && (
            <span className="flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3 shrink-0" />
              {event.location}
            </span>
          )}
        </div>
        {event.description && (
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
            {event.description}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Create Event Form ───────────────────────────────────────────────────────

function CreateEventForm({
  clubId,
  onCreated,
  onCancel,
}: {
  clubId: string;
  onCreated: () => void;
  onCancel: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/clubs/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          club_id: clubId,
          title: form.get("title"),
          description: form.get("description") || undefined,
          event_date: form.get("event_date"),
          start_time: form.get("start_time") || undefined,
          end_time: form.get("end_time") || undefined,
          event_type: form.get("event_type"),
          location: form.get("location") || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create event");
      }
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = cn(
    "w-full rounded-lg px-3 py-2 text-sm",
    "bg-zinc-50 dark:bg-zinc-800",
    "border border-zinc-200 dark:border-zinc-700",
    "text-zinc-900 dark:text-zinc-100",
    "focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
  );

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 space-y-3">
      <div>
        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Title *</label>
        <input name="title" required className={inputClass} placeholder="e.g., Saturday Social Bowls" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Date *</label>
          <input name="event_date" type="date" required className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Type</label>
          <select name="event_type" className={inputClass} defaultValue="other">
            <option value="social">Social</option>
            <option value="tournament">Tournament</option>
            <option value="meeting">Meeting</option>
            <option value="practice">Practice</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Start Time</label>
          <input name="start_time" type="time" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">End Time</label>
          <input name="end_time" type="time" className={inputClass} />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Location</label>
        <input name="location" className={inputClass} placeholder="e.g., Main green" />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Description</label>
        <textarea name="description" rows={2} className={cn(inputClass, "resize-none")} placeholder="Optional details..." />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">
          {submitting ? "Creating..." : "Create Event"}
        </button>
      </div>
    </form>
  );
}

// ─── CSV Import ──────────────────────────────────────────────────────────────

function CsvImportForm({
  clubId,
  onImported,
  onCancel,
}: {
  clubId: string;
  onImported: () => void;
  onCancel: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ imported: number } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const text = await file.text();
      const res = await fetch("/api/clubs/events/import-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ club_id: clubId, csv_content: text }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");

      setResult({ imported: data.imported });
      setTimeout(onImported, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 space-y-3">
      <div>
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Import events from CSV</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          CSV should have columns: title, date, start_time, end_time, type, description
        </p>
      </div>
      <input
        type="file"
        accept=".csv,text/csv"
        onChange={handleFileUpload}
        disabled={submitting}
        className="block w-full text-sm text-zinc-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 dark:file:bg-emerald-900/40 dark:file:text-emerald-300 hover:file:bg-emerald-100"
      />
      {submitting && (
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Importing...
        </div>
      )}
      {result && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
          Successfully imported {result.imported} events
        </p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex justify-end">
        <button onClick={onCancel} className="px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
          Close
        </button>
      </div>
    </div>
  );
}
