import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import {
  Target,
  Camera,
  Zap,
  MessageCircle,
  Users,
  Flame,
  Image,
  BatteryCharging,
  MessageSquare,
  Check,
  Star,
} from 'lucide-react-native';
import { UserChallengeProgress } from '@/lib/api/challenges';
import { spacing, fontSize, fontWeight } from '@/constants';

interface DailyChallengesProps {
  challenges: UserChallengeProgress[];
  onChallengePress?: (challenge: UserChallengeProgress) => void;
  compact?: boolean;
}

const ICON_MAP: Record<string, any> = {
  camera: Camera,
  zap: Zap,
  'message-circle': MessageCircle,
  users: Users,
  flame: Flame,
  image: Image,
  'battery-charging': BatteryCharging,
  'message-square': MessageSquare,
  star: Star,
};

const DIFFICULTY_COLORS = {
  easy: '#4ade80',
  medium: '#fbbf24',
  hard: '#ef4444',
};

export function DailyChallenges({
  challenges,
  onChallengePress,
  compact = false,
}: DailyChallengesProps) {
  const completedCount = challenges.filter((c) => c.completed).length;
  const totalCount = challenges.length;

  if (challenges.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Target size={32} color="rgba(255,255,255,0.3)" />
        <Text style={styles.emptyText}>No challenges today</Text>
      </View>
    );
  }

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactHeader}>
          <Target size={18} color="#00d4ff" />
          <Text style={styles.compactTitle}>Daily Challenges</Text>
          <View style={styles.compactBadge}>
            <Text style={styles.compactBadgeText}>
              {completedCount}/{totalCount}
            </Text>
          </View>
        </View>
        <View style={styles.compactProgress}>
          <View
            style={[
              styles.compactProgressFill,
              { width: `${(completedCount / totalCount) * 100}%` },
            ]}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(0, 212, 255, 0.1)', 'rgba(138, 43, 226, 0.08)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Target size={22} color="#00d4ff" />
            <Text style={styles.title}>Daily Challenges</Text>
          </View>
          <View style={styles.progressBadge}>
            <Text style={styles.progressText}>
              {completedCount}/{totalCount}
            </Text>
          </View>
        </View>

        {/* Challenges List */}
        <View style={styles.challengesList}>
          {challenges.map((item) => (
            <ChallengeCard
              key={item.id}
              challenge={item}
              onPress={() => onChallengePress?.(item)}
            />
          ))}
        </View>

        {/* Total XP Available */}
        <View style={styles.footer}>
          <Text style={styles.footerLabel}>Total XP available</Text>
          <Text style={styles.footerValue}>
            +
            {challenges
              .filter((c) => !c.completed)
              .reduce((sum, c) => sum + c.challenge.xp_reward, 0)}{' '}
            XP
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

// Individual Challenge Card
interface ChallengeCardProps {
  challenge: UserChallengeProgress;
  onPress?: () => void;
}

function ChallengeCard({ challenge, onPress }: ChallengeCardProps) {
  const { challenge: challengeData, current_progress, completed, xp_claimed } = challenge;
  const Icon = ICON_MAP[challengeData.icon_name] || Star;
  const difficultyColor = DIFFICULTY_COLORS[challengeData.difficulty];
  const progress = (current_progress / challengeData.target_count) * 100;

  // Celebration animation for completed challenges
  const scale = useSharedValue(1);

  React.useEffect(() => {
    if (completed) {
      scale.value = withSequence(
        withTiming(1.05, { duration: 150 }),
        withSpring(1, { damping: 10 })
      );
    }
  }, [completed]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={[
          styles.challengeCard,
          completed && styles.challengeCardCompleted,
        ]}
      >
        {/* Icon */}
        <View
          style={[
            styles.challengeIcon,
            { backgroundColor: completed ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255,255,255,0.1)' },
          ]}
        >
          {completed ? (
            <Check size={20} color="#4ade80" />
          ) : (
            <Icon size={20} color={difficultyColor} />
          )}
        </View>

        {/* Content */}
        <View style={styles.challengeContent}>
          <View style={styles.challengeHeader}>
            <Text
              style={[
                styles.challengeTitle,
                completed && styles.challengeTitleCompleted,
              ]}
              numberOfLines={1}
            >
              {challengeData.title}
            </Text>
            <View
              style={[
                styles.difficultyBadge,
                { backgroundColor: `${difficultyColor}20`, borderColor: difficultyColor },
              ]}
            >
              <Text style={[styles.difficultyText, { color: difficultyColor }]}>
                {challengeData.difficulty}
              </Text>
            </View>
          </View>

          <Text style={styles.challengeDescription} numberOfLines={1}>
            {challengeData.description}
          </Text>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress}%`,
                    backgroundColor: completed ? '#4ade80' : '#00d4ff',
                  },
                ]}
              />
            </View>
            <Text style={styles.progressLabel}>
              {current_progress}/{challengeData.target_count}
            </Text>
          </View>
        </View>

        {/* XP Reward */}
        <View style={styles.rewardContainer}>
          {completed && xp_claimed ? (
            <Text style={styles.claimedText}>Claimed</Text>
          ) : (
            <>
              <Text style={[styles.rewardAmount, completed && styles.rewardClaimed]}>
                +{challengeData.xp_reward}
              </Text>
              <Text style={styles.rewardLabel}>XP</Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.2)',
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
  progressBadge: {
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  progressText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: '#00d4ff',
  },
  challengesList: {
    gap: spacing.sm,
  },
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  challengeCardCompleted: {
    borderColor: 'rgba(74, 222, 128, 0.3)',
    backgroundColor: 'rgba(74, 222, 128, 0.05)',
  },
  challengeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeContent: {
    flex: 1,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 4,
  },
  challengeTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: '#ffffff',
    flex: 1,
  },
  challengeTitleCompleted: {
    color: 'rgba(255,255,255,0.6)',
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  difficultyText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    textTransform: 'capitalize',
  },
  challengeDescription: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: spacing.xs,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressLabel: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.5)',
    minWidth: 30,
    textAlign: 'right',
  },
  rewardContainer: {
    alignItems: 'center',
    minWidth: 50,
  },
  rewardAmount: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#fbbf24',
  },
  rewardClaimed: {
    color: '#4ade80',
  },
  rewardLabel: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.5)',
  },
  claimedText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: '#4ade80',
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
  footerLabel: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.5)',
  },
  footerValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: '#fbbf24',
  },
  // Empty state
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.4)',
  },
  // Compact styles
  compactContainer: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.2)',
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  compactTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: '#ffffff',
    flex: 1,
  },
  compactBadge: {
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  compactBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: '#00d4ff',
  },
  compactProgress: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  compactProgressFill: {
    height: '100%',
    backgroundColor: '#00d4ff',
    borderRadius: 2,
  },
});
