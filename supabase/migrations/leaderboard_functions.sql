-- SQL functions for optimized leaderboard queries
-- Run this migration in your Supabase SQL editor to improve performance

-- Function to get verified leaderboard with minimum posts and verification rate
CREATE OR REPLACE FUNCTION get_verified_leaderboard(
  min_posts INTEGER DEFAULT 10,
  min_verification_rate INTEGER DEFAULT 50,
  result_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  xp INTEGER,
  level INTEGER,
  rank TEXT,
  badge_type TEXT,
  is_verified_coach BOOLEAN,
  total_posts BIGINT,
  verified_posts BIGINT,
  verification_rate INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH user_post_stats AS (
    SELECT
      p.user_id,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE p.verification_status = 'verified') as verified,
      ROUND((COUNT(*) FILTER (WHERE p.verification_status = 'verified')::NUMERIC / COUNT(*)::NUMERIC) * 100) as rate
    FROM posts p
    GROUP BY p.user_id
    HAVING
      COUNT(*) >= min_posts
      AND (COUNT(*) FILTER (WHERE p.verification_status = 'verified')::NUMERIC / COUNT(*)::NUMERIC) * 100 >= min_verification_rate
  )
  SELECT
    pr.id,
    pr.username,
    pr.display_name,
    pr.avatar_url,
    pr.xp,
    pr.level,
    pr.rank,
    pr.badge_type::TEXT,
    pr.is_verified_coach,
    ups.total,
    ups.verified,
    ups.rate::INTEGER
  FROM profiles pr
  JOIN user_post_stats ups ON pr.id = ups.user_id
  ORDER BY ups.rate DESC, ups.verified DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get weekly leaderboard (more efficient than client-side aggregation)
CREATE OR REPLACE FUNCTION get_weekly_leaderboard_optimized(
  result_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  xp INTEGER,
  level INTEGER,
  rank TEXT,
  badge_type TEXT,
  is_verified_coach BOOLEAN,
  weekly_xp BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH weekly_xp_stats AS (
    SELECT
      user_id,
      SUM(amount) as total_weekly_xp
    FROM xp_transactions
    WHERE created_at >= NOW() - INTERVAL '7 days'
    GROUP BY user_id
  )
  SELECT
    pr.id,
    pr.username,
    pr.display_name,
    pr.avatar_url,
    pr.xp,
    pr.level,
    pr.rank,
    pr.badge_type::TEXT,
    pr.is_verified_coach,
    wes.total_weekly_xp
  FROM profiles pr
  JOIN weekly_xp_stats wes ON pr.id = wes.user_id
  ORDER BY wes.total_weekly_xp DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_verified_leaderboard TO authenticated;
GRANT EXECUTE ON FUNCTION get_weekly_leaderboard_optimized TO authenticated;

-- Create indexes for better query performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_posts_user_verification
  ON posts(user_id, verification_status);

CREATE INDEX IF NOT EXISTS idx_xp_transactions_recent
  ON xp_transactions(created_at DESC, user_id);

CREATE INDEX IF NOT EXISTS idx_profiles_xp
  ON profiles(xp DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_streak
  ON profiles(post_streak DESC) WHERE post_streak > 0;
