// Notifications API for SAYN
import { supabase } from '@/lib/supabase';
import { ApiResponse, Profile } from './types';

export type NotificationType =
  | 'follow'
  | 'power_up'
  | 'comment'
  | 'level_up'
  | 'rank_up'
  | 'streak_milestone'
  | 'badge_earned'
  | 'badge_under_review'
  | 'system'
  | 'weekly_recap';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string | null;
  actor_id: string | null;
  related_id: string | null;
  read: boolean;
  created_at: string;
  // Joined data
  actor?: Profile;
}

export interface NotificationSettings {
  power_ups: boolean;
  followers: boolean;
  comments: boolean;
  achievements: boolean;
  system: boolean;
}

/**
 * Get notifications for a user
 */
export async function getNotifications(
  userId: string,
  type?: NotificationType,
  limit: number = 50
): Promise<ApiResponse<Notification[]>> {
  try {
    let query = supabase
      .from('notifications')
      .select('*, actor:actor_id(id, username, avatar_url, badge_type, badge_verified)')
      .eq('user_id', userId);

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { data: data as Notification[], error: null };
  } catch (error: any) {
    console.error('Get notifications error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string): Promise<ApiResponse<number>> {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;

    return { data: count || 0, error: null };
  } catch (error: any) {
    console.error('Get unread count error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId: string): Promise<ApiResponse<boolean>> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;

    return { data: true, error: null };
  } catch (error: any) {
    console.error('Mark as read error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string): Promise<ApiResponse<boolean>> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;

    return { data: true, error: null };
  } catch (error: any) {
    console.error('Mark all as read error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Create a notification
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  actorId?: string,
  relatedId?: string
): Promise<ApiResponse<Notification>> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        actor_id: actorId,
        related_id: relatedId,
      })
      .select()
      .single();

    if (error) throw error;

    return { data: data as Notification, error: null };
  } catch (error: any) {
    console.error('Create notification error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<ApiResponse<boolean>> {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;

    return { data: true, error: null };
  } catch (error: any) {
    console.error('Delete notification error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get notification settings for a user
 */
export async function getNotificationSettings(
  userId: string
): Promise<ApiResponse<NotificationSettings>> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('notification_settings')
      .eq('id', userId)
      .single();

    if (error) throw error;

    const settings: NotificationSettings = data?.notification_settings || {
      power_ups: true,
      followers: true,
      comments: true,
      achievements: true,
      system: true,
    };

    return { data: settings, error: null };
  } catch (error: any) {
    console.error('Get notification settings error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Update notification settings for a user
 */
export async function updateNotificationSettings(
  userId: string,
  settings: Partial<NotificationSettings>
): Promise<ApiResponse<boolean>> {
  try {
    // Get current settings
    const { data: currentData } = await supabase
      .from('profiles')
      .select('notification_settings')
      .eq('id', userId)
      .single();

    const currentSettings = currentData?.notification_settings || {
      power_ups: true,
      followers: true,
      comments: true,
      achievements: true,
      system: true,
    };

    // Merge with new settings
    const updatedSettings = { ...currentSettings, ...settings };

    const { error } = await supabase
      .from('profiles')
      .update({ notification_settings: updatedSettings })
      .eq('id', userId);

    if (error) throw error;

    return { data: true, error: null };
  } catch (error: any) {
    console.error('Update notification settings error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Subscribe to real-time notifications
 */
export function subscribeToNotifications(
  userId: string,
  callback: (notification: Notification) => void
) {
  const channel = supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      async (payload) => {
        // Fetch actor details if actor_id exists
        let notification = payload.new as Notification;

        if (notification.actor_id) {
          const { data: actor } = await supabase
            .from('profiles')
            .select('id, username, avatar_url, badge_type, badge_verified')
            .eq('id', notification.actor_id)
            .single();

          if (actor) {
            notification = { ...notification, actor };
          }
        }

        callback(notification);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Helper function to create level up notification
 */
export async function notifyLevelUp(
  userId: string,
  newLevel: number
): Promise<ApiResponse<boolean>> {
  try {
    const { error } = await supabase.rpc('notify_level_up', {
      p_user_id: userId,
      p_new_level: newLevel,
    });

    if (error) throw error;

    return { data: true, error: null };
  } catch (error: any) {
    console.error('Notify level up error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Helper function to create rank up notification
 */
export async function notifyRankUp(
  userId: string,
  newRank: string
): Promise<ApiResponse<boolean>> {
  try {
    const { error } = await supabase.rpc('notify_rank_up', {
      p_user_id: userId,
      p_new_rank: newRank,
    });

    if (error) throw error;

    return { data: true, error: null };
  } catch (error: any) {
    console.error('Notify rank up error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Helper function to create streak milestone notification
 */
export async function notifyStreakMilestone(
  userId: string,
  streakDays: number
): Promise<ApiResponse<boolean>> {
  try {
    const { error } = await supabase.rpc('notify_streak_milestone', {
      p_user_id: userId,
      p_streak_days: streakDays,
    });

    if (error) throw error;

    return { data: true, error: null };
  } catch (error: any) {
    console.error('Notify streak milestone error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Helper function to create badge notification
 */
export async function notifyBadgeEarned(
  userId: string,
  badgeType: string,
  verified: boolean
): Promise<ApiResponse<boolean>> {
  try {
    const { error } = await supabase.rpc('notify_badge_earned', {
      p_user_id: userId,
      p_badge_type: badgeType,
      p_verified: verified,
    });

    if (error) throw error;

    return { data: true, error: null };
  } catch (error: any) {
    console.error('Notify badge earned error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Helper function to create badge under review notification
 */
export async function notifyBadgeUnderReview(userId: string): Promise<ApiResponse<boolean>> {
  try {
    const { error } = await supabase.rpc('notify_badge_under_review', {
      p_user_id: userId,
    });

    if (error) throw error;

    return { data: true, error: null };
  } catch (error: any) {
    console.error('Notify badge under review error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Helper function to check XP milestones
 */
export async function checkXPMilestone(
  userId: string,
  newXP: number
): Promise<ApiResponse<boolean>> {
  try {
    const { error } = await supabase.rpc('check_xp_milestone', {
      p_user_id: userId,
      p_new_xp: newXP,
    });

    if (error) throw error;

    return { data: true, error: null };
  } catch (error: any) {
    console.error('Check XP milestone error:', error);
    return { data: null, error: error.message };
  }
}
