import React, { useEffect } from 'react';
import { Image, View, StyleSheet, ImageStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

interface AnimatedSAYNLogoProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  animationType?: 'pulse' | 'entrance' | 'glow';
}

/**
 * AnimatedSAYNLogo - Animated version of SAYN logo for loading screens,
 * level ups, and special moments
 */
export const AnimatedSAYNLogo: React.FC<AnimatedSAYNLogoProps> = ({
  size = 'large',
  animationType = 'pulse',
}) => {
  const dimensions = {
    small: 40,
    medium: 80,
    large: 120,
    xlarge: 180,
  }[size];

  const scale = useSharedValue(animationType === 'entrance' ? 0 : 1);
  const opacity = useSharedValue(animationType === 'entrance' ? 0 : 1);
  const glowScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.5);

  useEffect(() => {
    if (animationType === 'entrance') {
      // Fade in + scale up entrance animation
      opacity.value = withDelay(
        200,
        withTiming(1, {
          duration: 800,
          easing: Easing.out(Easing.cubic),
        })
      );
      scale.value = withDelay(
        200,
        withTiming(1, {
          duration: 800,
          easing: Easing.out(Easing.back(1.5)),
        })
      );
    }

    if (animationType === 'pulse' || animationType === 'glow') {
      // Pulsing glow effect
      glowScale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // Infinite
        true
      );

      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.4, { duration: 1200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }

    if (animationType === 'pulse') {
      // Logo also pulses slightly
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [animationType]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: glowOpacity.value,
  }));

  const logoImageStyle: ImageStyle = {
    width: dimensions,
    height: dimensions,
    resizeMode: 'contain',
  };

  return (
    <View style={styles.container}>
      <Animated.View style={logoStyle}>
        <Image
          source={require('@/assets/images/SAYN LOGO.png')}
          style={logoImageStyle}
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.glow,
          {
            width: dimensions * 1.5,
            height: dimensions * 1.5,
          },
          glowStyle,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(0, 212, 255, 0.15)',
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 50,
    zIndex: -1,
  },
});
