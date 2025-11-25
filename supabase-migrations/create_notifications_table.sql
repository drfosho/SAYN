-- Migration: Create notifications table and related functions
-- Run this in your Supabase SQL Editor

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  related_id UUID,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- System/authenticated users can create notifications for any user
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON notifications;
CREATE POLICY "Authenticated users can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Users can update their own notifications (mark as read)
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own notifications
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- NOTIFICATION SETTINGS IN PROFILES
-- =====================================================

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{
  "power_ups": true,
  "followers": true,
  "comments": true,
  "achievements": true,
  "system": true
}'::jsonb;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to notify on level up
CREATE OR REPLACE FUNCTION notify_level_up(p_user_id UUID, p_new_level INTEGER)
RETURNS VOID AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, actor_id, related_id)
  VALUES (
    p_user_id,
    'level_up',
    'Level Up!',
    'You reached Level ' || p_new_level || '!',
    NULL,
    p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to notify on rank up
CREATE OR REPLACE FUNCTION notify_rank_up(p_user_id UUID, p_new_rank TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, actor_id, related_id)
  VALUES (
    p_user_id,
    'rank_up',
    'Rank Up!',
    'You are now a ' || p_new_rank || '!',
    NULL,
    p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to notify on streak milestone
CREATE OR REPLACE FUNCTION notify_streak_milestone(p_user_id UUID, p_streak_days INTEGER)
RETURNS VOID AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, actor_id, related_id)
  VALUES (
    p_user_id,
    'streak_milestone',
    p_streak_days || ' Day Streak!',
    'Keep it going! You''re on fire!',
    NULL,
    p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to notify on badge earned
CREATE OR REPLACE FUNCTION notify_badge_earned(p_user_id UUID, p_badge_type TEXT, p_verified BOOLEAN)
RETURNS VOID AS $$
DECLARE
  v_title TEXT;
  v_message TEXT;
BEGIN
  IF p_verified THEN
    v_title := 'Badge Verified!';
    v_message := 'Your ' || INITCAP(p_badge_type) || ' badge is now verified!';
  ELSE
    v_title := 'Badge Applied!';
    v_message := 'You applied for the ' || INITCAP(p_badge_type) || ' badge.';
  END IF;

  INSERT INTO notifications (user_id, type, title, message, actor_id, related_id)
  VALUES (
    p_user_id,
    'badge_earned',
    v_title,
    v_message,
    NULL,
    p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to notify on badge under review
CREATE OR REPLACE FUNCTION notify_badge_under_review(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, actor_id, related_id)
  VALUES (
    p_user_id,
    'badge_under_review',
    'Badge Under Review',
    'Your badge application is being reviewed.',
    NULL,
    p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and notify XP milestones
CREATE OR REPLACE FUNCTION check_xp_milestone(p_user_id UUID, p_new_xp INTEGER)
RETURNS VOID AS $$
DECLARE
  v_milestones INTEGER[] := ARRAY[100, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000];
  v_milestone INTEGER;
BEGIN
  FOREACH v_milestone IN ARRAY v_milestones
  LOOP
    IF p_new_xp >= v_milestone THEN
      -- Check if notification for this milestone already exists
      IF NOT EXISTS (
        SELECT 1 FROM notifications
        WHERE user_id = p_user_id
        AND type = 'xp_milestone'
        AND message LIKE '%' || v_milestone || '%'
      ) THEN
        INSERT INTO notifications (user_id, type, title, message, actor_id, related_id)
        VALUES (
          p_user_id,
          'xp_milestone',
          'XP Milestone!',
          'You''ve earned ' || v_milestone || ' total XP!',
          NULL,
          p_user_id
        );
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- AUTO-CLEANUP OLD NOTIFICATIONS (Optional)
-- =====================================================

-- Function to delete notifications older than 30 days
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS VOID AS $$
BEGIN
  DELETE FROM notifications
  WHERE created_at < NOW() - INTERVAL '30 days'
  AND read = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE notifications IS 'User notifications for social interactions and achievements';
COMMENT ON COLUMN notifications.type IS 'Type: follow, power_up, comment, comment_reply, comment_power_up, level_up, rank_up, streak_milestone, badge_earned, badge_under_review, system, weekly_recap';
COMMENT ON COLUMN notifications.actor_id IS 'User who triggered the notification (null for system notifications)';
COMMENT ON COLUMN notifications.related_id IS 'ID of related entity (post, comment, user, etc.)';
COMMENT ON COLUMN profiles.notification_settings IS 'User preferences for notification types';

-- =====================================================
-- VERIFY TABLE STRUCTURE
-- =====================================================

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;
