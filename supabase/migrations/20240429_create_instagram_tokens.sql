-- Migration: Create creator_instagram_tokens table
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS creator_instagram_tokens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id      UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  encrypted_token TEXT NOT NULL,
  iv              TEXT NOT NULL,
  instagram_user_id TEXT NOT NULL,
  username        TEXT,
  expires_at      TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (creator_id)
);

-- Enable RLS (Optional but recommended)
ALTER TABLE creator_instagram_tokens ENABLE ROW LEVEL SECURITY;

-- Add policies (Optional but recommended)
-- Only the owner can see/edit their own token
CREATE POLICY "Creators can view their own Instagram tokens"
  ON creator_instagram_tokens FOR SELECT
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can manage their own Instagram tokens"
  ON creator_instagram_tokens FOR ALL
  USING (auth.uid() = creator_id);
