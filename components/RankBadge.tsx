import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { RankDefinition } from '@/constants/ranks';

interface RankBadgeProps {
  rank: RankDefinition;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  animate?: boolean;
}

/**
 * RankBadge - Angular, powerful rank indicator
 * Shows rank tier with color-coded styling and optional glow animation
 */
export const RankBadge: React.FC<RankBadgeProps> = ({
  rank,
  size = 'medium',
  showLabel = true,
  animate = true,
}) => {
  const glowOpacity = useSharedValue(0.6);

  useEffect(() => {
    if (animate) {
      glowOpacity.value = withRepeat(
        withTiming(1, {
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
    }
  }, [animate]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const sizeStyles = {
    small: {
      container: styles.containerSmall,
      text: styles.textSmall,
      icon: styles.iconSmall,
    },
    medium: {
      container: styles.containerMedium,
      text: styles.textMedium,
      icon: styles.iconMedium,
    },
    large: {
      container: styles.containerLarge,
      text: styles.textLarge,
      icon: styles.iconLarge,
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <View style={[styles.wrapper, currentSize.container]}>
      {/* Animated glow effect */}
      {animate && (
        <Animated.View
          style={[
            styles.glow,
            glowStyle,
            {
              backgroundColor: rank.glowColor,
              shadowColor: rank.glowColor,
            },
          ]}
        />
      )}

      {/* Angular badge container */}
      <LinearGradient
        colors={rank.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.badge}
      >
        <View style={styles.content}>
          <Text style={[styles.icon, currentSize.icon]}>{rank.icon}</Text>
          {showLabel && <Text style={[styles.text, currentSize.text]}>{rank.name}</Text>}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    borderRadius: 10,
    overflow: 'visible',
  },
  containerSmall: {
    height: 24,
    minWidth: 80,
  },
  containerMedium: {
    height: 32,
    minWidth: 110,
  },
  containerLarge: {
    height: 44,
    minWidth: 150,
  },
  glow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 14,
    opacity: 0.6,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    zIndex: -1,
  },
  badge: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 4,
    borderColor: '#000000',
    paddingHorizontal: 10,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flex: 1,
  },
  icon: {
    fontSize: 14,
  },
  iconSmall: {
    fontSize: 12,
  },
  iconMedium: {
    fontSize: 14,
  },
  iconLarge: {
    fontSize: 18,
  },
  text: {
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1.5,
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  textSmall: {
    fontSize: 9,
  },
  textMedium: {
    fontSize: 11,
  },
  textLarge: {
    fontSize: 14,
  },
});
