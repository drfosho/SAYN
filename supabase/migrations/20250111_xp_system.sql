-- XP System Migration
-- This migration adds the XP progression system to SAYN

-- Add XP-related columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0 CHECK (xp >= 0),
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1 CHECK (level >= 1),
ADD COLUMN IF NOT EXISTS rank TEXT DEFAULT 'rookie' CHECK (rank IN ('rookie', 'warrior', 'titan', 'superhuman', 'god_tier')),
ADD COLUMN IF NOT EXISTS daily_power_ups_remaining INTEGER DEFAULT 10 CHECK (daily_power_ups_remaining >= 0 AND daily_power_ups_remaining <= 10),
ADD COLUMN IF NOT EXISTS last_power_up_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS post_streak INTEGER DEFAULT 0 CHECK (post_streak >= 0),
ADD COLUMN IF NOT EXISTS last_post_date DATE,
ADD COLUMN IF NOT EXISTS xp_multiplier DECIMAL(3,2) DEFAULT 1.0 CHECK (xp_multiplier >= 1.0 AND xp_multiplier <= 1.5);

-- Create XP transactions table to track all XP gains/losses
CREATE TABLE IF NOT EXISTS xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('post', 'power_up_received', 'power_up_given', 'streak_bonus', 'verification_bonus', 'admin_award')),
  source_id UUID, -- post_id or power_up_id that triggered the transaction
  multiplier DECIMAL(3,2) DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user_id ON xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_created_at ON xp_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_source ON xp_transactions(source);
CREATE INDEX IF NOT EXISTS idx_profiles_level ON profiles(level DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON profiles(xp DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_rank ON profiles(rank);

-- Enable Row Level Security (RLS)
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for xp_transactions
-- Users can read their own transactions
CREATE POLICY "Users can view own XP transactions"
  ON xp_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Only the system (authenticated users via functions) can insert transactions
CREATE POLICY "System can insert XP transactions"
  ON xp_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Comments for documentation
COMMENT ON COLUMN profiles.xp IS 'Total XP earned by the user';
COMMENT ON COLUMN profiles.level IS 'Current level calculated from XP (1-100+)';
COMMENT ON COLUMN profiles.rank IS 'Current rank tier: rookie, warrior, titan, superhuman, god_tier';
COMMENT ON COLUMN profiles.daily_power_ups_remaining IS 'Power ups remaining today (resets daily to 10)';
COMMENT ON COLUMN profiles.last_power_up_reset IS 'Timestamp when power ups were last reset';
COMMENT ON COLUMN profiles.post_streak IS 'Consecutive days the user has posted';
COMMENT ON COLUMN profiles.last_post_date IS 'Last date the user made a post';
COMMENT ON COLUMN profiles.xp_multiplier IS 'Current XP multiplier from streak (1.0 to 1.5)';

COMMENT ON TABLE xp_transactions IS 'Tracks all XP gains and losses for users';
COMMENT ON COLUMN xp_transactions.amount IS 'XP amount (positive for gain, negative for loss)';
COMMENT ON COLUMN xp_transactions.source IS 'Source of XP: post, power_up_received, power_up_given, streak_bonus, verification_bonus, admin_award';
COMMENT ON COLUMN xp_transactions.source_id IS 'Reference to the post or power_up that triggered this transaction';
COMMENT ON COLUMN xp_transactions.multiplier IS 'Multiplier applied to this transaction (from streak bonus)';
