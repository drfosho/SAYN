import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface PowerRingProps {
  size?: number;
  ringWidth?: number;
  colors?: readonly [string, string, ...string[]];
}

export const PowerRing: React.FC<PowerRingProps> = ({
  size = 70,
  ringWidth = 5,
  colors = ['#00e5ff', '#ff0080', '#ff4500', '#00e5ff'] as const,
}) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Constant rotation - no easing, pure power
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1800, // Fast, constant speed
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer glow effect */}
      <View
        style={[
          styles.outerGlow,
          {
            width: size + 8,
            height: size + 8,
            borderRadius: (size + 8) / 2,
          },
        ]}
      />

      <Animated.View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          animatedStyle,
        ]}
      >
        {/* Black border (outer) */}
        <View
          style={[
            styles.blackBorder,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: 3,
            },
          ]}
        />

        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradient,
            {
              width: size - 6,
              height: size - 6,
              borderRadius: (size - 6) / 2,
            },
          ]}
        />

        {/* Inner black border */}
        <View
          style={[
            styles.inner,
            {
              width: size - ringWidth * 2 - 6,
              height: size - ringWidth * 2 - 6,
              borderRadius: (size - ringWidth * 2 - 6) / 2,
              borderWidth: 2,
              borderColor: '#000000',
            },
          ]}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerGlow: {
    position: 'absolute',
    backgroundColor: '#00e5ff',
    opacity: 0.4,
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 18, // Sharper, more intense glow
    elevation: 18,
  },
  ring: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  blackBorder: {
    position: 'absolute',
    borderColor: '#000000',
    backgroundColor: 'transparent',
  },
  gradient: {
    position: 'absolute',
  },
  inner: {
    backgroundColor: '#050814', // Darker background to match theme
    borderWidth: 2,
  },
});
