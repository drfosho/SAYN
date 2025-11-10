import { supabase } from '../supabase';
import { ApiResponse } from './types';
import { decode } from 'base64-arraybuffer';
import { Platform } from 'react-native';

export type StorageBucket = 'avatars' | 'post-images';

/**
 * Upload an image to Supabase storage
 * @param bucket - The storage bucket to upload to
 * @param path - The path within the bucket (e.g., 'user-id/filename.jpg')
 * @param file - The file data (can be base64 string, blob, or file)
 * @param contentType - MIME type of the file
 */
export async function uploadImage(
  bucket: StorageBucket,
  path: string,
  file: string | Blob | File,
  contentType: string = 'image/jpeg'
): Promise<ApiResponse<string>> {
  try {
    let uploadData: ArrayBuffer | Blob | File;

    // Handle different file input types
    if (typeof file === 'string') {
      // Check if it's a file URI (React Native)
      if (file.startsWith('file://') || file.startsWith('content://')) {
        // For React Native file URIs, use fetch to read the file
        const response = await fetch(file);
        const blob = await response.blob();
        uploadData = blob;
      } else if (file.includes('base64,')) {
        // If it's a base64 string, convert it
        const base64Data = file.split('base64,')[1];
        uploadData = decode(base64Data);
      } else {
        // Assume it's raw base64
        uploadData = decode(file);
      }
    } else {
      uploadData = file;
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, uploadData, {
        contentType,
        upsert: true, // Overwrite if exists
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);

    return { data: urlData.publicUrl, error: null };
  } catch (error: any) {
    console.error('Upload image error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Upload avatar image
 */
export async function uploadAvatar(
  userId: string,
  file: string | Blob | File,
  contentType: string = 'image/jpeg'
): Promise<ApiResponse<string>> {
  const fileName = `${userId}/${Date.now()}.jpg`;
  return uploadImage('avatars', fileName, file, contentType);
}

/**
 * Upload post image
 */
export async function uploadPostImage(
  userId: string,
  file: string | Blob | File,
  contentType: string = 'image/jpeg'
): Promise<ApiResponse<string>> {
  const fileName = `${userId}/${Date.now()}.jpg`;
  return uploadImage('post-images', fileName, file, contentType);
}

/**
 * Delete an image from storage
 */
export async function deleteImage(
  bucket: StorageBucket,
  path: string
): Promise<ApiResponse<boolean>> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) throw error;

    return { data: true, error: null };
  } catch (error: any) {
    console.error('Delete image error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get public URL for an image
 */
export function getPublicUrl(bucket: StorageBucket, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Delete avatar for a user
 */
export async function deleteAvatar(userId: string, avatarUrl: string): Promise<ApiResponse<boolean>> {
  try {
    // Extract path from URL
    const url = new URL(avatarUrl);
    const pathParts = url.pathname.split('/');
    const bucketIndex = pathParts.findIndex((part) => part === 'avatars');
    const path = pathParts.slice(bucketIndex + 1).join('/');

    return deleteImage('avatars', path);
  } catch (error: any) {
    console.error('Delete avatar error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Delete post image
 */
export async function deletePostImage(imageUrl: string): Promise<ApiResponse<boolean>> {
  try {
    // Extract path from URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const bucketIndex = pathParts.findIndex((part) => part === 'post-images');
    const path = pathParts.slice(bucketIndex + 1).join('/');

    return deleteImage('post-images', path);
  } catch (error: any) {
    console.error('Delete post image error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * List files in a bucket for a specific user
 */
export async function listUserImages(
  bucket: StorageBucket,
  userId: string
): Promise<ApiResponse<string[]>> {
  try {
    const { data, error } = await supabase.storage.from(bucket).list(userId);

    if (error) throw error;

    const urls = data?.map((file) =>
      getPublicUrl(bucket, `${userId}/${file.name}`)
    ) || [];

    return { data: urls, error: null };
  } catch (error: any) {
    console.error('List user images error:', error);
    return { data: null, error: error.message };
  }
}
