-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Creators
CREATE TABLE IF NOT EXISTS creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  handle TEXT NOT NULL,
  subdomain TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  brand_color TEXT DEFAULT '#6366f1',
  bio TEXT,
  instagram_url TEXT,
  tiktok_url TEXT,
  stripe_id TEXT,
  plan_tier TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Prompts
CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES creators(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  video_url TEXT,
  thumbnail_url TEXT,
  category TEXT,
  ai_tool TEXT NOT NULL,
  output_type TEXT NOT NULL,
  gate_type TEXT DEFAULT 'open',
  price DECIMAL(10,2),
  slug TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(creator_id, slug)
);

-- Pages
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
  published_at TIMESTAMPTZ DEFAULT now()
);

-- Views (analytics)
CREATE TABLE IF NOT EXISTS views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  session_id TEXT,
  referrer TEXT,
  device TEXT,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Events (copy, unlock, email submit)
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  session_id TEXT,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Email captures
CREATE TABLE IF NOT EXISTS email_captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  captured_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_prompts_creator ON prompts(creator_id);
CREATE INDEX IF NOT EXISTS idx_prompts_slug ON prompts(slug);
CREATE INDEX IF NOT EXISTS idx_views_page ON views(page_id);
CREATE INDEX IF NOT EXISTS idx_events_page ON events(page_id);

-- RLS Policies
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE views ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_captures ENABLE ROW LEVEL SECURITY;

-- Creators: only authenticated user can read/update their own row
CREATE POLICY "Creator can read own row" ON creators
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Creator can update own row" ON creators
  FOR UPDATE USING (auth.uid() = id);

-- Prompts: creator manages their own; public can read published
CREATE POLICY "Creator manages own prompts" ON prompts
  FOR ALL USING (auth.uid() = creator_id);
CREATE POLICY "Public reads published prompts" ON prompts
  FOR SELECT USING (status = 'published');

-- Pages: public read
CREATE POLICY "Public reads pages" ON pages
  FOR SELECT USING (true);
CREATE POLICY "Service role inserts pages" ON pages
  FOR INSERT WITH CHECK (true);

-- Views: service role writes, no public read
CREATE POLICY "Service role inserts views" ON views
  FOR INSERT WITH CHECK (true);

-- Events: service role writes
CREATE POLICY "Service role inserts events" ON events
  FOR INSERT WITH CHECK (true);

-- Email captures: creator reads their own
CREATE POLICY "Creator reads own captures" ON email_captures
  FOR SELECT USING (
    auth.uid() = (SELECT creator_id FROM prompts WHERE id = prompt_id)
  );
CREATE POLICY "Anyone inserts email capture" ON email_captures
  FOR INSERT WITH CHECK (true);
