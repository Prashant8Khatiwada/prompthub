-- Add share_image_url to prompts table
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS share_image_url TEXT;
