// Search and Discovery API for SAYN
import { supabase } from '@/lib/supabase';
import { Profile, Post, ApiResponse } from './types';

export interface SearchFilters {
  location?: string;
  rank?: string;
  badgeType?: 'natural' | 'enhanced' | null;
  postType?: 'daily_check_in' | 'progress_update' | 'peak_condition' | 'just_sharing';
  verificationStatus?: 'verified' | 'not_verified' | 'all';
  timeRange?: 'all' | 'week' | 'month';
  specialization?: string;
  minRating?: number;
}

export interface UserSearchResult extends Profile {
  follower_count?: number;
  is_following?: boolean;
}

export interface PostSearchResult extends Post {
  profiles?: Profile;
}

export interface CoachSearchResult extends Profile {
  specializations?: string[];
  rating?: number;
  review_count?: number;
  client_count?: number;
}

export interface RecommendedUser extends Profile {
  reason: string;
  match_score: number;
  follower_count?: number;
}

/**
 * Search for users by username, display name, or location
 */
export async function searchUsers(
  query: string,
  filters: SearchFilters = {},
  currentUserId?: string,
  limit: number = 50
): Promise<ApiResponse<UserSearchResult[]>> {
  try {
    let searchQuery = supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`);

    // Apply filters
    if (filters.location) {
      searchQuery = searchQuery.ilike('location', `%${filters.location}%`);
    }
    if (filters.rank) {
      searchQuery = searchQuery.eq('rank', filters.rank);
    }
    if (filters.badgeType) {
      searchQuery = searchQuery.eq('badge_type', filters.badgeType);
    }

    // Order by match quality: exact match first, then by XP
    const { data, error } = await searchQuery
      .order('xp', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Get follower counts and following status for each user
    const usersWithStats = await Promise.all(
      (data || []).map(async (user) => {
        // Get follower count
        const { count: followerCount } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', user.id);

        // Check if current user is following
        let isFollowing = false;
        if (currentUserId) {
          const { data: followData } = await supabase
            .from('follows')
            .select('id')
            .eq('follower_id', currentUserId)
            .eq('following_id', user.id)
            .maybeSingle();
          isFollowing = !!followData;
        }

        return {
          ...user,
          follower_count: followerCount || 0,
          is_following: isFollowing,
        };
      })
    );

    // Sort to put exact username matches first
    const sorted = usersWithStats.sort((a, b) => {
      const aExact = a.username.toLowerCase() === query.toLowerCase();
      const bExact = b.username.toLowerCase() === query.toLowerCase();
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return b.xp - a.xp;
    });

    return { data: sorted, error: null };
  } catch (error: any) {
    console.error('Search users error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Search for posts by caption text
 */
export async function searchPosts(
  query: string,
  filters: SearchFilters = {},
  limit: number = 50
): Promise<ApiResponse<PostSearchResult[]>> {
  try {
    let searchQuery = supabase
      .from('posts')
      .select('*, profiles(*)')
      .ilike('caption', `%${query}%`);

    // Apply filters
    if (filters.postType) {
      searchQuery = searchQuery.eq('post_type', filters.postType);
    }
    if (filters.verificationStatus && filters.verificationStatus !== 'all') {
      searchQuery = searchQuery.eq('verification_status', filters.verificationStatus);
    }
    if (filters.timeRange && filters.timeRange !== 'all') {
      const now = new Date();
      let cutoffDate: Date;
      if (filters.timeRange === 'week') {
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else {
        // month
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      searchQuery = searchQuery.gte('created_at', cutoffDate.toISOString());
    }

    const { data, error } = await searchQuery
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { data: data as PostSearchResult[], error: null };
  } catch (error: any) {
    console.error('Search posts error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Search for verified coaches
 */
export async function searchCoaches(
  query: string,
  filters: SearchFilters = {},
  limit: number = 30
): Promise<ApiResponse<CoachSearchResult[]>> {
  try {
    let searchQuery = supabase
      .from('profiles')
      .select('*')
      .eq('is_verified_coach', true);

    if (query) {
      searchQuery = searchQuery.or(`username.ilike.%${query}%,display_name.ilike.%${query}%`);
    }

    // Apply filters
    if (filters.location) {
      searchQuery = searchQuery.ilike('location', `%${filters.location}%`);
    }

    const { data, error } = await searchQuery
      .order('power_points', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // For now, return coaches without additional stats
    // In future, add specializations, ratings, etc.
    const coaches: CoachSearchResult[] = (data || []).map((coach) => ({
      ...coach,
      specializations: ['General Fitness'], // Placeholder
      rating: 4.5, // Placeholder
      review_count: 0, // Placeholder
      client_count: 0, // Placeholder
    }));

    return { data: coaches, error: null };
  } catch (error: any) {
    console.error('Search coaches error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get recommended users to follow based on current user's profile
 */
export async function getRecommendedUsers(
  userId: string,
  limit: number = 30
): Promise<ApiResponse<RecommendedUser[]>> {
  try {
    // Get current user's profile
    const { data: currentUser, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !currentUser) throw userError;

    // Get users current user is already following
    const { data: following } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);

    const followingIds = following?.map((f) => f.following_id) || [];

    // Build recommendation query
    let recommendQuery = supabase
      .from('profiles')
      .select('*')
      .neq('id', userId) // Exclude self
      .gte('level', currentUser.level - 10) // Similar level (+/- 10)
      .lte('level', currentUser.level + 10)
      .order('xp', { ascending: false })
      .limit(limit * 2); // Get more than needed for filtering

    // Same location (if user has location)
    if (currentUser.location) {
      recommendQuery = recommendQuery.ilike('location', `%${currentUser.location}%`);
    }

    const { data: candidates, error: candidatesError } = await recommendQuery;

    if (candidatesError) throw candidatesError;

    // Filter out already following
    const filtered = (candidates || []).filter((user) => !followingIds.includes(user.id));

    // Calculate match scores and reasons
    const withScores = await Promise.all(
      filtered.map(async (user) => {
        let score = 0;
        const reasons: string[] = [];

        // Similar level (base score)
        const levelDiff = Math.abs(user.level - currentUser.level);
        score += Math.max(0, 10 - levelDiff);
        if (levelDiff <= 5) {
          reasons.push('Similar level');
        }

        // Same location
        if (
          currentUser.location &&
          user.location &&
          user.location.toLowerCase().includes(currentUser.location.toLowerCase())
        ) {
          score += 15;
          reasons.push('Same location');
        }

        // Same badge type
        if (currentUser.badge_type && user.badge_type === currentUser.badge_type) {
          score += 10;
          reasons.push(
            `${user.badge_type === 'natural' ? 'Natural' : 'Enhanced'} athlete`
          );
        }

        // Same fitness goals
        const currentGoals = currentUser.fitness_goals || [];
        const userGoals = user.fitness_goals || [];
        const sharedGoals = currentGoals.filter((g) => userGoals.includes(g));
        if (sharedGoals.length > 0) {
          score += sharedGoals.length * 5;
          reasons.push('Similar fitness goals');
        }

        // Active recently (posted in last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const { count: recentPosts } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', sevenDaysAgo.toISOString());

        if (recentPosts && recentPosts > 0) {
          score += 5;
          reasons.push('Active user');
        }

        // Get follower count
        const { count: followerCount } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', user.id);

        return {
          ...user,
          match_score: score,
          reason: reasons.length > 0 ? reasons.join(' · ') : 'Recommended for you',
          follower_count: followerCount || 0,
        };
      })
    );

    // Sort by match score and take top results
    const sorted = withScores.sort((a, b) => b.match_score - a.match_score).slice(0, limit);

    return { data: sorted, error: null };
  } catch (error: any) {
    console.error('Get recommended users error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get trending posts (most power-ups in last 24 hours)
 */
export async function getTrendingPosts(
  limit: number = 20
): Promise<ApiResponse<PostSearchResult[]>> {
  try {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(*)')
      .eq('verification_status', 'verified')
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .gte('power_count', 10) // Minimum power count
      .order('power_count', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { data: data as PostSearchResult[], error: null };
  } catch (error: any) {
    console.error('Get trending posts error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get search suggestions based on popular searches
 */
export async function getSearchSuggestions(
  query: string,
  limit: number = 10
): Promise<ApiResponse<string[]>> {
  try {
    // Get users matching query
    const { data: users } = await supabase
      .from('profiles')
      .select('username')
      .ilike('username', `${query}%`)
      .limit(limit);

    const suggestions = users?.map((u) => u.username) || [];

    return { data: suggestions, error: null };
  } catch (error: any) {
    console.error('Get search suggestions error:', error);
    return { data: null, error: error.message };
  }
}
