import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LeaderboardEntry } from '@/lib/api/leaderboard';

interface UserPositionProps {
  position: number;
  entry: LeaderboardEntry | null;
  leaderboardType: 'all_time' | 'weekly' | 'streaks' | 'verified';
  onPress?: () => void;
}

export default function UserPosition({
  position,
  entry,
  leaderboardType,
  onPress,
}: UserPositionProps) {
  if (!entry || position === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['rgba(10, 14, 39, 0.95)', 'rgba(10, 14, 39, 0.98)']}
          style={styles.content}
        >
          <Text style={styles.notRankedText}>
            {leaderboardType === 'streaks' && 'Start a posting streak to appear on this leaderboard!'}
            {leaderboardType === 'verified' &&
              'Get 10+ posts with 50%+ verified to appear on this leaderboard!'}
            {leaderboardType === 'weekly' && 'Start earning XP this week to climb the leaderboard!'}
            {leaderboardType === 'all_time' && 'Keep posting to climb the leaderboard!'}
          </Text>
        </LinearGradient>
      </View>
    );
  }

  const getDisplayValue = () => {
    switch (leaderboardType) {
      case 'all_time':
        return `${entry.xp.toLocaleString()} XP`;
      case 'weekly':
        return `+${(entry.weekly_xp || 0).toLocaleString()} XP`;
      case 'streaks':
        return `${entry.post_streak || 0} day streak`;
      case 'verified':
        return `${entry.verification_rate || 0}% verified`;
      default:
        return `${entry.xp.toLocaleString()} XP`;
    }
  };

  const getRankColor = () => {
    if (position <= 3) return '#FFD700';
    if (position <= 10) return '#C0C0C0';
    if (position <= 50) return '#CD7F32';
    return '#00e5ff';
  };

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <LinearGradient
        colors={['rgba(0, 229, 255, 0.2)', 'rgba(255, 0, 128, 0.15)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.content}
      >
        <View style={styles.leftContent}>
          <Text style={styles.label}>Your Position</Text>
          <Text style={styles.positionText}>
            <Text style={[styles.rank, { color: getRankColor() }]}>#{position}</Text>
            <Text style={styles.divider}> · </Text>
            <Text style={styles.value}>{getDisplayValue()}</Text>
          </Text>
        </View>

        <View style={styles.rightContent}>
          <Text style={styles.tapHint}>Tap to scroll →</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 2,
    borderTopColor: 'rgba(0, 229, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(10, 14, 39, 0.95)',
  },
  leftContent: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  positionText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rank: {
    fontSize: 20,
    fontWeight: '900',
  },
  divider: {
    fontSize: 16,
    color: '#6b7280',
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  rightContent: {
    paddingLeft: 16,
  },
  tapHint: {
    fontSize: 12,
    color: '#00e5ff',
    fontWeight: '600',
  },
  notRankedText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 20,
  },
});
