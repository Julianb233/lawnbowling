"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Check, Pencil, X } from "lucide-react";
import Link from "next/link";

interface Template {
  id: string;
  venue_id: string;
  title: string;
  body: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminWaiverTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formActive, setFormActive] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/waiver-templates");
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates);
      }
    } finally {
      setLoading(false);
    }
  }

  function startCreate() {
    setCreating(true);
    setEditing(null);
    setFormTitle("Liability Waiver");
    setFormBody("");
    setFormActive(true);
    setMessage("");
  }

  function startEdit(t: Template) {
    setEditing(t.id);
    setCreating(false);
    setFormTitle(t.title);
    setFormBody(t.body);
    setFormActive(t.is_active);
    setMessage("");
  }

  function cancelForm() {
    setEditing(null);
    setCreating(false);
    setMessage("");
  }

  async function handleSave() {
    if (!formTitle.trim() || !formBody.trim()) {
      setMessage("Title and body are required");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const url = "/api/admin/waiver-templates";
      const method = creating ? "POST" : "PUT";
      const payload = creating
        ? { title: formTitle, body: formBody, is_active: formActive }
        : { id: editing, title: formTitle, body: formBody, is_active: formActive };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage("Saved successfully");
        cancelForm();
        await fetchTemplates();
      } else {
        const err = await res.json();
        setMessage(err.error || "Failed to save");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <Link
        href="/admin/waivers"
        className="mb-6 inline-flex items-center gap-1 text-sm text-[#3D5A3E] hover:text-[#2D4A30] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Waivers
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A2E12]">Waiver Templates</h1>
          <p className="text-sm text-[#3D5A3E]">
            Configure the waiver text shown to players during sign-up.
          </p>
        </div>
        {!creating && !editing && (
          <button
            onClick={startCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1B5E20] px-4 py-2 text-sm font-medium text-[#0A2E12] hover:bg-[#1B5E20] transition-colors"
          >
            <Plus className="h-4 w-4" /> New Template
          </button>
        )}
      </div>

      {message && (
        <div
          className={`mb-4 rounded-lg px-4 py-2 text-sm ${
            message.includes("success")
              ? "bg-[#1B5E20]/5 text-[#1B5E20] border border-[#1B5E20]/20"
              : "bg-red-50 text-red-600 border border-red-200"
          }`}
        >
          {message}
        </div>
      )}

      {(creating || editing) && (
        <div className="mb-6 rounded-xl border border-[#0A2E12]/10 bg-white p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#0A2E12]">
            {creating ? "Create Template" : "Edit Template"}
          </h2>

          <div>
            <label className="block text-sm font-medium text-[#3D5A3E] mb-1">Title</label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full rounded-lg border border-[#0A2E12]/10 bg-white px-3 py-2 text-[#0A2E12] focus:border-[#1B5E20] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#3D5A3E] mb-1">
              Waiver Body Text
            </label>
            <textarea
              value={formBody}
              onChange={(e) => setFormBody(e.target.value)}
              rows={12}
              className="w-full rounded-lg border border-[#0A2E12]/10 bg-white px-3 py-2 text-[#0A2E12] focus:border-[#1B5E20] focus:outline-none font-mono text-sm"
              placeholder="Enter the full waiver text that players will read and accept..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formActive}
              onChange={(e) => setFormActive(e.target.checked)}
              className="h-4 w-4 rounded border-[#0A2E12]/10 bg-white text-[#1B5E20] focus:ring-[#1B5E20]"
            />
            <label htmlFor="is_active" className="text-sm text-[#3D5A3E]">
              Set as active template (shown to new players)
            </label>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1B5E20] px-4 py-2 text-sm font-medium text-[#0A2E12] hover:bg-[#1B5E20] disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : "Save Template"}
            </button>
            <button
              onClick={cancelForm}
              className="rounded-lg border border-[#0A2E12]/10 px-4 py-2 text-sm text-[#3D5A3E] hover:bg-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0A2E12]/10 border-t-[#1B5E20]" />
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-xl border border-[#0A2E12]/10 bg-white py-12 text-center">
          <p className="text-[#3D5A3E]">No waiver templates yet.</p>
          <p className="mt-1 text-sm text-[#3D5A3E]">
            The default waiver text will be used until you create a custom template.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((t) => (
            <div
              key={t.id}
              className={`rounded-xl border p-4 ${
                t.is_active
                  ? "border-[#1B5E20]/20 bg-[#1B5E20]/5"
                  : "border-[#0A2E12]/10 bg-white"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-[#0A2E12]">{t.title}</h3>
                    {t.is_active && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#1B5E20]/5 px-2 py-0.5 text-xs font-medium text-[#1B5E20]">
                        <Check className="h-3 w-3" /> Active
                      </span>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-[#3D5A3E]">
                    {t.body.slice(0, 200)}...
                  </p>
                  <p className="mt-2 text-xs text-[#3D5A3E]">
                    Updated {new Date(t.updated_at).toLocaleDateString("en-US", {
                      dateStyle: "medium",
                    })}
                  </p>
                </div>
                <button
                  onClick={() => startEdit(t)}
                  className="ml-4 shrink-0 rounded-lg border border-[#0A2E12]/10 p-2 text-[#3D5A3E] hover:bg-white hover:text-[#2D4A30] transition-colors"
                  aria-label="Edit template"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
