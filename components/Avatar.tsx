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
}

/**
 * Reusable Avatar component that shows user avatar or SAYN-branded default
 * Automatically falls back to DefaultAvatar when no avatarUrl is provided
 */
const Avatar: React.FC<AvatarProps> = ({
  avatarUrl,
  username,
  size = 120,
  level,
  rank,
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

  // Check if we have a valid avatar URL (not empty and not a placeholder)
  const hasValidAvatar =
    avatarUrl &&
    avatarUrl.trim() !== '' &&
    !avatarUrl.includes('placeholder') &&
    !avatarUrl.includes('via.placeholder');

  if (hasValidAvatar) {
    return (
      <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
        <Image
          source={{ uri: avatarUrl }}
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
        />
      </View>
    );
  }

  return <DefaultAvatar username={username} size={size} rankColor={rankColor} />;
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default Avatar;
