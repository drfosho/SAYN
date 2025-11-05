import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { ElectricBurst } from './ElectricBurst';

interface PowerUpAnimationProps {
  onComplete?: () => void;
}

/**
 * Power Up animation with electric burst and "+1 POWER" feedback
 * Sharp, forceful, INTENSE - not cartoonish
 */
export const PowerUpAnimation: React.FC<PowerUpAnimationProps> = ({ onComplete }) => {
  const textOpacity = useSharedValue(0);
  const textY = useSharedValue(0);
  const textScale = useSharedValue(0.5);

  useEffect(() => {
    // Sharp scale up
    textScale.value = withSequence(
      withTiming(1.3, { duration: 100, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 100, easing: Easing.inOut(Easing.ease) })
    );

    // Fade in and float up
    textOpacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(1, { duration: 300 }),
      withTiming(0, { duration: 200 })
    );

    textY.value = withTiming(-40, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });

    // Cleanup after animation
    const timer = setTimeout(() => {
      onComplete?.();
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textY.value }, { scale: textScale.value }],
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Electric burst effect */}
      <View style={styles.burstContainer}>
        <ElectricBurst size={100} color="#00e5ff" />
      </View>

      {/* "+1 POWER" text */}
      <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
        <Text style={styles.powerText}>+1 POWER</Text>
      </Animated.View>

      {/* Comic impact lines */}
      <View style={styles.impactLines}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <View
            key={angle}
            style={[
              styles.impactLine,
              {
                transform: [{ rotate: `${angle}deg` }],
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 200,
    height: 200,
    marginLeft: -100,
    marginTop: -100,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  burstContainer: {
    position: 'absolute',
  },
  textContainer: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#00e5ff',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 20,
  },
  powerText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#00e5ff',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  impactLines: {
    position: 'absolute',
    width: 120,
    height: 120,
  },
  impactLine: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 4,
    height: 30,
    backgroundColor: '#00e5ff',
    marginLeft: -2,
    marginTop: -15,
    opacity: 0.6,
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
});
