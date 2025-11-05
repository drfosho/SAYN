import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Image, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ElectricParticles } from './ElectricParticles';
import { ScanLines } from './ScanLines';
import { PowerRing } from './PowerRing';

const { width, height } = Dimensions.get('window');

interface LoadingScreenProps {
  onReady?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onReady }) => {
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);
  const glowPulse = useSharedValue(0.8);
  const progressWidth = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    // Logo entrance - sharp and forceful
    logoOpacity.value = withTiming(1, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    });

    logoScale.value = withTiming(1, {
      duration: 400,
      easing: Easing.out(Easing.back(1.5)),
    });

    // Glow pulse - powerful breathing effect
    glowPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.8, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Progress bar fill
    progressWidth.value = withTiming(100, {
      duration: 2000,
      easing: Easing.bezier(0.65, 0, 0.35, 1),
    });

    // Text fade in
    textOpacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.ease),
    });

    // Trigger ready callback after minimum display time
    const timer = setTimeout(() => {
      onReady?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowPulse.value,
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Background - Deep Black */}
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#000000' }]} />

      {/* Full Screen Logo with animated entrance */}
      <Animated.View style={[styles.logoWrapper, logoAnimatedStyle]}>
        <Image
          source={require('../assets/images/SAYN APP Loading Logo.png')}
          style={styles.logo}
          resizeMode="cover"
        />
      </Animated.View>

      {/* Dark overlay gradient for depth */}
      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'rgba(5,8,20,0.5)', 'rgba(0,0,0,0.6)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* Electric Particles ON TOP */}
      <ElectricParticles />

      {/* Scan Lines ON TOP */}
      <ScanLines opacity={0.1} />

      {/* Pulsing Glow Effect ON TOP */}
      <Animated.View style={[styles.glowOverlay, glowAnimatedStyle]} pointerEvents="none" />

      {/* Loading Indicator Section - ON TOP */}
      <View style={styles.loadingSection}>
        {/* Progress Bar Container */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarOuter}>
            <Animated.View style={[styles.progressBarInner, progressAnimatedStyle]}>
              <LinearGradient
                colors={['#00e5ff', '#ff0080', '#ff4500']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFillObject}
              />
            </Animated.View>
          </View>
        </View>

        {/* Loading Text */}
        <Animated.Text style={[styles.loadingText, textAnimatedStyle]}>
          POWERING UP...
        </Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  logoWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: width,
    height: height,
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 100,
  },
  loadingSection: {
    position: 'absolute',
    bottom: 80,
    width: width * 0.75,
    alignItems: 'center',
    zIndex: 100,
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 20,
  },
  progressBarOuter: {
    width: '100%',
    height: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 5,
    borderWidth: 3,
    borderColor: '#00e5ff',
    overflow: 'hidden',
  },
  progressBarInner: {
    height: '100%',
    borderRadius: 2,
  },
  loadingText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 6,
    textShadowColor: '#00e5ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
});
