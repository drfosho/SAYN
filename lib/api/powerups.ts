import { supabase } from '../supabase';
import { PowerUp, Profile, ApiResponse } from './types';
import { incrementPowerCount, decrementPowerCount } from './posts';
import { createNotification } from './notifications';

/**
 * Power up a post
 * Creates a notification for the post owner
 */
export async function powerUpPost(
  userId: string,
  postId: string
): Promise<ApiResponse<PowerUp>> {
  try {
    // Insert power up
    const { data, error } = await supabase
      .from('power_ups')
      .insert({
        user_id: userId,
        post_id: postId,
      })
      .select()
      .single();

    if (error) {
      // Check if already powered up
      if (error.code === '23505') {
        return { data: null, error: 'Already powered up this post' };
      }
      throw error;
    }

    // Increment the power count on the post
    await incrementPowerCount(postId);

    // Create notification for post owner
    try {
      // Get post owner and current user info
      const { data: post } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .single();

      const { data: currentUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single();

      // Only notify if not self-power up
      if (post && post.user_id !== userId) {
        await createNotification({
          user_id: post.user_id,
          type: 'power_up',
          title: 'New Power Up!',
          message: `${currentUser?.username || 'Someone'} powered up your post`,
          from_user_id: userId,
          related_post_id: postId,
        });
        console.log('Power up notification created for user:', post.user_id);
      }
    } catch (notifError) {
      console.warn('Failed to create power up notification:', notifError);
      // Don't fail the power up if notification fails
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Power up post error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Remove power up from a post
 */
export async function unPowerUpPost(
  userId: string,
  postId: string
): Promise<ApiResponse<boolean>> {
  try {
    const { error } = await supabase
      .from('power_ups')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId);

    if (error) throw error;

    // Decrement the power count on the post
    await decrementPowerCount(postId);

    return { data: true, error: null };
  } catch (error: any) {
    console.error('Un-power up post error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Toggle power up status for a post
 */
export async function togglePowerUp(
  userId: string,
  postId: string
): Promise<ApiResponse<{ isPoweredUp: boolean }>> {
  try {
    // Check if already powered up
    const { data: existingPowerUp } = await supabase
      .from('power_ups')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .maybeSingle();

    if (existingPowerUp) {
      // Already powered up, so remove it
      await unPowerUpPost(userId, postId);
      return { data: { isPoweredUp: false }, error: null };
    } else {
      // Not powered up, so add it
      await powerUpPost(userId, postId);
      return { data: { isPoweredUp: true }, error: null };
    }
  } catch (error: any) {
    console.error('Toggle power up error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Check if user has powered up a post
 */
export async function hasPoweredUp(
  userId: string,
  postId: string
): Promise<ApiResponse<boolean>> {
  try {
    const { data, error } = await supabase
      .from('power_ups')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .maybeSingle();

    if (error) throw error;

    return { data: !!data, error: null };
  } catch (error: any) {
    console.error('Check power up status error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get users who powered up a post
 */
export async function getPostPowerUps(
  postId: string,
  limit: number = 50
): Promise<ApiResponse<Profile[]>> {
  try {
    const { data, error } = await supabase
      .from('power_ups')
      .select(`
        user_id,
        profiles (
          id,
          username,
          display_name,
          avatar_url,
          badge_type,
          is_verified_coach
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Extract profiles from the joined data
    const profiles = data?.map((item: any) => item.profiles) || [];

    return { data: profiles, error: null };
  } catch (error: any) {
    console.error('Get post power ups error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get posts that a user has powered up
 */
export async function getUserPowerUps(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<ApiResponse<any[]>> {
  try {
    const { data, error } = await supabase
      .from('power_ups')
      .select(`
        post_id,
        created_at,
        posts (
          *,
          profiles (
            id,
            username,
            display_name,
            avatar_url,
            badge_type,
            is_verified_coach
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Extract posts from the joined data
    const posts = data?.map((item: any) => ({
      ...item.posts,
      powered_up_at: item.created_at,
      user_has_powered: true,
    })) || [];

    return { data: posts, error: null };
  } catch (error: any) {
    console.error('Get user power ups error:', error);
    return { data: null, error: error.message };
  }
}
