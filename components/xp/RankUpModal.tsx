import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { RankTier } from '@/lib/types/xp';
import { getRankConfig } from '@/lib/api/xp';

interface RankUpModalProps {
  visible: boolean;
  oldRank: RankTier;
  newRank: RankTier;
  unlockedPerks?: string[];
  onClose: () => void;
}

export function RankUpModal({
  visible,
  oldRank,
  newRank,
  unlockedPerks = [],
  onClose,
}: RankUpModalProps) {
  const newRankConfig = getRankConfig(newRank);

  const scale = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const badgeOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const perksOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Heavy haptic feedback for rank up
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setTimeout(() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }, 200);
      } catch (error) {
        // Haptics not available
      }

      // Epic entrance animation
      scale.value = withSequence(
        withTiming(1.3, { duration: 300, easing: Easing.out(Easing.cubic) }),
        withSpring(1, { damping: 8, stiffness: 100 })
      );

      glowOpacity.value = withTiming(1, { duration: 500 });
      badgeOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));
      textOpacity.value = withDelay(500, withTiming(1, { duration: 300 }));
      perksOpacity.value = withDelay(700, withTiming(1, { duration: 300 }));

      // Pulsing glow
      glowOpacity.value = withSequence(
        withTiming(1, { duration: 500 }),
        withSequence(
          withTiming(0.6, { duration: 800 }),
          withTiming(1, { duration: 800 })
        )
      );
    } else {
      // Reset animations
      scale.value = 0;
      glowOpacity.value = 0;
      badgeOpacity.value = 0;
      textOpacity.value = 0;
      perksOpacity.value = 0;
    }
  }, [visible]);

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: badgeOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const perksStyle = useAnimatedStyle(() => ({
    opacity: perksOpacity.value,
  }));

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Epic Glow Effect */}
          <Animated.View
            style={[
              styles.glow,
              glowStyle,
              { backgroundColor: newRankConfig.color },
            ]}
          />

          {/* Rank Badge */}
          <Animated.View style={badgeStyle}>
            <View
              style={[
                styles.rankBadge,
                { borderColor: newRankConfig.color },
              ]}
            >
              <LinearGradient
                colors={[newRankConfig.color, '#000000']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.badgeGradient}
              >
                <Text style={styles.rankIcon}>{newRankConfig.icon}</Text>
              </LinearGradient>
            </View>
          </Animated.View>

          {/* Rank Up Text */}
          <Animated.View style={textStyle}>
            <View style={styles.messageContainer}>
              <Text style={styles.rankUpText}>RANK UP!</Text>
              <Text
                style={[
                  styles.rankNameText,
                  { color: newRankConfig.color },
                ]}
              >
                {newRank.toUpperCase().replace('_', ' ')}
              </Text>
              <Text style={styles.description}>
                {newRankConfig.description}
              </Text>
            </View>
          </Animated.View>

          {/* Unlocked Perks */}
          {unlockedPerks.length > 0 && (
            <Animated.View style={[styles.perksContainer, perksStyle]}>
              <Text style={styles.perksTitle}>Unlocked Perks:</Text>
              {unlockedPerks.map((perk, index) => (
                <View key={index} style={styles.perkItem}>
                  <Text style={styles.perkBullet}>⚡</Text>
                  <Text style={styles.perkText}>{perk}</Text>
                </View>
              ))}
            </Animated.View>
          )}

          {/* Continue Button */}
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.buttonWrapper,
              pressed && styles.buttonPressed,
            ]}
          >
            <LinearGradient
              colors={[newRankConfig.color, '#000000']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  glow: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 80,
  },
  rankBadge: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 6,
    overflow: 'hidden',
    marginBottom: 32,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 40,
  },
  badgeGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankIcon: {
    fontSize: 100,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  rankUpText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 16,
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  rankNameText: {
    fontSize: 36,
    fontWeight: '900',
    marginBottom: 12,
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  description: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 26,
  },
  perksContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  perksTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  perkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  perkBullet: {
    fontSize: 18,
  },
  perkText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  buttonWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
  },
  button: {
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
  },
  buttonPressed: {
    opacity: 0.8,
  },
});
