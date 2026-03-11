-- Add onboarding_state JSONB column to players table
-- Stores: { player: boolean, player_dismiss_count: number, drawmaster: boolean, drawmaster_dismiss_count: number, admin_wizard_step: number | null }
alter table players add column if not exists onboarding_state jsonb default '{}';
