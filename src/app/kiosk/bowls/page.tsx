"use client";

import { KioskWrapper } from "@/components/kiosk/KioskWrapper";
import BowlsPage from "@/app/bowls/page";

/**
 * Kiosk version of the Bowls Tournament page.
 * Wraps the full bowls page in the KioskWrapper for iPad
 * fullscreen mode with inactivity reset and admin access.
 */
export default function KioskBowlsPage() {
  return (
    <KioskWrapper inactivityTimeout={60000}>
      <BowlsPage />
    </KioskWrapper>
  );
}
