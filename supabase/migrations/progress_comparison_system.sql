-- PROGRESS COMPARISON SYSTEM
-- Add progress comparison columns to enable before/after post comparisons

-- Add comparison columns to posts table
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS comparison_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS comparison_previous_post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS comparison_feedback TEXT,
ADD COLUMN IF NOT EXISTS comparison_timeframe_days INTEGER;

-- Add verification columns if they don't exist (for AI verification)
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS verification_requested BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_status TEXT CHECK (verification_status IN ('pending', 'verified', 'failed', 'not_requested')),
ADD COLUMN IF NOT EXISTS verification_confidence DECIMAL(3,2);

-- Create index for efficient querying of comparison posts
CREATE INDEX IF NOT EXISTS idx_posts_comparison_enabled ON posts(comparison_enabled) WHERE comparison_enabled = true;
CREATE INDEX IF NOT EXISTS idx_posts_comparison_previous ON posts(comparison_previous_post_id) WHERE comparison_previous_post_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_verification_status ON posts(verification_status);

-- Add comments for documentation
COMMENT ON COLUMN posts.comparison_enabled IS 'True if this post is part of a progress comparison (before/after)';
COMMENT ON COLUMN posts.comparison_previous_post_id IS 'Reference to the previous post in a progress comparison chain';
COMMENT ON COLUMN posts.comparison_feedback IS 'AI-generated feedback comparing this post to the previous post';
COMMENT ON COLUMN posts.comparison_timeframe_days IS 'Number of days between comparison posts (7, 14, 30, etc.)';
COMMENT ON COLUMN posts.verification_requested IS 'True if user requested AI verification for image authenticity';
COMMENT ON COLUMN posts.verification_status IS 'Status of AI verification: pending, verified, failed, or not_requested';
COMMENT ON COLUMN posts.verification_confidence IS 'AI confidence score (0.00 to 1.00) for verification result';
