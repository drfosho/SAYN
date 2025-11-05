import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface StatsRowProps {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  followers: number;
  following: number;
  onFollowersPress?: () => void;
  onFollowingPress?: () => void;
}

/**
 * Stats row with level progress bar following SAYN aesthetic
 * Angular pills with electric energy
 */
export const StatsRow: React.FC<StatsRowProps> = ({
  level,
  currentXP,
  nextLevelXP,
  followers,
  following,
  onFollowersPress,
  onFollowingPress,
}) => {
  const scale = useSharedValue(0.9);
  const progressWidth = useSharedValue(0);

  const progress = currentXP / nextLevelXP;
  const isCloseToLevelUp = progress >= 0.9;

  useEffect(() => {
    // Animate stats in
    scale.value = withSpring(1, {
      damping: 12,
      stiffness: 150,
      mass: 1,
    });

    // Animate progress bar
    progressWidth.value = withTiming(progress * 100, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const statsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  return (
    <Animated.View style={[styles.container, statsAnimatedStyle]}>
      {/* Level stat with progress bar */}
      <View style={styles.levelContainer}>
        <View style={styles.statPill}>
          <LinearGradient
            colors={['#0d1128', '#1a1f3a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.pillGradient}
          >
            <Text style={styles.statLabel}>LEVEL</Text>
            <Text style={styles.statValue}>{level}</Text>
          </LinearGradient>
        </View>

        {/* XP Progress bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarTrack}>
            <Animated.View style={[styles.progressBarFill, progressAnimatedStyle]}>
              <LinearGradient
                colors={isCloseToLevelUp ? ['#ffaa00', '#ff4500'] : ['#00e5ff', '#0088ff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.progressGradient}
              />
            </Animated.View>
          </View>
          <View style={styles.xpTextContainer}>
            <Text style={styles.xpText}>
              {currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
            </Text>
            {isCloseToLevelUp && (
              <Text style={styles.levelUpSoon}>⚡ LEVEL UP SOON!</Text>
            )}
          </View>
        </View>
      </View>

      {/* Followers & Following */}
      <View style={styles.followStats}>
        <Pressable onPress={onFollowersPress} style={styles.statPill}>
          <LinearGradient
            colors={['#0d1128', '#1a1f3a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.pillGradient}
          >
            <Text style={styles.statLabel}>FOLLOWERS</Text>
            <Text style={styles.statValue}>{followers.toLocaleString()}</Text>
          </LinearGradient>
        </Pressable>

        <Pressable onPress={onFollowingPress} style={styles.statPill}>
          <LinearGradient
            colors={['#0d1128', '#1a1f3a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.pillGradient}
          >
            <Text style={styles.statLabel}>FOLLOWING</Text>
            <Text style={styles.statValue}>{following.toLocaleString()}</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
  },
  levelContainer: {
    gap: 12,
  },
  followStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statPill: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 12,
  },
  pillGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#6b7280',
    letterSpacing: 1.5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  progressBarContainer: {
    gap: 8,
  },
  progressBarTrack: {
    height: 16,
    backgroundColor: '#0d1128',
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#000000',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressGradient: {
    flex: 1,
  },
  xpTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  xpText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    letterSpacing: 0.5,
  },
  levelUpSoon: {
    fontSize: 11,
    fontWeight: '900',
    color: '#ff4500',
    letterSpacing: 1,
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
});
