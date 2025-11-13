import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface VerifiedPostBadgeProps {
  size?: 'small' | 'medium';
}

const SIZES = {
  small: { container: 28, icon: 14, fontSize: 8 },
  medium: { container: 40, icon: 20, fontSize: 10 },
};

/**
 * Badge shown on posts that passed AI authenticity verification
 * Displays a checkmark shield in the corner of verified post images
 */
export const VerifiedPostBadge: React.FC<VerifiedPostBadgeProps> = ({
  size = 'small',
}) => {
  const pulse = useSharedValue(1);
  const glow = useSharedValue(0.6);
  const dimensions = SIZES[size];

  useEffect(() => {
    // Subtle pulse animation
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Glow animation
    glow.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {/* Glow effect */}
      <Animated.View
        style={[
          styles.glow,
          glowStyle,
          {
            width: dimensions.container + 8,
            height: dimensions.container + 8,
          },
        ]}
      />

      {/* Shield background */}
      <View
        style={[
          styles.shield,
          {
            width: dimensions.container,
            height: dimensions.container,
          },
        ]}
      >
        {/* Inner content */}
        <View style={styles.innerShield}>
          <Text style={[styles.checkmark, { fontSize: dimensions.icon }]}>✓</Text>
        </View>

        {/* Black border */}
        <View
          style={[
            styles.border,
            {
              width: dimensions.container,
              height: dimensions.container,
              borderWidth: size === 'small' ? 2 : 3,
            },
          ]}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    backgroundColor: '#00ff88',
    borderRadius: 100,
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 12,
  },
  shield: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00ff88',
    borderRadius: 100,
  },
  innerShield: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0f1e',
    borderRadius: 100,
    margin: 3,
  },
  border: {
    position: 'absolute',
    borderColor: '#000000',
    backgroundColor: 'transparent',
    borderRadius: 100,
  },
  checkmark: {
    color: '#00ff88',
    fontWeight: '900',
    textShadowColor: '#00ff88',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
});
