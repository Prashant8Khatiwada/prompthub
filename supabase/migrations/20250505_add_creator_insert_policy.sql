-- Migration: Add INSERT policy for creators table
-- Fixes the issue where new users cannot create their creator profile during login

-- Allow authenticated users to insert their own creator row
CREATE POLICY "Creator can insert own row" ON creators
  FOR INSERT WITH CHECK (auth.uid() = id);
