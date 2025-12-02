import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User } from 'lucide-react-native';

interface DefaultAvatarProps {
  username?: string;
  size?: number;
  rankColor?: string;
}

/**
 * SAYN-branded default avatar placeholder
 * Shows initials with gradient background and glow ring
 * Matches the app's intense, tech-forward aesthetic
 */
const DefaultAvatar: React.FC<DefaultAvatarProps> = ({
  username,
  size = 120,
  rankColor = '#00d4ff',
}) => {
  // Get initials from username (max 2 characters)
  const getInitials = () => {
    if (!username) return '';
    return username.substring(0, 2).toUpperCase();
  };

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
      {/* Gradient background */}
      <LinearGradient
        colors={['#0d1128', '#1a1f3a', '#0d1128']}
        style={[styles.gradient, { borderRadius: size / 2 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Inner glow ring */}
      <View
        style={[
          styles.glowRing,
          {
            width: size - 8,
            height: size - 8,
            borderRadius: (size - 8) / 2,
            borderColor: rankColor,
            shadowColor: rankColor,
          },
        ]}
      />

      {/* Content: Initials or Icon */}
      {username ? (
        <Text
          style={[
            styles.initials,
            {
              fontSize: size * 0.35,
              textShadowColor: rankColor,
            },
          ]}
        >
          {getInitials()}
        </Text>
      ) : (
        <User size={size * 0.4} color={rankColor} strokeWidth={1.5} />
      )}

      {/* Subtle scan line effect for tech feel */}
      <View style={[styles.scanLines, { borderRadius: size / 2 }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  glowRing: {
    position: 'absolute',
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 5,
  },
  initials: {
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 2,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  scanLines: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    // Subtle horizontal lines for tech effect
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 212, 255, 0.03)',
  },
});

export default DefaultAvatar;
