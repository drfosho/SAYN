# Backend Integration Guide

This guide explains how to use the new Supabase backend in your SAYN app screens and components.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Using Hooks](#using-hooks)
3. [Using API Functions Directly](#using-api-functions-directly)
4. [Image Upload](#image-upload)
5. [Real-time Updates](#real-time-updates)
6. [Examples](#examples)

## Quick Start

### 1. Set up your environment

Make sure your `.env` file has your Supabase credentials:

```
EXPO_PUBLIC_SUPABASE_URL=your_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key_here
```

### 2. Run the database setup

Follow the instructions in `SUPABASE_SETUP.md` to create all the tables and policies.

### 3. Start using the hooks and APIs

Import what you need:

```typescript
// Using hooks (recommended for most cases)
import { useProfile, useFeed, useFollowStatus } from '@/hooks';

// Using API functions directly
import { getProfile, createPost, uploadPostImage } from '@/lib/api';

// Using utilities
import { compressPostImage, compressAvatar } from '@/utils/imageCompression';
```

## Using Hooks

Hooks are the recommended way to integrate the backend into your screens. They handle loading states, errors, and provide easy-to-use methods.

### Profile Hooks

#### `useProfile(userId)`

Get and update a user's profile:

```typescript
import { useProfile } from '@/hooks';

function ProfileScreen() {
  const { user } = useAuth(); // Your auth hook
  const { profile, loading, error, update, refresh } = useProfile(user?.id);

  if (loading) return <LoadingSpinner />;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <View>
      <Text>{profile?.username}</Text>
      <Button
        title="Update Bio"
        onPress={async () => {
          await update({ bio: 'New bio!' });
        }}
      />
    </View>
  );
}
```

#### `useFollowStatus(currentUserId, targetUserId)`

Check and toggle follow status:

```typescript
import { useFollowStatus } from '@/hooks';

function UserProfileScreen({ userId }) {
  const { user } = useAuth();
  const { following, loading, toggleFollow } = useFollowStatus(user?.id, userId);

  return (
    <Button
      title={following ? 'Unfollow' : 'Follow'}
      onPress={toggleFollow}
      disabled={loading}
    />
  );
}
```

#### `useFollowCounts(userId)`

Get follower and following counts:

```typescript
import { useFollowCounts } from '@/hooks';

function ProfileHeader({ userId }) {
  const { followerCount, followingCount, loading } = useFollowCounts(userId);

  return (
    <View>
      <Text>{followerCount} Followers</Text>
      <Text>{followingCount} Following</Text>
    </View>
  );
}
```

### Post Hooks

#### `useFeed(currentUserId, followingOnly)`

Get feed posts with pagination:

```typescript
import { useFeed } from '@/hooks';

function FeedScreen() {
  const { user } = useAuth();
  const {
    posts,
    loading,
    refreshing,
    error,
    hasMore,
    refresh,
    loadMore,
    handlePowerUp,
  } = useFeed(user?.id, false); // false = all posts, true = following only

  return (
    <FlatList
      data={posts}
      renderItem={({ item }) => (
        <PostCard
          post={item}
          onPowerUp={() => handlePowerUp(item.id)}
        />
      )}
      onRefresh={refresh}
      refreshing={refreshing}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        loading && hasMore ? <LoadingSpinner /> : null
      }
    />
  );
}
```

#### `useUserPosts(userId, currentUserId)`

Get posts from a specific user:

```typescript
import { useUserPosts } from '@/hooks';

function UserProfilePosts({ userId }) {
  const { user } = useAuth();
  const { posts, loading, refresh, handlePowerUp } = useUserPosts(
    userId,
    user?.id
  );

  if (loading) return <LoadingSpinner />;

  return (
    <FlatList
      data={posts}
      renderItem={({ item }) => (
        <PostCard
          post={item}
          onPowerUp={() => handlePowerUp(item.id)}
        />
      )}
      onRefresh={refresh}
    />
  );
}
```

#### `useCreatePost()`

Create new posts:

```typescript
import { useCreatePost } from '@/hooks';
import { compressPostImage } from '@/utils/imageCompression';
import { uploadPostImage } from '@/lib/api';

function CreatePostScreen() {
  const { user } = useAuth();
  const { createPost, creating, error } = useCreatePost();
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');

  const handleSubmit = async () => {
    // 1. Compress image
    const compressedUri = await compressPostImage(image.uri);

    // 2. Upload to storage
    const { data: imageUrl, error: uploadError } = await uploadPostImage(
      user.id,
      compressedUri
    );

    if (uploadError) {
      Alert.alert('Error', uploadError);
      return;
    }

    // 3. Create post in database
    const { success, post } = await createPost({
      user_id: user.id,
      image_url: imageUrl,
      caption,
    });

    if (success) {
      router.push('/feed');
    }
  };

  return (
    <View>
      <ImagePicker onSelect={setImage} />
      <TextInput
        value={caption}
        onChangeText={setCaption}
        placeholder="Add a caption..."
      />
      <Button
        title="Post"
        onPress={handleSubmit}
        disabled={creating}
      />
    </View>
  );
}
```

## Using API Functions Directly

For more control or one-off operations, use the API functions directly:

### Profile API

```typescript
import {
  getProfile,
  updateProfile,
  searchProfiles,
  getVerifiedCoaches,
} from '@/lib/api';

// Get a profile
const { data: profile, error } = await getProfile(userId);

// Update profile
const { data: updated, error } = await updateProfile(userId, {
  display_name: 'New Name',
  bio: 'New bio',
});

// Search users
const { data: users, error } = await searchProfiles('john');

// Get verified coaches
const { data: coaches, error } = await getVerifiedCoaches();
```

### Posts API

```typescript
import {
  getPosts,
  getUserPosts,
  createPost,
  deletePost,
  getFollowingFeed,
} from '@/lib/api';

// Get all posts
const { data: posts, error } = await getPosts(20, 0, currentUserId);

// Get user's posts
const { data: userPosts, error } = await getUserPosts(userId, 20, 0);

// Create post
const { data: newPost, error } = await createPost({
  user_id: userId,
  image_url: 'https://...',
  caption: 'Check this out!',
});

// Delete post
const { data: success, error } = await deletePost(postId);

// Get following feed
const { data: feed, error } = await getFollowingFeed(userId, 20, 0);
```

### Power Ups API

```typescript
import {
  powerUpPost,
  unPowerUpPost,
  togglePowerUp,
  hasPoweredUp,
  getPostPowerUps,
} from '@/lib/api';

// Power up a post
const { data, error } = await powerUpPost(userId, postId);

// Remove power up
const { data, error } = await unPowerUpPost(userId, postId);

// Toggle power up
const { data: { isPoweredUp }, error } = await togglePowerUp(userId, postId);

// Check if powered up
const { data: hasPowered, error } = await hasPoweredUp(userId, postId);

// Get who powered up a post
const { data: users, error } = await getPostPowerUps(postId);
```

### Follows API

```typescript
import {
  followUser,
  unfollowUser,
  toggleFollow,
  getMutualFollows,
} from '@/lib/api';

// Follow a user
const { data, error } = await followUser(currentUserId, targetUserId);

// Unfollow
const { data, error } = await unfollowUser(currentUserId, targetUserId);

// Toggle follow
const { data: { isFollowing }, error } = await toggleFollow(
  currentUserId,
  targetUserId
);

// Get mutual follows
const { data: mutualIds, error } = await getMutualFollows(userId);
```

## Image Upload

### Upload Avatar

```typescript
import * as ImagePicker from 'expo-image-picker';
import { compressAvatar } from '@/utils/imageCompression';
import { uploadAvatar } from '@/lib/api';
import { updateProfile } from '@/lib/api';

async function handleAvatarUpload() {
  // 1. Pick image
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });

  if (result.canceled) return;

  // 2. Compress image
  const compressedUri = await compressAvatar(result.assets[0].uri);

  // 3. Upload to storage
  const { data: avatarUrl, error: uploadError } = await uploadAvatar(
    user.id,
    compressedUri
  );

  if (uploadError) {
    Alert.alert('Error', uploadError);
    return;
  }

  // 4. Update profile
  const { error: updateError } = await updateProfile(user.id, {
    avatar_url: avatarUrl,
  });

  if (updateError) {
    Alert.alert('Error', updateError);
  }
}
```

### Upload Post Image

```typescript
import * as ImagePicker from 'expo-image-picker';
import { compressPostImage } from '@/utils/imageCompression';
import { uploadPostImage } from '@/lib/api';

async function handlePostImageUpload() {
  // 1. Pick image
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 1,
  });

  if (result.canceled) return;

  // 2. Compress image
  const compressedUri = await compressPostImage(result.assets[0].uri);

  // 3. Upload to storage
  const { data: imageUrl, error } = await uploadPostImage(
    user.id,
    compressedUri
  );

  return { imageUrl, error };
}
```

## Real-time Updates

Subscribe to real-time changes:

```typescript
import {
  useNewPostsSubscription,
  useNewFollowersSubscription,
  useProfileUpdatesSubscription,
} from '@/hooks';

function FeedScreen() {
  const { refresh } = useFeed();

  // Listen for new posts
  useNewPostsSubscription((newPost) => {
    console.log('New post!', newPost);
    refresh(); // Refresh feed
  });

  // Rest of component...
}

function ProfileScreen({ userId }) {
  const { refresh } = useProfile(userId);

  // Listen for profile updates
  useProfileUpdatesSubscription(userId, (updatedProfile) => {
    console.log('Profile updated!', updatedProfile);
    refresh();
  });

  // Rest of component...
}

function NotificationsScreen() {
  const { user } = useAuth();

  // Listen for new followers
  useNewFollowersSubscription(user.id, (follower) => {
    Alert.alert('New Follower!', `${follower.username} started following you`);
  });

  // Rest of component...
}
```

## Examples

### Complete Feed Screen Example

```typescript
import { View, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { useFeed } from '@/hooks';
import { useAuth } from '@/context/auth'; // Your auth context

export default function FeedScreen() {
  const { user } = useAuth();
  const {
    posts,
    loading,
    refreshing,
    error,
    hasMore,
    refresh,
    loadMore,
    handlePowerUp,
  } = useFeed(user?.id, false);

  if (loading && posts.length === 0) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <PostCard
          post={item}
          currentUserId={user?.id}
          onPowerUp={() => handlePowerUp(item.id)}
          isPoweredUp={item.user_has_powered}
        />
      )}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} />
      }
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={() =>
        loading && hasMore ? <ActivityIndicator /> : null
      }
    />
  );
}
```

### Complete Profile Screen Example

```typescript
import { View, Text, Image, Button } from 'react-native';
import { useProfile, useFollowStatus, useFollowCounts, useUserPosts } from '@/hooks';
import { useAuth } from '@/context/auth';

export default function ProfileScreen({ route }) {
  const { userId } = route.params;
  const { user: currentUser } = useAuth();
  const isOwnProfile = currentUser?.id === userId;

  const { profile, loading: profileLoading } = useProfile(userId);
  const { following, toggleFollow } = useFollowStatus(currentUser?.id, userId);
  const { followerCount, followingCount } = useFollowCounts(userId);
  const { posts, loading: postsLoading, handlePowerUp } = useUserPosts(
    userId,
    currentUser?.id
  );

  if (profileLoading) return <ActivityIndicator />;

  return (
    <View>
      <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
      <Text style={styles.username}>{profile.username}</Text>
      <Text style={styles.bio}>{profile.bio}</Text>

      <View style={styles.stats}>
        <Text>{followerCount} Followers</Text>
        <Text>{followingCount} Following</Text>
        <Text>{posts.length} Posts</Text>
      </View>

      {!isOwnProfile && (
        <Button
          title={following ? 'Unfollow' : 'Follow'}
          onPress={toggleFollow}
        />
      )}

      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onPowerUp={() => handlePowerUp(item.id)}
            isPoweredUp={item.user_has_powered}
          />
        )}
      />
    </View>
  );
}
```

## Error Handling

All API functions return an object with `{ data, error }`. Always check for errors:

```typescript
const { data, error } = await getProfile(userId);

if (error) {
  // Handle error
  Alert.alert('Error', error);
  return;
}

// Use data
console.log(data);
```

Hooks provide error in their return value:

```typescript
const { profile, loading, error } = useProfile(userId);

if (error) {
  return <ErrorView message={error} />;
}
```

## Next Steps

1. Update your screens to use the new hooks and APIs
2. Remove mock data
3. Test all functionality
4. Add loading and error states to all components
5. Test real-time subscriptions
6. Optimize with proper memoization and caching

Your app is now fully integrated with Supabase! 🚀
