import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import DefaultAvatar from './profile/DefaultAvatar';
import { getRankColor } from '@/utils/getRankColor';
import { getRankFromLevel } from '@/utils/getRankFromLevel';

interface AvatarProps {
  avatarUrl?: string | null;
  username?: string;
  size?: number;
  level?: number;
  rank?: string;
  showRankRing?: boolean;
  style?: any;
}

/**
 * Reusable Avatar component that shows user avatar or SAYN-branded default
 * Automatically falls back to DefaultAvatar when no avatarUrl is provided
 *
 * Standard sizes:
 * - Profile screen (own): 120px
 * - Profile screen (other): 100px
 * - Post cards: 40px
 * - Comments: 36px
 * - Leaderboard: 48px
 * - Search results: 44px
 * - Notifications: 40px
 * - Small badges/mentions: 24px
 */
const Avatar: React.FC<AvatarProps> = ({
  avatarUrl,
  username,
  size = 120,
  level,
  rank,
  showRankRing = false,
  style,
}) => {
  // Determine rank color from level or rank prop
  const getRankColorForAvatar = (): string => {
    if (rank) {
      return getRankColor(rank);
    }
    if (level) {
      const rankDef = getRankFromLevel(level);
      return rankDef.colors.primary;
    }
    return '#00d4ff';
  };

  const rankColor = getRankColorForAvatar();
  const ringWidth = Math.max(2, Math.round(size / 30)); // Scale ring width with size

  // Check if we have a valid avatar URL (not empty and not a placeholder)
  const hasValidAvatar =
    avatarUrl &&
    avatarUrl.trim() !== '' &&
    !avatarUrl.includes('placeholder') &&
    !avatarUrl.includes('via.placeholder');

  if (hasValidAvatar) {
    return (
      <View style={[styles.wrapper, style]}>
        {/* Rank ring (behind avatar) */}
        {showRankRing && (
          <View
            style={[
              styles.rankRing,
              {
                width: size + ringWidth * 2 + 2,
                height: size + ringWidth * 2 + 2,
                borderRadius: (size + ringWidth * 2 + 2) / 2,
                borderWidth: ringWidth,
                borderColor: rankColor,
                shadowColor: rankColor,
              },
            ]}
          />
        )}
        <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
          <Image
            source={{ uri: avatarUrl }}
            style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
            resizeMode="cover"
          />
        </View>
      </View>
    );
  }

  // For default avatar, wrap with rank ring if needed
  if (showRankRing) {
    return (
      <View style={[styles.wrapper, style]}>
        <View
          style={[
            styles.rankRing,
            {
              width: size + ringWidth * 2 + 2,
              height: size + ringWidth * 2 + 2,
              borderRadius: (size + ringWidth * 2 + 2) / 2,
              borderWidth: ringWidth,
              borderColor: rankColor,
              shadowColor: rankColor,
            },
          ]}
        />
        <DefaultAvatar username={username} size={size} rankColor={rankColor} />
      </View>
    );
  }

  return <DefaultAvatar username={username} size={size} rankColor={rankColor} />;
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  rankRing: {
    position: 'absolute',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
});

export default Avatar;
