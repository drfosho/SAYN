import { useState, useEffect, useCallback } from 'react';
import { Post, PostCreate } from '../lib/api/types';
import {
  getPosts,
  getUserPosts,
  getFollowingFeed,
  createPost as createPostApi,
  deletePost as deletePostApi,
} from '../lib/api/posts';
import { togglePowerUp } from '../lib/api/powerups';

export function useFeed(currentUserId?: string, followingOnly: boolean = false) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const loadPosts = useCallback(
    async (refresh: boolean = false) => {
      if (refresh) {
        setRefreshing(true);
        setOffset(0);
      } else {
        setLoading(true);
      }

      setError(null);

      const currentOffset = refresh ? 0 : offset;
      const limit = 20;

      let result;
      if (followingOnly && currentUserId) {
        result = await getFollowingFeed(currentUserId, limit, currentOffset);
      } else {
        result = await getPosts(limit, currentOffset, currentUserId);
      }

      const { data, error: err } = result;

      if (err) {
        setError(err);
      } else if (data) {
        if (refresh) {
          setPosts(data);
        } else {
          setPosts((prev) => [...prev, ...data]);
        }

        setHasMore(data.length === limit);
        setOffset((prev) => refresh ? limit : prev + limit);
      }

      setLoading(false);
      setRefreshing(false);
    },
    [offset, currentUserId, followingOnly]
  );

  useEffect(() => {
    loadPosts(true);
  }, [currentUserId, followingOnly]); // Only run when these change

  const refresh = () => {
    loadPosts(true);
  };

  const loadMore = () => {
    if (!loading && !refreshing && hasMore) {
      loadPosts(false);
    }
  };

  const handlePowerUp = async (postId: string) => {
    if (!currentUserId) return;

    // Optimistic update
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const isPowered = post.user_has_powered;
          return {
            ...post,
            user_has_powered: !isPowered,
            power_count: isPowered ? post.power_count - 1 : post.power_count + 1,
          };
        }
        return post;
      })
    );

    // Make API call
    const { error } = await togglePowerUp(currentUserId, postId);

    if (error) {
      // Revert on error
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id === postId) {
            const isPowered = !post.user_has_powered;
            return {
              ...post,
              user_has_powered: !isPowered,
              power_count: isPowered ? post.power_count - 1 : post.power_count + 1,
            };
          }
          return post;
        })
      );
    }
  };

  return {
    posts,
    loading,
    refreshing,
    error,
    hasMore,
    refresh,
    loadMore,
    handlePowerUp,
  };
}

export function useUserPosts(userId: string | null, currentUserId?: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const loadPosts = useCallback(
    async (refresh: boolean = false) => {
      if (!userId) {
        setPosts([]);
        setLoading(false);
        return;
      }

      if (refresh) {
        setRefreshing(true);
        setOffset(0);
      } else {
        setLoading(true);
      }

      setError(null);

      const currentOffset = refresh ? 0 : offset;
      const limit = 20;

      const { data, error: err } = await getUserPosts(userId, limit, currentOffset);

      if (err) {
        setError(err);
      } else if (data) {
        if (refresh) {
          setPosts(data);
        } else {
          setPosts((prev) => [...prev, ...data]);
        }

        setHasMore(data.length === limit);
        setOffset((prev) => refresh ? limit : prev + limit);
      }

      setLoading(false);
      setRefreshing(false);
    },
    [userId, offset]
  );

  useEffect(() => {
    loadPosts(true);
  }, [userId]); // Only run when userId changes

  const refresh = () => {
    loadPosts(true);
  };

  const loadMore = () => {
    if (!loading && !refreshing && hasMore) {
      loadPosts(false);
    }
  };

  const handlePowerUp = async (postId: string) => {
    if (!currentUserId) return;

    // Optimistic update
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const isPowered = post.user_has_powered;
          return {
            ...post,
            user_has_powered: !isPowered,
            power_count: isPowered ? post.power_count - 1 : post.power_count + 1,
          };
        }
        return post;
      })
    );

    // Make API call
    const { error } = await togglePowerUp(currentUserId, postId);

    if (error) {
      // Revert on error
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id === postId) {
            const isPowered = !post.user_has_powered;
            return {
              ...post,
              user_has_powered: !isPowered,
              power_count: isPowered ? post.power_count - 1 : post.power_count + 1,
            };
          }
          return post;
        })
      );
    }
  };

  return {
    posts,
    loading,
    refreshing,
    error,
    hasMore,
    refresh,
    loadMore,
    handlePowerUp,
  };
}

export function useCreatePost() {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPost = async (postData: PostCreate) => {
    setCreating(true);
    setError(null);

    const { data, error: err } = await createPostApi(postData);

    setCreating(false);

    if (err) {
      setError(err);
      return { success: false, error: err, post: null };
    }

    return { success: true, error: null, post: data };
  };

  return {
    createPost,
    creating,
    error,
  };
}

export function useDeletePost() {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deletePost = async (postId: string) => {
    setDeleting(true);
    setError(null);

    const { error: err } = await deletePostApi(postId);

    setDeleting(false);

    if (err) {
      setError(err);
      return { success: false, error: err };
    }

    return { success: true, error: null };
  };

  return {
    deletePost,
    deleting,
    error,
  };
}
