import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  Easing,
} from 'react-native-reanimated';

interface ImpactEffectProps {
  size?: number;
  color?: string;
  animated?: boolean;
  burstCount?: number;
}

/**
 * Comic book style impact effect with burst/star lines
 * Perfect for button presses and power-up effects
 */
export const ImpactEffect: React.FC<ImpactEffectProps> = ({
  size = 60,
  color = '#ffff00',
  animated = true,
  burstCount = 8,
}) => {
  const scale = useSharedValue(animated ? 0 : 1);
  const opacity = useSharedValue(animated ? 0 : 1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      // Burst in animation
      scale.value = withSequence(
        withSpring(1.3, { damping: 3, stiffness: 100 }),
        withSpring(1, { damping: 8, stiffness: 200 })
      );
      opacity.value = withTiming(1, { duration: 200 });
      rotation.value = withTiming(360, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [animated]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
    opacity: opacity.value,
  }));

  // Generate burst lines in a circle
  const burstLines = Array.from({ length: burstCount }, (_, i) => {
    const angle = (i * 360) / burstCount;
    return (
      <View
        key={i}
        style={[
          styles.burstLine,
          {
            width: size * 0.6,
            height: size * 0.12,
            backgroundColor: color,
            transform: [
              { translateX: -size * 0.3 },
              { rotate: `${angle}deg` },
            ],
          },
        ]}
      />
    );
  });

  // Generate star points
  const starPoints = Array.from({ length: 4 }, (_, i) => {
    const angle = i * 90;
    return (
      <View
        key={`star-${i}`}
        style={[
          styles.starPoint,
          {
            width: size * 0.25,
            height: size * 0.25,
            backgroundColor: color,
            transform: [{ rotate: `${angle + 45}deg` }],
          },
        ]}
      />
    );
  });

  return (
    <Animated.View style={[styles.container, { width: size, height: size }, animatedStyle]}>
      {/* Central star shape */}
      <View style={styles.starContainer}>{starPoints}</View>

      {/* Burst lines radiating out */}
      <View style={styles.burstContainer}>{burstLines}</View>

      {/* Center dot for emphasis */}
      <View
        style={[
          styles.centerDot,
          {
            width: size * 0.15,
            height: size * 0.15,
            backgroundColor: '#ffffff',
            borderRadius: size * 0.075,
          },
        ]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  burstContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  burstLine: {
    position: 'absolute',
    borderRadius: 20,
    // Comic book outline
    borderWidth: 1,
    borderColor: '#000000',
  },
  starContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  starPoint: {
    position: 'absolute',
    // Comic book outline
    borderWidth: 1,
    borderColor: '#000000',
  },
  centerDot: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#000000',
  },
});
