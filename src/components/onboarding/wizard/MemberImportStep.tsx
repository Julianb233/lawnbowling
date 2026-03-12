"use client";

import { useState } from "react";
import { Plus, Trash2, Upload } from "lucide-react";

interface Member {
  name: string;
  email: string;
}

interface MemberImportStepProps {
  members: Member[];
  onChange: (members: Member[]) => void;
  errors: Record<string, string>;
}

export function MemberImportStep({ members, onChange, errors }: MemberImportStepProps) {
  const [csvError, setCsvError] = useState<string | null>(null);

  function addMember() {
    onChange([...members, { name: "", email: "" }]);
  }

  function removeMember(index: number) {
    onChange(members.filter((_, i) => i !== index));
  }

  function updateMember(index: number, field: keyof Member, value: string) {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  }

  function handleCSVUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvError(null);

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        const lines = text.split("\n").filter((line) => line.trim());
        const parsed: Member[] = [];

        for (let i = 0; i < lines.length; i++) {
          const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
          // Skip header row if detected
          if (i === 0 && (cols[0].toLowerCase() === "name" || cols[0].toLowerCase() === "first name")) {
            continue;
          }
          if (cols[0]) {
            parsed.push({
              name: cols[0],
              email: cols[1] || "",
            });
          }
        }

        if (parsed.length === 0) {
          setCsvError("No valid members found in CSV. Expected format: name,email (one per line).");
          return;
        }

        onChange([...members, ...parsed]);
      } catch {
        setCsvError("Failed to parse CSV file. Please check the format.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-[#0A2E12]">Member Import</h2>
        <p className="mt-1 text-sm text-[#3D5A3E]">
          Add at least one member to continue. You can upload a CSV or add manually.
        </p>
      </div>

      {errors.members && <p className="text-xs text-red-500">{errors.members}</p>}
      {csvError && <p className="text-xs text-amber-600">{csvError}</p>}

      {/* CSV Upload */}
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#0A2E12]/10 px-4 py-4 text-sm font-medium text-[#3D5A3E] hover:border-green-400 hover:text-green-600 transition-colors min-h-[44px]">
        <Upload className="h-4 w-4" />
        Upload CSV (name, email)
        <input
          type="file"
          accept=".csv"
          onChange={handleCSVUpload}
          className="hidden"
        />
      </label>

      {/* Manual entry */}
      <div className="space-y-3">
        {members.map((member, i) => (
          <div key={i} className="flex items-center gap-2 rounded-xl border border-[#0A2E12]/10 bg-white p-3">
            <div className="flex-1">
              <input
                type="text"
                value={member.name}
                onChange={(e) => updateMember(i, "name", e.target.value)}
                className="w-full rounded-lg border border-[#0A2E12]/10 bg-[#0A2E12]/[0.03] px-3 py-2 text-sm text-[#0A2E12] outline-none focus:border-green-500/50 min-h-[44px]"
                placeholder="Name"
              />
            </div>
            <div className="flex-1">
              <input
                type="email"
                value={member.email}
                onChange={(e) => updateMember(i, "email", e.target.value)}
                className="w-full rounded-lg border border-[#0A2E12]/10 bg-[#0A2E12]/[0.03] px-3 py-2 text-sm text-[#0A2E12] outline-none focus:border-green-500/50 min-h-[44px]"
                placeholder="Email (optional)"
              />
            </div>
            <button
              onClick={() => removeMember(i)}
              className="rounded-lg p-2 text-[#3D5A3E] hover:bg-red-50 hover:text-red-500 transition-colors min-h-[44px]"
              aria-label={`Remove ${member.name || "member"}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addMember}
        className="flex items-center gap-2 rounded-xl border border-dashed border-[#0A2E12]/10 px-4 py-3 text-sm font-medium text-[#3D5A3E] hover:border-green-400 hover:text-green-600 transition-colors w-full justify-center min-h-[44px]"
      >
        <Plus className="h-4 w-4" /> Add Member Manually
      </button>

      <p className="text-xs text-[#3D5A3E]">
        {members.length} member{members.length !== 1 ? "s" : ""} added
      </p>
    </div>
  );
}
