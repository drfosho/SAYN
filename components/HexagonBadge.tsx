import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Polygon } from 'react-native-svg';

interface HexagonBadgeProps {
  rank: string;
  colors?: [string, string];
  animate?: boolean;
}

/**
 * Angular hexagon-shaped rank badge for powerful, aggressive aesthetic
 * Replaces soft rounded badges with sharp, bold power level indicators
 */
export const HexagonBadge: React.FC<HexagonBadgeProps> = ({
  rank,
  colors = ['#00e5ff', '#ff0080'],
  animate = true,
}) => {
  const glowOpacity = useSharedValue(0.6);

  useEffect(() => {
    if (animate) {
      glowOpacity.value = withRepeat(
        withTiming(1, {
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
    }
  }, [animate]);

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Outer glow layer */}
      <Animated.View style={[styles.glowLayer, glowAnimatedStyle]}>
        <View style={styles.hexagonOuter}>
          <Svg height="36" width="120" viewBox="0 0 120 36">
            <Polygon
              points="8,0 112,0 120,18 112,36 8,36 0,18"
              fill={colors[0]}
              opacity={0.3}
            />
          </Svg>
        </View>
      </Animated.View>

      {/* Main badge */}
      <View style={styles.badgeContainer}>
        <Svg height="32" width="110" viewBox="0 0 110 32" style={styles.hexagon}>
          <Polygon
            points="8,0 102,0 110,16 102,32 8,32 0,16"
            fill="url(#grad)"
            stroke="#000000"
            strokeWidth="4"
          />
        </Svg>

        {/* Gradient overlay using LinearGradient */}
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientOverlay}
        >
          <View style={styles.innerGlow} />
        </LinearGradient>

        {/* Text */}
        <View style={styles.textContainer}>
          <Text style={styles.rankText}>{rank}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    height: 36,
    width: 120,
  },
  glowLayer: {
    position: 'absolute',
    top: -2,
    left: -5,
  },
  hexagonOuter: {
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 12,
  },
  badgeContainer: {
    position: 'relative',
    height: 32,
    width: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hexagon: {
    position: 'absolute',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 4,
    left: 8,
    right: 8,
    bottom: 4,
    borderRadius: 0,
  },
  innerGlow: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 0,
  },
  textContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  rankText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    // Add text stroke effect
    textDecorationLine: 'none',
  },
});
