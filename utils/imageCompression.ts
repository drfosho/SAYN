import * as ImageManipulator from 'expo-image-manipulator';

export interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  format?: 'jpeg' | 'png' | 'webp';
}

/**
 * Compress and resize an image
 * @param uri - The local URI of the image
 * @param options - Compression options
 * @returns The URI of the compressed image
 */
export async function compressImage(
  uri: string,
  options: CompressImageOptions = {}
): Promise<string> {
  const {
    maxWidth = 1080,
    maxHeight = 1920,
    quality = 0.8,
    format = 'jpeg',
  } = options;

  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          resize: {
            width: maxWidth,
            height: maxHeight,
          },
        },
      ],
      {
        compress: quality,
        format: ImageManipulator.SaveFormat[format.toUpperCase() as keyof typeof ImageManipulator.SaveFormat],
      }
    );

    return manipResult.uri;
  } catch (error) {
    console.error('Image compression error:', error);
    throw error;
  }
}

/**
 * Compress an avatar image (smaller size for profiles)
 */
export async function compressAvatar(uri: string): Promise<string> {
  return compressImage(uri, {
    maxWidth: 500,
    maxHeight: 500,
    quality: 0.8,
    format: 'jpeg',
  });
}

/**
 * Compress a post image (larger size for feed)
 */
export async function compressPostImage(uri: string): Promise<string> {
  return compressImage(uri, {
    maxWidth: 1080,
    maxHeight: 1920,
    quality: 0.85,
    format: 'jpeg',
  });
}

/**
 * Create a thumbnail from an image
 */
export async function createThumbnail(
  uri: string,
  size: number = 200
): Promise<string> {
  return compressImage(uri, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.7,
    format: 'jpeg',
  });
}

/**
 * Get image dimensions
 */
export async function getImageDimensions(
  uri: string
): Promise<{ width: number; height: number }> {
  try {
    const result = await ImageManipulator.manipulateAsync(uri, [], {});
    return {
      width: result.width || 0,
      height: result.height || 0,
    };
  } catch (error) {
    console.error('Get image dimensions error:', error);
    throw error;
  }
}

/**
 * Convert image URI to base64
 */
export async function imageToBase64(uri: string): Promise<string> {
  try {
    const result = await ImageManipulator.manipulateAsync(uri, [], {
      base64: true,
    });
    return result.base64 || '';
  } catch (error) {
    console.error('Image to base64 error:', error);
    throw error;
  }
}

/**
 * Crop image to square (for avatars)
 */
export async function cropToSquare(uri: string, size: number = 500): Promise<string> {
  try {
    // Get original dimensions
    const dimensions = await getImageDimensions(uri);
    const { width, height } = dimensions;

    // Calculate crop dimensions (center square)
    const cropSize = Math.min(width, height);
    const originX = (width - cropSize) / 2;
    const originY = (height - cropSize) / 2;

    const result = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          crop: {
            originX,
            originY,
            width: cropSize,
            height: cropSize,
          },
        },
        {
          resize: {
            width: size,
            height: size,
          },
        },
      ],
      {
        compress: 0.8,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return result.uri;
  } catch (error) {
    console.error('Crop to square error:', error);
    throw error;
  }
}
