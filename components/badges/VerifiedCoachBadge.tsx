import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface VerifiedCoachBadgeProps {
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  showLabel?: boolean;
}

const SIZES = {
  small: { container: 28, icon: 14, fontSize: 8 },
  medium: { container: 48, icon: 22, fontSize: 10 },
  large: { container: 70, icon: 34, fontSize: 14 },
};

export const VerifiedCoachBadge: React.FC<VerifiedCoachBadgeProps> = ({
  size = 'medium',
  onPress,
  showLabel = false,
}) => {
  const shimmer = useSharedValue(0);
  const pulse = useSharedValue(1);
  const dimensions = SIZES[size];

  useEffect(() => {
    // Gold shimmer effect
    shimmer.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Gentle pulse
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const shimmerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + shimmer.value * 0.4,
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const BadgeContent = () => (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.container, pulseAnimatedStyle]}>
        {/* Hexagon Background with Gold Gradient */}
        <View
          style={[
            styles.hexagon,
            {
              width: dimensions.container,
              height: dimensions.container,
            },
          ]}
        >
          {/* Outer glow */}
          <View
            style={[
              styles.glow,
              {
                width: dimensions.container + 10,
                height: dimensions.container + 10,
                shadowColor: '#FFB800',
              },
            ]}
          />

          {/* Main hexagon shape with gold gradient */}
          <LinearGradient
            colors={['#FFB800', '#FF8C00', '#FFD700']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.hexagonInner,
              {
                width: dimensions.container,
                height: dimensions.container,
                borderRadius: dimensions.container * 0.15,
              },
            ]}
          >
            {/* Shimmer overlay */}
            <Animated.View
              style={[
                StyleSheet.absoluteFillObject,
                styles.shimmerOverlay,
                { borderRadius: dimensions.container * 0.15 },
                shimmerAnimatedStyle,
              ]}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.6)', 'rgba(255,255,255,0)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
            </Animated.View>

            {/* Inner dark background */}
            <View
              style={[
                styles.hexagonContent,
                {
                  width: dimensions.container - 6,
                  height: dimensions.container - 6,
                  borderRadius: (dimensions.container - 6) * 0.15,
                },
              ]}
            >
              {/* Coach Icon (clipboard with checkmark) */}
              <View style={styles.iconContainer}>
                <Text style={[styles.icon, { fontSize: dimensions.icon }]}>📋</Text>
                <View style={[styles.checkmark, { width: dimensions.icon * 0.5, height: dimensions.icon * 0.5 }]}>
                  <Text style={[styles.checkmarkText, { fontSize: dimensions.icon * 0.4 }]}>✓</Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* Black border */}
          <View
            style={[
              styles.border,
              {
                width: dimensions.container,
                height: dimensions.container,
                borderRadius: dimensions.container * 0.15,
                borderWidth: size === 'small' ? 2 : 4,
              },
            ]}
          />
        </View>
      </Animated.View>

      {/* Label */}
      {showLabel && size !== 'small' && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { fontSize: dimensions.fontSize }]}>VERIFIED COACH</Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
        <BadgeContent />
      </Pressable>
    );
  }

  return <BadgeContent />;
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  hexagon: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    backgroundColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 16,
    borderRadius: 100,
  },
  hexagonInner: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  shimmerOverlay: {
    position: 'absolute',
  },
  hexagonContent: {
    backgroundColor: '#0a0f1e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  border: {
    position: 'absolute',
    borderColor: '#000000',
    backgroundColor: 'transparent',
  },
  iconContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    color: '#FFB800',
  },
  checkmark: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#00ff88',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#000000',
    fontWeight: '900',
  },
  labelContainer: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFB800',
  },
  label: {
    color: '#FFB800',
    fontWeight: '900',
    letterSpacing: 1.5,
  },
});
