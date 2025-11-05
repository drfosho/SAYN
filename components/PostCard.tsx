import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Image, Pressable, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { PowerRing } from './PowerRing';

export interface Post {
  id: string;
  username: string;
  rank: string;
  avatarUrl: string;
  content: string;
  powerLevel: number;
}

interface PostCardProps {
  post: Post;
  index: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const PostCard: React.FC<PostCardProps> = ({ post, index }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    const delay = index * 100;
    setTimeout(() => {
      opacity.value = withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.ease),
      });
      translateY.value = withTiming(0, {
        duration: 500,
        easing: Easing.out(Easing.ease),
      });
    }, delay);
  }, [opacity, translateY, index]);

  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.95, {
      damping: 15,
      stiffness: 300,
    });
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });
  };

  const handlePowerUp = () => {
    console.log(`Power up for ${post.username}!`);
  };

  return (
    <Animated.View style={[styles.cardContainer, cardAnimatedStyle]}>
      <LinearGradient
        colors={['#0a0e27', '#1a1f3a', '#0a0e27']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Glow effect wrapper */}
        <View style={styles.glowContainer}>
          <View style={styles.glow} />
        </View>

        {/* User info section */}
        <View style={styles.userSection}>
          <View style={styles.avatarContainer}>
            <PowerRing size={70} ringWidth={3} />
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: post.avatarUrl }}
                style={styles.avatar}
              />
            </View>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.username}>{post.username}</Text>
            <LinearGradient
              colors={['#00d4ff', '#ff0099']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.rankBadge}
            >
              <Text style={styles.rankText}>{post.rank}</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Content section */}
        <View style={styles.contentSection}>
          <Text style={styles.content}>{post.content}</Text>
        </View>

        {/* Power Up button */}
        <AnimatedPressable
          onPress={handlePowerUp}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[styles.powerUpButtonWrapper, buttonAnimatedStyle]}
        >
          <LinearGradient
            colors={['#ff0099', '#ff6b00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.powerUpButton}
          >
            <Text style={styles.powerUpText}>⚡ POWER UP</Text>
            <Text style={styles.powerLevel}>{post.powerLevel}</Text>
          </LinearGradient>
          {/* Button glow effect */}
          <View style={styles.buttonGlow} />
        </AnimatedPressable>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 20,
    overflow: 'visible',
    ...Platform.select({
      ios: {
        shadowColor: '#00d4ff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.2)',
    overflow: 'hidden',
  },
  glowContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    bottom: -50,
    backgroundColor: 'transparent',
    borderRadius: 20,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    width: 70,
    height: 70,
    marginRight: 16,
  },
  avatarWrapper: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#1a1f3a',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userInfo: {
    flex: 1,
    gap: 6,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  rankBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rankText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1,
  },
  contentSection: {
    marginBottom: 16,
  },
  content: {
    fontSize: 16,
    color: '#c0c5d9',
    lineHeight: 24,
  },
  powerUpButtonWrapper: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'visible',
  },
  powerUpButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
  },
  powerUpText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1.5,
  },
  powerLevel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  buttonGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 20,
    backgroundColor: '#ff0099',
    opacity: 0.3,
    zIndex: -1,
  },
});
