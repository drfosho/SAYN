import { useState, useEffect, useCallback } from 'react';
import { Profile, ProfileUpdate } from '../lib/api/types';
import {
  getProfile,
  getProfileByUsername,
  updateProfile,
  getFollowerCount,
  getFollowingCount,
  isFollowing,
} from '../lib/api/profiles';
import { followUser, unfollowUser } from '../lib/api/follows';

export function useProfile(userId: string | null) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: err } = await getProfile(userId);

    if (err) {
      setError(err);
      setProfile(null);
    } else {
      setProfile(data);
    }

    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const update = async (updates: ProfileUpdate) => {
    if (!userId) return { success: false, error: 'No user ID' };

    const { data, error: err } = await updateProfile(userId, updates);

    if (err) {
      setError(err);
      return { success: false, error: err };
    }

    setProfile(data);
    return { success: true, error: null };
  };

  const refresh = () => {
    loadProfile();
  };

  return {
    profile,
    loading,
    error,
    update,
    refresh,
  };
}

export function useProfileByUsername(username: string | null) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!username) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: err } = await getProfileByUsername(username);

    if (err) {
      setError(err);
      setProfile(null);
    } else {
      setProfile(data);
    }

    setLoading(false);
  }, [username]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    profile,
    loading,
    error,
    refresh: loadProfile,
  };
}

export function useFollowStatus(currentUserId: string | null, targetUserId: string | null) {
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkFollowStatus = useCallback(async () => {
    if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
      setFollowing(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data } = await isFollowing(currentUserId, targetUserId);
    setFollowing(data || false);
    setLoading(false);
  }, [currentUserId, targetUserId]);

  useEffect(() => {
    checkFollowStatus();
  }, [checkFollowStatus]);

  const toggleFollow = async () => {
    if (!currentUserId || !targetUserId) return;

    const previousState = following;
    setFollowing(!following); // Optimistic update

    if (following) {
      const { error } = await unfollowUser(currentUserId, targetUserId);
      if (error) {
        setFollowing(previousState); // Revert on error
      }
    } else {
      const { error } = await followUser(currentUserId, targetUserId);
      if (error) {
        setFollowing(previousState); // Revert on error
      }
    }
  };

  return {
    following,
    loading,
    toggleFollow,
    refresh: checkFollowStatus,
  };
}

export function useFollowCounts(userId: string | null) {
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadCounts = useCallback(async () => {
    if (!userId) {
      setFollowerCount(0);
      setFollowingCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);

    const [followersResult, followingResult] = await Promise.all([
      getFollowerCount(userId),
      getFollowingCount(userId),
    ]);

    setFollowerCount(followersResult.data || 0);
    setFollowingCount(followingResult.data || 0);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  return {
    followerCount,
    followingCount,
    loading,
    refresh: loadCounts,
  };
}
