import { z } from "zod";

// Reusable field schemas
const uuid = z.string().uuid("Must be a valid UUID");
const nonEmptyString = z.string().min(1, "Cannot be empty");

// ─── Favorites ───────────────────────────────────────────────
export const favoriteSchema = z.object({
  favorite_id: uuid,
});

// ─── Admin: Courts ───────────────────────────────────────────
export const courtCreateSchema = z.object({
  venue_id: uuid,
  name: nonEmptyString,
  sport: z.enum(["lawn_bowls", "bocce", "petanque", "cornhole"]),
});

export const courtUpdateSchema = z.object({
  id: uuid,
}).catchall(z.unknown());

export const courtDeleteSchema = z.object({
  id: uuid,
});

// ─── Admin: Players ──────────────────────────────────────────
export const playerUpdateSchema = z.object({
  id: uuid,
  role: z.enum(["player", "admin"]),
});

// ─── Admin: Venue ────────────────────────────────────────────
export const venueUpdateSchema = z.object({
  id: uuid,
  name: z.string().optional(),
  address: z.string().optional(),
  timezone: z.string().optional(),
  sports: z.array(z.string()).optional(),
  contact_email: z.string().email().optional().or(z.literal("")),
  contact_phone: z.string().optional(),
  website_url: z.string().url().optional().or(z.literal("")),
  tagline: z.string().optional(),
  logo_url: z.string().url().optional().or(z.literal("")),
  primary_color: z.string().optional(),
  secondary_color: z.string().optional(),
}).passthrough();

// ─── Tournament ──────────────────────────────────────────────
export const tournamentCreateSchema = z.object({
  name: nonEmptyString,
  sport: z.enum(["lawn_bowls", "bocce", "petanque", "cornhole"]),
  format: nonEmptyString,
  max_players: z.number().int().positive().optional(),
  starts_at: z.string().optional(),
});

// ─── Stripe ──────────────────────────────────────────────────
export const stripeCheckoutSchema = z.object({
  plan: nonEmptyString,
});

// ─── Bowls: Scores ───────────────────────────────────────────
export const scoreCreateSchema = z.object({
  tournament_id: uuid,
  round: z.number().int().positive(),
  rink: z.number().int().min(0),
  team_a_players: z.array(uuid).min(1),
  team_b_players: z.array(uuid).min(1),
  team_a_scores: z.array(z.number().int().min(0)),
  team_b_scores: z.array(z.number().int().min(0)),
  is_finalized: z.boolean().optional(),
  expected_updated_at: z.string().optional(),
});

export const scoreUpdateSchema = z.object({
  tournament_id: uuid,
  round: z.number().int().positive(),
  rink: z.number().int().min(0),
});

export const scoreFinalizeSchema = z.object({
  tournament_id: uuid,
  round: z.number().int().positive(),
});

// ─── Bowls: Draw ─────────────────────────────────────────────
export const drawCreateSchema = z.object({
  tournament_id: uuid,
  format: nonEmptyString,
  draw_style: z.string().optional(),
});

// ─── Bowls: Check-in ─────────────────────────────────────────
export const checkinCreateSchema = z.object({
  player_id: uuid,
  tournament_id: uuid,
  preferred_position: z.string().optional(),
  checkin_source: z.string().optional(),
  visit_token: z.string().optional(),
});

export const checkinDeleteSchema = z.object({
  player_id: uuid,
  tournament_id: uuid,
});

// ─── Waitlist ────────────────────────────────────────────────
export const waitlistCreateSchema = z.object({
  venue_id: uuid,
  sport: z.enum(["lawn_bowls", "bocce", "petanque", "cornhole"]),
  partner_id: uuid.optional(),
});

// ─── Email ───────────────────────────────────────────────────
export const emailSendSchema = z.object({
  to: z.string().email("Must be a valid email address"),
  template: nonEmptyString,
  data: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
});

// ─── Profile ─────────────────────────────────────────────────
export const profileCreateSchema = z.object({
  display_name: nonEmptyString,
  skill_level: z.string().optional(),
  avatar_url: z.string().url().optional().or(z.literal("")),
});

export const profilePatchSchema = z.object({
  display_name: z.string().min(1).optional(),
  skill_level: z.string().optional(),
  sports: z.array(z.string()).optional(),
  avatar_url: z.string().optional(),
  bio: z.string().optional(),
  preferred_position: z.string().optional(),
  preferred_hand: z.string().optional(),
  years_experience: z.number().int().min(0).optional(),
  home_club_id: uuid.optional().nullable(),
  onboarding_state: z.string().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided",
});
