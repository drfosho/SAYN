import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { RankDefinition } from '@/constants/ranks';
import { ElectricBurst } from './ElectricBurst';

const { width, height } = Dimensions.get('window');

interface RankUpAnimationProps {
  newRank: RankDefinition;
  oldRank: RankDefinition;
  onComplete?: () => void;
}

/**
 * RankUpAnimation - Full screen rank up celebration
 * INTENSE, POWERFUL takeover effect
 */
export const RankUpAnimation: React.FC<RankUpAnimationProps> = ({
  newRank,
  oldRank,
  onComplete,
}) => {
  const backgroundOpacity = useSharedValue(0);
  const badgeScale = useSharedValue(0.3);
  const badgeOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textScale = useSharedValue(0.5);
  const unlocksOpacity = useSharedValue(0);
  const unlocksY = useSharedValue(30);
  const flashOpacity = useSharedValue(0);

  // Create particles
  const particleCount = 20;
  const particles = Array.from({ length: particleCount }, (_, i) => {
    const angle = (i / particleCount) * Math.PI * 2;
    return {
      x: useSharedValue(0),
      y: useSharedValue(0),
      opacity: useSharedValue(1),
      angle,
    };
  });

  useEffect(() => {
    // Flash effect
    flashOpacity.value = withSequence(
      withTiming(0.3, { duration: 100 }),
      withTiming(0, { duration: 200 })
    );

    // Background fade in
    backgroundOpacity.value = withTiming(0.95, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });

    // Badge scale up with POWER
    badgeScale.value = withSequence(
      withDelay(
        100,
        withTiming(1.5, { duration: 300, easing: Easing.out(Easing.cubic) })
      ),
      withTiming(1, { duration: 150, easing: Easing.inOut(Easing.ease) })
    );

    badgeOpacity.value = withDelay(
      100,
      withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) })
    );

    // "RANK UP!" text
    textScale.value = withDelay(
      400,
      withSequence(
        withTiming(1.2, { duration: 150, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 100, easing: Easing.inOut(Easing.ease) })
      )
    );

    textOpacity.value = withDelay(
      400,
      withTiming(1, { duration: 150, easing: Easing.out(Easing.cubic) })
    );

    // Unlocks list
    unlocksOpacity.value = withDelay(
      700,
      withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) })
    );

    unlocksY.value = withDelay(
      700,
      withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) })
    );

    // Particles explosion
    particles.forEach((particle, i) => {
      const delay = 100 + i * 20;
      const distance = 150;

      particle.x.value = withDelay(
        delay,
        withTiming(Math.cos(particle.angle) * distance, {
          duration: 800,
          easing: Easing.out(Easing.cubic),
        })
      );

      particle.y.value = withDelay(
        delay,
        withTiming(Math.sin(particle.angle) * distance, {
          duration: 800,
          easing: Easing.out(Easing.cubic),
        })
      );

      particle.opacity.value = withDelay(
        delay,
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0, { duration: 400 })
        )
      );
    });

    // Complete animation
    const timer = setTimeout(() => {
      onComplete?.();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badgeOpacity.value,
    transform: [{ scale: badgeScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ scale: textScale.value }],
  }));

  const unlocksStyle = useAnimatedStyle(() => ({
    opacity: unlocksOpacity.value,
    transform: [{ translateY: unlocksY.value }],
  }));

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      {/* White flash */}
      <Animated.View style={[styles.flash, flashStyle]} />

      {/* Background overlay */}
      <Animated.View style={[styles.background, backgroundStyle]}>
        <LinearGradient
          colors={['#000000', '#050814', '#0d1128']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Explosion particles */}
      <View style={styles.particlesContainer}>
        {particles.map((particle, i) => {
          const particleStyle = useAnimatedStyle(() => ({
            opacity: particle.opacity.value,
            transform: [
              { translateX: particle.x.value },
              { translateY: particle.y.value },
            ],
          }));

          return (
            <Animated.View key={i} style={[styles.particle, particleStyle]}>
              <View
                style={[
                  styles.particleDot,
                  { backgroundColor: newRank.glowColor },
                ]}
              />
            </Animated.View>
          );
        })}
      </View>

      {/* Electric bursts */}
      <View style={styles.burstContainer}>
        <ElectricBurst size={200} color={newRank.glowColor} />
      </View>
      <View style={[styles.burstContainer, { top: '60%' }]}>
        <ElectricBurst size={150} color={newRank.colors.secondary} />
      </View>

      {/* Rank badge */}
      <Animated.View style={[styles.badgeContainer, badgeStyle]}>
        <LinearGradient
          colors={newRank.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.badge}
        >
          <Text style={styles.badgeIcon}>{newRank.icon}</Text>
          <Text style={styles.badgeName}>{newRank.name}</Text>
        </LinearGradient>

        {/* Badge glow */}
        <View
          style={[
            styles.badgeGlow,
            {
              backgroundColor: newRank.glowColor,
              shadowColor: newRank.glowColor,
            },
          ]}
        />
      </Animated.View>

      {/* "RANK UP!" text */}
      <Animated.View style={[styles.textContainer, textStyle]}>
        <Text style={styles.rankUpText}>RANK UP!</Text>
        <Text style={styles.subText}>
          {oldRank.name} → {newRank.name}
        </Text>
      </Animated.View>

      {/* Unlocks list */}
      <Animated.View style={[styles.unlocksContainer, unlocksStyle]}>
        <Text style={styles.unlocksTitle}>NEW UNLOCKS:</Text>
        {newRank.unlocks.map((unlock, i) => (
          <View key={i} style={styles.unlockItem}>
            <Text style={styles.unlockBullet}>⚡</Text>
            <Text style={styles.unlockText}>{unlock}</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    zIndex: 10001,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10002,
  },
  particlesContainer: {
    position: 'absolute',
    top: '35%',
    left: '50%',
    zIndex: 10003,
  },
  particle: {
    position: 'absolute',
  },
  particleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  burstContainer: {
    position: 'absolute',
    top: '35%',
    left: '50%',
    marginLeft: -100,
    marginTop: -100,
    zIndex: 10004,
  },
  badgeContainer: {
    zIndex: 10005,
    marginBottom: 40,
    borderRadius: 20,
    overflow: 'visible',
  },
  badge: {
    paddingHorizontal: 40,
    paddingVertical: 24,
    borderRadius: 20,
    borderWidth: 6,
    borderColor: '#000000',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 20,
  },
  badgeIcon: {
    fontSize: 60,
  },
  badgeName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 4,
    textShadowColor: '#000000',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
  },
  badgeGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 30,
    opacity: 0.5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
    zIndex: -1,
  },
  textContainer: {
    alignItems: 'center',
    gap: 12,
    zIndex: 10005,
  },
  rankUpText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 6,
    textShadowColor: '#000000',
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 0,
    textTransform: 'uppercase',
  },
  subText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00e5ff',
    letterSpacing: 2,
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  unlocksContainer: {
    position: 'absolute',
    bottom: 100,
    left: 40,
    right: 40,
    backgroundColor: 'rgba(13, 17, 40, 0.9)',
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#000000',
    padding: 20,
    gap: 12,
    zIndex: 10005,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 12,
  },
  unlocksTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#00e5ff',
    letterSpacing: 2,
    marginBottom: 8,
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  unlockItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  unlockBullet: {
    fontSize: 14,
    color: '#00e5ff',
  },
  unlockText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
});
