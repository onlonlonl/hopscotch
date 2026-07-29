-- Hopscotch · setup.sql
-- Run this in your Supabase SQL Editor to create all tables.

-- ============================================================
-- locations — your places
-- ============================================================
CREATE TABLE IF NOT EXISTS locations (
  id           TEXT PRIMARY KEY,
  label        TEXT NOT NULL,
  name         TEXT NOT NULL,
  city         TEXT NOT NULL,
  address      TEXT NOT NULL,
  lng          TEXT NOT NULL,
  lat          TEXT NOT NULL,
  category     TEXT DEFAULT 'other',
  icon_type    TEXT DEFAULT 'dot',
  color        TEXT,
  weather      TEXT,
  scale        REAL DEFAULT 1.0,
  story        TEXT,
  ink_name_iris TEXT,
  ink_name_lux  TEXT,
  lux_x        REAL,
  lux_y        REAL,
  inf_t        REAL,
  inf_w        REAL,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- hopscotch_elements — stickers & photos placed on the board
-- ============================================================
CREATE TABLE IF NOT EXISTS hopscotch_elements (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone         TEXT NOT NULL,            -- 'roof' | 'free'
  sticker_type TEXT NOT NULL,
  color        TEXT NOT NULL DEFAULT '#D0A0A0',
  offset_x     REAL NOT NULL DEFAULT 0.5,
  offset_y     REAL NOT NULL DEFAULT 0.5,
  scale        REAL NOT NULL DEFAULT 1,
  photo_data   TEXT,                     -- base64 for photo stamps
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- hopscotch_garden — the currently growing plant
-- ============================================================
CREATE TABLE IF NOT EXISTS hopscotch_garden (
  id           SERIAL PRIMARY KEY,
  plant_name   TEXT NOT NULL DEFAULT 'Sunflower',
  planted_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  stamps       JSONB DEFAULT '[]'::jsonb,    -- growth event log
  milestones   JSONB DEFAULT '[]'::jsonb,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- hopscotch_shelf — harvested plants archive
-- ============================================================
CREATE TABLE IF NOT EXISTS hopscotch_shelf (
  id           SERIAL PRIMARY KEY,
  plant_name   TEXT NOT NULL,
  planted_at   TIMESTAMPTZ NOT NULL,
  harvested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  stamps       JSONB DEFAULT '[]'::jsonb,
  milestones   JSONB DEFAULT '[]'::jsonb,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- hopscotch_notes — shared message board
-- ============================================================
CREATE TABLE IF NOT EXISTS hopscotch_notes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content      TEXT NOT NULL,
  author       TEXT NOT NULL DEFAULT 'lux',
  clip_color   TEXT NOT NULL DEFAULT '#E8A87C',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- hopscotch_roof — roof configuration
-- ============================================================
CREATE TABLE IF NOT EXISTS hopscotch_roof (
  id           INTEGER PRIMARY KEY DEFAULT 1,
  photo_base64 TEXT,
  updated_at   TIMESTAMPTZ DEFAULT now()
);
INSERT INTO hopscotch_roof (id) VALUES (1) ON CONFLICT DO NOTHING;

-- ============================================================
-- hopscotch_stickers — AI-generated sticker recipes
-- ============================================================
CREATE TABLE IF NOT EXISTS hopscotch_stickers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  description  TEXT,
  recipe       JSONB,                    -- rough.js drawing instructions
  category     TEXT NOT NULL DEFAULT 'custom',
  author       TEXT NOT NULL DEFAULT 'iris',
  status       TEXT NOT NULL DEFAULT 'pending',  -- pending | done
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- settings — key-value store (shared table, Hopscotch uses 2 keys)
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT
);

-- Default Hopscotch settings
INSERT INTO settings (key, value) VALUES
  ('hopscotch_connections', '[]'),
  ('hopscotch_city', '{}')
ON CONFLICT DO NOTHING;

-- ============================================================
-- Enable RLS on all tables
-- ============================================================
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE hopscotch_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE hopscotch_garden ENABLE ROW LEVEL SECURITY;
ALTER TABLE hopscotch_shelf ENABLE ROW LEVEL SECURITY;
ALTER TABLE hopscotch_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE hopscotch_roof ENABLE ROW LEVEL SECURITY;
ALTER TABLE hopscotch_stickers ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Permissive policies (anon key access)
CREATE POLICY "allow all" ON locations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow all" ON hopscotch_elements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow all" ON hopscotch_garden FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow all" ON hopscotch_shelf FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow all" ON hopscotch_notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow all" ON hopscotch_roof FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow all" ON hopscotch_stickers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow all" ON settings FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime (optional, for live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE locations;
ALTER PUBLICATION supabase_realtime ADD TABLE hopscotch_elements;
ALTER PUBLICATION supabase_realtime ADD TABLE hopscotch_garden;
ALTER PUBLICATION supabase_realtime ADD TABLE hopscotch_notes;
ALTER PUBLICATION supabase_realtime ADD TABLE hopscotch_roof;
ALTER PUBLICATION supabase_realtime ADD TABLE hopscotch_stickers;
