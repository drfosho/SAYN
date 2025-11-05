import React from 'react';
import { StyleSheet, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface FollowButtonProps {
  isFollowing: boolean;
  onPress: () => void;
  style?: any;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Follow/Following button with SAYN's powerful aesthetic
 * Sharp animations, clear state indication
 */
export const FollowButton: React.FC<FollowButtonProps> = ({
  isFollowing,
  onPress,
  style,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.94, {
      duration: 80,
      easing: Easing.out(Easing.cubic),
    });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, {
      duration: 150,
      easing: Easing.inOut(Easing.ease),
    });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.buttonWrapper, style, animatedStyle]}
    >
      <LinearGradient
        colors={isFollowing ? ['#0d1128', '#1a1f3a'] : ['#ff0080', '#ff4500']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.button}
      >
        <Text style={styles.buttonText}>
          {isFollowing ? 'FOLLOWING' : 'FOLLOW'}
        </Text>
      </LinearGradient>
      {!isFollowing && <Animated.View style={styles.buttonGlow} />}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  buttonWrapper: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  button: {
    paddingVertical: 16,
    borderWidth: 4,
    borderColor: '#000000',
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 12,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1.5,
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  buttonGlow: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 20,
    backgroundColor: '#ff0080',
    opacity: 0.4,
    zIndex: -1,
  },
});
