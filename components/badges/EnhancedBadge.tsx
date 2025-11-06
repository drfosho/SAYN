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
import { BADGE_DEFINITIONS } from '@/constants/badges';

interface EnhancedBadgeProps {
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  showLabel?: boolean;
}

const SIZES = {
  small: { container: 24, icon: 12, fontSize: 8 },
  medium: { container: 40, icon: 20, fontSize: 10 },
  large: { container: 60, icon: 30, fontSize: 14 },
};

export const EnhancedBadge: React.FC<EnhancedBadgeProps> = ({
  size = 'medium',
  onPress,
  showLabel = false,
}) => {
  const pulse = useSharedValue(1);
  const { color, accentColor, name } = BADGE_DEFINITIONS.enhanced;
  const dimensions = SIZES[size];

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const BadgeContent = () => (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {/* Hexagon Background with Gradient */}
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
                width: dimensions.container + 8,
                height: dimensions.container + 8,
                shadowColor: color,
              },
            ]}
          />

          {/* Main hexagon shape with gradient */}
          <LinearGradient
            colors={[color, accentColor]}
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
              {/* Star + Lightning Icon */}
              <View style={styles.iconContainer}>
                <Text style={[styles.icon, { fontSize: dimensions.icon }]}>⚡</Text>
                <Text style={[styles.starIcon, { fontSize: dimensions.icon * 0.6 }]}>
                  ★
                </Text>
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
                borderWidth: size === 'small' ? 2 : 3,
              },
            ]}
          />
        </View>
      </Animated.View>

      {/* Label */}
      {showLabel && size !== 'small' && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { fontSize: dimensions.fontSize }]}>{name}</Text>
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
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 12,
    borderRadius: 100,
  },
  hexagonInner: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  icon: {
    color: '#9D4EDD',
    fontWeight: '900',
  },
  starIcon: {
    color: '#FF6B35',
    marginTop: -3,
  },
  labelContainer: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(157, 78, 221, 0.15)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#9D4EDD',
  },
  label: {
    color: '#9D4EDD',
    fontWeight: '900',
    letterSpacing: 1,
  },
});
