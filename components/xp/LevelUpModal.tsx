import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface LevelUpModalProps {
  visible: boolean;
  oldLevel: number;
  newLevel: number;
  levelsGained: number;
  onClose: () => void;
}

export function LevelUpModal({
  visible,
  oldLevel,
  newLevel,
  levelsGained,
  onClose,
}: LevelUpModalProps) {
  const scale = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const levelOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Haptic feedback
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        // Haptics not available
      }

      // Animate entrance
      scale.value = withSpring(1, { damping: 10, stiffness: 100 });
      glowOpacity.value = withTiming(1, { duration: 400 });
      levelOpacity.value = withDelay(200, withTiming(1, { duration: 300 }));
      textOpacity.value = withDelay(400, withTiming(1, { duration: 300 }));

      // Pulse animation for glow
      glowOpacity.value = withSequence(
        withTiming(1, { duration: 400 }),
        withSequence(
          withTiming(0.7, { duration: 600 }),
          withTiming(1, { duration: 600 })
        )
      );
    } else {
      // Reset animations
      scale.value = 0;
      glowOpacity.value = 0;
      levelOpacity.value = 0;
      textOpacity.value = 0;
    }
  }, [visible]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const levelStyle = useAnimatedStyle(() => ({
    opacity: levelOpacity.value,
    transform: [
      {
        scale: withSpring(levelOpacity.value, {
          damping: 8,
          stiffness: 100,
        }),
      },
    ],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Glow Effect */}
          <Animated.View style={[styles.glow, glowStyle]} />

          {/* Icon */}
          <Animated.View style={iconStyle}>
            <View style={styles.iconCircle}>
              <Ionicons name="flash" size={60} color="#ffffff" />
            </View>
          </Animated.View>

          {/* Level Number */}
          <Animated.View style={levelStyle}>
            <Text style={styles.levelText}>LEVEL {newLevel}</Text>
          </Animated.View>

          {/* Message */}
          <Animated.View style={textStyle}>
            <View style={styles.messageContainer}>
              <Text style={styles.messageText}>LEVEL UP!</Text>
              {levelsGained > 1 && (
                <Text style={styles.subMessage}>
                  +{levelsGained} Levels Gained!
                </Text>
              )}
              <Text style={styles.description}>
                You're getting stronger. Keep pushing!
              </Text>
            </View>
          </Animated.View>

          {/* Continue Button */}
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.buttonWrapper,
              pressed && styles.buttonPressed,
            ]}
          >
            <LinearGradient
              colors={['#00e5ff', '#ff00ff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#00e5ff',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 60,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#00e5ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
  },
  levelText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
    marginBottom: 24,
    textShadowColor: '#00e5ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  messageText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: 2,
  },
  subMessage: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ff00ff',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
  },
  button: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
  },
  buttonPressed: {
    opacity: 0.7,
  },
});
