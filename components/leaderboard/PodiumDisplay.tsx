import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LeaderboardEntry } from '@/lib/api/leaderboard';
import { router } from 'expo-router';

interface PodiumDisplayProps {
  entries: LeaderboardEntry[];
  leaderboardType: 'all_time' | 'weekly' | 'streaks' | 'verified';
}

export default function PodiumDisplay({ entries, leaderboardType }: PodiumDisplayProps) {
  const first = entries.find((e) => e.position === 1);
  const second = entries.find((e) => e.position === 2);
  const third = entries.find((e) => e.position === 3);

  const getDisplayValue = (entry: LeaderboardEntry) => {
    switch (leaderboardType) {
      case 'all_time':
        return `${entry.xp.toLocaleString()} XP`;
      case 'weekly':
        return `+${(entry.weekly_xp || 0).toLocaleString()} XP`;
      case 'streaks':
        return `${entry.post_streak || 0} days`;
      case 'verified':
        return `${entry.verification_rate || 0}%`;
      default:
        return `${entry.xp.toLocaleString()} XP`;
    }
  };

  const PodiumCard = ({
    entry,
    position,
    height,
    color,
    emoji,
  }: {
    entry: LeaderboardEntry | undefined;
    position: number;
    height: number;
    color: string;
    emoji: string;
  }) => {
    if (!entry) return <View style={{ flex: 1 }} />;

    return (
      <Pressable
        style={{ flex: 1, alignItems: 'center' }}
        onPress={() => router.push(`/profile/${entry.username}`)}
      >
        {/* Avatar */}
        <View style={styles.podiumAvatarContainer}>
          <View style={[styles.podiumAvatarGlow, { backgroundColor: color, shadowColor: color }]} />
          <View style={[styles.podiumAvatarWrapper, { borderColor: color }]}>
            {entry.avatar_url ? (
              <Image source={{ uri: entry.avatar_url }} style={styles.podiumAvatar} />
            ) : (
              <View style={styles.podiumAvatarPlaceholder}>
                <Text style={styles.podiumAvatarText}>
                  {entry.username.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <View style={[styles.crownBadge, { backgroundColor: color }]}>
            <Text style={styles.crownEmoji}>{emoji}</Text>
          </View>
        </View>

        {/* Username */}
        <Text style={styles.podiumUsername} numberOfLines={1}>
          {entry.username}
        </Text>

        {/* Stats */}
        <Text style={[styles.podiumStats, { color }]}>{getDisplayValue(entry)}</Text>

        {/* Podium base */}
        <LinearGradient
          colors={[color + 'CC', color + '66']}
          style={[styles.podiumBase, { height }]}
        >
          <Text style={styles.podiumRank}>#{position}</Text>
        </LinearGradient>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>TOP 3</Text>

      {/* Podium */}
      <View style={styles.podiumContainer}>
        {/* Second Place */}
        <PodiumCard entry={second} position={2} height={100} color="#C0C0C0" emoji="🥈" />

        {/* First Place */}
        <PodiumCard entry={first} position={1} height={140} color="#FFD700" emoji="👑" />

        {/* Third Place */}
        <PodiumCard entry={third} position={3} height={80} color="#CD7F32" emoji="🥉" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFD700',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 20,
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  podiumAvatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  podiumAvatarWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    borderWidth: 4,
  },
  podiumAvatar: {
    width: '100%',
    height: '100%',
  },
  podiumAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1f3a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  podiumAvatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00e5ff',
  },
  podiumAvatarGlow: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 44,
    opacity: 0.5,
    zIndex: -1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  crownBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000',
  },
  crownEmoji: {
    fontSize: 18,
  },
  podiumUsername: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
    maxWidth: 100,
    textAlign: 'center',
  },
  podiumStats: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  podiumBase: {
    width: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  podiumRank: {
    fontSize: 28,
    fontWeight: '900',
    color: '#000',
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
