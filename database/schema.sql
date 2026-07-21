CREATE TABLE IF NOT EXISTS tournaments (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  edition TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  venue TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  announcement TEXT NOT NULL DEFAULT '',
  rules JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  group_name TEXT NOT NULL CHECK (group_name IN ('A', 'B')),
  color TEXT NOT NULL DEFAULT '#f59e0b',
  captain TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (tournament_id, code)
);

CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  shirt_number INTEGER,
  is_captain BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  phase TEXT NOT NULL CHECK (phase IN ('group', 'semifinal', 'third_place', 'final')),
  group_name TEXT CHECK (group_name IN ('A', 'B')),
  round_label TEXT NOT NULL DEFAULT '',
  home_team_id TEXT REFERENCES teams(id) ON DELETE SET NULL,
  away_team_id TEXT REFERENCES teams(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  court TEXT NOT NULL DEFAULT 'Quadra principal',
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'finished', 'postponed', 'cancelled')),
  sets JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  CHECK (home_team_id IS NULL OR away_team_id IS NULL OR home_team_id <> away_team_id)
);

CREATE TABLE IF NOT EXISTS standing_adjustments (
  team_id TEXT PRIMARY KEY REFERENCES teams(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  reason TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teams_tournament ON teams(tournament_id, group_name, sort_order);
CREATE INDEX IF NOT EXISTS idx_players_team ON players(team_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_matches_tournament_date ON matches(tournament_id, scheduled_at);
