import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { Flame, Snowflake, Camera, TrendingUp } from 'lucide-react-native';
import {
  getNextMilestone,
  getProgressToNextMilestone,
  LOGIN_STREAK_MILESTONES,
  POST_STREAK_MILESTONES,
  getDailyStreakBonus,
  StreakMilestone,
} from '@/constants/streaks';
import { spacing, fontSize, fontWeight } from '@/constants';

interface StreakWidgetProps {
  loginStreak: number;
  postStreak: number;
  longestLoginStreak: number;
  longestPostStreak: number;
  streakFreezeCount: number;
  compact?: boolean;
  onPress?: () => void;
}

export function StreakWidget({
  loginStreak,
  postStreak,
  longestLoginStreak,
  longestPostStreak,
  streakFreezeCount,
  compact = false,
  onPress,
}: StreakWidgetProps) {
  const nextLoginMilestone = getNextMilestone(loginStreak, LOGIN_STREAK_MILESTONES);
  const nextPostMilestone = getNextMilestone(postStreak, POST_STREAK_MILESTONES);
  const loginProgress = getProgressToNextMilestone(loginStreak, LOGIN_STREAK_MILESTONES);
  const postProgress = getProgressToNextMilestone(postStreak, POST_STREAK_MILESTONES);
  const dailyBonus = getDailyStreakBonus(loginStreak);

  // Flame animation
  const flameScale = useSharedValue(1);

  React.useEffect(() => {
    if (loginStreak > 0) {
      flameScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
    }
  }, [loginStreak]);

  const flameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flameScale.value }],
  }));

  if (compact) {
    return (
      <TouchableOpacity onPress={onPress} style={styles.compactContainer}>
        <View style={styles.compactStreak}>
          <Animated.View style={flameStyle}>
            <Flame
              size={20}
              color={loginStreak > 0 ? '#ff6b35' : 'rgba(255,255,255,0.3)'}
              fill={loginStreak > 0 ? '#ff6b35' : 'none'}
            />
          </Animated.View>
          <Text style={[styles.compactNumber, loginStreak > 0 && styles.activeStreak]}>
            {loginStreak}
          </Text>
        </View>
        {streakFreezeCount > 0 && (
          <View style={styles.compactFreeze}>
            <Snowflake size={14} color="#00d4ff" />
            <Text style={styles.freezeCount}>{streakFreezeCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      style={styles.container}
    >
      <LinearGradient
        colors={['rgba(255, 107, 53, 0.15)', 'rgba(255, 0, 128, 0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Animated.View style={flameStyle}>
              <Flame
                size={24}
                color={loginStreak > 0 ? '#ff6b35' : 'rgba(255,255,255,0.3)'}
                fill={loginStreak > 0 ? '#ff6b35' : 'none'}
              />
            </Animated.View>
            <Text style={styles.title}>Daily Streaks</Text>
          </View>
          {dailyBonus > 0 && (
            <View style={styles.bonusBadge}>
              <Text style={styles.bonusText}>+{dailyBonus} XP/action</Text>
            </View>
          )}
        </View>

        {/* Streak Stats */}
        <View style={styles.streaksRow}>
          {/* Login Streak */}
          <View style={styles.streakItem}>
            <View style={styles.streakIcon}>
              <TrendingUp size={18} color="#00d4ff" />
            </View>
            <View style={styles.streakInfo}>
              <Text style={styles.streakLabel}>Login Streak</Text>
              <Text style={styles.streakValue}>{loginStreak} days</Text>
              {nextLoginMilestone && (
                <View style={styles.milestonePreview}>
                  <Text style={styles.milestoneText}>
                    {nextLoginMilestone.emoji} {nextLoginMilestone.days - loginStreak} to go
                  </Text>
                </View>
              )}
            </View>
            <ProgressRing progress={loginProgress} size={40} />
          </View>

          {/* Post Streak */}
          <View style={styles.streakItem}>
            <View style={styles.streakIcon}>
              <Camera size={18} color="#ff00ff" />
            </View>
            <View style={styles.streakInfo}>
              <Text style={styles.streakLabel}>Post Streak</Text>
              <Text style={styles.streakValue}>{postStreak} days</Text>
              {nextPostMilestone && (
                <View style={styles.milestonePreview}>
                  <Text style={styles.milestoneText}>
                    {nextPostMilestone.emoji} {nextPostMilestone.days - postStreak} to go
                  </Text>
                </View>
              )}
            </View>
            <ProgressRing progress={postProgress} size={40} color="#ff00ff" />
          </View>
        </View>

        {/* Best Streaks & Freezes */}
        <View style={styles.footer}>
          <View style={styles.bestStreak}>
            <Text style={styles.footerLabel}>Best</Text>
            <Text style={styles.footerValue}>
              🔥 {longestLoginStreak} · 📸 {longestPostStreak}
            </Text>
          </View>
          {streakFreezeCount > 0 && (
            <View style={styles.freezeContainer}>
              <Snowflake size={16} color="#00d4ff" />
              <Text style={styles.freezeText}>{streakFreezeCount} freezes</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// Progress Ring Component - Simple circular progress indicator
interface ProgressRingProps {
  progress: number;
  size: number;
  color?: string;
}

function ProgressRing({ progress, size, color = '#00d4ff' }: ProgressRingProps) {
  // Use a simple view-based progress indicator since SVG isn't available
  const progressWidth = 3;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: progressWidth,
        borderColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      {/* Progress arc simulation with partial border */}
      <View
        style={{
          position: 'absolute',
          width: size - progressWidth * 2,
          height: size - progressWidth * 2,
          borderRadius: (size - progressWidth * 2) / 2,
          borderWidth: progressWidth,
          borderColor: color,
          borderTopColor: progress > 75 ? color : 'transparent',
          borderRightColor: progress > 50 ? color : 'transparent',
          borderBottomColor: progress > 25 ? color : 'transparent',
          borderLeftColor: progress > 0 ? color : 'transparent',
          transform: [{ rotate: '-45deg' }],
        }}
      />
      <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.3)',
  },
  gradient: {
    padding: spacing.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#ffffff',
  },
  bonusBadge: {
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  bonusText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: '#00d4ff',
  },
  streaksRow: {
    gap: spacing.md,
  },
  streakItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.md,
  },
  streakIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakInfo: {
    flex: 1,
  },
  streakLabel: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 2,
  },
  streakValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#ffffff',
  },
  milestonePreview: {
    marginTop: spacing.xs,
  },
  milestoneText: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.5)',
  },
  progressPercent: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: 'rgba(255,255,255,0.8)',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  bestStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  footerLabel: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.5)',
  },
  footerValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: '#ffffff',
  },
  freezeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  freezeText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: '#00d4ff',
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.2)',
  },
  compactStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  compactNumber: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: 'rgba(255,255,255,0.5)',
  },
  activeStreak: {
    color: '#ff6b35',
  },
  compactFreeze: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  freezeCount: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: '#00d4ff',
  },
});
