import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { RANK_TIERS, RANK_ORDER, RankDefinition } from '@/constants/ranks';
import { getRankFromLevel, getProgressToNextRank } from '@/utils/getRankFromLevel';
import { RankBadge } from '@/components/RankBadge';
import { RankUpAnimation } from '@/components/RankUpAnimation';

// Mock current user level
const CURRENT_LEVEL = 42;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function RanksScreen() {
  const [showRankUp, setShowRankUp] = useState(false);
  const currentRank = getRankFromLevel(CURRENT_LEVEL);
  const { nextRank, progress, levelsRemaining } = getProgressToNextRank(CURRENT_LEVEL);

  const handleDemoRankUp = () => {
    setShowRankUp(true);
    setTimeout(() => setShowRankUp(false), 2500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Rank Up Animation Overlay */}
      {showRankUp && (
        <RankUpAnimation
          oldRank={currentRank}
          newRank={nextRank || currentRank}
          onComplete={() => setShowRankUp(false)}
        />
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>RANK SYSTEM</Text>
          <Text style={styles.headerSubtitle}>POWER EVOLUTION PATH</Text>
        </View>

        {/* Current Rank Card */}
        <View style={styles.currentRankSection}>
          <LinearGradient
            colors={['#0d1128', '#1a1f3a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.currentRankCard}
          >
            <Text style={styles.currentRankLabel}>YOUR CURRENT RANK</Text>
            <View style={styles.currentRankBadgeContainer}>
              <RankBadge rank={currentRank} size="large" animate={true} />
            </View>
            <Text style={styles.currentLevel}>LEVEL {CURRENT_LEVEL}</Text>

            {/* Progress to next rank */}
            {nextRank && (
              <>
                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>NEXT RANK</Text>
                    <Text style={styles.progressRemaining}>
                      {levelsRemaining} levels remaining
                    </Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarBg}>
                      <LinearGradient
                        colors={nextRank.gradientColors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.progressBarFill, { width: `${progress * 100}%` }]}
                      />
                    </View>
                  </View>
                  <Text style={styles.nextRankName}>{nextRank.name}</Text>
                </View>

                {/* Demo Button */}
                <DemoButton onPress={handleDemoRankUp} />
              </>
            )}
          </LinearGradient>
        </View>

        {/* All Ranks List */}
        <View style={styles.ranksListSection}>
          <Text style={styles.sectionTitle}>ALL RANKS</Text>
          {RANK_ORDER.map((tier, index) => {
            const rank = RANK_TIERS[tier];
            const isCurrentRank = rank.tier === currentRank.tier;
            const isUnlocked = CURRENT_LEVEL >= rank.minLevel;

            return (
              <RankCard
                key={tier}
                rank={rank}
                isCurrentRank={isCurrentRank}
                isUnlocked={isUnlocked}
                index={index}
              />
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface RankCardProps {
  rank: RankDefinition;
  isCurrentRank: boolean;
  isUnlocked: boolean;
  index: number;
}

const RankCard: React.FC<RankCardProps> = ({ rank, isCurrentRank, isUnlocked }) => {
  return (
    <View style={styles.rankCard}>
      <LinearGradient
        colors={isUnlocked ? ['#0d1128', '#1a1f3a'] : ['#0a0e1a', '#050814']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.rankCardGradient}
      >
        {/* Current rank indicator */}
        {isCurrentRank && (
          <View style={styles.currentBadge}>
            <Text style={styles.currentBadgeText}>CURRENT</Text>
          </View>
        )}

        {/* Rank badge */}
        <View style={styles.rankCardHeader}>
          <RankBadge rank={rank} size="medium" animate={isCurrentRank} />
          <View style={styles.ringIndicator}>
            {Array.from({ length: rank.ringCount }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.ringDot,
                  { backgroundColor: rank.glowColor, shadowColor: rank.glowColor },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Level range */}
        <Text style={styles.levelRange}>
          LEVEL {rank.minLevel}-{rank.maxLevel}
        </Text>

        {/* Ring count info */}
        <Text style={styles.ringCount}>
          {rank.ringCount === 0
            ? 'No Power Rings'
            : `${rank.ringCount} Power Ring${rank.ringCount > 1 ? 's' : ''}`}
        </Text>

        {/* Unlocks */}
        <View style={styles.unlocks}>
          <Text style={styles.unlocksTitle}>UNLOCKS:</Text>
          {rank.unlocks.map((unlock, i) => (
            <View key={i} style={styles.unlockItem}>
              <Text style={styles.unlockBullet}>•</Text>
              <Text style={[styles.unlockText, !isUnlocked && styles.unlockTextLocked]}>
                {unlock}
              </Text>
            </View>
          ))}
        </View>

        {/* Locked overlay */}
        {!isUnlocked && (
          <View style={styles.lockedOverlay}>
            <Text style={styles.lockedText}>🔒 LOCKED</Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

interface DemoButtonProps {
  onPress: () => void;
}

const DemoButton: React.FC<DemoButtonProps> = ({ onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.94, {
      duration: 80,
      easing: Easing.out(Easing.cubic),
    });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, {
      duration: 150,
      easing: Easing.inOut(Easing.ease),
    });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.demoButton, animatedStyle]}
    >
      <LinearGradient
        colors={['#ff0080', '#ff4500']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.demoButtonGradient}
      >
        <Text style={styles.demoButtonText}>⚡ PREVIEW RANK UP</Text>
      </LinearGradient>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050814',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0, 229, 255, 0.3)',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 4,
    textShadowColor: '#000000',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00e5ff',
    letterSpacing: 2,
  },
  currentRankSection: {
    padding: 20,
  },
  currentRankCard: {
    borderRadius: 16,
    borderWidth: 5,
    borderColor: '#000000',
    padding: 24,
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 16,
  },
  currentRankLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#6b7280',
    letterSpacing: 2,
  },
  currentRankBadgeContainer: {
    marginVertical: 8,
  },
  currentLevel: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  progressSection: {
    width: '100%',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: 'rgba(0, 229, 255, 0.2)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#00e5ff',
    letterSpacing: 2,
  },
  progressRemaining: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b7280',
    letterSpacing: 0.5,
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBarBg: {
    height: 12,
    backgroundColor: '#0a0e1a',
    borderRadius: 6,
    borderWidth: 3,
    borderColor: '#000000',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  nextRankName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
    textAlign: 'center',
  },
  demoButton: {
    width: '100%',
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  demoButtonGradient: {
    paddingVertical: 14,
    borderWidth: 4,
    borderColor: '#000000',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 12,
  },
  demoButtonText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1.5,
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  ranksListSection: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 3,
    marginBottom: 16,
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  rankCard: {
    marginBottom: 16,
    borderRadius: 14,
    overflow: 'hidden',
  },
  rankCardGradient: {
    padding: 20,
    borderWidth: 4,
    borderColor: '#000000',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 12,
    position: 'relative',
  },
  currentBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#00e5ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#000000',
    zIndex: 10,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 1,
  },
  rankCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  ringIndicator: {
    flexDirection: 'row',
    gap: 6,
  },
  ringDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  levelRange: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1.5,
    marginBottom: 4,
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  ringCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  unlocks: {
    gap: 8,
  },
  unlocksTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#00e5ff',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  unlockItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  unlockBullet: {
    fontSize: 12,
    color: '#00e5ff',
    marginTop: 2,
  },
  unlockText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#d0d5e9',
    lineHeight: 18,
  },
  unlockTextLocked: {
    color: '#6b7280',
  },
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  lockedText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#6b7280',
    letterSpacing: 2,
  },
});
