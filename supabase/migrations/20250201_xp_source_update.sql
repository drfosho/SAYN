-- XP Source Constraint Update
-- This migration updates the xp_transactions source constraint to include comment-related XP sources

-- Drop the existing check constraint on source
ALTER TABLE xp_transactions DROP CONSTRAINT IF EXISTS xp_transactions_source_check;

-- Add the new check constraint with all valid XP sources
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
  'achievement'
));

-- Update comment on the source column to document all valid values
COMMENT ON COLUMN xp_transactions.source IS 'Source of XP: post, power_up_received, power_up_given, streak_bonus, verification_bonus, admin_award, comment, comment_power_up, give_comment_power_up, reply, level_up, rank_up, badge_earned, progress_comparison_shared, follow, achievement';
