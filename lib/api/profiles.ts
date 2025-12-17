import { supabase } from '../supabase';
import { Profile, ProfileUpdate, ApiResponse } from './types';

/**
 * Fetch a user profile by ID
 */
export async function getProfile(userId: string): Promise<ApiResponse<Profile>> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    console.error('Get profile error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Fetch a user profile by username
 */
export async function getProfileByUsername(username: string): Promise<ApiResponse<Profile>> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    console.error('Get profile by username error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  updates: ProfileUpdate
): Promise<ApiResponse<Profile>> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    console.error('Update profile error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get follower count for a user
 */
export async function getFollowerCount(userId: string): Promise<ApiResponse<number>> {
  try {
    const { count, error } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);

    if (error) throw error;

    return { data: count || 0, error: null };
  } catch (error: any) {
    console.error('Get follower count error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get following count for a user
 */
export async function getFollowingCount(userId: string): Promise<ApiResponse<number>> {
  try {
    const { count, error } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);

    if (error) throw error;

    return { data: count || 0, error: null };
  } catch (error: any) {
    console.error('Get following count error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get followers for a user
 */
export async function getFollowers(userId: string): Promise<ApiResponse<Profile[]>> {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('follower_id, profiles!follows_follower_id_fkey(*)')
      .eq('following_id', userId);

    if (error) throw error;

    // Extract profiles from the joined data
    const followers = data?.map((item: any) => item.profiles) || [];

    return { data: followers, error: null };
  } catch (error: any) {
    console.error('Get followers error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get who a user is following
 */
export async function getFollowing(userId: string): Promise<ApiResponse<Profile[]>> {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('following_id, profiles!follows_following_id_fkey(*)')
      .eq('follower_id', userId);

    if (error) throw error;

    // Extract profiles from the joined data
    const following = data?.map((item: any) => item.profiles) || [];

    return { data: following, error: null };
  } catch (error: any) {
    console.error('Get following error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Check if a user is following another user
 */
export async function isFollowing(
  followerId: string,
  followingId: string
): Promise<ApiResponse<boolean>> {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();

    if (error) throw error;

    return { data: !!data, error: null };
  } catch (error: any) {
    console.error('Check following status error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Search profiles by username
 */
export async function searchProfiles(query: string): Promise<ApiResponse<Profile[]>> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', `%${query}%`)
      .limit(20);

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    console.error('Search profiles error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get verified coaches
 */
export async function getVerifiedCoaches(): Promise<ApiResponse<Profile[]>> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_verified_coach', true)
      .order('power_points', { ascending: false })
      .limit(20);

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    console.error('Get verified coaches error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Check if a username is available
 */
export async function checkUsernameAvailability(
  username: string,
  currentUserId: string
): Promise<ApiResponse<boolean>> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.toLowerCase())
      .neq('id', currentUserId)
      .maybeSingle();

    if (error) throw error;

    // If data exists, username is taken. If null, username is available
    return { data: !data, error: null };
  } catch (error: any) {
    console.error('Check username availability error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Upload avatar image to Supabase storage
 * Uses ArrayBuffer instead of Blob for React Native compatibility
 */
export async function uploadAvatar(
  userId: string,
  imageUri: string
): Promise<ApiResponse<string>> {
  try {
    console.log('📤 Starting avatar upload for user:', userId);
    console.log('📤 Image URI:', imageUri);

    // Convert image URI to ArrayBuffer (React Native compatible)
    const response = await fetch(imageUri);
    const arrayBuffer = await response.arrayBuffer();

    // Create file path: avatars/{userId}/avatar_{timestamp}.jpg
    const timestamp = Date.now();
    const filePath = `${userId}/avatar_${timestamp}.jpg`;

    console.log('📤 Uploading to path:', filePath);

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: true, // Allow overwriting
      });

    if (error) {
      console.error('📤 Supabase upload error:', error);
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    console.log('✅ Avatar uploaded successfully:', urlData.publicUrl);
    return { data: urlData.publicUrl, error: null };
  } catch (error: any) {
    console.error('❌ Upload avatar error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Delete avatar from Supabase storage
 */
export async function deleteAvatar(avatarUrl: string): Promise<ApiResponse<boolean>> {
  try {
    // Extract file path from URL
    // URL format: https://{project}.supabase.co/storage/v1/object/public/avatars/{userId}/avatar_{timestamp}.jpg
    const urlParts = avatarUrl.split('/avatars/');
    if (urlParts.length < 2) {
      throw new Error('Invalid avatar URL format');
    }
    const filePath = urlParts[1];

    // Delete from storage
    const { error } = await supabase.storage
      .from('avatars')
      .remove([filePath]);

    if (error) throw error;

    return { data: true, error: null };
  } catch (error: any) {
    console.error('Delete avatar error:', error);
    return { data: null, error: error.message };
  }
}
