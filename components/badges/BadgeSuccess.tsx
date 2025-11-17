import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BadgeType } from '@/lib/api/badges';
import { NaturalBadge } from './NaturalBadge';
import { EnhancedBadge } from './EnhancedBadge';

interface BadgeSuccessProps {
  badgeType: BadgeType;
  xpAwarded?: number;
}

export default function BadgeSuccess({ badgeType, xpAwarded = 100 }: BadgeSuccessProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const confettiOpacity = useSharedValue(1);

  useEffect(() => {
    // Badge animation
    scale.value = withSpring(1, {
      damping: 8,
      stiffness: 100,
    });

    opacity.value = withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.ease),
    });

    // Confetti fade out
    confettiOpacity.value = withSequence(
      withTiming(1, { duration: 1000 }),
      withTiming(0, { duration: 1000 })
    );
  }, []);

  const badgeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const confettiAnimatedStyle = useAnimatedStyle(() => ({
    opacity: confettiOpacity.value,
  }));

  const badgeName = badgeType === 'natural' ? 'Natural Athlete' : 'Enhanced Athlete';
  const badgeColor = badgeType === 'natural' ? '#00ff88' : '#9D4EDD';
  const message =
    badgeType === 'natural'
      ? 'You are now a Verified Natural Athlete! Your honesty and natural progression have been recognized.'
      : 'You are now a Verified Enhanced Athlete! Your transparency and honesty have been recognized.';

  return (
    <View style={styles.container}>
      {/* Confetti background */}
      <Animated.View style={[styles.confettiContainer, confettiAnimatedStyle]}>
        {[...Array(20)].map((_, i) => (
          <Text
            key={i}
            style={[
              styles.confetti,
              {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              },
            ]}
          >
            {['🎉', '⭐', '✨', '🔥', '💪'][Math.floor(Math.random() * 5)]}
          </Text>
        ))}
      </Animated.View>

      {/* Success content */}
      <View style={styles.content}>
        {/* Badge */}
        <Animated.View style={[styles.badgeContainer, badgeAnimatedStyle]}>
          {badgeType === 'natural' ? (
            <NaturalBadge size="large" showLabel={false} />
          ) : (
            <EnhancedBadge size="large" showLabel={false} />
          )}
        </Animated.View>

        {/* Title */}
        <Text style={styles.title}>Badge Verified!</Text>
        <Text style={[styles.badgeName, { color: badgeColor }]}>{badgeName}</Text>

        {/* Message */}
        <View style={styles.messageContainer}>
          <Text style={styles.message}>{message}</Text>
        </View>

        {/* Perks */}
        <View style={styles.perksContainer}>
          <Text style={styles.perksTitle}>What You Get:</Text>
          <View style={styles.perksList}>
            <View style={styles.perkItem}>
              <Ionicons name="shield-checkmark" size={20} color={badgeColor} />
              <Text style={styles.perkText}>Verified badge on profile and posts</Text>
            </View>

            {badgeType === 'natural' && (
              <View style={styles.perkItem}>
                <Ionicons name="trending-up" size={20} color={badgeColor} />
                <Text style={styles.perkText}>+10% XP bonus on all activities</Text>
              </View>
            )}

            <View style={styles.perkItem}>
              <Ionicons name="star" size={20} color={badgeColor} />
              <Text style={styles.perkText}>Community credibility and trust</Text>
            </View>

            <View style={styles.perkItem}>
              <Ionicons name="people" size={20} color={badgeColor} />
              <Text style={styles.perkText}>Connect with like-minded athletes</Text>
            </View>
          </View>
        </View>

        {/* XP Award */}
        {xpAwarded > 0 && (
          <LinearGradient
            colors={['#00e5ff', '#ff00ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.xpBadge}
          >
            <Ionicons name="flash" size={24} color="#ffffff" />
            <Text style={styles.xpText}>+{xpAwarded} XP Earned!</Text>
          </LinearGradient>
        )}

        {/* Footer message */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Thank you for being honest about your journey. Both Natural and Enhanced athletes are
            respected equally on SAYN.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  confetti: {
    position: 'absolute',
    fontSize: 24,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  badgeContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  badgeName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
  },
  messageContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  message: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 24,
    textAlign: 'center',
  },
  perksContainer: {
    width: '100%',
    marginBottom: 24,
  },
  perksTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  perksList: {
    gap: 12,
  },
  perkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 12,
  },
  perkText: {
    flex: 1,
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 3,
    borderColor: '#000',
  },
  xpText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
  },
  footer: {
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  footerText: {
    fontSize: 13,
    color: '#00e5ff',
    lineHeight: 20,
    textAlign: 'center',
  },
});
