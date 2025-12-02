import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { UserSearchResult } from '@/lib/api/search';
import { BadgeDisplay } from '../badges/BadgeDisplay';
import Avatar from '../Avatar';
import { followUser, unfollowUser } from '@/lib/api/follows';

interface UserSearchCardProps {
  user: UserSearchResult;
  currentUserId?: string;
  onFollowChange?: () => void;
}

export default function UserSearchCard({
  user,
  currentUserId,
  onFollowChange,
}: UserSearchCardProps) {
  const [isFollowing, setIsFollowing] = useState(user.is_following || false);
  const [loading, setLoading] = useState(false);

  const handleFollow = async (e: any) => {
    e.stopPropagation();
    if (!currentUserId || loading) return;

    setLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(currentUserId, user.id);
        setIsFollowing(false);
      } else {
        await followUser(currentUserId, user.id);
        setIsFollowing(true);
      }
      onFollowChange?.();
    } catch (error) {
      console.error('Follow/unfollow error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = () => {
    router.push(`/profile/${user.username}`);
  };

  const getRankColor = () => {
    switch (user.rank) {
      case 'god_tier':
        return '#FFD700';
      case 'superhuman':
        return '#ffa500';
      case 'titan':
        return '#ff00ff';
      case 'warrior':
        return '#00e5ff';
      default:
        return '#808080';
    }
  };

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <LinearGradient
        colors={['rgba(0, 229, 255, 0.05)', 'rgba(255, 0, 128, 0.03)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Avatar
            avatarUrl={user.avatar_url}
            username={user.username}
            size={56}
            level={user.level}
            rank={user.rank}
          />
          {/* Rank badge */}
          <View style={[styles.rankBadge, { backgroundColor: getRankColor() }]}>
            <Text style={styles.rankBadgeText}>L{user.level}</Text>
          </View>
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.username} numberOfLines={1}>
              {user.username}
            </Text>
            {user.badge_type && user.badge_verified && (
              <BadgeDisplay badgeType={user.badge_type} size="small" />
            )}
          </View>

          {user.display_name && (
            <Text style={styles.displayName} numberOfLines={1}>
              {user.display_name}
            </Text>
          )}

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="shield" size={14} color={getRankColor()} />
              <Text style={styles.statText}>
                {user.rank.replace('_', ' ').toUpperCase()}
              </Text>
            </View>

            {user.follower_count !== undefined && (
              <View style={styles.statItem}>
                <Ionicons name="people" size={14} color="#6b7280" />
                <Text style={styles.statText}>
                  {user.follower_count} {user.follower_count === 1 ? 'follower' : 'followers'}
                </Text>
              </View>
            )}
          </View>

          {user.location && (
            <View style={styles.locationRow}>
              <Ionicons name="location" size={12} color="#6b7280" />
              <Text style={styles.locationText} numberOfLines={1}>
                {user.location}
              </Text>
            </View>
          )}
        </View>

        {/* Follow Button */}
        {currentUserId && currentUserId !== user.id && (
          <Pressable
            onPress={handleFollow}
            disabled={loading}
            style={({ pressed }) => [
              styles.followButton,
              isFollowing && styles.followingButton,
              pressed && styles.followButtonPressed,
            ]}
          >
            <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </Pressable>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#00e5ff',
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1a1f3a',
    borderWidth: 2,
    borderColor: '#00e5ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00e5ff',
  },
  rankBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: '#000',
  },
  rankBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#000',
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  username: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  displayName: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 6,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 11,
    color: '#6b7280',
  },
  followButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#00e5ff',
    borderWidth: 2,
    borderColor: '#000',
  },
  followingButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: '#00e5ff',
  },
  followButtonPressed: {
    opacity: 0.7,
  },
  followButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },
  followingButtonText: {
    color: '#00e5ff',
  },
});
