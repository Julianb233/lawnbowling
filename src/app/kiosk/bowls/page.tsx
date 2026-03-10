"use client";

import { KioskWrapper } from "@/components/kiosk/KioskWrapper";
import BowlsPage from "@/app/bowls/page";

/**
 * Kiosk version of the Bowls Tournament list page.
 * Wraps the tournament list in the KioskWrapper for iPad
 * fullscreen mode with inactivity reset and admin access.
 */
export default function KioskBowlsListPage() {
  return (
    <KioskWrapper inactivityTimeout={60000}>
      <BowlsPage />
    </KioskWrapper>
  );
}
