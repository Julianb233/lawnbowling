"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Monitor, QrCode } from "lucide-react";

export default function KioskSettingsPage() {
  const router = useRouter();
  const [pin, setPin] = useState(() => localStorage.getItem("kiosk_pin") || "1234");
  const [timeout, setTimeoutVal] = useState(() =>
    parseInt(localStorage.getItem("kiosk_timeout") || "30", 10)
  );
  const [saved, setSaved] = useState(false);

  function handleSave() {
    localStorage.setItem("kiosk_pin", pin);
    localStorage.setItem("kiosk_timeout", timeout.toString());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-8">
      <div className="mx-auto max-w-md">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-1 text-sm text-white/60 hover:text-white min-h-[44px]"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <h1 className="mb-8 text-2xl font-bold text-white">Kiosk Settings</h1>

        {saved && (
          <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
            Settings saved
          </div>
        )}

        <div className="space-y-6">
          {/* Admin PIN */}
          <div>
            <label className="mb-2 block text-sm font-medium text-white/70">
              Admin PIN (4 digits)
            </label>
            <input
              type="text"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white text-center text-2xl tracking-[0.5em] outline-none focus:border-green-500/50 min-h-[44px]"
              placeholder="1234"
            />
          </div>

          {/* Inactivity Timeout */}
          <div>
            <label className="mb-2 block text-sm font-medium text-white/70">
              Inactivity Timeout (seconds)
            </label>
            <div className="flex gap-2">
              {[15, 30, 60, 120].map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeoutVal(t)}
                  className={`flex-1 rounded-lg border px-3 py-3 text-sm font-medium min-h-[44px] ${
                    timeout === t
                      ? "border-green-500 bg-green-500/20 text-green-400"
                      : "border-white/10 bg-white/5 text-white/60"
                  }`}
                >
                  {t}s
                </button>
              ))}
            </div>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-500 min-h-[44px]"
          >
            <Save className="h-4 w-4" /> Save Settings
          </button>

          {/* Quick Links */}
          <div className="border-t border-white/10 pt-6">
            <h2 className="mb-4 text-sm font-medium text-white/70">Launch Kiosk</h2>
            <div className="space-y-2">
              <a
                href="/kiosk"
                target="_blank"
                className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white hover:bg-white/10 min-h-[44px]"
              >
                <Monitor className="h-5 w-5 text-green-400" />
                <div>
                  <p className="font-medium">Check-In Kiosk</p>
                  <p className="text-xs text-white/40">Full-screen board with tap check-in</p>
                </div>
              </a>
              <a
                href="/kiosk/scan"
                target="_blank"
                className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white hover:bg-white/10 min-h-[44px]"
              >
                <QrCode className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="font-medium">QR Scanner Kiosk</p>
                  <p className="text-xs text-white/40">Camera-based QR code check-in</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
