-- Migration to support Global Players
-- This updates the players table to make team_id nullable

-- Make team_id nullable and update the foreign key constraint
ALTER TABLE players 
  ALTER COLUMN team_id DROP NOT NULL;

-- Update the foreign key constraint to SET NULL instead of CASCADE
ALTER TABLE players
  DROP CONSTRAINT IF EXISTS players_team_id_fkey;

ALTER TABLE players
  ADD CONSTRAINT players_team_id_fkey 
  FOREIGN KEY (team_id) 
  REFERENCES teams(id) 
  ON DELETE SET NULL;

-- Verification query (optional)
-- SELECT column_name, is_nullable, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'players' AND column_name = 'team_id';

