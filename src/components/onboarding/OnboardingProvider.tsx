"use client";

import { PlayerOnboarding } from "./PlayerOnboarding";
import { DrawmasterTour } from "./DrawmasterTour";

export function OnboardingProvider() {
  return (
    <>
      <PlayerOnboarding />
      <DrawmasterTour />
    </>
  );
}
