import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface ActionLinesProps {
  color?: string;
  lineCount?: number;
  direction?: 'horizontal' | 'vertical' | 'radial';
  animated?: boolean;
  speed?: number;
}

/**
 * Comic book style action/speed lines
 * Creates that dynamic movement effect behind elements
 */
export const ActionLines: React.FC<ActionLinesProps> = ({
  color = '#00d4ff',
  lineCount = 12,
  direction = 'horizontal',
  animated = true,
  speed = 2000,
}) => {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    if (animated) {
      // Animate lines moving
      translateX.value = withRepeat(
        withTiming(100, { duration: speed, easing: Easing.linear }),
        -1,
        false
      );

      // Pulse opacity
      opacity.value = withRepeat(
        withTiming(0.6, { duration: speed / 2, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }
  }, [animated, speed]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: direction === 'horizontal' ? translateX.value : 0 }],
    opacity: opacity.value,
  }));

  // Generate speed lines
  const lines = Array.from({ length: lineCount }, (_, i) => {
    const offset = (i / lineCount) * 100;
    const lineWidth = Math.random() * 40 + 20; // Random widths between 20-60%
    const lineHeight = direction === 'horizontal' ? 2 + Math.random() * 3 : 100;
    const topPosition = direction === 'horizontal' ? `${offset}%` : 0;

    return (
      <View
        key={i}
        style={[
          styles.line,
          {
            width: direction === 'horizontal' ? `${lineWidth}%` : lineHeight,
            height: direction === 'horizontal' ? lineHeight : `${lineWidth}%`,
            top: direction === 'horizontal' ? topPosition : 0,
            left: direction === 'horizontal' ? `${-10 + offset}%` : topPosition,
            opacity: 0.3 + Math.random() * 0.4,
          },
        ]}
      >
        <LinearGradient
          colors={[`${color}00`, color, color, `${color}00`]}
          start={{ x: 0, y: 0 }}
          end={{ x: direction === 'horizontal' ? 1 : 0, y: direction === 'horizontal' ? 0 : 1 }}
          style={styles.gradient}
        />
      </View>
    );
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]} pointerEvents="none">
      {lines}
    </Animated.View>
  );
};

/**
 * Radial action lines component (emanating from center)
 */
export const RadialActionLines: React.FC<{ color?: string; lineCount?: number }> = ({
  color = '#00d4ff',
  lineCount = 16,
}) => {
  const scale = useSharedValue(0.8);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.2, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Generate radial lines
  const lines = Array.from({ length: lineCount }, (_, i) => {
    const angle = (i * 360) / lineCount;
    const length = 80 + Math.random() * 40; // Random lengths

    return (
      <View
        key={i}
        style={[
          styles.radialLine,
          {
            width: 3,
            height: length,
            transform: [{ translateY: -length / 2 }, { rotate: `${angle}deg` }],
          },
        ]}
      >
        <LinearGradient
          colors={[`${color}00`, color]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradient}
        />
      </View>
    );
  });

  return (
    <Animated.View style={[styles.radialContainer, animatedStyle]} pointerEvents="none">
      {lines}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  line: {
    position: 'absolute',
    borderRadius: 10,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
  radialContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 200,
    height: 200,
    marginLeft: -100,
    marginTop: -100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radialLine: {
    position: 'absolute',
    borderRadius: 10,
    overflow: 'hidden',
  },
});
