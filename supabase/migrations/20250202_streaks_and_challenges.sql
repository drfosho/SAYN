-- Daily Streak Rewards and Challenges System
-- This migration adds streak tracking and daily challenges functionality

-- Add streak tracking columns to profiles if not exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS login_streak INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS longest_login_streak INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS post_streak INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_post_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS longest_post_streak INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak_freeze_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_streak_freeze_used DATE;

-- Create streak_milestones table to track which milestones user has achieved
CREATE TABLE IF NOT EXISTS streak_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_days INTEGER NOT NULL,
  streak_type TEXT NOT NULL CHECK (streak_type IN ('login', 'post')),
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  xp_awarded INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, milestone_days, streak_type)
);

-- Create daily_challenges table
CREATE TABLE IF NOT EXISTS daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('post', 'power_up', 'comment', 'engagement', 'streak')),
  target_count INTEGER NOT NULL DEFAULT 1,
  xp_reward INTEGER NOT NULL DEFAULT 50,
  is_active BOOLEAN DEFAULT true,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'easy',
  icon_name TEXT DEFAULT 'star',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_daily_challenges table to track user progress
CREATE TABLE IF NOT EXISTS user_daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES daily_challenges(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  current_progress INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  xp_claimed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, challenge_id, date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_streak_milestones_user ON streak_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_challenges_user ON user_daily_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_challenges_date ON user_daily_challenges(date);
CREATE INDEX IF NOT EXISTS idx_user_daily_challenges_user_date ON user_daily_challenges(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_active ON daily_challenges(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_last_login ON profiles(last_login_date);

-- Insert default daily challenges
INSERT INTO daily_challenges (title, description, challenge_type, target_count, xp_reward, difficulty, icon_name) VALUES
  ('First Post', 'Create your first post of the day', 'post', 1, 50, 'easy', 'camera'),
  ('Power Giver', 'Give 3 power ups to others', 'power_up', 3, 75, 'easy', 'zap'),
  ('Conversation Starter', 'Leave 2 comments on posts', 'comment', 2, 50, 'easy', 'message-circle'),
  ('Social Butterfly', 'Interact with 5 different posts', 'engagement', 5, 100, 'medium', 'users'),
  ('Streak Keeper', 'Maintain your daily login streak', 'streak', 1, 25, 'easy', 'flame'),
  ('Content Creator', 'Create 3 posts today', 'post', 3, 150, 'hard', 'image'),
  ('Power Surge', 'Give 10 power ups today', 'power_up', 10, 200, 'hard', 'battery-charging'),
  ('Engaged User', 'Leave 5 comments today', 'comment', 5, 125, 'medium', 'message-square')
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE streak_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_challenges ENABLE ROW LEVEL SECURITY;

-- RLS policies for streak_milestones
CREATE POLICY "Users can view their own milestones" ON streak_milestones
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own milestones" ON streak_milestones
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for daily_challenges (read-only for users)
CREATE POLICY "Anyone can view active challenges" ON daily_challenges
  FOR SELECT USING (is_active = true);

-- RLS policies for user_daily_challenges
CREATE POLICY "Users can view their own challenge progress" ON user_daily_challenges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own challenge progress" ON user_daily_challenges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenge progress" ON user_daily_challenges
  FOR UPDATE USING (auth.uid() = user_id);

-- Update xp_transactions source constraint to include streak and challenge sources
ALTER TABLE xp_transactions DROP CONSTRAINT IF EXISTS xp_transactions_source_check;

ALTER TABLE xp_transactions ADD CONSTRAINT xp_transactions_source_check
CHECK (source IN (
  -- Original sources
  'post',
  'power_up_received',
  'power_up_given',
  'streak_bonus',
  'verification_bonus',
  'admin_award',
  -- Comment-related sources
  'comment',
  'comment_power_up',
  'give_comment_power_up',
  -- Additional sources
  'reply',
  'level_up',
  'rank_up',
  'badge_earned',
  'progress_comparison_shared',
  'follow',
  'achievement',
  -- Streak and challenge sources
  'login_streak_milestone',
  'post_streak_milestone',
  'daily_challenge'
));

COMMENT ON TABLE streak_milestones IS 'Tracks which streak milestones users have achieved';
COMMENT ON TABLE daily_challenges IS 'Defines available daily challenges';
COMMENT ON TABLE user_daily_challenges IS 'Tracks user progress on daily challenges';
