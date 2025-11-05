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
  ringWidth = 3,
  colors = ['#00d4ff', '#ff0099', '#ff6b00', '#00d4ff'] as const,
}) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 3000,
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
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradient,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        />
        <View
          style={[
            styles.inner,
            {
              width: size - ringWidth * 2,
              height: size - ringWidth * 2,
              borderRadius: (size - ringWidth * 2) / 2,
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
  ring: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    position: 'absolute',
  },
  inner: {
    backgroundColor: '#0a0e27',
  },
});
