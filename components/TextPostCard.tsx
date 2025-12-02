import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Platform, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import { PowerRing } from './PowerRing';
import { RankBadge } from './RankBadge';
import { ScanLines } from './ScanLines';
import Avatar from './Avatar';
import { usePowerUp } from '@/hooks/usePowerUp';
import { getRankFromLevel } from '@/utils/getRankFromLevel';

export interface TextPost {
  id: string;
  username: string;
  level: number;
  avatarUrl: string;
  content: string;
  powerLevel: number;
  isPoweredUp?: boolean;
  commentCount?: number;
}

interface TextPostCardProps {
  post: TextPost;
  index: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(TouchableOpacity);

/**
 * TextPostCard - Specialized card for text-only posts
 * Distinct styling from image posts with gradient background
 * Text posts are "Just Sharing" (0 XP) - focus on community expression
 */
export const TextPostCard: React.FC<TextPostCardProps> = ({ post, index }) => {
  const { initializePowerUp, getPowerUpCount, isPoweredUpByUser, togglePowerUp } = usePowerUp();

  useEffect(() => {
    initializePowerUp(post.id, post.powerLevel, post.isPoweredUp || false);
  }, [post.id, post.powerLevel, post.isPoweredUp, initializePowerUp]);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(40);
  const scale = useSharedValue(0.9);
  const buttonScale = useSharedValue(1);

  const isPoweredUp = isPoweredUpByUser(post.id);
  const powerUpCount = getPowerUpCount(post.id);
  const userRank = getRankFromLevel(post.level);

  useEffect(() => {
    const delay = index * 100;
    setTimeout(() => {
      opacity.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      });
      translateY.value = withSpring(0, {
        damping: 12,
        stiffness: 150,
        mass: 1,
      });
      scale.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      });
    }, delay);
  }, [opacity, translateY, scale, index]);

  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  const handlePowerUp = async () => {
    await togglePowerUp(post.id);
  };

  const handlePressIn = () => {
    buttonScale.value = withTiming(0.92, {
      duration: 80,
      easing: Easing.out(Easing.cubic),
    });
  };

  const handlePressOut = () => {
    buttonScale.value = withTiming(1.08, { duration: 80 });
    buttonScale.value = withTiming(1, { duration: 70 });
  };

  return (
    <Animated.View style={[styles.cardContainer, cardAnimatedStyle]}>
      <LinearGradient
        colors={['#0d1128', '#050814', '#0d1128']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <ScanLines opacity={0.05} lineHeight={2} spacing={4} />

        {/* User info section */}
        <View style={styles.userSection}>
          <View style={styles.avatarContainer}>
            <PowerRing size={70} ringWidth={5} />
            <View style={styles.avatarWrapper}>
              <Avatar
                avatarUrl={post.avatarUrl}
                username={post.username}
                size={50}
                level={post.level}
              />
            </View>
          </View>

          <View style={styles.userInfo}>
            <View style={styles.usernameRow}>
              <Text style={styles.username}>{post.username}</Text>
              {/* Just Sharing badge */}
              <View style={styles.textPostBadge}>
                <Text style={styles.textPostBadgeText}>💭</Text>
              </View>
            </View>
            <RankBadge rank={userRank} size="small" animate={false} />
          </View>
        </View>

        {/* Text Content - Main focus */}
        <View style={styles.textContentContainer}>
          <LinearGradient
            colors={['rgba(0, 212, 255, 0.08)', 'rgba(0, 212, 255, 0.03)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.textContent}
          >
            <Text style={styles.contentText}>{post.content}</Text>
          </LinearGradient>
        </View>

        {/* Comments section */}
        <TouchableOpacity
          onPress={() => router.push(`/comments/${post.id}`)}
          style={styles.commentsSection}
        >
          <MessageCircle size={18} color="rgba(255,255,255,0.6)" strokeWidth={2} />
          <Text style={styles.commentsText}>
            {!post.commentCount || post.commentCount === 0
              ? 'Be the first to comment'
              : `${post.commentCount} ${post.commentCount === 1 ? 'comment' : 'comments'}`}
          </Text>
        </TouchableOpacity>

        {/* Power Up button */}
        <View>
          {isPoweredUp && (
            <View style={styles.poweredUpIndicator}>
              <Text style={styles.poweredUpText}>⚡ POWERED UP BY YOU</Text>
            </View>
          )}

          <AnimatedPressable
            onPress={handlePowerUp}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[styles.powerUpButtonWrapper, buttonAnimatedStyle]}
          >
            <LinearGradient
              colors={
                isPoweredUp
                  ? ['#0d1128', '#1a1f3a']
                  : ['#ff0080', '#ff4500']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.powerUpButton}
            >
              <Text style={styles.powerUpText}>
                {isPoweredUp ? '⚡ POWERED UP' : '⚡ POWER UP'}
              </Text>
              <View style={styles.powerLevelBadge}>
                <Text style={styles.powerLevel}>{powerUpCount}</Text>
              </View>
            </LinearGradient>
            {!isPoweredUp && <View style={styles.buttonGlow} />}
          </AnimatedPressable>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 16,
    marginVertical: 14,
    borderRadius: 14,
    overflow: 'visible',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 0.8,
        shadowRadius: 0,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  card: {
    borderRadius: 14,
    padding: 22,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 5,
    borderColor: '#000000',
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
    borderWidth: 4,
    borderColor: '#000000',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userInfo: {
    flex: 1,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  username: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  textPostBadge: {
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#00d4ff',
  },
  textPostBadgeText: {
    fontSize: 12,
  },
  textContentContainer: {
    marginBottom: 18,
  },
  textContent: {
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#00d4ff',
    borderWidth: 2,
    borderColor: 'rgba(0, 212, 255, 0.2)',
  },
  contentText: {
    fontSize: 17,
    lineHeight: 28,
    color: '#ffffff',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  commentsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  commentsText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  poweredUpIndicator: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#00e5ff',
    marginBottom: 8,
  },
  poweredUpText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#00e5ff',
    letterSpacing: 1.5,
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  powerUpButtonWrapper: {
    position: 'relative',
    borderRadius: 14,
    overflow: 'visible',
  },
  powerUpButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 26,
    borderRadius: 14,
    gap: 10,
    borderWidth: 5,
    borderColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 12,
  },
  powerUpText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  powerLevelBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ffffff',
    minWidth: 40,
    alignItems: 'center',
  },
  powerLevel: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  buttonGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 18,
    backgroundColor: '#ff0080',
    opacity: 0.3,
    zIndex: -1,
  },
});
