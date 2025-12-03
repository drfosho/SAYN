-- Weekly Recaps System
-- This migration creates the weekly_recaps table to store user activity summaries

CREATE TABLE IF NOT EXISTS weekly_recaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,

  -- Stats
  total_posts INTEGER DEFAULT 0,
  verified_posts INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  power_ups_received INTEGER DEFAULT 0,
  power_ups_given INTEGER DEFAULT 0,
  comments_posted INTEGER DEFAULT 0,
  comments_received INTEGER DEFAULT 0,
  new_followers INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,

  -- Highlights
  most_powered_post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  total_engagement INTEGER DEFAULT 0,
  level_at_start INTEGER,
  level_at_end INTEGER,
  rank_at_start TEXT,
  rank_at_end TEXT,

  -- Badges/Milestones achieved this week
  milestones_unlocked JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  viewed BOOLEAN DEFAULT false,
  viewed_at TIMESTAMPTZ,

  UNIQUE(user_id, week_start_date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_weekly_recaps_user ON weekly_recaps(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_recaps_week ON weekly_recaps(week_start_date);
CREATE INDEX IF NOT EXISTS idx_weekly_recaps_user_week ON weekly_recaps(user_id, week_start_date DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_recaps_viewed ON weekly_recaps(user_id, viewed);

-- Enable RLS
ALTER TABLE weekly_recaps ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own recaps" ON weekly_recaps
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recaps" ON weekly_recaps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recaps" ON weekly_recaps
  FOR UPDATE USING (auth.uid() = user_id);

COMMENT ON TABLE weekly_recaps IS 'Stores weekly activity summaries for each user';
COMMENT ON COLUMN weekly_recaps.most_powered_post_id IS 'The post that received the most power ups during the week';
COMMENT ON COLUMN weekly_recaps.milestones_unlocked IS 'JSON array of milestones/achievements unlocked during the week';
