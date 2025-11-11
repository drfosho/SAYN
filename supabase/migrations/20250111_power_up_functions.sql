-- Power Up Functions and RLS Policies
-- This migration adds RPC functions for atomic power count operations
-- and fixes RLS policies to allow power ups on other users' posts

-- Create RPC function for incrementing power count (atomic operation)
CREATE OR REPLACE FUNCTION increment_power_count(post_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE posts
  SET power_count = power_count + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RPC function for decrementing power count (atomic operation)
CREATE OR REPLACE FUNCTION decrement_power_count(post_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE posts
  SET power_count = GREATEST(power_count - 1, 0)
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing restrictive update policy if it exists
DROP POLICY IF EXISTS "Users can update own posts" ON posts;

-- Create new update policy that allows users to update only their own posts' content
CREATE POLICY "Users can update own posts content"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create separate policy to allow power count updates via RPC functions
-- Note: The RPC functions use SECURITY DEFINER, so they bypass RLS
-- This comment is just for documentation

-- Grant execute permissions on the RPC functions
GRANT EXECUTE ON FUNCTION increment_power_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_power_count(uuid) TO authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION increment_power_count IS 'Atomically increments the power_count for a post. Used when a user powers up a post.';
COMMENT ON FUNCTION decrement_power_count IS 'Atomically decrements the power_count for a post. Used when a user removes a power up.';
