"use client";

import { useState, useEffect } from "react";
import { KioskWrapper } from "@/components/kiosk/KioskWrapper";
import { KioskLayout } from "@/components/kiosk/KioskLayout";
import { KioskHeading, KioskText } from "@/components/kiosk/KioskLayout";
import { QRScanner } from "@/components/qr/QRScanner";
import type { Venue } from "@/lib/types";

export default function KioskScanPage() {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [lastCheckedIn, setLastCheckedIn] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/venue/default")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && !data.error) setVenue(data);
      })
      .catch(() => {});
  }, []);

  return (
    <KioskWrapper>
      <KioskLayout
        venueName={venue?.name}
        subtitle="Scan your QR code to check in"
      >
        {venue ? (
          <div className="mx-auto max-w-md text-center">
            <KioskHeading level={2} align="center" className="mb-6">
              Scan Your QR Code
            </KioskHeading>
            <QRScanner
              venueId={venue.id}
              onScanSuccess={(name) => setLastCheckedIn(name)}
            />
            {lastCheckedIn && (
              <div className="mt-6">
                <KioskText size="body" align="center">
                  <span
                    className="font-bold"
                    style={{ color: "#2E7D32", fontSize: "24px" }}
                  >
                    Welcome, {lastCheckedIn}!
                  </span>
                </KioskText>
              </div>
            )}
          </div>
        ) : (
          <div
            className="flex items-center justify-center py-24"
            role="status"
            aria-label="Loading venue"
          >
            <div
              className="h-16 w-16 animate-spin rounded-full border-4 border-t-transparent"
              style={{ borderColor: "#1B5E20", borderTopColor: "transparent" }}
            />
          </div>
        )}
      </KioskLayout>
    </KioskWrapper>
  );
}
