import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toggleFollow as apiToggleFollow } from '@/lib/api/follows';

interface FollowState {
  following: Map<string, boolean>; // userId -> isFollowing
}

/**
 * Hook for managing follow/unfollow state with real database
 * Includes optimistic updates for better UX
 */
export const useFollow = () => {
  const { user } = useAuth();
  const [state, setState] = useState<FollowState>({
    following: new Map(),
  });

  // Initialize follow state for a user (called from screens)
  const initializeFollowState = useCallback((userId: string, isFollowing: boolean) => {
    setState((prev) => {
      const newFollowing = new Map(prev.following);
      newFollowing.set(userId, isFollowing);
      return { following: newFollowing };
    });
  }, []);

  const isFollowing = useCallback(
    (userId: string): boolean => {
      return state.following.get(userId) || false;
    },
    [state.following]
  );

  const toggleFollow = useCallback(
    async (userId: string) => {
      if (!user) {
        console.log('❌ No user logged in, cannot follow');
        return;
      }

      const wasFollowing = state.following.get(userId) || false;

      // Optimistic update
      setState((prev) => {
        const newFollowing = new Map(prev.following);
        newFollowing.set(userId, !wasFollowing);
        return { following: newFollowing };
      });

      // Call API
      console.log(`🔄 ${wasFollowing ? 'Unfollowing' : 'Following'} user ${userId}...`);
      const { data, error } = await apiToggleFollow(user.id, userId);

      if (error) {
        console.error('❌ Follow toggle failed:', error);
        // Revert optimistic update on error
        setState((prev) => {
          const newFollowing = new Map(prev.following);
          newFollowing.set(userId, wasFollowing);
          return { following: newFollowing };
        });
        return;
      }

      console.log(`✅ Follow ${wasFollowing ? 'removed' : 'added'} successfully`);

      // Confirm state from server
      if (data) {
        setState((prev) => {
          const newFollowing = new Map(prev.following);
          newFollowing.set(userId, data.isFollowing);
          return { following: newFollowing };
        });
      }
    },
    [user, state.following]
  );

  return {
    initializeFollowState,
    isFollowing,
    toggleFollow,
  };
};
