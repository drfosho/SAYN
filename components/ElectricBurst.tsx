import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

interface ElectricBurstProps {
  size?: number;
  color?: string;
  boltCount?: number;
}

/**
 * Sharp electric energy burst effect - NOT cute sparkles
 * Electric bolts radiate out with aggressive, powerful energy
 */
export const ElectricBurst: React.FC<ElectricBurstProps> = ({
  size = 60,
  color = '#00e5ff',
  boltCount = 8,
}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Sharp burst animation
    scale.value = withSequence(
      withTiming(1.3, { duration: 100, easing: Easing.out(Easing.cubic) }),
      withTiming(0, { duration: 150, easing: Easing.in(Easing.cubic) })
    );
    opacity.value = withSequence(
      withTiming(1, { duration: 50 }),
      withTiming(0, { duration: 200 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  // Generate sharp electric bolts
  const bolts = Array.from({ length: boltCount }, (_, i) => {
    const angle = (i * 360) / boltCount;
    const boltLength = size * 0.5;

    return (
      <View
        key={i}
        style={[
          styles.bolt,
          {
            width: 3,
            height: boltLength,
            backgroundColor: color,
            transform: [
              { translateY: -boltLength / 2 },
              { rotate: `${angle}deg` },
            ],
          },
        ]}
      >
        {/* Lightning tip */}
        <View
          style={[
            styles.boltTip,
            {
              width: 0,
              height: 0,
              borderLeftWidth: 5,
              borderRightWidth: 5,
              borderBottomWidth: 8,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: color,
            },
          ]}
        />
      </View>
    );
  });

  return (
    <Animated.View style={[styles.container, { width: size, height: size }, animatedStyle]}>
      {/* Central flash */}
      <View
        style={[
          styles.flash,
          {
            width: size * 0.3,
            height: size * 0.3,
            backgroundColor: '#ffffff',
            borderRadius: (size * 0.3) / 2,
          },
        ]}
      />

      {/* Electric bolts */}
      <View style={styles.boltContainer}>{bolts}</View>

      {/* Outer glow ring */}
      <View
        style={[
          styles.glowRing,
          {
            width: size * 0.8,
            height: size * 0.8,
            borderRadius: (size * 0.8) / 2,
            borderColor: color,
            borderWidth: 2,
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
  flash: {
    position: 'absolute',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 15,
  },
  boltContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  bolt: {
    position: 'absolute',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 8,
  },
  boltTip: {
    position: 'absolute',
    top: -8,
    left: -2.5,
  },
  glowRing: {
    position: 'absolute',
    opacity: 0.6,
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 20,
  },
});
