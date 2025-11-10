import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, Pressable, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { PowerRing } from './PowerRing';
import { RankBadge } from './RankBadge';
import { ElectricBurst } from './ElectricBurst';
import { ScanLines } from './ScanLines';
import { PowerUpAnimation } from './PowerUpAnimation';
import { BadgeDisplay } from './badges/BadgeDisplay';
import { usePowerUp } from '@/hooks/usePowerUp';
import { getRankFromLevel } from '@/utils/getRankFromLevel';
import { BadgeType } from '@/constants/badges';

export interface Post {
  id: string;
  username: string;
  level: number;
  avatarUrl: string;
  content: string;
  powerLevel: number;
  isPoweredUp?: boolean;
  badge?: BadgeType;
}

interface PostCardProps {
  post: Post;
  index: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const PostCard: React.FC<PostCardProps> = ({ post, index }) => {
  const { initializePowerUp, getPowerUpCount, isPoweredUpByUser, togglePowerUp } = usePowerUp();

  // Initialize power up data from post prop
  useEffect(() => {
    initializePowerUp(post.id, post.powerLevel, post.isPoweredUp || false);
  }, [post.id, post.powerLevel, post.isPoweredUp, initializePowerUp]);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(40);
  const scale = useSharedValue(0.9);
  const buttonScale = useSharedValue(1);
  const flashOpacity = useSharedValue(0);
  const shakeX = useSharedValue(0);
  const powerFeedbackOpacity = useSharedValue(0);
  const powerFeedbackY = useSharedValue(0);
  const [showElectricBurst, setShowElectricBurst] = useState(false);
  const [showButtonBurst, setShowButtonBurst] = useState(false);
  const [showPowerUpAnimation, setShowPowerUpAnimation] = useState(false);

  const isPoweredUp = isPoweredUpByUser(post.id);
  const powerUpCount = getPowerUpCount(post.id);
  const userRank = getRankFromLevel(post.level);

  useEffect(() => {
    const delay = index * 100;
    setTimeout(() => {
      // Show electric burst when card slams in
      setShowElectricBurst(true);
      setTimeout(() => setShowElectricBurst(false), 300);

      // SHARP, FORCEFUL entrance - no bounce
      opacity.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      });
      translateY.value = withSpring(0, {
        damping: 12, // More aggressive
        stiffness: 150, // Forceful
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
        { translateX: shakeX.value },
      ],
    };
  });

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  const flashAnimatedStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  const powerFeedbackAnimatedStyle = useAnimatedStyle(() => ({
    opacity: powerFeedbackOpacity.value,
    transform: [{ translateY: powerFeedbackY.value }],
  }));

  const handlePressIn = () => {
    // Quick, aggressive press
    buttonScale.value = withTiming(0.92, {
      duration: 80,
      easing: Easing.out(Easing.cubic),
    });
  };

  const handlePressOut = () => {
    // Sharp bounce back - QUICK (150ms total)
    buttonScale.value = withSequence(
      withTiming(1.08, { duration: 80, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 70, easing: Easing.inOut(Easing.ease) })
    );
  };

  const handlePowerUp = async () => {
    const didPowerUp = await togglePowerUp(post.id);

    if (didPowerUp) {
      // Only show animation when powering up (not unpowering)
      console.log(`Powered up ${post.username}!`);

      // Brief white screen flash (100ms)
      flashOpacity.value = 0.1;
      flashOpacity.value = withTiming(0, { duration: 100 });

      // Subtle screen shake
      shakeX.value = withSequence(
        withTiming(4, { duration: 40 }),
        withTiming(-4, { duration: 40 }),
        withTiming(3, { duration: 40 }),
        withTiming(-3, { duration: 40 }),
        withTiming(0, { duration: 40 })
      );

      // Show PowerUpAnimation component
      setShowPowerUpAnimation(true);
      setTimeout(() => setShowPowerUpAnimation(false), 700);

      // Trigger electric burst effect
      setShowButtonBurst(true);
      setTimeout(() => setShowButtonBurst(false), 300);
    } else {
      console.log(`Unpowered up ${post.username}`);
    }
  };

  return (
    <Animated.View style={[styles.cardContainer, cardAnimatedStyle]}>
      {/* PowerUpAnimation overlay */}
      {showPowerUpAnimation && <PowerUpAnimation />}

      {/* Electric burst when card slams in */}
      {showElectricBurst && (
        <View style={styles.burstContainer}>
          <ElectricBurst size={90} color="#00e5ff" />
        </View>
      )}

      {/* Screen flash overlay */}
      <Animated.View style={[styles.flashOverlay, flashAnimatedStyle]} pointerEvents="none" />

      <LinearGradient
        colors={['#0d1128', '#050814', '#0d1128']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Scan lines for tech intensity */}
        <ScanLines opacity={0.05} lineHeight={2} spacing={4} />

        {/* Subtle vignette for depth */}
        <View style={styles.vignette} />

        {/* User info section */}
        <View style={styles.userSection}>
          <View style={styles.avatarContainer}>
            <PowerRing size={70} ringWidth={5} />
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: post.avatarUrl }}
                style={styles.avatar}
              />
            </View>
          </View>

          <View style={styles.userInfo}>
            <View style={styles.usernameRow}>
              <Text style={styles.username}>{post.username}</Text>
              {/* Verification badge (Natural/Enhanced) */}
              {post.badge && (
                <BadgeDisplay badgeType={post.badge} size="small" />
              )}
            </View>
            {/* Rank badge */}
            <RankBadge rank={userRank} size="small" animate={false} />
          </View>
        </View>

        {/* Content section */}
        <View style={styles.contentSection}>
          <Text style={styles.content}>{post.content}</Text>
        </View>

        {/* Power Up button */}
        <View>
          {/* "Powered Up by you" indicator */}
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
            {/* Electric burst effect on press */}
            {showButtonBurst && (
              <>
                <View style={[styles.burstEffect, { top: -35, left: '15%' }]}>
                  <ElectricBurst size={60} color="#00e5ff" />
                </View>
                <View style={[styles.burstEffect, { top: -30, right: '15%' }]}>
                  <ElectricBurst size={50} color="#ff0080" />
                </View>
              </>
            )}

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
            {/* Button glow effect (only show when not powered up) */}
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
    borderRadius: 14, // Selective rounding (12-16px max)
    overflow: 'visible',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 8, height: 8 }, // Deeper, longer shadows
        shadowOpacity: 0.8,
        shadowRadius: 0,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  burstContainer: {
    position: 'absolute',
    top: -30,
    right: -30,
    zIndex: 10,
  },
  flashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    zIndex: 100,
    borderRadius: 14,
  },
  card: {
    borderRadius: 14,
    padding: 22,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 5, // Thicker borders (4-6px)
    borderColor: '#000000',
  },
  vignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    // Radial gradient effect (vignette)
    borderRadius: 14,
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
    borderWidth: 4, // Bolder border
    borderColor: '#000000',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userInfo: {
    flex: 1,
    gap: 8,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  username: {
    fontSize: 19,
    fontWeight: '900', // Heavier weight
    color: '#ffffff',
    letterSpacing: 1,
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  contentSection: {
    marginBottom: 18,
  },
  content: {
    fontSize: 16,
    color: '#d0d5e9', // Slightly brighter for contrast
    lineHeight: 24,
    letterSpacing: 0.3,
  },
  powerUpButtonWrapper: {
    position: 'relative',
    borderRadius: 14,
    overflow: 'visible',
  },
  burstEffect: {
    position: 'absolute',
    zIndex: 10,
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
  powerUpButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 26,
    borderRadius: 14,
    gap: 10,
    borderWidth: 5, // Thicker border
    borderColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 6 }, // Deeper shadow
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 16,
  },
  powerUpText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2.5,
    textShadowColor: '#000000',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
  },
  powerLevelBadge: {
    backgroundColor: '#000000',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#00e5ff',
  },
  powerLevel: {
    fontSize: 15,
    fontWeight: '900',
    color: '#00e5ff',
    textShadowColor: '#00e5ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  buttonGlow: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 22,
    backgroundColor: '#ff0080',
    opacity: 0.5, // More intense glow
    zIndex: -1,
    shadowColor: '#ff0080',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20, // Sharper, more intense glow
  },
});
