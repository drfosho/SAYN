// Weekly Recap System API for SAYN
import { supabase } from '@/lib/supabase';

export interface WeeklyRecap {
  id: string;
  user_id: string;
  week_start_date: string;
  week_end_date: string;
  total_posts: number;
  verified_posts: number;
  xp_earned: number;
  power_ups_received: number;
  power_ups_given: number;
  comments_posted: number;
  comments_received: number;
  new_followers: number;
  streak_days: number;
  most_powered_post_id: string | null;
  total_engagement: number;
  level_at_start: number | null;
  level_at_end: number | null;
  rank_at_start: string | null;
  rank_at_end: string | null;
  milestones_unlocked: string[];
  generated_at: string;
  viewed: boolean;
  viewed_at: string | null;
}

/**
 * Get the week range (Monday to Sunday) for a given date
 */
export function getWeekRange(date: Date = new Date()): { start: Date; end: Date } {
  const dayOfWeek = date.getDay();
  // Sunday is 0, Monday is 1, etc.
  // We want Monday as start of week
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - daysFromMonday);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return { start: weekStart, end: weekEnd };
}

/**
 * Get the previous week's range
 */
export function getPreviousWeekRange(): { start: Date; end: Date } {
  const today = new Date();
  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 7);
  return getWeekRange(lastWeek);
}

/**
 * Generate weekly recap for a user
 */
export async function generateWeeklyRecap(userId: string): Promise<WeeklyRecap | null> {
  try {
    // Get previous week's date range
    const { start: weekStart, end: weekEnd } = getPreviousWeekRange();
    const weekStartStr = weekStart.toISOString();
    const weekEndStr = weekEnd.toISOString();
    const weekStartDate = weekStart.toISOString().split('T')[0];
    const weekEndDate = weekEnd.toISOString().split('T')[0];

    console.log(`📊 Generating weekly recap for ${weekStartDate} to ${weekEndDate}`);

    // Check if recap already exists
    const { data: existing } = await supabase
      .from('weekly_recaps')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start_date', weekStartDate)
      .single();

    if (existing) {
      console.log('📋 Recap already exists for this week');
      return existing as WeeklyRecap;
    }

    // Get user's current profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('level, rank, login_streak')
      .eq('id', userId)
      .single();

    // Count posts created this week
    const { data: posts } = await supabase
      .from('posts')
      .select('id, verification_status, power_count, comment_count')
      .eq('user_id', userId)
      .gte('created_at', weekStartStr)
      .lte('created_at', weekEndStr);

    const totalPosts = posts?.length || 0;
    const verifiedPosts = posts?.filter((p) => p.verification_status === 'verified').length || 0;

    // Find most powered post
    const mostPoweredPost = posts?.reduce(
      (max, p) => (p.power_count > (max?.power_count || 0) ? p : max),
      null as any
    );

    // Get post IDs for further queries
    const postIds = posts?.map((p) => p.id) || [];

    // Count power ups received (on user's posts)
    let powerUpsReceived = 0;
    if (postIds.length > 0) {
      const { count } = await supabase
        .from('power_ups')
        .select('*', { count: 'exact', head: true })
        .in('post_id', postIds)
        .gte('created_at', weekStartStr)
        .lte('created_at', weekEndStr);
      powerUpsReceived = count || 0;
    }

    // Count power ups given
    const { count: powerUpsGiven } = await supabase
      .from('power_ups')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', weekStartStr)
      .lte('created_at', weekEndStr);

    // Count comments posted
    const { count: commentsPosted } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', weekStartStr)
      .lte('created_at', weekEndStr);

    // Count comments received (on user's posts)
    let commentsReceived = 0;
    if (postIds.length > 0) {
      const { count } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .in('post_id', postIds)
        .gte('created_at', weekStartStr)
        .lte('created_at', weekEndStr);
      commentsReceived = count || 0;
    }

    // Count new followers
    const { count: newFollowers } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId)
      .gte('created_at', weekStartStr)
      .lte('created_at', weekEndStr);

    // Calculate XP earned this week
    const { data: xpTransactions } = await supabase
      .from('xp_transactions')
      .select('amount')
      .eq('user_id', userId)
      .gte('created_at', weekStartStr)
      .lte('created_at', weekEndStr);

    const xpEarned = xpTransactions?.reduce((sum, t) => sum + t.amount, 0) || 0;

    // Calculate total engagement
    const totalEngagement = powerUpsReceived + commentsReceived;

    // Get milestones achieved this week
    const { data: milestones } = await supabase
      .from('streak_milestones')
      .select('milestone_days, streak_type')
      .eq('user_id', userId)
      .gte('achieved_at', weekStartStr)
      .lte('achieved_at', weekEndStr);

    const milestonesUnlocked =
      milestones?.map((m) => `${m.streak_type}_${m.milestone_days}`) || [];

    // Create recap record
    const { data: recap, error } = await supabase
      .from('weekly_recaps')
      .insert({
        user_id: userId,
        week_start_date: weekStartDate,
        week_end_date: weekEndDate,
        total_posts: totalPosts,
        verified_posts: verifiedPosts,
        xp_earned: xpEarned,
        power_ups_received: powerUpsReceived,
        power_ups_given: powerUpsGiven || 0,
        comments_posted: commentsPosted || 0,
        comments_received: commentsReceived,
        new_followers: newFollowers || 0,
        streak_days: profile?.login_streak || 0,
        most_powered_post_id: mostPoweredPost?.id || null,
        total_engagement: totalEngagement,
        level_at_end: profile?.level || 1,
        rank_at_end: profile?.rank || 'rookie',
        milestones_unlocked: milestonesUnlocked,
      })
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Weekly recap generated successfully');
    return recap as WeeklyRecap;
  } catch (error: any) {
    console.error('❌ Error generating weekly recap:', error);
    return null;
  }
}

/**
 * Get user's most recent recap
 */
export async function getLatestRecap(userId: string): Promise<WeeklyRecap | null> {
  try {
    const { data, error } = await supabase
      .from('weekly_recaps')
      .select('*')
      .eq('user_id', userId)
      .order('week_start_date', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as WeeklyRecap | null;
  } catch (error: any) {
    console.error('Error fetching latest recap:', error);
    return null;
  }
}

/**
 * Get a specific recap by ID
 */
export async function getRecapById(recapId: string): Promise<WeeklyRecap | null> {
  try {
    const { data, error } = await supabase
      .from('weekly_recaps')
      .select('*')
      .eq('id', recapId)
      .single();

    if (error) throw error;
    return data as WeeklyRecap;
  } catch (error: any) {
    console.error('Error fetching recap:', error);
    return null;
  }
}

/**
 * Mark recap as viewed
 */
export async function markRecapViewed(recapId: string): Promise<void> {
  try {
    await supabase
      .from('weekly_recaps')
      .update({
        viewed: true,
        viewed_at: new Date().toISOString(),
      })
      .eq('id', recapId);
  } catch (error: any) {
    console.error('Error marking recap as viewed:', error);
  }
}

/**
 * Get all recaps for history
 */
export async function getUserRecaps(userId: string, limit: number = 12): Promise<WeeklyRecap[]> {
  try {
    const { data, error } = await supabase
      .from('weekly_recaps')
      .select('*')
      .eq('user_id', userId)
      .order('week_start_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data as WeeklyRecap[]) || [];
  } catch (error: any) {
    console.error('Error fetching user recaps:', error);
    return [];
  }
}

/**
 * Check if user has an unviewed recap
 */
export async function hasUnviewedRecap(userId: string): Promise<boolean> {
  try {
    const { count, error } = await supabase
      .from('weekly_recaps')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('viewed', false);

    if (error) throw error;
    return (count || 0) > 0;
  } catch (error: any) {
    console.error('Error checking unviewed recaps:', error);
    return false;
  }
}

/**
 * Check if it's time to show a weekly recap (Monday)
 */
export function shouldShowWeeklyRecap(): boolean {
  const today = new Date();
  return today.getDay() === 1; // Monday
}

/**
 * Get motivational message based on recap performance
 */
export function getMotivationalMessage(recap: WeeklyRecap): string {
  if (recap.total_posts >= 7) {
    return "Incredible consistency! You posted every day this week. That's the SAYN spirit! 🔥";
  }
  if (recap.xp_earned >= 1000) {
    return 'Massive XP gains this week! You\'re on fire! Keep up the momentum! ⚡';
  }
  if (recap.power_ups_received >= 50) {
    return 'The community loves your content! Your authenticity is inspiring others! 💪';
  }
  if (recap.new_followers >= 10) {
    return 'Your influence is growing! More people want to follow your journey! 🚀';
  }
  if (recap.total_posts === 0) {
    return 'We missed you this week! Jump back in and share your progress. The community is waiting! 💙';
  }
  if (recap.power_ups_given >= 20) {
    return "You're an amazing community supporter! Your encouragement means everything! 🙌";
  }
  if (recap.comments_posted >= 10) {
    return 'Great engagement this week! Building connections is what SAYN is all about! 💬';
  }
  return 'Another week of progress! Every post, every rep, every day counts. Keep grinding! 💯';
}

/**
 * Get comparison text (better/worse than last week)
 */
export async function getWeekComparison(
  userId: string,
  currentRecap: WeeklyRecap
): Promise<{
  xpChange: number;
  postsChange: number;
  engagementChange: number;
  trend: 'up' | 'down' | 'same';
}> {
  try {
    // Get the recap from 2 weeks ago
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const { start } = getWeekRange(twoWeeksAgo);

    const { data: previousRecap } = await supabase
      .from('weekly_recaps')
      .select('xp_earned, total_posts, total_engagement')
      .eq('user_id', userId)
      .eq('week_start_date', start.toISOString().split('T')[0])
      .single();

    if (!previousRecap) {
      return { xpChange: 0, postsChange: 0, engagementChange: 0, trend: 'same' };
    }

    const xpChange = currentRecap.xp_earned - previousRecap.xp_earned;
    const postsChange = currentRecap.total_posts - previousRecap.total_posts;
    const engagementChange = currentRecap.total_engagement - previousRecap.total_engagement;

    const totalChange = xpChange + postsChange * 100 + engagementChange * 10;
    const trend = totalChange > 0 ? 'up' : totalChange < 0 ? 'down' : 'same';

    return { xpChange, postsChange, engagementChange, trend };
  } catch (error) {
    return { xpChange: 0, postsChange: 0, engagementChange: 0, trend: 'same' };
  }
}
