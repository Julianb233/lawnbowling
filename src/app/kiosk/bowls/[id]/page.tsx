"use client";

import { KioskWrapper } from "@/components/kiosk/KioskWrapper";
import BowlsTournamentPage from "@/app/bowls/[id]/page";

/**
 * Kiosk version of the Bowls Tournament check-in page.
 * Wraps the tournament check-in page in the KioskWrapper for iPad
 * fullscreen mode with inactivity reset and admin access.
 */
export default function KioskBowlsTournamentPage() {
  return (
    <KioskWrapper inactivityTimeout={60000}>
      <BowlsTournamentPage />
    </KioskWrapper>
  );
}
