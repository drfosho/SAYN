-- SEARCH OPTIMIZATION
-- Add indexes to improve search performance

-- Index for username searches (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_profiles_username_lower
  ON profiles (LOWER(username));

-- Index for display name searches (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_profiles_display_name_lower
  ON profiles (LOWER(display_name));

-- Index for location searches
CREATE INDEX IF NOT EXISTS idx_profiles_location
  ON profiles (location);

-- Index for verified coaches
CREATE INDEX IF NOT EXISTS idx_profiles_verified_coach
  ON profiles (is_verified_coach) WHERE is_verified_coach = true;

-- Full-text search index for post captions
CREATE INDEX IF NOT EXISTS idx_posts_caption_fulltext
  ON posts USING gin(to_tsvector('english', caption));

-- Index for post type filtering
CREATE INDEX IF NOT EXISTS idx_posts_type
  ON posts (post_type);

-- Index for post verification status
CREATE INDEX IF NOT EXISTS idx_posts_verification
  ON posts (verification_status);

-- Index for recent posts (time range filtering)
CREATE INDEX IF NOT EXISTS idx_posts_created_at
  ON posts (created_at DESC);

-- Index for trending posts (power count + recent)
CREATE INDEX IF NOT EXISTS idx_posts_trending
  ON posts (power_count DESC, created_at DESC)
  WHERE verification_status = 'verified';

-- Composite index for user search with filters
CREATE INDEX IF NOT EXISTS idx_profiles_search_composite
  ON profiles (xp DESC, level, rank, badge_type);

-- Index for recommendations (level-based)
CREATE INDEX IF NOT EXISTS idx_profiles_level
  ON profiles (level);

-- Index for active users (recent posts)
CREATE INDEX IF NOT EXISTS idx_posts_user_recent
  ON posts (user_id, created_at DESC);

-- Comments for documentation
COMMENT ON INDEX idx_profiles_username_lower IS 'Improves case-insensitive username searches';
COMMENT ON INDEX idx_posts_caption_fulltext IS 'Enables full-text search on post captions';
COMMENT ON INDEX idx_posts_trending IS 'Optimizes trending posts query';
COMMENT ON INDEX idx_profiles_search_composite IS 'Composite index for filtered user searches';
