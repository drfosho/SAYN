import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { AnimatedSAYNLogo, SAYNText } from '@/components/brand';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const glowOpacity = useSharedValue(0.3);
  const particleY = useSharedValue(0);

  useEffect(() => {
    // Pulsing glow effect
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Floating particles
    particleY.value = withRepeat(
      withTiming(-20, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const particleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: particleY.value }],
  }));

  return (
    <LinearGradient
      colors={['#050814', '#0d1128', '#1a1f3a']}
      style={styles.container}
    >
      {/* Animated particles */}
      <View style={styles.particlesContainer}>
        <Animated.View style={[styles.particle, particleStyle, { left: '20%', top: '30%' }]} />
        <Animated.View style={[styles.particle, particleStyle, { left: '70%', top: '40%' }]} />
        <Animated.View style={[styles.particle, particleStyle, { left: '50%', top: '60%' }]} />
        <Animated.View style={[styles.particle, particleStyle, { left: '30%', top: '70%' }]} />
      </View>

      {/* Logo with glow */}
      <View style={styles.logoContainer}>
        <AnimatedSAYNLogo size="xlarge" animationType="entrance" />
        <View style={styles.textContainer}>
          <SAYNText size="large" withGlow={true} />
        </View>
        <LinearGradient
          colors={['#00e5ff', '#ff00ff', '#ffa500']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoUnderline}
        />
      </View>

      {/* Tagline */}
      <Text style={styles.tagline}>No filters. No fakes.{'\n'}Just real results.</Text>

      {/* CTA Buttons */}
      <View style={styles.buttonContainer}>
        <Pressable
          onPress={() => router.push('/auth/signup')}
          style={({ pressed }) => [styles.buttonWrapper, pressed && styles.buttonPressed]}
        >
          <LinearGradient
            colors={['#00e5ff', '#ff00ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Sign Up</Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          onPress={() => router.push('/auth/login')}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
        >
          <Text style={styles.secondaryButtonText}>Log In</Text>
        </Pressable>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>Join the revolution. No excuses.</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00e5ff',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  textContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  logoUnderline: {
    width: 180,
    height: 4,
    borderRadius: 2,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 80,
    letterSpacing: 0.5,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 340,
    gap: 16,
  },
  buttonWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  primaryButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
  },
  secondaryButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(0, 229, 255, 0.5)',
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00e5ff',
    letterSpacing: 1,
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 0.5,
  },
});
