import { supabase } from '../supabase';
import { Post, PostCreate, PostUpdate, ApiResponse } from './types';

/**
 * Get paginated posts for the feed
 * Includes user profile data and whether current user has powered up
 */
export async function getPosts(
  limit: number = 20,
  offset: number = 0,
  currentUserId?: string
): Promise<ApiResponse<Post[]>> {
  try {
    let query = supabase
      .from('posts')
      .select(`
        *,
        profiles (
          id,
          username,
          display_name,
          avatar_url,
          badge_type,
          is_verified_coach
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) throw error;

    // If current user is provided, check which posts they've powered up
    if (currentUserId && data) {
      const postIds = data.map(post => post.id);
      const { data: powerUps } = await supabase
        .from('power_ups')
        .select('post_id')
        .eq('user_id', currentUserId)
        .in('post_id', postIds);

      const poweredUpIds = new Set(powerUps?.map(p => p.post_id) || []);

      const postsWithPowerStatus = data.map(post => ({
        ...post,
        user_has_powered: poweredUpIds.has(post.id),
      }));

      return { data: postsWithPowerStatus, error: null };
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Get posts error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get posts from a specific user
 */
export async function getUserPosts(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<ApiResponse<Post[]>> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (
          id,
          username,
          display_name,
          avatar_url,
          badge_type,
          is_verified_coach
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    console.error('Get user posts error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get a single post by ID
 */
export async function getPost(postId: string, currentUserId?: string): Promise<ApiResponse<Post>> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (
          id,
          username,
          display_name,
          avatar_url,
          badge_type,
          is_verified_coach
        )
      `)
      .eq('id', postId)
      .single();

    if (error) throw error;

    // Check if current user has powered up this post
    if (currentUserId) {
      const { data: powerUp } = await supabase
        .from('power_ups')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', currentUserId)
        .maybeSingle();

      return {
        data: {
          ...data,
          user_has_powered: !!powerUp,
        },
        error: null,
      };
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Get post error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Create a new post
 */
export async function createPost(postData: PostCreate): Promise<ApiResponse<Post>> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        ...postData,
        power_count: 0,
        comment_count: 0,
      })
      .select(`
        *,
        profiles (
          id,
          username,
          display_name,
          avatar_url,
          badge_type,
          is_verified_coach
        )
      `)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    console.error('Create post error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Update a post
 */
export async function updatePost(
  postId: string,
  updates: PostUpdate
): Promise<ApiResponse<Post>> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId)
      .select(`
        *,
        profiles (
          id,
          username,
          display_name,
          avatar_url,
          badge_type,
          is_verified_coach
        )
      `)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    console.error('Update post error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Delete a post
 */
export async function deletePost(postId: string): Promise<ApiResponse<boolean>> {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;

    return { data: true, error: null };
  } catch (error: any) {
    console.error('Delete post error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get posts from users that the current user follows (feed)
 */
export async function getFollowingFeed(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<ApiResponse<Post[]>> {
  try {
    // First get the list of users the current user follows
    const { data: following, error: followingError } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);

    if (followingError) throw followingError;

    const followingIds = following?.map(f => f.following_id) || [];

    // If not following anyone, return empty array
    if (followingIds.length === 0) {
      return { data: [], error: null };
    }

    // Get posts from followed users
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (
          id,
          username,
          display_name,
          avatar_url,
          badge_type,
          is_verified_coach
        )
      `)
      .in('user_id', followingIds)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Check which posts current user has powered up
    if (data) {
      const postIds = data.map(post => post.id);
      const { data: powerUps } = await supabase
        .from('power_ups')
        .select('post_id')
        .eq('user_id', userId)
        .in('post_id', postIds);

      const poweredUpIds = new Set(powerUps?.map(p => p.post_id) || []);

      const postsWithPowerStatus = data.map(post => ({
        ...post,
        user_has_powered: poweredUpIds.has(post.id),
      }));

      return { data: postsWithPowerStatus, error: null };
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Get following feed error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Increment power count for a post
 * This is called after a power up is added
 */
export async function incrementPowerCount(postId: string): Promise<ApiResponse<boolean>> {
  try {
    console.log('Incrementing power count for post:', postId);

    const { error } = await supabase.rpc('increment_power_count', {
      post_id: postId,
    });

    // If RPC function doesn't exist, manually increment
    if (error?.message?.includes('function') && error?.message?.includes('does not exist')) {
      console.log('RPC function not found, using manual increment');

      const { data: post, error: fetchError } = await supabase
        .from('posts')
        .select('power_count')
        .eq('id', postId)
        .single();

      if (fetchError) {
        console.error('Error fetching post for increment:', fetchError);
        throw fetchError;
      }

      if (post) {
        const { error: updateError } = await supabase
          .from('posts')
          .update({ power_count: post.power_count + 1 })
          .eq('id', postId);

        if (updateError) {
          console.error('Error updating power count:', updateError);
          throw updateError;
        }
      }

      return { data: true, error: null };
    }

    if (error) {
      console.error('RPC increment_power_count error:', error);
      throw error;
    }

    return { data: true, error: null };
  } catch (error: any) {
    console.error('Increment power count error:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      postId: postId
    });
    return { data: null, error: error.message };
  }
}

/**
 * Decrement power count for a post
 * This is called after a power up is removed
 */
export async function decrementPowerCount(postId: string): Promise<ApiResponse<boolean>> {
  try {
    const { error } = await supabase.rpc('decrement_power_count', {
      post_id: postId,
    });

    // If RPC function doesn't exist, manually decrement
    if (error?.message?.includes('function') && error?.message?.includes('does not exist')) {
      const { data: post } = await supabase
        .from('posts')
        .select('power_count')
        .eq('id', postId)
        .single();

      if (post && post.power_count > 0) {
        await supabase
          .from('posts')
          .update({ power_count: post.power_count - 1 })
          .eq('id', postId);
      }

      return { data: true, error: null };
    }

    if (error) throw error;

    return { data: true, error: null };
  } catch (error: any) {
    console.error('Decrement power count error:', error);
    return { data: null, error: error.message };
  }
}
