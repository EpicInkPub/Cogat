/*
  # Add Missing Tracking Columns
  
  1. Changes to Tables
    - Add `page_url` column to `leads` table
    - Add `user_agent` column to `leads` table
    - Add `source` column to `bonus_signups` table
    - Add `page_url` column to `bonus_signups` table
    - Add `user_agent` column to `bonus_signups` table
  
  2. Notes
    - All columns are nullable to allow existing records
    - These columns are needed for proper data capture tracking
*/

-- Add missing columns to leads table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'page_url'
  ) THEN
    ALTER TABLE leads ADD COLUMN page_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'user_agent'
  ) THEN
    ALTER TABLE leads ADD COLUMN user_agent text;
  END IF;
END $$;

-- Add missing columns to bonus_signups table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bonus_signups' AND column_name = 'source'
  ) THEN
    ALTER TABLE bonus_signups ADD COLUMN source text DEFAULT 'bonus_page';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bonus_signups' AND column_name = 'page_url'
  ) THEN
    ALTER TABLE bonus_signups ADD COLUMN page_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bonus_signups' AND column_name = 'user_agent'
  ) THEN
    ALTER TABLE bonus_signups ADD COLUMN user_agent text;
  END IF;
END $$;