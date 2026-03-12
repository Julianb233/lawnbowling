-- Player onboarding fields for the senior-friendly onboarding wizard
ALTER TABLE players ADD COLUMN IF NOT EXISTS preferred_position TEXT CHECK (preferred_position IN ('skip', 'vice', 'second', 'lead', 'any')) DEFAULT 'any';
ALTER TABLE players ADD COLUMN IF NOT EXISTS years_playing INTEGER DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS experience_level TEXT CHECK (experience_level IN ('brand_new', 'learning', 'social', 'competitive', 'representative')) DEFAULT 'brand_new';
ALTER TABLE players ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS home_club_name TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS bowling_formats TEXT[] DEFAULT '{}';
ALTER TABLE players ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
