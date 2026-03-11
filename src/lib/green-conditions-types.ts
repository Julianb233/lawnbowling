// Green Conditions types (REQ-15-02)

export type GreenSpeed = "fast" | "medium" | "slow";
export type SurfaceCondition = "dry" | "damp" | "wet";
export type WindDirection = "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW" | "calm";
export type WindStrength = "calm" | "light" | "moderate" | "strong";

export interface GreenConditions {
  id: string;
  tournament_id: string;
  venue_id: string | null;
  recorded_by: string | null;
  green_speed: GreenSpeed;
  surface_condition: SurfaceCondition;
  wind_direction: WindDirection;
  wind_strength: WindStrength;
  notes: string | null;
  temperature_c: number | null;
  recorded_at: string;
  created_at: string;
  updated_at: string;
  recorder?: { id: string; display_name: string; avatar_url?: string | null } | null;
}

export const GREEN_SPEED_LABELS: Record<GreenSpeed, string> = {
  fast: "Fast",
  medium: "Medium",
  slow: "Slow",
};

export const SURFACE_CONDITION_LABELS: Record<SurfaceCondition, string> = {
  dry: "Dry",
  damp: "Damp",
  wet: "Wet",
};

export const WIND_DIRECTION_LABELS: Record<WindDirection, string> = {
  N: "North",
  NE: "Northeast",
  E: "East",
  SE: "Southeast",
  S: "South",
  SW: "Southwest",
  W: "West",
  NW: "Northwest",
  calm: "Calm",
};

export const WIND_STRENGTH_LABELS: Record<WindStrength, string> = {
  calm: "Calm",
  light: "Light",
  moderate: "Moderate",
  strong: "Strong",
};
