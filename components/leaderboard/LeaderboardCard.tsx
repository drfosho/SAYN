import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LeaderboardEntry } from '@/lib/api/leaderboard';
import { router } from 'expo-router';

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  leaderboardType: 'all_time' | 'weekly' | 'streaks' | 'verified';
}

export default function LeaderboardCard({ entry, leaderboardType }: LeaderboardCardProps) {
  const isTopTen = entry.position <= 10;
  const isTopThree = entry.position <= 3;

  const getRankColor = () => {
    if (entry.position === 1) return '#FFD700'; // Gold
    if (entry.position === 2) return '#C0C0C0'; // Silver
    if (entry.position === 3) return '#CD7F32'; // Bronze
    if (entry.position <= 10) return '#FFD700';
    if (entry.position <= 25) return '#C0C0C0';
    if (entry.position <= 50) return '#CD7F32';
    return '#00e5ff'; // Default cyan
  };

  const getDisplayValue = () => {
    switch (leaderboardType) {
      case 'all_time':
        return `${entry.xp.toLocaleString()} XP`;
      case 'weekly':
        return `+${(entry.weekly_xp || 0).toLocaleString()} XP`;
      case 'streaks':
        return `${entry.post_streak || 0} day streak`;
      case 'verified':
        return `${entry.verification_rate || 0}% Verified`;
      default:
        return `${entry.xp.toLocaleString()} XP`;
    }
  };

  const getRankBadge = () => {
    if (entry.position === 1) return '👑';
    if (entry.position === 2) return '🥈';
    if (entry.position === 3) return '🥉';
    return '';
  };

  const handlePress = () => {
    router.push(`/profile/${entry.username}`);
  };

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <LinearGradient
        colors={
          isTopThree
            ? [getRankColor() + '33', getRankColor() + '11']
            : ['rgba(0, 229, 255, 0.1)', 'rgba(255, 0, 128, 0.05)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, isTopTen && styles.topTenCard]}
      >
        {/* Rank Number */}
        <View style={styles.rankContainer}>
          <Text
            style={[
              styles.rankNumber,
              isTopTen && styles.topTenRank,
              isTopThree && styles.topThreeRank,
              { color: getRankColor() },
            ]}
          >
            #{entry.position}
          </Text>
        </View>

        {/* Avatar with glow */}
        <View style={styles.avatarContainer}>
          {isTopThree && (
            <View
              style={[
                styles.avatarGlow,
                { backgroundColor: getRankColor(), shadowColor: getRankColor() },
              ]}
            />
          )}
          <View style={[styles.avatarWrapper, isTopThree && styles.topThreeAvatar]}>
            {entry.avatar_url ? (
              <Image source={{ uri: entry.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>
                  {entry.username.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          {getRankBadge() && (
            <View style={styles.rankBadge}>
              <Text style={styles.rankBadgeEmoji}>{getRankBadge()}</Text>
            </View>
          )}
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.usernameRow}>
            <Text style={styles.username} numberOfLines={1}>
              {entry.username}
            </Text>
            {entry.badge_type === 'natural' && <Text style={styles.badge}>🌿</Text>}
            {entry.badge_type === 'enhanced' && <Text style={styles.badge}>⚡</Text>}
            {entry.is_verified_coach && <Text style={styles.badge}>✓</Text>}
          </View>
          <Text style={styles.rankTier}>
            Level {entry.level} · {entry.rank.replace('_', ' ').toUpperCase()}
          </Text>
        </View>

        {/* XP/Stats */}
        <View style={styles.statsContainer}>
          <Text style={[styles.statsValue, isTopTen && { color: getRankColor() }]}>
            {getDisplayValue()}
          </Text>
          {leaderboardType === 'verified' && entry.verified_posts !== undefined && (
            <Text style={styles.statsSubtext}>
              {entry.verified_posts}/{entry.total_posts} posts
            </Text>
          )}
          {leaderboardType === 'streaks' && (
            <Text style={styles.statsSubtext}>🔥 1.{((entry.post_streak || 1) - 1) * 0.1}x XP</Text>
          )}
        </View>
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
    borderColor: 'rgba(0, 229, 255, 0.2)',
    backgroundColor: 'rgba(10, 14, 39, 0.6)',
  },
  topTenCard: {
    borderWidth: 3,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  topTenRank: {
    fontSize: 22,
    fontWeight: '900',
  },
  topThreeRank: {
    fontSize: 26,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatarWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#00e5ff',
  },
  topThreeAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1f3a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00e5ff',
  },
  avatarGlow: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 34,
    opacity: 0.4,
    zIndex: -1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 16,
  },
  rankBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#000',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  rankBadgeEmoji: {
    fontSize: 14,
  },
  userInfo: {
    flex: 1,
    marginRight: 12,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  badge: {
    fontSize: 14,
  },
  rankTier: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  statsContainer: {
    alignItems: 'flex-end',
  },
  statsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00e5ff',
  },
  statsSubtext: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
});
