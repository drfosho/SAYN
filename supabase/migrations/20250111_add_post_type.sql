-- Add post_type column to posts table
-- This migration adds support for categorizing posts by type (daily check-in, progress update, etc.)

-- Add post_type column
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS post_type TEXT CHECK (post_type IN ('daily_check_in', 'progress_update', 'peak_condition', 'just_sharing'));

-- Add index for efficient querying by post type
CREATE INDEX IF NOT EXISTS posts_post_type_idx ON posts(post_type);

-- Add comment to explain the column
COMMENT ON COLUMN posts.post_type IS 'Type of post: daily_check_in (10 XP), progress_update (25 XP), peak_condition (40 XP), just_sharing (0 XP)';
