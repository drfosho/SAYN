import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { getRankConfig } from '@/lib/api/xp';
import { RankTier } from '@/lib/types/xp';

interface XPBarProps {
  currentXP: number;
  level: number;
  rank: RankTier;
  xpToNextLevel: number;
  xpProgress: number; // 0-100
  showDetails?: boolean;
  compact?: boolean;
}

export function XPBar({
  currentXP,
  level,
  rank,
  xpToNextLevel,
  xpProgress,
  showDetails = true,
  compact = false,
}: XPBarProps) {
  const rankConfig = getRankConfig(rank);

  // Animated progress bar
  const progressStyle = useAnimatedStyle(() => ({
    width: withSpring(`${Math.min(xpProgress, 100)}%`, {
      damping: 15,
      stiffness: 100,
    }),
  }));

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactInfo}>
          <Text style={styles.compactLevel}>LVL {level}</Text>
          <Text style={styles.compactRank}>{rankConfig.icon}</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <Animated.View style={[styles.progressBarFill, progressStyle]}>
            <LinearGradient
              colors={['#00e5ff', '#ff00ff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.progressGradient}
            />
          </Animated.View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Level and Rank */}
      <View style={styles.header}>
        <View style={styles.levelContainer}>
          <Text style={styles.levelLabel}>LEVEL</Text>
          <Text style={styles.levelNumber}>{level}</Text>
        </View>

        <View style={[styles.rankBadge, { borderColor: rankConfig.color }]}>
          <Text style={styles.rankIcon}>{rankConfig.icon}</Text>
          <Text style={[styles.rankText, { color: rankConfig.color }]}>
            {rank.toUpperCase().replace('_', ' ')}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <Animated.View style={[styles.progressBarFill, progressStyle]}>
          <LinearGradient
            colors={['#00e5ff', '#ff00ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.progressGradient}
          />
        </Animated.View>
      </View>

      {/* XP Details */}
      {showDetails && (
        <View style={styles.details}>
          <Text style={styles.xpText}>
            {currentXP.toLocaleString()} XP
          </Text>
          <Text style={styles.xpToNextLevel}>
            {xpToNextLevel.toLocaleString()} XP to Level {level + 1}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  compactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compactLevel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  compactRank: {
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 1,
  },
  levelNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  rankIcon: {
    fontSize: 16,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
  },
  progressGradient: {
    flex: 1,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  xpToNextLevel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
  },
});
