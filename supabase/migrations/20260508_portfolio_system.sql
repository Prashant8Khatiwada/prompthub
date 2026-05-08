-- ============================================================
-- 20260508_portfolio_system.sql
-- Dynamic Portfolio System for Creatopedia creators
-- ============================================================
-- Depends on: 001_initial_schema.sql, 002_ad_system.sql,
--             and all subsequent migrations having been applied.
-- ============================================================


-- ─────────────────────────────────────────────────────────────
-- 1. PORTFOLIOS  (root meta record — one per creator)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolios (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id       UUID REFERENCES creators(id) ON DELETE CASCADE NOT NULL,

  published        BOOLEAN      NOT NULL DEFAULT false,
  slug             TEXT,
  seo_title        TEXT,
  seo_description  TEXT,
  theme_color      TEXT         NOT NULL DEFAULT '#ff1f4b',

  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),

  CONSTRAINT portfolios_creator_id_unique UNIQUE (creator_id)
);


-- ─────────────────────────────────────────────────────────────
-- 2. PORTFOLIO HERO  (one per portfolio)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio_hero (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id          UUID REFERENCES portfolios(id) ON DELETE CASCADE NOT NULL,

  headline              TEXT NOT NULL DEFAULT '',
  subheadline           TEXT          DEFAULT '',
  tagline               TEXT          DEFAULT '',
  image_url             TEXT,                        -- /hero.jpg or full CDN URL
  cta_primary_label     TEXT          DEFAULT 'Explore My Work',
  cta_primary_url       TEXT          DEFAULT '#works',
  cta_secondary_label   TEXT          DEFAULT 'Let''s Talk',
  cta_secondary_url     TEXT          DEFAULT '#contact',

  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT portfolio_hero_portfolio_id_unique UNIQUE (portfolio_id)
);


-- ─────────────────────────────────────────────────────────────
-- 3. PORTFOLIO STATS  (metrics shown below hero, e.g. "1.2M+ Prompt Runs")
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio_stats (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id     UUID REFERENCES portfolios(id) ON DELETE CASCADE NOT NULL,

  label            TEXT NOT NULL,         -- e.g. "Prompt Runs"
  value            TEXT NOT NULL,         -- e.g. "1.2M+"
  sort_order       INTEGER NOT NULL DEFAULT 0,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ─────────────────────────────────────────────────────────────
-- 4. PORTFOLIO JOURNEY  (vertical timeline steps: Chapter I, II, III…)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio_journey (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id     UUID REFERENCES portfolios(id) ON DELETE CASCADE NOT NULL,

  chapter          TEXT NOT NULL,         -- e.g. "Chapter I (2022)"
  title            TEXT NOT NULL,         -- e.g. "The AI Genesis & Discovery"
  description      TEXT NOT NULL,
  year             TEXT,
  align            TEXT NOT NULL DEFAULT 'right',  -- 'left' | 'right'
  sort_order       INTEGER NOT NULL DEFAULT 0,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ─────────────────────────────────────────────────────────────
-- 5. PORTFOLIO WORKS  (project / case-study cards)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio_works (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id     UUID REFERENCES portfolios(id) ON DELETE CASCADE NOT NULL,

  title            TEXT NOT NULL,
  category         TEXT NOT NULL,          -- e.g. "AI Art & Midjourney"
  description      TEXT,
  image_url        TEXT,
  tags             TEXT[]  NOT NULL DEFAULT '{}',   -- e.g. ['Midjourney v6', 'Cinematic']
  link_url         TEXT,                    -- optional link to a prompt page
  featured         BOOLEAN NOT NULL DEFAULT false,
  sort_order       INTEGER NOT NULL DEFAULT 0,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ─────────────────────────────────────────────────────────────
-- 6. PORTFOLIO IMPACT  (value proposition cards)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio_impact (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id     UUID REFERENCES portfolios(id) ON DELETE CASCADE NOT NULL,

  title            TEXT NOT NULL,           -- e.g. "Hyper-Targeted Outputs"
  description      TEXT,
  icon_name        TEXT NOT NULL DEFAULT 'target',  -- Lucide icon key
  sort_order       INTEGER NOT NULL DEFAULT 0,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ─────────────────────────────────────────────────────────────
-- 7. PORTFOLIO TESTIMONIALS  (client quotes)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio_testimonials (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id       UUID REFERENCES portfolios(id) ON DELETE CASCADE NOT NULL,

  quote              TEXT NOT NULL,
  author_name        TEXT NOT NULL,
  author_role        TEXT,                   -- e.g. "VP of Design, StudioX"
  author_avatar_url  TEXT,
  sort_order         INTEGER NOT NULL DEFAULT 0,

  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ─────────────────────────────────────────────────────────────
-- 8. PORTFOLIO BRANDS  ("Collaborated with" logo carousel)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio_brands (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id     UUID REFERENCES portfolios(id) ON DELETE CASCADE NOT NULL,

  name             TEXT NOT NULL,
  logo_url         TEXT,
  website_url      TEXT,
  sort_order       INTEGER NOT NULL DEFAULT 0,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ─────────────────────────────────────────────────────────────
-- 9. INQUIRIES  (unified lead capture — both sources)
-- ─────────────────────────────────────────────────────────────
-- source = 'portfolio_contact'    → from /[subdomain]/portfolio contact form
-- source = 'creatopedia_landing'  → from Creatopedia reach-us / waitlist page
CREATE TABLE IF NOT EXISTS inquiries (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id       UUID REFERENCES creators(id) ON DELETE SET NULL,
  -- NULL when source = 'creatopedia_landing' (platform-level lead)

  name             TEXT NOT NULL,
  email            TEXT NOT NULL,
  message          TEXT,
  phone            TEXT,

  source           TEXT NOT NULL DEFAULT 'portfolio_contact',
  -- CHECK: 'portfolio_contact' | 'creatopedia_landing'

  status           TEXT NOT NULL DEFAULT 'new',
  -- CHECK: 'new' | 'read' | 'replied' | 'archived'

  referrer_url     TEXT,
  ip_address       TEXT,
  user_agent       TEXT,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Optional: enforce allowed values via check constraints
ALTER TABLE inquiries
  ADD CONSTRAINT inquiries_source_check
    CHECK (source IN ('portfolio_contact', 'creatopedia_landing'));

ALTER TABLE inquiries
  ADD CONSTRAINT inquiries_status_check
    CHECK (status IN ('new', 'read', 'replied', 'archived'));


-- ─────────────────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_portfolios_creator          ON portfolios(creator_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_published        ON portfolios(published);

CREATE INDEX IF NOT EXISTS idx_portfolio_hero_pid          ON portfolio_hero(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_stats_pid         ON portfolio_stats(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_stats_order       ON portfolio_stats(portfolio_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_portfolio_journey_pid       ON portfolio_journey(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_journey_order     ON portfolio_journey(portfolio_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_portfolio_works_pid         ON portfolio_works(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_works_order       ON portfolio_works(portfolio_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_portfolio_works_category    ON portfolio_works(portfolio_id, category);
CREATE INDEX IF NOT EXISTS idx_portfolio_impact_pid        ON portfolio_impact(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_impact_order      ON portfolio_impact(portfolio_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_portfolio_testimonials_pid  ON portfolio_testimonials(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_testimonials_order ON portfolio_testimonials(portfolio_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_portfolio_brands_pid        ON portfolio_brands(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_brands_order      ON portfolio_brands(portfolio_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_inquiries_creator           ON inquiries(creator_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_source            ON inquiries(source);
CREATE INDEX IF NOT EXISTS idx_inquiries_status            ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_email             ON inquiries(email);
CREATE INDEX IF NOT EXISTS idx_inquiries_created           ON inquiries(created_at DESC);


-- ─────────────────────────────────────────────────────────────
-- AUTO updated_at TRIGGER  (reusable across all tables)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all portfolio tables
CREATE TRIGGER trg_portfolios_updated_at
  BEFORE UPDATE ON portfolios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_portfolio_hero_updated_at
  BEFORE UPDATE ON portfolio_hero
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_portfolio_stats_updated_at
  BEFORE UPDATE ON portfolio_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_portfolio_journey_updated_at
  BEFORE UPDATE ON portfolio_journey
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_portfolio_works_updated_at
  BEFORE UPDATE ON portfolio_works
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_portfolio_impact_updated_at
  BEFORE UPDATE ON portfolio_impact
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_portfolio_testimonials_updated_at
  BEFORE UPDATE ON portfolio_testimonials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_portfolio_brands_updated_at
  BEFORE UPDATE ON portfolio_brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_inquiries_updated_at
  BEFORE UPDATE ON inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ─────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────
ALTER TABLE portfolios             ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_hero         ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_stats        ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_journey      ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_works        ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_impact       ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_brands       ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries              ENABLE ROW LEVEL SECURITY;

-- ── portfolios ────────────────────────────────────────────────
CREATE POLICY "Creator manages own portfolio"
  ON portfolios FOR ALL
  USING (auth.uid() = creator_id);

CREATE POLICY "Public reads published portfolios"
  ON portfolios FOR SELECT
  USING (published = true);

-- ── portfolio_hero ────────────────────────────────────────────
CREATE POLICY "Creator manages own hero"
  ON portfolio_hero FOR ALL
  USING (
    auth.uid() = (SELECT creator_id FROM portfolios WHERE id = portfolio_id)
  );

CREATE POLICY "Public reads hero of published portfolio"
  ON portfolio_hero FOR SELECT
  USING (
    (SELECT published FROM portfolios WHERE id = portfolio_id) = true
  );

-- ── portfolio_stats ───────────────────────────────────────────
CREATE POLICY "Creator manages own stats"
  ON portfolio_stats FOR ALL
  USING (
    auth.uid() = (SELECT creator_id FROM portfolios WHERE id = portfolio_id)
  );

CREATE POLICY "Public reads stats of published portfolio"
  ON portfolio_stats FOR SELECT
  USING (
    (SELECT published FROM portfolios WHERE id = portfolio_id) = true
  );

-- ── portfolio_journey ─────────────────────────────────────────
CREATE POLICY "Creator manages own journey"
  ON portfolio_journey FOR ALL
  USING (
    auth.uid() = (SELECT creator_id FROM portfolios WHERE id = portfolio_id)
  );

CREATE POLICY "Public reads journey of published portfolio"
  ON portfolio_journey FOR SELECT
  USING (
    (SELECT published FROM portfolios WHERE id = portfolio_id) = true
  );

-- ── portfolio_works ───────────────────────────────────────────
CREATE POLICY "Creator manages own works"
  ON portfolio_works FOR ALL
  USING (
    auth.uid() = (SELECT creator_id FROM portfolios WHERE id = portfolio_id)
  );

CREATE POLICY "Public reads works of published portfolio"
  ON portfolio_works FOR SELECT
  USING (
    (SELECT published FROM portfolios WHERE id = portfolio_id) = true
  );

-- ── portfolio_impact ──────────────────────────────────────────
CREATE POLICY "Creator manages own impact"
  ON portfolio_impact FOR ALL
  USING (
    auth.uid() = (SELECT creator_id FROM portfolios WHERE id = portfolio_id)
  );

CREATE POLICY "Public reads impact of published portfolio"
  ON portfolio_impact FOR SELECT
  USING (
    (SELECT published FROM portfolios WHERE id = portfolio_id) = true
  );

-- ── portfolio_testimonials ────────────────────────────────────
CREATE POLICY "Creator manages own testimonials"
  ON portfolio_testimonials FOR ALL
  USING (
    auth.uid() = (SELECT creator_id FROM portfolios WHERE id = portfolio_id)
  );

CREATE POLICY "Public reads testimonials of published portfolio"
  ON portfolio_testimonials FOR SELECT
  USING (
    (SELECT published FROM portfolios WHERE id = portfolio_id) = true
  );

-- ── portfolio_brands ──────────────────────────────────────────
CREATE POLICY "Creator manages own brands"
  ON portfolio_brands FOR ALL
  USING (
    auth.uid() = (SELECT creator_id FROM portfolios WHERE id = portfolio_id)
  );

CREATE POLICY "Public reads brands of published portfolio"
  ON portfolio_brands FOR SELECT
  USING (
    (SELECT published FROM portfolios WHERE id = portfolio_id) = true
  );

-- ── inquiries ─────────────────────────────────────────────────
-- Anyone (unauthenticated public) can submit an inquiry
CREATE POLICY "Public can submit inquiries"
  ON inquiries FOR INSERT
  WITH CHECK (true);

-- Creator reads their own incoming inquiries
CREATE POLICY "Creator reads own inquiries"
  ON inquiries FOR SELECT
  USING (auth.uid() = creator_id);

-- Creator can update status (new → read → replied → archived)
CREATE POLICY "Creator updates own inquiry status"
  ON inquiries FOR UPDATE
  USING (auth.uid() = creator_id);


-- ─────────────────────────────────────────────────────────────
-- SEED: create empty portfolio shells for all existing creators
-- ─────────────────────────────────────────────────────────────
INSERT INTO portfolios (creator_id, published, theme_color)
SELECT
  id,
  false,
  COALESCE(brand_color, '#ff1f4b')
FROM creators
ON CONFLICT (creator_id) DO NOTHING;




