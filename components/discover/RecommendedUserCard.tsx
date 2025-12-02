import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { RecommendedUser } from '@/lib/api/search';
import { BadgeDisplay } from '../badges/BadgeDisplay';
import Avatar from '../Avatar';
import { followUser } from '@/lib/api/follows';

interface RecommendedUserCardProps {
  user: RecommendedUser;
  currentUserId?: string;
  onFollowChange?: () => void;
}

export default function RecommendedUserCard({
  user,
  currentUserId,
  onFollowChange,
}: RecommendedUserCardProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    if (!currentUserId || loading || isFollowing) return;

    setLoading(true);
    try {
      await followUser(currentUserId, user.id);
      setIsFollowing(true);
      onFollowChange?.();
    } catch (error) {
      console.error('Follow error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = () => {
    router.push(`/profile/${user.username}`);
  };

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <LinearGradient
        colors={['rgba(0, 229, 255, 0.1)', 'rgba(255, 0, 128, 0.05)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Avatar
            avatarUrl={user.avatar_url}
            username={user.username}
            size={64}
            level={user.level}
          />
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.username}>{user.username}</Text>
            {user.badge_type && user.badge_verified && (
              <BadgeDisplay badgeType={user.badge_type} size="small" />
            )}
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBadge}>
              <Text style={styles.statValue}>Level {user.level}</Text>
            </View>
            <View style={styles.statBadge}>
              <Text style={styles.statValue}>{user.follower_count} followers</Text>
            </View>
          </View>

          {user.reason && (
            <View style={styles.reasonContainer}>
              <Ionicons name="sparkles" size={12} color="#ffa500" />
              <Text style={styles.reasonText}>{user.reason}</Text>
            </View>
          )}
        </View>

        {/* Follow Button */}
        {currentUserId && !isFollowing && (
          <Pressable
            onPress={handleFollow}
            disabled={loading}
            style={({ pressed }) => [styles.followButton, pressed && { opacity: 0.7 }]}
          >
            <LinearGradient colors={['#00e5ff', '#ff00ff']} style={styles.followGradient}>
              <Ionicons name="add" size={20} color="#ffffff" />
            </LinearGradient>
          </Pressable>
        )}

        {isFollowing && (
          <View style={styles.followingBadge}>
            <Ionicons name="checkmark" size={20} color="#00e5ff" />
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(0, 229, 255, 0.3)',
    gap: 16,
  },
  avatarContainer: {},
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: '#00e5ff',
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1a1f3a',
    borderWidth: 3,
    borderColor: '#00e5ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00e5ff',
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  username: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  statBadge: {
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00e5ff',
  },
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reasonText: {
    fontSize: 12,
    color: '#ffa500',
    fontWeight: '600',
    fontStyle: 'italic',
  },
  followButton: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  followGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  followingBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 229, 255, 0.2)',
    borderWidth: 2,
    borderColor: '#00e5ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
