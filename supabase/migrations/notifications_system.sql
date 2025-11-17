-- NOTIFICATIONS SYSTEM
-- Create notifications table and triggers for auto-notification creation

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'follow',
    'power_up',
    'comment',
    'level_up',
    'rank_up',
    'streak_milestone',
    'badge_earned',
    'badge_under_review',
    'system',
    'weekly_recap'
  )),
  title TEXT NOT NULL,
  message TEXT,
  actor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  related_id UUID,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read, created_at DESC);

-- Add push_token column to profiles for push notifications (future)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS push_token TEXT,
ADD COLUMN IF NOT EXISTS notification_settings JSON DEFAULT '{"power_ups": true, "followers": true, "comments": true, "achievements": true, "system": true}'::JSON;

-- Function to create follow notification
CREATE OR REPLACE FUNCTION create_follow_notification()
RETURNS TRIGGER AS $$
DECLARE
  follower_username TEXT;
BEGIN
  -- Get follower's username
  SELECT username INTO follower_username
  FROM profiles
  WHERE id = NEW.follower_id;

  -- Create notification for the user being followed
  INSERT INTO notifications (user_id, type, title, message, actor_id, related_id)
  VALUES (
    NEW.following_id,
    'follow',
    'New Follower!',
    follower_username || ' started following you',
    NEW.follower_id,
    NEW.follower_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for follow notifications
DROP TRIGGER IF EXISTS trigger_follow_notification ON follows;
CREATE TRIGGER trigger_follow_notification
  AFTER INSERT ON follows
  FOR EACH ROW
  EXECUTE FUNCTION create_follow_notification();

-- Function to create power up notification
CREATE OR REPLACE FUNCTION create_power_up_notification()
RETURNS TRIGGER AS $$
DECLARE
  giver_username TEXT;
  post_owner_id UUID;
BEGIN
  -- Get the post owner and power up giver's username
  SELECT user_id INTO post_owner_id
  FROM posts
  WHERE id = NEW.post_id;

  SELECT username INTO giver_username
  FROM profiles
  WHERE id = NEW.user_id;

  -- Don't create notification if user powered up their own post
  IF post_owner_id != NEW.user_id THEN
    -- Create notification for post owner
    INSERT INTO notifications (user_id, type, title, message, actor_id, related_id)
    VALUES (
      post_owner_id,
      'power_up',
      'New Power Up!',
      giver_username || ' powered up your post',
      NEW.user_id,
      NEW.post_id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for power up notifications
DROP TRIGGER IF EXISTS trigger_power_up_notification ON power_ups;
CREATE TRIGGER trigger_power_up_notification
  AFTER INSERT ON power_ups
  FOR EACH ROW
  EXECUTE FUNCTION create_power_up_notification();

-- Function to create level up notification
CREATE OR REPLACE FUNCTION notify_level_up(
  p_user_id UUID,
  p_new_level INTEGER
) RETURNS VOID AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message)
  VALUES (
    p_user_id,
    'level_up',
    'Level Up!',
    'You reached Level ' || p_new_level || '!'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to create rank up notification
CREATE OR REPLACE FUNCTION notify_rank_up(
  p_user_id UUID,
  p_new_rank TEXT
) RETURNS VOID AS $$
DECLARE
  rank_display TEXT;
BEGIN
  -- Convert rank slug to display name
  rank_display := CASE p_new_rank
    WHEN 'rookie' THEN 'Rookie'
    WHEN 'warrior' THEN 'Warrior'
    WHEN 'titan' THEN 'Titan'
    WHEN 'superhuman' THEN 'Superhuman'
    WHEN 'god_tier' THEN 'God Tier'
    ELSE p_new_rank
  END;

  INSERT INTO notifications (user_id, type, title, message)
  VALUES (
    p_user_id,
    'rank_up',
    'Rank Up!',
    'You are now a ' || rank_display || '!'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to create streak milestone notification
CREATE OR REPLACE FUNCTION notify_streak_milestone(
  p_user_id UUID,
  p_streak_days INTEGER
) RETURNS VOID AS $$
BEGIN
  -- Only notify on milestone days: 5, 10, 20, 30, 50, 100, etc.
  IF p_streak_days IN (5, 10, 20, 30, 50, 100, 200, 365) THEN
    INSERT INTO notifications (user_id, type, title, message)
    VALUES (
      p_user_id,
      'streak_milestone',
      'Streak Milestone! 🔥',
      p_streak_days || ' day streak - keep it going!'
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to create badge notification
CREATE OR REPLACE FUNCTION notify_badge_earned(
  p_user_id UUID,
  p_badge_type TEXT,
  p_verified BOOLEAN
) RETURNS VOID AS $$
DECLARE
  badge_display TEXT;
  notification_message TEXT;
BEGIN
  -- Convert badge type to display name
  badge_display := CASE p_badge_type
    WHEN 'natural' THEN 'Natural'
    WHEN 'enhanced' THEN 'Enhanced'
    ELSE p_badge_type
  END;

  -- Different message for verified vs unverified
  IF p_verified THEN
    notification_message := 'Your ' || badge_display || ' badge has been verified!';
  ELSE
    notification_message := 'You selected the ' || badge_display || ' badge. Complete verification to make it permanent!';
  END IF;

  INSERT INTO notifications (user_id, type, title, message)
  VALUES (
    p_user_id,
    'badge_earned',
    'Badge Update!',
    notification_message
  );
END;
$$ LANGUAGE plpgsql;

-- Function to create badge under review notification
CREATE OR REPLACE FUNCTION notify_badge_under_review(
  p_user_id UUID
) RETURNS VOID AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message)
  VALUES (
    p_user_id,
    'badge_under_review',
    'Badge Under Review',
    'Your badge is currently under review due to community reports. We''ll update you soon.'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to create XP milestone notification
CREATE OR REPLACE FUNCTION check_xp_milestone(
  p_user_id UUID,
  p_new_xp INTEGER
) RETURNS VOID AS $$
BEGIN
  -- Notify on XP milestones: 1000, 5000, 10000, 25000, 50000, 100000
  IF p_new_xp IN (1000, 5000, 10000, 25000, 50000, 100000) THEN
    INSERT INTO notifications (user_id, type, title, message)
    VALUES (
      p_user_id,
      'system',
      'XP Milestone! 🎯',
      'You''ve earned ' || p_new_xp || ' total XP!'
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON notifications TO authenticated;
GRANT EXECUTE ON FUNCTION create_follow_notification TO authenticated;
GRANT EXECUTE ON FUNCTION create_power_up_notification TO authenticated;
GRANT EXECUTE ON FUNCTION notify_level_up TO authenticated;
GRANT EXECUTE ON FUNCTION notify_rank_up TO authenticated;
GRANT EXECUTE ON FUNCTION notify_streak_milestone TO authenticated;
GRANT EXECUTE ON FUNCTION notify_badge_earned TO authenticated;
GRANT EXECUTE ON FUNCTION notify_badge_under_review TO authenticated;
GRANT EXECUTE ON FUNCTION check_xp_milestone TO authenticated;

-- Comments for documentation
COMMENT ON TABLE notifications IS 'Stores all user notifications for social interactions, achievements, and system messages';
COMMENT ON COLUMN notifications.type IS 'Type of notification: follow, power_up, comment, level_up, rank_up, streak_milestone, badge_earned, badge_under_review, system';
COMMENT ON COLUMN notifications.actor_id IS 'User who triggered the notification (for social notifications)';
COMMENT ON COLUMN notifications.related_id IS 'ID of related entity (post_id, user_id, etc.)';
COMMENT ON COLUMN notifications.read IS 'Whether the notification has been read by the user';
