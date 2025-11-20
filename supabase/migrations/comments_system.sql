-- COMMENTS SYSTEM
-- Complete commenting system with replies, power ups, and notifications

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts NOT NULL,
  user_id UUID REFERENCES profiles NOT NULL,
  parent_comment_id UUID REFERENCES comments,
  text TEXT NOT NULL,
  power_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  edited BOOLEAN DEFAULT false,
  CONSTRAINT text_length CHECK (char_length(text) <= 500)
);

-- Create comment_power_ups table
CREATE TABLE IF NOT EXISTS comment_power_ups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID REFERENCES comments NOT NULL,
  user_id UUID REFERENCES profiles NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);
CREATE INDEX IF NOT EXISTS idx_comment_power_ups_comment_id ON comment_power_ups(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_power_ups_user_id ON comment_power_ups(user_id);

-- Add comment_count to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;

-- Function to increment comment count
CREATE OR REPLACE FUNCTION increment_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET comment_count = comment_count + 1
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-increment comment count (only for parent comments)
DROP TRIGGER IF EXISTS comment_count_increment ON comments;
CREATE TRIGGER comment_count_increment
AFTER INSERT ON comments
FOR EACH ROW
WHEN (NEW.parent_comment_id IS NULL)
EXECUTE FUNCTION increment_comment_count();

-- Function to decrement comment count
CREATE OR REPLACE FUNCTION decrement_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET comment_count = comment_count - 1
  WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-decrement comment count (only for parent comments)
DROP TRIGGER IF EXISTS comment_count_decrement ON comments;
CREATE TRIGGER comment_count_decrement
AFTER DELETE ON comments
FOR EACH ROW
WHEN (OLD.parent_comment_id IS NULL)
EXECUTE FUNCTION decrement_comment_count();

-- Function to update comment updated_at timestamp
CREATE OR REPLACE FUNCTION update_comment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on comment edit
DROP TRIGGER IF EXISTS comment_updated_at ON comments;
CREATE TRIGGER comment_updated_at
BEFORE UPDATE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_comment_updated_at();

-- Enable Row Level Security
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_power_ups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comments
DROP POLICY IF EXISTS "Comments viewable by everyone" ON comments;
CREATE POLICY "Comments viewable by everyone"
  ON comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own comments" ON comments;
CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON comments;
CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for comment_power_ups
DROP POLICY IF EXISTS "Comment power ups viewable by everyone" ON comment_power_ups;
CREATE POLICY "Comment power ups viewable by everyone"
  ON comment_power_ups FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can power up comments" ON comment_power_ups;
CREATE POLICY "Authenticated users can power up comments"
  ON comment_power_ups FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove their comment power ups" ON comment_power_ups;
CREATE POLICY "Users can remove their comment power ups"
  ON comment_power_ups FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON comments TO authenticated;
GRANT SELECT, INSERT, DELETE ON comment_power_ups TO authenticated;

-- Add comment notifications to notifications table
-- (Assumes notifications table already exists from previous migrations)
-- Comment notification types: 'comment', 'comment_reply', 'comment_power_up'

-- Comments for documentation
COMMENT ON TABLE comments IS 'User comments on posts with support for nested replies (1 level deep)';
COMMENT ON TABLE comment_power_ups IS 'Power ups given to comments, shares daily limit with post power ups';
COMMENT ON COLUMN comments.parent_comment_id IS 'If set, this comment is a reply to another comment (only 1 level deep)';
COMMENT ON COLUMN comments.power_count IS 'Number of power ups this comment has received';
COMMENT ON COLUMN comments.edited IS 'True if comment was edited after posting';
COMMENT ON COLUMN posts.comment_count IS 'Cached count of top-level comments (not including replies)';
