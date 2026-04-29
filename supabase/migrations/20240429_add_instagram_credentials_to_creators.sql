-- Migration: Add instagram_app_id and instagram_app_secret to creators table
-- Run this in your Supabase SQL Editor

ALTER TABLE creators 
ADD COLUMN IF NOT EXISTS instagram_app_id TEXT,
ADD COLUMN IF NOT EXISTS instagram_app_secret TEXT;
