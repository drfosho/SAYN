import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useAuth } from '@/hooks/useAuth';

const TUTORIAL_POINTS = [
  {
    icon: 'flash',
    title: 'Power Up posts you respect',
    description: 'Show appreciation for real effort and results',
  },
  {
    icon: 'trophy',
    title: 'Build your rank through consistency',
    description: 'Level up by staying active and engaged',
  },
  {
    icon: 'shield-checkmark',
    title: 'Earn your badge over time',
    description: 'Natural/Enhanced badges verified through community trust',
  },
];

export default function WelcomeCompleteScreen() {
  const { profile } = useAuth();
  const scale = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    // Power-up animation
    scale.value = withSequence(
      withTiming(1.2, { duration: 400, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 200, easing: Easing.inOut(Easing.ease) })
    );

    glowOpacity.value = withDelay(
      200,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) })
    );
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <LinearGradient
      colors={['#050814', '#0d1128', '#1a1f3a']}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Success Animation */}
        <View style={styles.iconContainer}>
          <Animated.View style={[styles.glow, glowStyle]} />
          <Animated.View style={iconStyle}>
            <View style={styles.iconCircle}>
              <Ionicons name="rocket" size={60} color="#ffffff" />
            </View>
          </Animated.View>
        </View>

        {/* Welcome Message */}
        <Text style={styles.title}>
          Welcome to SAYN,{'\n'}
          <Text style={styles.username}>{profile?.username || 'Champion'}!</Text>
        </Text>

        <Text style={styles.message}>
          You're now part of the revolution. No filters, no fakes—just real
          results.
        </Text>

        {/* Tutorial Points */}
        <View style={styles.tutorialContainer}>
          <Text style={styles.tutorialTitle}>Quick Start:</Text>

          {TUTORIAL_POINTS.map((point, index) => (
            <View key={index} style={styles.tutorialPoint}>
              <View style={styles.tutorialIconContainer}>
                <LinearGradient
                  colors={['#00e5ff', '#ff00ff']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.tutorialIconCircle}
                >
                  <Ionicons name={point.icon as any} size={20} color="#ffffff" />
                </LinearGradient>
              </View>

              <View style={styles.tutorialText}>
                <Text style={styles.tutorialPointTitle}>{point.title}</Text>
                <Text style={styles.tutorialPointDescription}>
                  {point.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA Button */}
        <Pressable
          onPress={() => router.replace('/(tabs)')}
          style={({ pressed }) => [
            styles.buttonWrapper,
            pressed && styles.buttonPressed,
          ]}
        >
          <LinearGradient
            colors={['#00e5ff', '#ff00ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Enter SAYN</Text>
            <Ionicons name="arrow-forward" size={20} color="#ffffff" />
          </LinearGradient>
        </Pressable>

        {/* Skip Tutorial */}
        <Pressable
          onPress={() => router.replace('/(tabs)')}
          style={styles.skipButton}
        >
          <Text style={styles.skipText}>I got it, let's go!</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 80,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  glow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#00e5ff',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 40,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#00e5ff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 40,
  },
  username: {
    color: '#00e5ff',
  },
  message: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
    paddingHorizontal: 20,
  },
  tutorialContainer: {
    marginBottom: 40,
  },
  tutorialTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 20,
  },
  tutorialPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 16,
  },
  tutorialIconContainer: {
    paddingTop: 2,
  },
  tutorialIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tutorialText: {
    flex: 1,
  },
  tutorialPointTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  tutorialPointDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 20,
  },
  buttonWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  button: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
});
