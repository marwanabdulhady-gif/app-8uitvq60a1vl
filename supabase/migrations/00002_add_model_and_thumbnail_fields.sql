-- Add model and thumbnail fields to generation_history table
ALTER TABLE generation_history 
ADD COLUMN IF NOT EXISTS model TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_generated BOOLEAN DEFAULT false;