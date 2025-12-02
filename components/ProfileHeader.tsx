import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PowerRing } from './PowerRing';
import { RankBadge } from './RankBadge';
import { BadgeDisplay } from './badges/BadgeDisplay';
import { VerifiedCoachBadge } from './badges/VerifiedCoachBadge';
import Avatar from './Avatar';
import { getRankFromLevel } from '@/utils/getRankFromLevel';
import { BadgeType } from '@/constants/badges';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface ProfileHeaderProps {
  avatarUrl: string;
  username: string;
  level: number;
  bio?: string;
  location?: string;
  badge?: BadgeType;
  isVerifiedCoach?: boolean;
  onBack?: () => void;
  onEdit?: () => void;
  onSettings?: () => void;
  isOwnProfile?: boolean;
  onBadgePress?: () => void;
  onCoachBadgePress?: () => void;
}

/**
 * Epic profile header with triple power rings and dynamic aura
 * Follows SAYN's intense, battle-ready aesthetic
 */
export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  avatarUrl,
  username,
  level,
  bio,
  location,
  badge,
  isVerifiedCoach = false,
  onBack,
  onEdit,
  onSettings,
  isOwnProfile = false,
  onBadgePress,
  onCoachBadgePress,
}) => {
  const particleOpacity = useSharedValue(0.3);
  const userRank = getRankFromLevel(level);

  useEffect(() => {
    // Animate background particles
    particleOpacity.value = withRepeat(
      withTiming(0.7, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const particleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: particleOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Background gradient with animated particles */}
      <LinearGradient
        colors={['#050814', '#0d1128', '#050814']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        {/* Animated energy particles */}
        <Animated.View style={[styles.particles, particleAnimatedStyle]}>
          {Array.from({ length: 20 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.particle,
                {
                  left: `${(i * 5) % 100}%`,
                  top: `${(i * 7) % 100}%`,
                  width: Math.random() * 3 + 1,
                  height: Math.random() * 3 + 1,
                },
              ]}
            />
          ))}
        </Animated.View>

        {/* Top controls */}
        <View style={styles.topControls}>
          {onBack && (
            <Pressable onPress={onBack} style={styles.controlButton}>
              <LinearGradient
                colors={['#ff0080', '#ff4500']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.controlButtonGradient}
              >
                <Text style={styles.controlButtonText}>←</Text>
              </LinearGradient>
            </Pressable>
          )}

          {isOwnProfile && onSettings && (
            <Pressable onPress={onSettings} style={styles.controlButton}>
              <View style={styles.controlButtonSolid}>
                <Text style={styles.controlButtonText}>⚙️</Text>
              </View>
            </Pressable>
          )}
        </View>

        {/* Avatar with power rings based on rank */}
        <View style={styles.avatarSection}>
          {/* Outer aura based on rank */}
          <View style={styles.auraContainer}>
            <LinearGradient
              colors={userRank.gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.aura}
            />
          </View>

          {/* Power rings based on rank tier */}
          {userRank.ringCount > 0 && (
            <View style={styles.ringContainer}>
              {Array.from({ length: userRank.ringCount }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.ringWrapper,
                    { transform: [{ scale: 1 + i * 0.15 }] },
                  ]}
                >
                  <PowerRing size={140} ringWidth={5} />
                </View>
              ))}
            </View>
          )}

          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            <Avatar
              avatarUrl={avatarUrl}
              username={username}
              size={108}
              level={level}
            />
          </View>
        </View>

        {/* User info */}
        <View style={styles.userInfo}>
          <View style={styles.usernameRow}>
            <Text style={styles.username}>{username}</Text>
            {/* Verification badge */}
            {badge && (
              <BadgeDisplay
                badgeType={badge}
                size="medium"
                onPress={onBadgePress}
              />
            )}
            {/* Verified Coach badge */}
            {isVerifiedCoach && (
              <VerifiedCoachBadge
                size="medium"
                onPress={onCoachBadgePress}
              />
            )}
          </View>
          <View style={styles.rankContainer}>
            <RankBadge rank={userRank} size="medium" animate={true} />
          </View>
          <Text style={styles.levelText}>LEVEL {level}</Text>
          {bio && <Text style={styles.bio}>{bio}</Text>}
          {location && (
            <View style={styles.locationContainer}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.location}>{location}</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300,
    borderBottomWidth: 3,
    borderBottomColor: 'rgba(0, 229, 255, 0.3)',
  },
  background: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  particles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  particle: {
    position: 'absolute',
    backgroundColor: '#00e5ff',
    borderRadius: 100,
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  controlButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonSolid: {
    flex: 1,
    backgroundColor: '#0d1128',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonText: {
    fontSize: 24,
    color: '#ffffff',
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  auraContainer: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.3,
  },
  aura: {
    flex: 1,
    borderRadius: 90,
    shadowColor: '#ff0080',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 30,
  },
  ringContainer: {
    marginBottom: -70,
  },
  ringWrapper: {
    position: 'absolute',
  },
  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    borderColor: '#000000',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 16,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userInfo: {
    alignItems: 'center',
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  username: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textShadowColor: '#000000',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
  },
  rankContainer: {
    marginBottom: 8,
  },
  levelText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#00e5ff',
    letterSpacing: 2,
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    marginBottom: 12,
  },
  bio: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d0d5e9',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationIcon: {
    fontSize: 14,
  },
  location: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6b7280',
    letterSpacing: 0.5,
  },
});
