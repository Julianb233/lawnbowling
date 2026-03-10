"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Court {
  id: string;
  venue_id: string;
  name: string;
  sport: string;
  is_available: boolean;
}

const SPORTS = [
  "pickleball",
  "lawn_bowling",
  "tennis",
  "badminton",
  "table_tennis",
];

export default function CourtsAdminPage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newSport, setNewSport] = useState(SPORTS[0]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSport, setEditSport] = useState("");

  const fetchCourts = async () => {
    const res = await fetch("/api/admin/courts");
    const data = await res.json();
    setCourts(data.courts ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCourts();
  }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await fetch("/api/admin/courts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        venue_id: courts[0]?.venue_id ?? "default",
        name: newName.trim(),
        sport: newSport,
      }),
    });
    setNewName("");
    fetchCourts();
  };

  const handleUpdate = async (id: string) => {
    await fetch("/api/admin/courts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name: editName, sport: editSport }),
    });
    setEditing(null);
    fetchCourts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this court?")) return;
    await fetch("/api/admin/courts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchCourts();
  };

  if (loading) {
    return <div className="text-zinc-400">Loading courts...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-100 mb-6">Court Management</h1>

      {/* Add court */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Court name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100 focus:border-emerald-500 focus:outline-none"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <select
          value={newSport}
          onChange={(e) => setNewSport(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100"
        >
          {SPORTS.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
        <Button onClick={handleAdd}>Add Court</Button>
      </div>

      {/* Court list */}
      <div className="space-y-2">
        {courts.map((court) => (
          <div
            key={court.id}
            className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3"
          >
            {editing === court.id ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-zinc-100"
                />
                <select
                  value={editSport}
                  onChange={(e) => setEditSport(e.target.value)}
                  className="rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-zinc-100"
                >
                  {SPORTS.map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </select>
                <Button size="sm" onClick={() => handleUpdate(court.id)}>
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <>
                <div>
                  <span className="font-medium text-zinc-100">
                    {court.name}
                  </span>
                  <span className="ml-2 text-xs text-zinc-500 capitalize">
                    {court.sport.replace("_", " ")}
                  </span>
                  <span
                    className={`ml-2 inline-block h-2 w-2 rounded-full ${court.is_available ? "bg-emerald-500" : "bg-red-500"}`}
                  />
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditing(court.id);
                      setEditName(court.name);
                      setEditSport(court.sport);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(court.id)}
                  >
                    Delete
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
        {courts.length === 0 && (
          <p className="text-sm text-zinc-500 italic">
            No courts yet. Add one above.
          </p>
        )}
      </div>
    </div>
  );
}
