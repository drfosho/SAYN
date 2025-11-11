import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface XPGainToastProps {
  xpAmount: number;
  source: string;
  visible: boolean;
  onHide?: () => void;
  duration?: number; // milliseconds to show toast
}

export function XPGainToast({
  xpAmount,
  source,
  visible,
  onHide,
  duration = 3000,
}: XPGainToastProps) {
  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    if (visible) {
      // Haptic feedback
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        // Haptics not available
      }

      // Animate in
      translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, { damping: 10, stiffness: 100 });

      // Auto hide after duration
      if (onHide) {
        const hideTimer = setTimeout(() => {
          // Animate out
          translateY.value = withTiming(-100, {
            duration: 300,
            easing: Easing.in(Easing.ease),
          });
          opacity.value = withTiming(0, { duration: 300 }, (finished) => {
            if (finished) {
              runOnJS(onHide)();
            }
          });
        }, duration);

        return () => clearTimeout(hideTimer);
      }
    } else {
      // Reset values
      translateY.value = 100;
      opacity.value = 0;
      scale.value = 0.8;
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <LinearGradient
        colors={['#00e5ff', '#ff00ff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Ionicons name="flash" size={24} color="#ffffff" />
          <View style={styles.textContainer}>
            <Text style={styles.xpText}>+{xpAmount} XP</Text>
            {source && <Text style={styles.sourceText}>{source}</Text>}
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: 24,
    right: 24,
    zIndex: 9999,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textContainer: {
    flex: 1,
  },
  xpText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
  },
  sourceText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
});
