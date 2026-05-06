-- ============================================================
-- 002_ad_system.sql  — Ad System + PDF Support
-- ============================================================

-- ── PDF columns on prompts ───────────────────────────────────
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'prompt';
-- values: 'prompt' | 'pdf'
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- ── Ad Clients ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ad_clients (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id  UUID REFERENCES creators(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  email       TEXT,
  phone       TEXT,
  company     TEXT,
  website     TEXT,
  notes       TEXT,
  status      TEXT DEFAULT 'active',   -- active | inactive
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ── Ad Campaigns ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ad_campaigns (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id          UUID REFERENCES creators(id) ON DELETE CASCADE,
  client_id           UUID REFERENCES ad_clients(id) ON DELETE SET NULL,
  name                TEXT NOT NULL,
  banner_url          TEXT NOT NULL,
  banner_alt          TEXT,
  target_url          TEXT NOT NULL,
  utm_source          TEXT DEFAULT 'creatopedia',
  utm_medium          TEXT DEFAULT 'banner',
  utm_campaign        TEXT,
  client_webhook_url  TEXT,
  report_token        TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  status              TEXT DEFAULT 'active',  -- active | paused | ended | scheduled
  starts_at           TIMESTAMPTZ,
  ends_at             TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- ── Ad Placements ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ad_placements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES ad_campaigns(id) ON DELETE CASCADE,
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    position TEXT NOT NULL, -- 'below_video', 'above_gate', 'below_gate'
    is_global BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Ad Impressions ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ad_impressions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id  UUID REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  placement_id UUID REFERENCES ad_placements(id) ON DELETE CASCADE,
  prompt_id    UUID REFERENCES prompts(id) ON DELETE SET NULL,
  session_id   TEXT,
  device       TEXT,
  country      TEXT,
  referrer     TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ── Ad Clicks ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ad_clicks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id  UUID REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  placement_id UUID REFERENCES ad_placements(id) ON DELETE CASCADE,
  prompt_id    UUID REFERENCES prompts(id) ON DELETE SET NULL,
  session_id   TEXT,
  device       TEXT,
  country      TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_impressions_campaign ON ad_impressions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_impressions_prompt   ON ad_impressions(prompt_id);
CREATE INDEX IF NOT EXISTS idx_impressions_created  ON ad_impressions(created_at);
CREATE INDEX IF NOT EXISTS idx_clicks_campaign      ON ad_clicks(campaign_id);
CREATE INDEX IF NOT EXISTS idx_clicks_prompt        ON ad_clicks(prompt_id);
CREATE INDEX IF NOT EXISTS idx_clicks_created       ON ad_clicks(created_at);
CREATE INDEX IF NOT EXISTS idx_placements_campaign  ON ad_placements(campaign_id);
CREATE INDEX IF NOT EXISTS idx_clients_creator      ON ad_clients(creator_id);

-- ── Row Level Security ───────────────────────────────────────
ALTER TABLE ad_clients     ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_campaigns   ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_placements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_clicks      ENABLE ROW LEVEL SECURITY;

-- Creators manage own clients
CREATE POLICY "Creators manage own clients"
  ON ad_clients FOR ALL USING (auth.uid() = creator_id);

-- Creators manage own campaigns
CREATE POLICY "Creators manage own campaigns"
  ON ad_campaigns FOR ALL USING (auth.uid() = creator_id);

-- Public can read active campaigns (for placement display)
CREATE POLICY "Public reads active campaigns"
  ON ad_campaigns FOR SELECT USING (status = 'active');

-- Public can read placements (for display on prompt pages)
CREATE POLICY "Public reads placements for display"
  ON ad_placements FOR SELECT USING (true);

-- Anyone can insert impressions (fire-and-forget tracking)
CREATE POLICY "Public can insert impressions"
  ON ad_impressions FOR INSERT WITH CHECK (true);

-- Creators can read their own impression data
CREATE POLICY "Creators read own impressions"
  ON ad_impressions FOR SELECT
  USING (auth.uid() = (SELECT creator_id FROM ad_campaigns WHERE id = campaign_id));

-- Anyone can insert clicks (tracking redirect)
CREATE POLICY "Public can insert clicks"
  ON ad_clicks FOR INSERT WITH CHECK (true);

-- Creators can read their own click data
CREATE POLICY "Creators read own clicks"
  ON ad_clicks FOR SELECT
  USING (auth.uid() = (SELECT creator_id FROM ad_campaigns WHERE id = campaign_id));
