-- Supabase SQL Schema for Dota 2 CM Simulator
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS lobbies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(6) NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'waiting',
  current_stage INTEGER NOT NULL DEFAULT 0,
  time_remaining INTEGER NOT NULL DEFAULT 30,
  radiant_picks INTEGER[] DEFAULT '{}',
  radiant_bans INTEGER[] DEFAULT '{}',
  dire_picks INTEGER[] DEFAULT '{}',
  dire_bans INTEGER[] DEFAULT '{}',
  history JSONB DEFAULT '[]',
  radiant_player VARCHAR(50),
  radiant_player_id VARCHAR(20),
  dire_player VARCHAR(50),
  dire_player_id VARCHAR(20),
  last_action_by VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE lobbies;

-- Index for code lookup
CREATE INDEX IF NOT EXISTS idx_lobbies_code ON lobbies(code);
CREATE INDEX IF NOT EXISTS idx_lobbies_status ON lobbies(status);

-- Row Level Security (optional, for production)
ALTER TABLE lobbies ENABLE ROW LEVEL SECURITY;

-- Allow all operations (adjust for production)
CREATE POLICY "Allow all" ON lobbies FOR ALL USING (true) WITH CHECK (true);

-- Auto-cleanup old lobbies (optional)
-- DELETE FROM lobbies WHERE status = 'completed' AND created_at < NOW() - INTERVAL '7 days';
