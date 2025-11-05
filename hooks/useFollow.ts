import { useState, useCallback } from 'react';

interface FollowState {
  followers: Set<string>;
  following: Set<string>;
}

const initialState: FollowState = {
  followers: new Set([
    'user2', 'user3', 'user4', 'user5', 'user6', 'user7', 'user8', 'user9', 'user10',
  ]), // Mock followers
  following: new Set(['user2', 'user3', 'user5']), // Mock following
};

/**
 * Hook for managing follow/unfollow state
 * Frontend-only with local state (not persisted)
 */
export const useFollow = () => {
  const [state, setState] = useState<FollowState>(initialState);

  const isFollowing = useCallback(
    (userId: string): boolean => {
      return state.following.has(userId);
    },
    [state.following]
  );

  const isFollower = useCallback(
    (userId: string): boolean => {
      return state.followers.has(userId);
    },
    [state.followers]
  );

  const followUser = useCallback((userId: string) => {
    setState((prev) => {
      const newFollowing = new Set(prev.following);
      newFollowing.add(userId);
      return {
        ...prev,
        following: newFollowing,
      };
    });
  }, []);

  const unfollowUser = useCallback((userId: string) => {
    setState((prev) => {
      const newFollowing = new Set(prev.following);
      newFollowing.delete(userId);
      return {
        ...prev,
        following: newFollowing,
      };
    });
  }, []);

  const toggleFollow = useCallback(
    (userId: string) => {
      if (isFollowing(userId)) {
        unfollowUser(userId);
      } else {
        followUser(userId);
      }
    },
    [isFollowing, followUser, unfollowUser]
  );

  const getFollowersList = useCallback((): string[] => {
    return Array.from(state.followers);
  }, [state.followers]);

  const getFollowingList = useCallback((): string[] => {
    return Array.from(state.following);
  }, [state.following]);

  const getFollowersCount = useCallback((): number => {
    return state.followers.size;
  }, [state.followers]);

  const getFollowingCount = useCallback((): number => {
    return state.following.size;
  }, [state.following]);

  return {
    isFollowing,
    isFollower,
    followUser,
    unfollowUser,
    toggleFollow,
    getFollowersList,
    getFollowingList,
    getFollowersCount,
    getFollowingCount,
  };
};
