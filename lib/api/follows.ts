import { supabase } from '../supabase';
import { Follow, ApiResponse } from './types';

/**
 * Follow a user
 */
export async function followUser(
  followerId: string,
  followingId: string
): Promise<ApiResponse<Follow>> {
  try {
    // Don't allow users to follow themselves
    if (followerId === followingId) {
      return { data: null, error: 'Cannot follow yourself' };
    }

    const { data, error } = await supabase
      .from('follows')
      .insert({
        follower_id: followerId,
        following_id: followingId,
      })
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    console.error('Follow user error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Unfollow a user
 */
export async function unfollowUser(
  followerId: string,
  followingId: string
): Promise<ApiResponse<boolean>> {
  try {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) throw error;

    return { data: true, error: null };
  } catch (error: any) {
    console.error('Unfollow user error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Toggle follow status (follow if not following, unfollow if following)
 */
export async function toggleFollow(
  followerId: string,
  followingId: string
): Promise<ApiResponse<{ isFollowing: boolean }>> {
  try {
    // Check current status
    const { data: existingFollow } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();

    if (existingFollow) {
      // Already following, so unfollow
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);

      if (error) throw error;

      return { data: { isFollowing: false }, error: null };
    } else {
      // Not following, so follow
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: followerId,
          following_id: followingId,
        });

      if (error) throw error;

      return { data: { isFollowing: true }, error: null };
    }
  } catch (error: any) {
    console.error('Toggle follow error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get mutual follows (users who follow each other)
 */
export async function getMutualFollows(userId: string): Promise<ApiResponse<string[]>> {
  try {
    // Get users that the current user follows
    const { data: following, error: followingError } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);

    if (followingError) throw followingError;

    const followingIds = following?.map((f) => f.following_id) || [];

    if (followingIds.length === 0) {
      return { data: [], error: null };
    }

    // Get users from that list who also follow the current user
    const { data: mutual, error: mutualError } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('following_id', userId)
      .in('follower_id', followingIds);

    if (mutualError) throw mutualError;

    const mutualIds = mutual?.map((m) => m.follower_id) || [];

    return { data: mutualIds, error: null };
  } catch (error: any) {
    console.error('Get mutual follows error:', error);
    return { data: null, error: error.message };
  }
}
