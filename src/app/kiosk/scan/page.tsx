"use client";

import { useState, useEffect } from "react";
import { KioskWrapper } from "@/components/kiosk/KioskWrapper";
import { QRScanner } from "@/components/qr/QRScanner";
import type { Venue } from "@/lib/types";

export default function KioskScanPage() {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [lastCheckedIn, setLastCheckedIn] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/venue/default")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data && !data.error) setVenue(data); })
      .catch(() => {});
  }, []);

  return (
    <KioskWrapper>
      <div className="flex min-h-screen flex-col bg-white">
        <header className="border-b border-zinc-200 px-6 py-4 text-center">
          <h1 className="text-2xl font-black text-zinc-900">
            {venue?.name || "Pick a Partner"}
          </h1>
          <p className="text-sm text-zinc-500">Scan your QR code to check in</p>
        </header>

        <main className="flex flex-1 items-center justify-center p-6">
          {venue ? (
            <div className="w-full max-w-md">
              <QRScanner
                venueId={venue.id}
                onScanSuccess={(name) => setLastCheckedIn(name)}
              />
              {lastCheckedIn && (
                <p className="mt-4 text-center text-lg text-green-400 font-semibold">
                  Welcome, {lastCheckedIn}!
                </p>
              )}
            </div>
          ) : (
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
          )}
        </main>
      </div>
    </KioskWrapper>
  );
}
