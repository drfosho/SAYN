// Leaderboard API for SAYN
import { supabase } from '@/lib/supabase';
import { Profile, ApiResponse } from './types';

export type LeaderboardType = 'all_time' | 'weekly' | 'streaks' | 'verified';

export interface LeaderboardEntry {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  xp: number;
  level: number;
  rank: string;
  badge_type: 'natural' | 'enhanced' | 'under_review' | null;
  is_verified_coach: boolean;
  post_streak?: number;
  weekly_xp?: number;
  verification_rate?: number;
  total_posts?: number;
  verified_posts?: number;
  position: number;
}

export interface UserLeaderboardPosition {
  position: number;
  entry: LeaderboardEntry | null;
}

/**
 * Get All Time Leaderboard - Top 100 users by total XP
 */
export async function getAllTimeLeaderboard(
  limit: number = 100
): Promise<ApiResponse<LeaderboardEntry[]>> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, xp, level, rank, badge_type, is_verified_coach')
      .order('xp', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Add position numbers
    const entries: LeaderboardEntry[] = (data || []).map((profile, index) => ({
      ...profile,
      position: index + 1,
    }));

    return { data: entries, error: null };
  } catch (error: any) {
    console.error('Get all time leaderboard error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get Weekly Leaderboard - Top 100 users by XP gained in last 7 days
 */
export async function getWeeklyLeaderboard(
  limit: number = 100
): Promise<ApiResponse<LeaderboardEntry[]>> {
  try {
    // Calculate date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoISO = sevenDaysAgo.toISOString();

    // Get XP transactions from last 7 days, grouped by user
    const { data: transactions, error: txError } = await supabase
      .from('xp_transactions')
      .select('user_id, amount')
      .gte('created_at', sevenDaysAgoISO);

    if (txError) throw txError;

    // Group by user and sum amounts
    const weeklyXPMap = new Map<string, number>();
    transactions?.forEach((tx) => {
      const current = weeklyXPMap.get(tx.user_id) || 0;
      weeklyXPMap.set(tx.user_id, current + tx.amount);
    });

    // Convert to array and sort by weekly XP
    const sortedUserIds = Array.from(weeklyXPMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([userId, weeklyXP]) => ({ userId, weeklyXP }));

    if (sortedUserIds.length === 0) {
      return { data: [], error: null };
    }

    // Fetch user profiles for top users
    const userIds = sortedUserIds.map((u) => u.userId);
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, xp, level, rank, badge_type, is_verified_coach')
      .in('id', userIds);

    if (profileError) throw profileError;

    // Create map of profiles
    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

    // Build leaderboard entries with weekly XP
    const entries: LeaderboardEntry[] = sortedUserIds
      .map((item, index) => {
        const profile = profileMap.get(item.userId);
        if (!profile) return null;
        return {
          ...profile,
          weekly_xp: item.weeklyXP,
          position: index + 1,
        };
      })
      .filter((entry): entry is LeaderboardEntry => entry !== null);

    return { data: entries, error: null };
  } catch (error: any) {
    console.error('Get weekly leaderboard error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get Streaks Leaderboard - Top 100 users by current post_streak
 */
export async function getStreakLeaderboard(
  limit: number = 100
): Promise<ApiResponse<LeaderboardEntry[]>> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, xp, level, rank, badge_type, is_verified_coach, post_streak')
      .gt('post_streak', 0) // Only users with active streaks
      .order('post_streak', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Add position numbers
    const entries: LeaderboardEntry[] = (data || []).map((profile, index) => ({
      ...profile,
      position: index + 1,
    }));

    return { data: entries, error: null };
  } catch (error: any) {
    console.error('Get streak leaderboard error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get Verified Leaderboard - Top 100 users by verification percentage
 * Requires minimum 10 total posts and 50% verification rate
 */
export async function getVerifiedLeaderboard(
  limit: number = 100
): Promise<ApiResponse<LeaderboardEntry[]>> {
  try {
    // Query to get verification stats per user
    const { data, error } = await supabase.rpc('get_verified_leaderboard', {
      min_posts: 10,
      min_verification_rate: 50,
      result_limit: limit,
    });

    if (error) {
      // If RPC doesn't exist, fall back to client-side calculation
      console.warn('RPC get_verified_leaderboard not found, using fallback method');
      return await getVerifiedLeaderboardFallback(limit);
    }

    // Add position numbers
    const entries: LeaderboardEntry[] = (data || []).map((entry: any, index: number) => ({
      id: entry.id,
      username: entry.username,
      display_name: entry.display_name,
      avatar_url: entry.avatar_url,
      xp: entry.xp,
      level: entry.level,
      rank: entry.rank,
      badge_type: entry.badge_type,
      is_verified_coach: entry.is_verified_coach,
      total_posts: entry.total_posts,
      verified_posts: entry.verified_posts,
      verification_rate: entry.verification_rate,
      position: index + 1,
    }));

    return { data: entries, error: null };
  } catch (error: any) {
    console.error('Get verified leaderboard error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Fallback method for verified leaderboard if RPC doesn't exist
 */
async function getVerifiedLeaderboardFallback(
  limit: number = 100
): Promise<ApiResponse<LeaderboardEntry[]>> {
  try {
    // Get all posts grouped by user
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('user_id, verification_status');

    if (postsError) throw postsError;

    // Calculate verification stats per user
    const userStatsMap = new Map<
      string,
      { total: number; verified: number; rate: number }
    >();

    posts?.forEach((post) => {
      const stats = userStatsMap.get(post.user_id) || { total: 0, verified: 0, rate: 0 };
      stats.total += 1;
      if (post.verification_status === 'verified') {
        stats.verified += 1;
      }
      stats.rate = (stats.verified / stats.total) * 100;
      userStatsMap.set(post.user_id, stats);
    });

    // Filter users meeting criteria (min 10 posts, 50% verification rate)
    const qualifiedUsers = Array.from(userStatsMap.entries())
      .filter(([_, stats]) => stats.total >= 10 && stats.rate >= 50)
      .sort((a, b) => b[1].rate - a[1].rate)
      .slice(0, limit);

    if (qualifiedUsers.length === 0) {
      return { data: [], error: null };
    }

    // Fetch profiles for qualified users
    const userIds = qualifiedUsers.map(([userId]) => userId);
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, xp, level, rank, badge_type, is_verified_coach')
      .in('id', userIds);

    if (profileError) throw profileError;

    // Create profile map
    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

    // Build leaderboard entries
    const entries: LeaderboardEntry[] = qualifiedUsers
      .map(([userId, stats], index) => {
        const profile = profileMap.get(userId);
        if (!profile) return null;
        return {
          ...profile,
          total_posts: stats.total,
          verified_posts: stats.verified,
          verification_rate: Math.round(stats.rate),
          position: index + 1,
        };
      })
      .filter((entry): entry is LeaderboardEntry => entry !== null);

    return { data: entries, error: null };
  } catch (error: any) {
    console.error('Get verified leaderboard fallback error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get user's position in a specific leaderboard
 */
export async function getUserLeaderboardPosition(
  userId: string,
  leaderboardType: LeaderboardType
): Promise<ApiResponse<UserLeaderboardPosition>> {
  try {
    let position = 0;
    let entry: LeaderboardEntry | null = null;

    switch (leaderboardType) {
      case 'all_time': {
        // Count users with more XP than this user
        const { data: profile } = await supabase
          .from('profiles')
          .select('xp, username, display_name, avatar_url, level, rank, badge_type, is_verified_coach')
          .eq('id', userId)
          .single();

        if (!profile) break;

        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gt('xp', profile.xp);

        position = (count || 0) + 1;
        entry = { ...profile, id: userId, position };
        break;
      }

      case 'weekly': {
        // Calculate weekly XP for all users, find position
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: userTx } = await supabase
          .from('xp_transactions')
          .select('amount')
          .eq('user_id', userId)
          .gte('created_at', sevenDaysAgo.toISOString());

        const userWeeklyXP = userTx?.reduce((sum, tx) => sum + tx.amount, 0) || 0;

        const { data: allTx } = await supabase
          .from('xp_transactions')
          .select('user_id, amount')
          .gte('created_at', sevenDaysAgo.toISOString());

        const weeklyXPMap = new Map<string, number>();
        allTx?.forEach((tx) => {
          const current = weeklyXPMap.get(tx.user_id) || 0;
          weeklyXPMap.set(tx.user_id, current + tx.amount);
        });

        const usersWithMoreXP = Array.from(weeklyXPMap.values()).filter(
          (xp) => xp > userWeeklyXP
        ).length;

        position = usersWithMoreXP + 1;

        const { data: profile } = await supabase
          .from('profiles')
          .select('username, display_name, avatar_url, xp, level, rank, badge_type, is_verified_coach')
          .eq('id', userId)
          .single();

        if (profile) {
          entry = { ...profile, id: userId, weekly_xp: userWeeklyXP, position };
        }
        break;
      }

      case 'streaks': {
        const { data: profile } = await supabase
          .from('profiles')
          .select('post_streak, username, display_name, avatar_url, xp, level, rank, badge_type, is_verified_coach')
          .eq('id', userId)
          .single();

        if (!profile || !profile.post_streak || profile.post_streak === 0) {
          position = 0; // Not on leaderboard
          break;
        }

        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gt('post_streak', profile.post_streak);

        position = (count || 0) + 1;
        entry = { ...profile, id: userId, position };
        break;
      }

      case 'verified': {
        // Get user's verification stats
        const { data: posts } = await supabase
          .from('posts')
          .select('verification_status')
          .eq('user_id', userId);

        const totalPosts = posts?.length || 0;
        const verifiedPosts =
          posts?.filter((p) => p.verification_status === 'verified').length || 0;
        const verificationRate = totalPosts > 0 ? (verifiedPosts / totalPosts) * 100 : 0;

        if (totalPosts < 10 || verificationRate < 50) {
          position = 0; // Not qualified
          break;
        }

        // Calculate position - this is simplified, for production use RPC
        const { data: allPosts } = await supabase.from('posts').select('user_id, verification_status');

        const userStatsMap = new Map<string, { total: number; verified: number; rate: number }>();
        allPosts?.forEach((post) => {
          const stats = userStatsMap.get(post.user_id) || { total: 0, verified: 0, rate: 0 };
          stats.total += 1;
          if (post.verification_status === 'verified') stats.verified += 1;
          stats.rate = (stats.verified / stats.total) * 100;
          userStatsMap.set(post.user_id, stats);
        });

        const qualifiedUsers = Array.from(userStatsMap.entries())
          .filter(([_, stats]) => stats.total >= 10 && stats.rate >= 50)
          .filter(([uid]) => uid !== userId)
          .filter(([_, stats]) => stats.rate > verificationRate);

        position = qualifiedUsers.length + 1;

        const { data: profile } = await supabase
          .from('profiles')
          .select('username, display_name, avatar_url, xp, level, rank, badge_type, is_verified_coach')
          .eq('id', userId)
          .single();

        if (profile) {
          entry = {
            ...profile,
            id: userId,
            total_posts: totalPosts,
            verified_posts: verifiedPosts,
            verification_rate: Math.round(verificationRate),
            position,
          };
        }
        break;
      }
    }

    return {
      data: { position, entry },
      error: null,
    };
  } catch (error: any) {
    console.error('Get user leaderboard position error:', error);
    return { data: null, error: error.message };
  }
}
